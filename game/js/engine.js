/* 劇本直譯器：逐行執行 GAME_DATA，處理文字、選項、條件、數值、存讀檔與自動／快進 */
(function () {
  'use strict';
  var VN = window.VN;
  var P = VN.Persist;
  var Stage = VN.Stage;
  var Au = VN.Audio;
  var WAIT = 'wait';

  var D = null;              // GAME_DATA
  var mainOrder = [], sideOrder = [];
  var keyIndex = {};

  var CPS = [12, 18, 25, 32, 40, 52, 68, 90, 130, Infinity];
  var AUTO_PER_CHAR = [95, 80, 66, 55, 46, 38, 31, 25, 20, 15];
  var ENDING_LABEL = { '伴侶': '靈魂伴侶結局', '朋友': '普通朋友結局', 'BAD': 'BAD END' };
  // 長句分頁：優先在句尾斷開，其次逗號；下一頁的開頭不放這些標點
  var BREAK_STRONG = /[。！？!?…」』）]/;
  var BREAK_WEAK = /[，、；：,;]/;
  var NO_LEAD = /[。！？!?…」』）、，；：,;]/;
  VN.ENDING_LABEL = ENDING_LABEL;

  var dom = {};

  // ================================================================ 打字機
  var Typer = {
    typing: false,
    chars: [],
    n: 0,
    raf: 0,
    onDone: null,
    show: function (text, cls, onDone) {
      cancelAnimationFrame(this.raf);
      var t = dom.text;
      t.className = cls || '';
      t.innerHTML = '';
      this.shown = VN.el('span.shown');
      this.rest = VN.el('span.rest');
      t.appendChild(this.shown);
      t.appendChild(this.rest);
      this.chars = Array.from(text);
      this.n = 0;
      this.onDone = onDone;
      var speed = P.settings.textSpeed;
      var cps = CPS[VN.clamp(speed, 1, 10) - 1];
      if (!isFinite(cps) || E.skipping()) { this.finish(); return; }
      this.typing = true;
      this.rest.textContent = text;
      var self = this, t0 = performance.now();
      var step = function (now) {
        var k = Math.min(self.chars.length, Math.floor(((now - t0) / 1000) * cps) + 1);
        if (k !== self.n) {
          self.n = k;
          self.shown.textContent = self.chars.slice(0, k).join('');
          self.rest.textContent = self.chars.slice(k).join('');
        }
        if (k >= self.chars.length) { self.finish(); return; }
        self.raf = requestAnimationFrame(step);
      };
      this.raf = requestAnimationFrame(step);
    },
    finish: function () {
      cancelAnimationFrame(this.raf);
      this.typing = false;
      this.shown.textContent = this.chars.join('');
      this.rest.textContent = '';
      dom.text.appendChild(VN.el('span.next-mark'));
      var cb = this.onDone;
      this.onDone = null;
      if (cb) cb();
    },
    stop: function () {
      cancelAnimationFrame(this.raf);
      this.typing = false;
      this.onDone = null;
    },
  };
  VN.Typer = Typer;

  // ================================================================ 引擎
  var E = (VN.Engine = {
    gen: 0,
    runningGen: null,
    state: null,
    checkpoint: null,
    waiting: null,          // 'text' | 'choice' | null
    curOp: null,
    mode: { auto: false, skip: false, ctrl: false },
    backlog: [],
    autoTimer: 0,
    active: false,          // 是否在遊戲畫面中
    pages: null,            // 目前這句拆成的頁（對話框放不下時才會有多頁）
    page: 0,
    lineCls: '',

    init: function () {
      D = window.GAME_DATA;
      dom.text = document.getElementById('text');
      dom.textbox = document.getElementById('textbox');
      dom.nameplate = document.getElementById('nameplate');
      dom.choices = document.getElementById('choices');
      dom.ui = document.getElementById('ui-layer');
      dom.badge = document.getElementById('mode-badge');
      dom.qm = document.getElementById('quickmenu');
      D.files.forEach(function (f, i) {
        keyIndex[f.key] = i;
        (f.route === 'side' ? sideOrder : mainOrder).push(i);
      });
      // 轉螢幕或改視窗大小時，依新的對話框尺寸重新分頁目前這句
      var repageTimer = 0;
      window.addEventListener('resize', function () {
        clearTimeout(repageTimer);
        repageTimer = setTimeout(E.repage, 200);
      });
    },
    get data() { return D; },
    get protagonist() { return D.protagonist || '孫承完'; },
    mainFiles: function () { return mainOrder.map(function (i) { return D.files[i]; }); },
    sideFiles: function () { return sideOrder.map(function (i) { return { file: D.files[i], index: i }; }); },
    skipping: function () { return E.mode.skip || E.mode.ctrl; },

    // ------------------------------------------------------------ 開始 / 結束
    freshState: function (route, fileIndex) {
      var stats = {};
      (D.stats || ['心動', '信任', '採息']).forEach(function (s) { stats[s] = 0; });
      return { route: route, file: fileIndex, pc: 0, cur: 0, stats: stats, flags: {}, face: '普通', chapter: '', line: null };
    },
    newGame: function () {
      if (!mainOrder.length) { VN.toast('找不到主線劇本，請先執行 build.bat。'); return; }
      E._begin(E.freshState('main', mainOrder[0]));
    },
    startSide: function (fileIndex) {
      E._begin(E.freshState('side', fileIndex));
    },
    _begin: function (st) {
      E.halt();
      Stage.reset();
      Au.stopBgm(0.8);
      E.state = st;
      E.backlog = [];
      E.checkpoint = null;
      E.clearText();
      E.enter();
      E.run();
    },
    /** 停止目前的執行（換存檔、回標題時） */
    halt: function () {
      E.gen += 1;
      E.runningGen = null;
      E.waiting = null;
      E.curOp = null;
      E.justEnded = false;
      clearTimeout(E.autoTimer);
      Typer.stop();
      E.hideChoices();
      Stage.closeCard(true);
      E.setAuto(false);
      E.setSkip(false);
      E.mode.ctrl = false;
    },
    enter: function () {
      E.active = true;
      VN.UI.hideTitle();
      VN.UI.closeQm();
      dom.ui.classList.remove('hidden-ui');
    },
    toTitle: function () {
      E.halt();
      E.active = false;
      P.flush();
      Stage.reset();
      E.clearText();
      VN.UI.showTitle();
    },

    // ------------------------------------------------------------ 執行迴圈
    run: function () {
      var gen = E.gen;
      if (E.runningGen === gen) return;
      E.runningGen = gen;
      E._loop(gen).catch(function (err) {
        console.error(err);
        VN.toast('劇本執行時發生錯誤：' + (err && err.message ? err.message : err), 5000);
      }).then(function () {
        if (E.runningGen === gen) E.runningGen = null;
      });
    },
    _loop: async function (gen) {
      while (gen === E.gen) {
        var st = E.state;
        var f = D.files[st.file];
        if (!f) return;
        if (st.pc >= f.ops.length) {
          var cont = await E.endOfFile(gen);
          if (!cont || gen !== E.gen) return;
          continue;
        }
        var idx = st.pc;
        var op = f.ops[idx];
        st.pc = idx + 1;
        var r = E.exec(op, idx, gen);
        if (r && typeof r.then === 'function') r = await r;
        if (gen !== E.gen) return;
        if (r === WAIT) return;
      }
    },

    exec: function (op, idx, gen) {
      var st = E.state;
      var fast = E.skipping();
      switch (op.t) {
        case 'label': return null;
        case 'title': return E.opTitle(op, idx, gen);
        case 'say': return E.say(op, idx);
        case 'bg': Stage.setBg(op.name, fast); return null;
        case 'show': Stage.show(op.list, fast); return null;
        case 'hide': Stage.hide(op.all ? 'all' : op.list, fast); return null;
        case 'form': op.list.forEach(function (s) { Stage.setForm(s.c, s.f, fast); }); return null;
        case 'cg':
          if (P.unlockCG(op.id) && !fast) VN.toast('CG 已解鎖：' + (op.title || op.id), 1800);
          Stage.showCG(op.id, op.title, fast);
          return null;
        case 'cgEnd': Stage.hideCG(fast); return null;
        case 'bgm':
          if (op.stop === 'stop') Au.stopBgm(0.4);
          else if (op.stop === 'fade') Au.stopBgm(2.6);
          else Au.playBgm(op.name);
          return null;
        case 'se':
          if (!fast) op.names.forEach(function (n, i) {
            var d = op.delays ? op.delays[i] : 0;
            if (!d) { Au.playSe(n); return; }
            // 延遲播放；這段時間內讀檔、回標題或開始快進就不播了
            setTimeout(function () { if (gen === E.gen && E.active && !E.skipping()) Au.playSe(n); }, d * 1000);
          });
          return null;
        case 'trans': return E.opTrans(op, fast);
        case 'shake': if (!fast) Stage.shake(); return null;
        case 'stat': E.applyEffects(op.list); return null;
        case 'flag': op.names.forEach(function (n) { st.flags[n] = true; }); return null;
        case 'if': if (E.evalCond(op.cond)) E.jump(op.to); return null;
        case 'jump': E.jump(op.to); return null;
        case 'choice': return E.opChoice(op, idx);
        case 'chend': return E.opChapterEnd(op, idx, gen);
        case 'ending': return E.opEnding(op, idx, gen);
        default:
          console.warn('未知的指令', op);
          return null;
      }
    },

    // ------------------------------------------------------------ 各種指令
    opTitle: async function (op, idx, gen) {
      E.state.chapter = op.text;
      E.state.cur = idx;
      E.makeCheckpoint(idx, op);
      E.autosave();
      if (!op.card) return null;
      E.hideTextbox();
      await Stage.card('title', { text: op.text }, E.skipping() ? 500 : 2900);
      return null;
    },
    opTrans: async function (op, fast) {
      if (op.kind === 'out') {
        E.hideTextbox();
        Stage.setFaded(true, fast);
        if (!fast) await VN.sleep(850);
      } else if (op.kind === 'in') {
        Stage.setFaded(false, fast);
        if (!fast) await VN.sleep(650);
      } else {
        if (!fast) { Stage.flash(); await VN.sleep(220); }
      }
      return null;
    },
    opChapterEnd: async function (op, idx, gen) {
      var f = D.files[E.state.file];
      P.markChapter(f.route, f.num);
      E.hideTextbox();
      E.hideFaceAndNames();
      var auto = E.skipping() ? 700 : E.mode.auto ? 4000 : 0;
      await Stage.card('end', { text: op.text }, auto);
      E.justEnded = true;
      return null;
    },
    opEnding: async function (op, idx, gen) {
      var f = D.files[E.state.file];
      P.markChapter(f.route, f.num);
      var first = !P.anyEnding();
      P.reachEnding(op.code, op.name);
      E.setSkip(false);
      E.hideTextbox();
      E.hideFaceAndNames();
      if (!Au.current()) Au.playBgm('結局曲', 2.5);
      await Stage.card('ending', { code: op.code, name: op.name, label: ENDING_LABEL[op.code] || op.code });
      if (gen !== E.gen) return WAIT;
      E.toTitle();
      if (first) setTimeout(function () { VN.toast('「' + (D.sideRoute || '人魚篇') + '」已解鎖！可以從標題畫面進入。', 4200); }, 900);
      return WAIT;
    },
    endOfFile: async function (gen) {
      var st = E.state;
      var f = D.files[st.file];
      P.markChapter(f.route, f.num);
      if (st.route === 'main') {
        var pos = mainOrder.indexOf(st.file);
        var next = mainOrder[pos + 1];
        if (next != null) {
          st.file = next;
          st.pc = 0;
          return true;
        }
        E.hideTextbox();
        E.hideFaceAndNames();
        await Stage.card('tbc', { small: '故事', text: '未完待續', note: '點擊回到標題畫面' });
      } else if (!E.justEnded) {
        // 人魚篇：檔案最後沒有【…完】時才補一張結束卡
        E.hideTextbox();
        E.hideFaceAndNames();
        await Stage.card('tbc', { small: D.sideRoute || '人魚篇', text: f.title, note: '點擊返回' });
      }
      if (gen !== E.gen) return false;
      var side = st.route === 'side';
      E.toTitle();
      if (side) VN.UI.openSide();
      return false;
    },

    jump: function (label) {
      var loc = D.labels[label];
      if (!loc) { console.warn('找不到標籤', label); VN.toast('找不到標籤「' + label + '」'); return; }
      E.state.file = loc[0];
      E.state.pc = loc[1];
    },
    evalCond: function (or) {
      var st = E.state;
      return or.some(function (and) {
        return and.every(function (t) {
          if (t.f != null) return t.neg ? !st.flags[t.f] : !!st.flags[t.f];
          var v = st.stats[t.s] || 0;
          switch (t.op) {
            case '>=': return v >= t.v;
            case '<=': return v <= t.v;
            case '>': return v > t.v;
            case '<': return v < t.v;
            case '==': return v === t.v;
            case '!=': return v !== t.v;
            default: return false;
          }
        });
      });
    },
    applyEffects: function (list) {
      var st = E.state;
      (list || []).forEach(function (e) {
        if (e.f != null) { if (e.clear) delete st.flags[e.f]; else st.flags[e.f] = true; return; }
        if (e.set != null) st.stats[e.s] = e.set;
        else st.stats[e.s] = (st.stats[e.s] || 0) + e.d;
      });
    },

    // ------------------------------------------------------------ 台詞
    say: function (op, idx) {
      var st = E.state;
      var hero = E.protagonist;
      var fast = E.skipping();
      st.cur = idx;
      E.curOp = op;
      E.justEnded = false;
      if (op.k === 'd' && op.expr) {
        if (op.who === hero) st.face = op.expr;
        else Stage.setExpr(op.who, op.expr, fast);
      }
      Stage.highlight(op.k === 'd' ? op.who : null);
      // 主角說話時顯示頭像；主線的內心話也是主角視角，所以也顯示（人魚篇的內心話不是她的）
      if ((op.k === 'd' && op.who === hero) || (op.k === 'i' && st.route === 'main')) Stage.showFace(hero, st.face, fast);
      else Stage.hideFace();
      st.line = { who: op.k === 'd' ? op.who : null, text: op.text, k: op.k };
      E.makeCheckpoint(idx, op);
      E.renderLine(st.line);
      E.backlog.push({ who: st.line.who, text: op.text, k: op.k });
      if (E.backlog.length > 300) E.backlog.splice(0, E.backlog.length - 300);
      E.waiting = 'text';

      if (fast && !E.canSkip(op)) {
        E.mode.ctrl = false;
        if (E.mode.skip) { E.setSkip(false); VN.toast('遇到未讀的文字，已停止快進'); }
        E.updateModes();
      }
      E.lineCls = op.k === 'd' ? 'dlg' : op.k === 'i' ? 'inner' : 'narr';
      E.pages = E.paginate(op.text, E.lineCls);
      E.page = 0;
      Typer.show(E.pages[0], E.lineCls, function () { E.afterTyped(); });
      return WAIT;
    },
    /** 對話框放不下的長句，拆成好幾頁（優先在句尾斷開） */
    paginate: function (text, cls) {
      var t = dom.text;
      var chars = Array.from(text);
      t.className = cls;
      var fits = function (a, b) {
        t.textContent = chars.slice(a, b).join('');
        t.appendChild(VN.el('span.next-mark'));
        return t.scrollHeight <= t.clientHeight + 1;
      };
      if (!t.clientHeight || fits(0, chars.length)) { t.innerHTML = ''; return [text]; }
      var pages = [], start = 0;
      while (start < chars.length) {
        // 找出這一頁最多放得下幾個字
        var lo = start + 1, hi = chars.length, best = start + 1;
        while (lo <= hi) {
          var mid = (lo + hi) >> 1;
          if (fits(start, mid)) { best = mid; lo = mid + 1; } else hi = mid - 1;
        }
        var cut = best;
        if (best < chars.length) {
          cut = E._breakAt(chars, start, best, BREAK_STRONG, 0.4) || E._breakAt(chars, start, best, BREAK_WEAK, 0.5) || best;
          while (cut < best && NO_LEAD.test(chars[cut])) cut++;
        }
        pages.push(chars.slice(start, cut).join(''));
        start = cut;
      }
      t.innerHTML = '';
      return pages;
    },
    /** 在 [start, end) 的後段找最後一個斷句點，找不到回傳 0 */
    _breakAt: function (chars, start, end, re, minRatio) {
      var min = start + Math.max(1, Math.floor((end - start) * minRatio));
      for (var i = end; i > min; i--) if (re.test(chars[i - 1])) return i;
      return 0;
    },
    repage: function () {
      if (!E.active || E.waiting !== 'text' || !E.pages) return;
      var rest = E.pages.slice(E.page).join('');
      E.pages = E.pages.slice(0, E.page).concat(E.paginate(rest, E.lineCls));
      Typer.show(E.pages[E.page], E.lineCls, function () { E.afterTyped(); });
      Typer.finish();
    },
    renderLine: function (line) {
      dom.textbox.classList.remove('off', 'empty');
      dom.ui.classList.remove('no-text');
      if (line && line.who) {
        dom.nameplate.textContent = line.who;
        dom.nameplate.style.setProperty('--nc', VN.charColor(line.who));
        dom.nameplate.classList.add('on');
      } else {
        dom.nameplate.classList.remove('on');
      }
    },
    canSkip: function (op) {
      return !P.settings.skipReadOnly || P.isRead(op.id);
    },
    afterTyped: function () {
      clearTimeout(E.autoTimer);
      if (E.waiting !== 'text') return;
      var gen = E.gen;
      if (E.skipping() && E.curOp && E.canSkip(E.curOp)) {
        E.autoTimer = setTimeout(function () { if (gen === E.gen && E.waiting === 'text') E.proceed(); }, 45);
      } else if (E.mode.auto) {
        var n = Array.from((E.pages && E.pages[E.page]) || '').length;
        var ms = Math.max(1300, 700 + n * AUTO_PER_CHAR[VN.clamp(P.settings.autoSpeed, 1, 10) - 1]);
        E.autoTimer = setTimeout(function () { if (gen === E.gen && E.waiting === 'text' && E.mode.auto && !VN.UI.overlayOpen()) E.proceed(); else if (E.mode.auto) E.afterTyped(); }, ms);
      }
    },
    /** 玩家點擊／按鍵 */
    advance: function () {
      if (!E.active) return;
      if (Stage.cardOpen) { Stage.dismissCard(); return; }
      if (E.waiting !== 'text') return;
      if (Typer.typing) { Typer.finish(); return; }
      E.proceed();
    },
    proceed: function () {
      if (E.waiting !== 'text') return;
      clearTimeout(E.autoTimer);
      // 長句還有下一頁：先顯示下一頁，這句還沒讀完
      if (E.pages && E.page < E.pages.length - 1) {
        E.page += 1;
        Typer.show(E.pages[E.page], E.lineCls, function () { E.afterTyped(); });
        return;
      }
      if (E.curOp) P.markRead(E.curOp.id);
      E.waiting = null;
      E.run();
    },
    clearText: function () {
      dom.text.innerHTML = '';
      dom.text.className = '';
      dom.nameplate.classList.remove('on');
      dom.textbox.classList.add('off', 'empty');
      dom.ui.classList.add('no-text');
      Stage.hideFace();
    },
    hideTextbox: function () {
      dom.textbox.classList.add('off');
      dom.ui.classList.add('no-text');
    },
    hideFaceAndNames: function () {
      Stage.hideFace();
      Stage.highlight(null);
    },

    // ------------------------------------------------------------ 選項
    opChoice: function (op, idx) {
      var st = E.state;
      st.cur = idx;
      E.curOp = op;
      E.mode.ctrl = false;
      E.setSkip(false);
      E.makeCheckpoint(idx, op);
      E.autosave();
      E.waiting = 'choice';
      var f = D.files[st.file];
      var box = dom.choices;
      box.innerHTML = '';
      op.options.forEach(function (opt, i) {
        var key = f.key + ':' + idx + ':' + opt.key;
        var b = VN.el('button', { type: 'button', role: 'menuitem', text: opt.text });
        if (P.choiceSeen(key)) b.classList.add('seen');
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          if (E.waiting !== 'choice') return;
          b.classList.add('picked');
          E.pick(op, opt, key);
        });
        box.appendChild(b);
      });
      box.classList.add('on');
      if (!VN.isTouch()) setTimeout(function () { var b = box.querySelector('button'); if (b && E.waiting === 'choice') b.focus({ preventScroll: true }); }, 50);
      return WAIT;
    },
    pick: function (op, opt, key) {
      P.markChoice(key);
      E.waiting = null;
      Au.ui('click');
      E.backlog.push({ who: null, text: '▶ ' + opt.text, k: 'c' });
      E.applyEffects(opt.eff);
      setTimeout(function () { E.hideChoices(); }, 160);
      E.jump(opt.to);
      E.run();
    },
    hideChoices: function () {
      if (!dom.choices) return;
      dom.choices.classList.remove('on');
      dom.choices.innerHTML = '';
    },
    pickByNumber: function (n) {
      if (E.waiting !== 'choice') return;
      var b = dom.choices.querySelectorAll('button')[n - 1];
      if (b) b.click();
    },

    // ------------------------------------------------------------ 自動 / 快進
    setAuto: function (on) {
      E.mode.auto = !!on;
      if (on) E.mode.skip = false;
      E.updateModes();
      if (on && E.waiting === 'text' && !Typer.typing) E.afterTyped();
      if (!on && !E.skipping()) clearTimeout(E.autoTimer);
    },
    setSkip: function (on) {
      E.mode.skip = !!on;
      if (on) E.mode.auto = false;
      E.updateModes();
      if (on && E.waiting === 'text') {
        if (!E.canSkip(E.curOp)) {
          E.mode.skip = false;
          E.updateModes();
          VN.toast(P.settings.skipReadOnly ? '目前是未讀的文字（設定為只快進已讀）' : '無法快進');
          return;
        }
        if (Typer.typing) Typer.finish(); else E.afterTyped();
      }
    },
    setCtrl: function (on) {
      if (E.mode.ctrl === !!on) return;
      E.mode.ctrl = !!on;
      E.updateModes();
      if (on && E.waiting === 'text' && E.active && !VN.UI.overlayOpen()) {
        if (!E.canSkip(E.curOp)) return;
        if (Typer.typing) Typer.finish(); else E.afterTyped();
      }
    },
    updateModes: function () {
      if (!dom.qm) return;
      // 選單裡的文字鈕和對話框右下角的圖示一起更新
      var mark = function (q, on) {
        dom.ui.querySelectorAll('[data-q=' + q + ']').forEach(function (b) {
          b.classList.toggle('active', on);
          b.setAttribute('aria-pressed', String(on));
        });
      };
      mark('auto', E.mode.auto);
      mark('skip', E.mode.skip || E.mode.ctrl);
      var txt = E.skipping() ? '快進中' : E.mode.auto ? '自動播放' : '';
      dom.badge.textContent = txt;
      dom.badge.classList.toggle('on', !!txt);
    },

    // ------------------------------------------------------------ 存讀檔
    makeCheckpoint: function (idx, op) {
      var st = E.state;
      var f = D.files[st.file];
      E.checkpoint = {
        route: st.route,
        file: f.key,
        cur: idx,
        opId: op && op.id ? op.id : null,
        opType: op ? op.t : null,
        stats: Object.assign({}, st.stats),
        flags: Object.assign({}, st.flags),
        face: st.face,
        chapter: st.chapter || f.title,
        line: st.line ? Object.assign({}, st.line) : null,
        stage: Stage.snapshot(),
        bgm: Au.current(),
      };
    },
    canSave: function () { return E.active && !!E.checkpoint; },
    buildSave: function () {
      var cp = E.checkpoint;
      if (!cp) return null;
      var preview = '';
      if (cp.opType === 'choice') preview = '（選項）' + (cp.line ? cp.line.text : '');
      else if (cp.opType === 'title') preview = '（' + cp.chapter + '）';
      else if (cp.line) preview = (cp.line.who ? cp.line.who + '：' : '') + cp.line.text;
      var st = JSON.parse(JSON.stringify(cp));
      st.backlog = E.backlog.slice(-40);
      return { v: 1, time: Date.now(), route: cp.route, chapter: cp.chapter, preview: preview.slice(0, 80), state: st };
    },
    saveTo: function (slot) {
      var s = E.buildSave();
      if (!s) return false;
      return P.writeSlot(slot, s);
    },
    autosave: function () {
      if (!E.active) return;
      E.saveTo('auto');
    },
    load: function (save) {
      var cp = save && save.state;
      if (!cp) return false;
      var fi = keyIndex[cp.file];
      if (fi == null) { VN.toast('這個存檔的章節已經不存在了（' + cp.file + '）'); return false; }
      var ops = D.files[fi].ops;
      var cur = VN.clamp(cp.cur | 0, 0, Math.max(0, ops.length - 1));
      // 劇本改過時，用台詞 id 找回原本的位置
      if (cp.opId && (!ops[cur] || ops[cur].id !== cp.opId)) {
        for (var i = 0; i < ops.length; i++) if (ops[i].id === cp.opId) { cur = i; break; }
      }
      E.halt();
      var st = E.freshState(cp.route === 'side' ? 'side' : 'main', fi);
      Object.assign(st.stats, cp.stats || {});
      st.flags = Object.assign({}, cp.flags || {});
      st.face = cp.face || '普通';
      st.chapter = cp.chapter || '';
      st.line = cp.line || null;
      st.pc = cur;
      st.cur = cur;
      E.state = st;
      E.backlog = (cp.backlog || []).slice();
      // 重播的那一句會再加進紀錄，先拿掉最後一筆避免重複
      if (E.backlog.length && cp.line && E.backlog[E.backlog.length - 1].text === cp.line.text) E.backlog.pop();
      E.checkpoint = null;
      Stage.restore(cp.stage);
      if (cp.bgm) Au.playBgm(cp.bgm, 1); else Au.stopBgm(0.5);
      E.clearText();
      if (cp.line) {
        E.renderLine(cp.line);
        dom.text.className = cp.line.k === 'd' ? 'dlg' : cp.line.k === 'i' ? 'inner' : 'narr';
        dom.text.textContent = cp.line.text;
      }
      E.enter();
      E.run();
      return true;
    },
  });
})();
