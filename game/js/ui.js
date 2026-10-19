/* 介面：標題畫面、存讀檔、設定、CG 圖庫、對話紀錄、人魚篇、暫停選單、確認框、輸入處理 */
(function () {
  'use strict';
  var VN = window.VN;
  var el = VN.el;
  var P = VN.Persist;
  var E = VN.Engine;
  var Au = VN.Audio;
  var A = VN.Assets;

  var stack = [];
  var dom = {};
  var lastPage = { save: 1, load: 1 };

  // ================================================================ 浮層
  function openOverlay(content, opts) {
    opts = opts || {};
    var ov = el('div.overlay' + (opts.cls ? '.' + opts.cls : ''));
    ov.appendChild(content);
    var h = { node: ov, onClose: opts.onClose, dismissable: opts.dismissable !== false, close: function () { closeOverlay(h); } };
    ov.addEventListener('click', function (e) {
      e.stopPropagation();
      if (e.target === ov && h.dismissable) closeOverlay(h);
    });
    ov.addEventListener('contextmenu', function (e) { e.preventDefault(); e.stopPropagation(); if (h.dismissable) closeOverlay(h); });
    dom.overlays.appendChild(ov);
    stack.push(h);
    E.updateModes();
    return h;
  }
  function closeOverlay(h, instant) {
    var i = stack.indexOf(h);
    if (i < 0) return;
    stack.splice(i, 1);
    if (instant) h.node.remove();
    else { h.node.classList.add('closing'); setTimeout(function () { h.node.remove(); }, 200); }
    if (h.onClose) h.onClose();
    // 關掉選單後，自動模式繼續
    if (!stack.length && E.mode.auto && E.waiting === 'text') E.afterTyped();
  }
  function closeAll(instant) { stack.slice().reverse().forEach(function (h) { closeOverlay(h, instant); }); }
  function panel(title, sub, body, h) {
    var close = el('button.btn.icon.close-x', { type: 'button', 'aria-label': '關閉', text: '×' });
    var head = el('div.panel-head', null, [el('h2', null, [title, sub ? el('small', { text: sub }) : null]), close]);
    var p = el('div.panel', null, [head]);
    if (body) p.appendChild(body);
    close.addEventListener('click', function () { if (h.ref) h.ref.close(); });
    return p;
  }

  var UI = (VN.UI = {
    overlayOpen: function () { return stack.length > 0; },
    closeAll: closeAll,

    confirm: function (msg, okText, cancelText, danger) {
      return new Promise(function (resolve) {
        var done = false;
        var finish = function (v) { if (done) return; done = true; h.close(); resolve(v); };
        var ok = el('button.btn' + (danger ? '.danger' : '.primary'), { type: 'button', text: okText || '確定' });
        var no = el('button.btn', { type: 'button', text: cancelText || '取消' });
        var box = el('div.dialog', { role: 'alertdialog', 'aria-modal': 'true' }, [el('p', { text: msg }), el('div.row', null, [no, ok])]);
        var h = openOverlay(box, { cls: 'confirm', onClose: function () { if (!done) { done = true; resolve(false); } } });
        ok.addEventListener('click', function () { finish(true); });
        no.addEventListener('click', function () { finish(false); });
        setTimeout(function () { ok.focus({ preventScroll: true }); }, 30);
      });
    },

    // ============================================================ 標題畫面
    initTitle: function () {
      dom.title = document.getElementById('title-screen');
      dom.overlays = document.getElementById('overlays');
      var stars = dom.title.querySelector('.stars');
      var rnd = VN.rng('潮約之歌');
      for (var i = 0; i < 90; i++) {
        var s = el('i', { style: { left: (rnd() * 100).toFixed(2) + '%', top: (Math.pow(rnd(), 1.5) * 100).toFixed(2) + '%', animationDelay: (rnd() * 3.4).toFixed(2) + 's', opacity: (0.3 + rnd() * 0.7).toFixed(2) } });
        if (rnd() < 0.1) { s.style.width = '3px'; s.style.height = '3px'; s.style.boxShadow = '0 0 6px #fff'; }
        stars.appendChild(s);
      }
      var bub = dom.title.querySelector('.bubbles');
      for (var j = 0; j < 14; j++) {
        var z = (4 + rnd() * 10).toFixed(1);
        bub.appendChild(el('i', { style: { left: (rnd() * 100).toFixed(1) + '%', width: z + 'px', height: z + 'px', animationDuration: (8 + rnd() * 10).toFixed(1) + 's', animationDelay: (-rnd() * 14).toFixed(1) + 's' } }));
      }
      var sideName = (E.data && E.data.sideRoute) || '人魚篇';
      dom.title.querySelector('.side-name').textContent = sideName;
      dom.title.querySelector('#title-menu').addEventListener('click', function (e) {
        var b = e.target.closest('button');
        if (!b || b.disabled) return;
        UI.titleAction(b.dataset.t);
      });
      var built = E.data && E.data.builtAt ? VN.fmtTime(E.data.builtAt) : '';
      document.getElementById('title-foot').textContent = built ? '劇本更新於 ' + built : '';
    },
    titleAction: function (t) {
      switch (t) {
        case 'new':
          if (P.settings.fullscreen && !isFs()) enterFs();
          E.newGame();
          break;
        case 'continue': {
          var s = P.latest();
          if (s) E.load(s);
          break;
        }
        case 'load': UI.openSaveLoad('load'); break;
        case 'gallery': UI.openGallery(); break;
        case 'side': UI.openSide(); break;
        case 'config': UI.openSettings(); break;
      }
    },
    showTitle: function () {
      UI.refreshTitle();
      dom.title.classList.remove('off');
      dom.title.inert = false;
      document.getElementById('stage').inert = true;
      document.getElementById('game').classList.remove('in-game');
      Au.playBgm('標題曲', 2);
    },
    hideTitle: function () {
      closeAll(true);
      dom.title.classList.add('off');
      dom.title.inert = true;
      document.getElementById('stage').inert = false;
      document.getElementById('game').classList.add('in-game');
    },
    refreshTitle: function () {
      var latest = P.latest();
      var btns = dom.title.querySelectorAll('#title-menu button');
      btns.forEach(function (b) {
        if (b.dataset.t === 'continue') b.disabled = !latest;
        if (b.dataset.t === 'side') {
          b.classList.toggle('locked', !P.anyEnding());
          b.setAttribute('aria-label', P.anyEnding() ? b.textContent : b.textContent + '（達成任一結局後解鎖）');
        }
      });
      var box = document.getElementById('ending-badges');
      box.innerHTML = '';
      ['伴侶', '朋友', 'BAD'].forEach(function (code) {
        var got = P.g.endings[code];
        var b = el('span.ending-badge' + (got ? '.got' : '') + (code === 'BAD' ? '.bad' : ''), { title: VN.ENDING_LABEL[code] });
        b.appendChild(el('span.pearl'));
        b.appendChild(el('b', { text: code }));
        b.appendChild(document.createTextNode(got ? '「' + (got.name || VN.ENDING_LABEL[code]) + '」' : '　？？？'));
        box.appendChild(b);
      });
    },

    // ============================================================ 存讀檔
    openSaveLoad: function (mode) {
      if (mode === 'save' && !E.canSave()) { VN.toast('目前無法存檔'); return; }
      var h = {};
      var body = el('div.panel-body');
      var tabs = el('div.tabs', { role: 'tablist' });
      var pages = [];
      if (mode === 'load') pages.push('auto');
      for (var i = 1; i <= P.SLOT_PAGES; i++) pages.push(i);
      var page = lastPage[mode];
      var title = mode === 'save' ? '存檔' : '讀取存檔';
      var pnl = panel(title, mode === 'save' ? '點選欄位存檔' : '點選欄位讀取', null, h);
      pnl.classList.add('saves');
      pnl.appendChild(tabs);
      pnl.appendChild(body);

      function render() {
        tabs.innerHTML = '';
        pages.forEach(function (p) {
          var b = el('button', { type: 'button', role: 'tab', text: p === 'auto' ? '自動' : '第 ' + p + ' 頁', 'aria-selected': String(p === page) });
          if (p === page) b.classList.add('on');
          b.addEventListener('click', function () { page = p; lastPage[mode] = p; lastPage['touched_' + mode] = true; render(); });
          tabs.appendChild(b);
        });
        body.innerHTML = '';
        var grid = el('div.slots');
        var slots = page === 'auto' ? ['auto'] : P.allSlots().slice((page - 1) * P.SLOTS_PER_PAGE, page * P.SLOTS_PER_PAGE);
        slots.forEach(function (slot) { grid.appendChild(slotNode(slot)); });
        body.appendChild(grid);
        if (page === 'auto') body.appendChild(el('p.gal-count', { style: { marginTop: '14px' }, text: '每章開始與每次選擇前會自動存檔到這裡。' }));
      }
      function slotNode(slot) {
        var s = P.readSlot(slot);
        var label = slot === 'auto' ? '自動' : 'No.' + VN.pad2(slot);
        var node = el('button.slot' + (s ? '' : '.empty') + (!s && mode === 'load' ? '.readonly' : ''), { type: 'button' });
        var thumb = el('div.thumb');
        if (s) thumb.appendChild(A.miniStage(s.state && s.state.stage));
        else thumb.appendChild(el('div.empty-mark', { text: '空白' }));
        node.appendChild(thumb);
        var meta = el('div.meta', null, [
          el('div.row1', null, [el('b', { text: label }), el('span', { text: s ? VN.fmtTime(s.time) : '' })]),
          el('div.chapter', { text: s ? (s.route === 'side' ? '【' + ((E.data && E.data.sideRoute) || '人魚篇') + '】' : '') + (s.chapter || '') : (mode === 'save' ? '點選以存檔' : '—') }),
          el('div.preview', { text: s ? s.preview || '' : '' }),
        ]);
        node.appendChild(meta);
        node.addEventListener('click', function () { onSlot(slot, s); });
        if (s) {
          var del = el('span.del', { role: 'button', tabindex: '0', 'aria-label': '刪除存檔', title: '刪除', text: '×' });
          del.addEventListener('click', function (e) {
            e.stopPropagation();
            UI.confirm('確定要刪除「' + label + '」的存檔嗎？\n刪除後無法復原。', '刪除', '取消', true).then(function (ok) {
              if (ok) { P.deleteSlot(slot); render(); UI.refreshTitle(); VN.toast('已刪除'); }
            });
          });
          node.appendChild(del);
        }
        return node;
      }
      function onSlot(slot, s) {
        if (mode === 'save') {
          var doSave = function () {
            if (E.saveTo(slot)) VN.toast('已存檔到 ' + (slot === 'auto' ? '自動' : 'No.' + VN.pad2(slot)));
            else VN.toast('存檔失敗：瀏覽器無法寫入儲存空間');
            render();
          };
          if (s) UI.confirm('要覆蓋 No.' + VN.pad2(slot) + ' 的存檔嗎？\n（' + VN.fmtTime(s.time) + '　' + (s.chapter || '') + '）', '覆蓋', '取消', true).then(function (ok) { if (ok) doSave(); });
          else doSave();
        } else {
          if (!s) return;
          var go = function () { closeAll(true); E.load(s); };
          if (E.active) UI.confirm('要讀取這個存檔嗎？\n目前沒有存檔的進度會遺失。', '讀取', '取消').then(function (ok) { if (ok) go(); });
          else go();
        }
      }
      if (mode === 'load' && !lastPage.touched_load) {
        // 預設打開最新存檔所在的頁
        var latest = P.latest();
        if (latest) page = latest.slot === 'auto' ? 'auto' : Math.ceil(latest.slot / P.SLOTS_PER_PAGE);
      }
      render();
      h.ref = openOverlay(pnl);
    },

    // ============================================================ 設定
    openSettings: function () {
      var h = {};
      var s = P.settings;
      var body = el('div.panel-body');
      var grid = el('div.settings');
      body.appendChild(grid);

      function row(label, ctl, val, extraCls) {
        var r = el('div.set-row' + (extraCls ? '.' + extraCls : ''), null, [el('span.lbl', { text: label }), el('div.ctl', null, [ctl]), val || null]);
        grid.appendChild(r);
        return r;
      }
      function sw(checked, onChange, aria) {
        var input = el('input', { type: 'checkbox', role: 'switch', 'aria-label': aria });
        input.checked = !!checked;
        input.addEventListener('change', function () { onChange(input.checked, input); });
        return { node: el('label.switch', null, [input, el('span.track')]), input: input };
      }
      function slider(min, max, value, fmt, onInput, onChange, aria) {
        var input = el('input', { type: 'range', min: min, max: max, step: 1, value: value, 'aria-label': aria });
        var val = el('span.val', { text: fmt(value) });
        var paint = function () { input.style.setProperty('--p', ((input.value - min) / (max - min) * 100) + '%'); val.textContent = fmt(+input.value); };
        paint();
        input.addEventListener('input', function () { paint(); onInput(+input.value); });
        input.addEventListener('change', function () { if (onChange) onChange(+input.value); });
        return { input: input, val: val };
      }

      // 全螢幕
      var fsHint = el('div.hint');
      var fs = sw(isFs() || (s.fullscreen && isStandalone()), function (on, input) {
        P.setSetting('fullscreen', on && fsSupported());
        if (!fsSupported()) {
          input.checked = isStandalone();
          fsHint.textContent = isStandalone()
            ? '目前已經是全螢幕（主畫面 App）模式。'
            : '這個瀏覽器不支援網頁全螢幕（例如 iPhone 的 Safari）。請按「分享」→「加入主畫面」，再從主畫面的圖示開啟，就能全螢幕遊玩。';
          return;
        }
        if (on) enterFs(); else exitFs();
      }, '全螢幕');
      var fsRow = row('全螢幕', fs.node, null, 'wrap');
      fsRow.appendChild(fsHint);
      if (!fsSupported() && !isStandalone()) fsHint.textContent = '此瀏覽器不支援網頁全螢幕，可用「加入主畫面」全螢幕遊玩。';
      dom.fsInput = fs.input;

      var pct = function (v) { return v + '%'; };
      var bgm = slider(0, 100, s.bgmVol, pct, function (v) { s.bgmVol = v; Au.applyVolumes(); }, function (v) { P.setSetting('bgmVol', v); }, '音樂音量');
      row('音樂音量', bgm.input, bgm.val);
      var se = slider(0, 100, s.seVol, pct, function (v) { s.seVol = v; Au.applyVolumes(); }, function (v) { P.setSetting('seVol', v); Au.blip(); }, '音效音量');
      row('音效音量', se.input, se.val);

      var preview = el('div.set-preview', { 'aria-hidden': 'true' });
      var speedFmt = function (v) { return v >= 10 ? '瞬間' : String(v); };
      var ts = slider(1, 10, s.textSpeed, speedFmt, function (v) { s.textSpeed = v; }, function (v) { P.setSetting('textSpeed', v); demo(); }, '文字速度');
      row('文字速度', ts.input, ts.val);
      var as = slider(1, 10, s.autoSpeed, String, function (v) { s.autoSpeed = v; }, function (v) { P.setSetting('autoSpeed', v); }, '自動播放速度');
      row('自動播放速度', as.input, as.val);
      var sk = sw(s.skipReadOnly, function (on) { P.setSetting('skipReadOnly', on); }, '只快進已讀');
      row('只快進已讀', sk.node, el('span.val', { style: { flexBasis: 'auto' }, text: '' }));

      grid.appendChild(preview);
      var demoRaf = 0;
      function demo() {
        cancelAnimationFrame(demoRaf);
        var text = '月亮落進海裡頭，潮水把歌帶著走——這是文字顯示速度的預覽。';
        var chars = Array.from(text);
        var cps = [12, 18, 25, 32, 40, 52, 68, 90, 130, Infinity][s.textSpeed - 1];
        var shown = el('span'), rest = el('span.rest');
        preview.innerHTML = '';
        preview.appendChild(shown); preview.appendChild(rest);
        if (!isFinite(cps)) { shown.textContent = text; return; }
        var t0 = performance.now();
        var step = function (now) {
          var k = Math.min(chars.length, Math.floor((now - t0) / 1000 * cps) + 1);
          shown.textContent = chars.slice(0, k).join('');
          rest.textContent = chars.slice(k).join('');
          if (k < chars.length) demoRaf = requestAnimationFrame(step);
        };
        demoRaf = requestAnimationFrame(step);
      }
      demo();

      var reset = el('button.btn.small', { type: 'button', text: '恢復預設值' });
      reset.addEventListener('click', function () {
        UI.confirm('要把設定恢復成預設值嗎？', '恢復', '取消').then(function (ok) {
          if (!ok) return;
          var keepFs = s.fullscreen;
          Object.assign(s, { bgmVol: 70, seVol: 80, textSpeed: 6, autoSpeed: 5, skipReadOnly: true, fullscreen: keepFs });
          P.flush();
          Au.applyVolumes();
          h.ref.close();
          UI.openSettings();
        });
      });
      grid.appendChild(el('div.set-actions', null, [reset]));

      var pnl = panel('設定', null, body, h);
      h.ref = openOverlay(pnl, { onClose: function () { cancelAnimationFrame(demoRaf); P.flush(); dom.fsInput = null; } });
    },

    // ============================================================ CG 圖庫
    openGallery: function () {
      var h = {};
      var cgs = (E.data && E.data.cgs) || [];
      var got = cgs.filter(function (c) { return P.hasCG(c.id); }).length;
      var body = el('div.panel-body');
      if (!cgs.length) {
        body.appendChild(el('div.empty-state', null, [el('span.big', { text: '還沒有 CG' }), '劇本裡還沒有任何【CG】。']));
      } else {
        var grid = el('div.gallery');
        cgs.forEach(function (c, i) {
          var unlocked = P.hasCG(c.id);
          var item = el('button.gal-item' + (unlocked ? '' : '.locked'), { type: 'button', 'aria-label': unlocked ? 'CG ' + c.id + ' ' + c.title : 'CG ' + c.id + '（未解鎖）' });
          if (unlocked) {
            var url = A.cg(c.id);
            if (url) item.appendChild(VN.imgOr(url, '', function () { return A.cgCard(c.id, c.title, { mini: true }); }));
            else item.appendChild(A.cgCard(c.id, c.title, { mini: true }));
            item.addEventListener('click', function () { UI.openViewer(cgs, i); });
          } else {
            item.appendChild(el('div.lock', null, [el('span.no', { text: c.id }), el('span', { text: '未解鎖' })]));
            item.disabled = false;
            item.addEventListener('click', function () { VN.toast('這張 CG 還沒解鎖'); });
          }
          grid.appendChild(item);
        });
        body.appendChild(grid);
      }
      var pnl = panel('CG 圖庫', cgs.length ? '已解鎖 ' + got + ' / ' + cgs.length : null, body, h);
      h.ref = openOverlay(pnl);
    },
    openViewer: function (cgs, index) {
      var unlocked = cgs.filter(function (c) { return P.hasCG(c.id); });
      var pos = Math.max(0, unlocked.indexOf(cgs[index]));
      var box = el('div.viewer', { role: 'dialog', 'aria-label': 'CG 檢視' });
      var h;
      function render() {
        box.innerHTML = '';
        var c = unlocked[pos];
        box.appendChild(A.cgView(c.id, c.title, { fit: true }));
        box.appendChild(el('div.cap', { text: 'CG ' + c.id + '　' + (c.title || '') + '　（' + (pos + 1) + ' / ' + unlocked.length + '）' }));
        var close = el('button.btn.icon.close', { type: 'button', 'aria-label': '關閉', text: '×' });
        close.addEventListener('click', function (e) { e.stopPropagation(); h.close(); });
        box.appendChild(close);
        if (unlocked.length > 1) {
          var prev = el('button.nav.prev', { type: 'button', 'aria-label': '上一張', text: '‹' });
          var next = el('button.nav.next', { type: 'button', 'aria-label': '下一張', text: '›' });
          prev.addEventListener('click', function (e) { e.stopPropagation(); UI._viewerStep(-1); });
          next.addEventListener('click', function (e) { e.stopPropagation(); UI._viewerStep(1); });
          box.appendChild(prev);
          box.appendChild(next);
        }
      }
      UI._viewerStep = function (d) { pos = (pos + d + unlocked.length) % unlocked.length; render(); };
      box.addEventListener('click', function () { h.close(); });
      // 手機左右滑
      var sx = null;
      box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      box.addEventListener('touchend', function (e) {
        if (sx == null) return;
        var dx = e.changedTouches[0].clientX - sx;
        sx = null;
        if (Math.abs(dx) > 50 && unlocked.length > 1) { e.preventDefault(); UI._viewerStep(dx < 0 ? 1 : -1); }
      });
      render();
      h = openOverlay(box, { cls: 'viewer-ov', onClose: function () { UI._viewerStep = null; } });
      h.node.style.padding = '0';
    },

    // ============================================================ 對話紀錄
    openBacklog: function () {
      var h = {};
      var body = el('div.panel-body');
      var list = el('div.log');
      if (!E.backlog.length) list.appendChild(el('div.log-empty', { text: '還沒有對話紀錄。' }));
      E.backlog.forEach(function (b) {
        var item = el('div.log-item.' + b.k, null, [el('div.who', { text: b.who || (b.k === 'c' ? '選擇' : '') }), el('div.text', { text: b.text })]);
        if (b.who) item.style.setProperty('--nc', VN.charColor(b.who));
        list.appendChild(item);
      });
      body.appendChild(list);
      var pnl = panel('對話紀錄', null, body, h);
      h.ref = openOverlay(pnl);
      requestAnimationFrame(function () { body.scrollTop = body.scrollHeight; });
    },

    // ============================================================ 人魚篇
    openSide: function () {
      var name = (E.data && E.data.sideRoute) || '人魚篇';
      if (!P.anyEnding()) { VN.toast('達成任一結局後，就能解鎖「' + name + '」。'); return; }
      var h = {};
      var body = el('div.panel-body');
      var files = E.sideFiles();
      if (!files.length) {
        body.appendChild(el('div.empty-state', null, [el('span.big', { text: '敬請期待' }), '「' + name + '」還在撰寫中，完成後會出現在這裡。']));
      } else {
        var list = el('div.side-list');
        files.forEach(function (x) {
          var f = x.file;
          var need = f.num === 0 ? 1 : f.num;
          var open = P.chapterRead(need);
          var item = el('button.side-item', { type: 'button' });
          item.appendChild(el('span.no', { text: VN.pad2(f.num) }));
          item.appendChild(el('span.t', { text: open ? f.title : '？？？' }));
          item.appendChild(el('span.s' + (P.sideRead(f.num) ? '.read' : ''), { text: !open ? '讀完主線第 ' + need + ' 章後解鎖' : P.sideRead(f.num) ? '已讀' : '未讀' }));
          if (!open) item.disabled = true;
          else item.addEventListener('click', function () { closeAll(true); E.startSide(x.index); });
          list.appendChild(item);
        });
        body.appendChild(list);
      }
      var pnl = panel(name, '另一個視角', body, h);
      h.ref = openOverlay(pnl);
    },

    // ============================================================ 暫停選單
    openPause: function () {
      var box = el('div.pause', { role: 'dialog', 'aria-label': '選單' });
      var h;
      var items = [['繼續遊戲', function () { h.close(); }], ['存檔', function () { UI.openSaveLoad('save'); }], ['讀檔', function () { UI.openSaveLoad('load'); }],
        ['對話紀錄', function () { UI.openBacklog(); }], ['設定', function () { UI.openSettings(); }], ['回到標題', function () { UI.askTitle(); }]];
      box.appendChild(el('h2', { text: '選單' }));
      items.forEach(function (it, i) {
        var b = el('button.btn' + (i === 0 ? '.primary' : ''), { type: 'button', text: it[0] });
        b.addEventListener('click', it[1]);
        box.appendChild(b);
      });
      h = openOverlay(box);
      setTimeout(function () { var b = box.querySelector('button'); if (b) b.focus({ preventScroll: true }); }, 30);
    },
    // 手機版：齒輪按鈕收合的快捷選單
    closeQm: function () {
      document.getElementById('ui-layer').classList.remove('qm-open');
      document.getElementById('qm-toggle').setAttribute('aria-expanded', 'false');
    },
    askTitle: function () {
      UI.confirm('要回到標題畫面嗎？\n沒有存檔的進度會遺失。', '回到標題', '取消').then(function (ok) {
        if (ok) { closeAll(true); E.toTitle(); }
      });
    },

    // ============================================================ 輸入
    initInput: function () {
      var stage = document.getElementById('stage');
      var ui = document.getElementById('ui-layer');
      var unlock = function () { Au.unlock(); };
      ['pointerdown', 'keydown', 'touchend'].forEach(function (t) { window.addEventListener(t, unlock, { capture: true, passive: true }); });

      stage.addEventListener('click', function (e) {
        if (!E.active || stack.length) return;
        if (e.target.closest('#quickmenu, #choices, #qm-toggle')) return;
        if (ui.classList.contains('qm-open')) { UI.closeQm(); return; }
        if (ui.classList.contains('hidden-ui')) { ui.classList.remove('hidden-ui'); return; }
        E.advance();
      });
      stage.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        if (!E.active || stack.length) return;
        ui.classList.toggle('hidden-ui');
      });
      stage.addEventListener('wheel', function (e) {
        if (!E.active || stack.length) return;
        if (e.deltaY < -20) UI.openBacklog();
        else if (e.deltaY > 20 && !ui.classList.contains('hidden-ui')) E.advance();
      }, { passive: true });

      var qmToggle = document.getElementById('qm-toggle');
      qmToggle.addEventListener('click', function (e) {
        e.stopPropagation();
        if (!E.active) return;
        var open = !ui.classList.contains('qm-open');
        ui.classList.toggle('qm-open', open);
        qmToggle.setAttribute('aria-expanded', String(open));
      });

      document.getElementById('quickmenu').addEventListener('click', function (e) {
        e.stopPropagation();
        var b = e.target.closest('button');
        if (!b || !E.active) return;
        UI.closeQm();
        switch (b.dataset.q) {
          case 'save': UI.openSaveLoad('save'); break;
          case 'load': UI.openSaveLoad('load'); break;
          case 'log': UI.openBacklog(); break;
          case 'auto': E.setAuto(!E.mode.auto); break;
          case 'skip': E.setSkip(!E.mode.skip); break;
          case 'hide': ui.classList.add('hidden-ui'); break;
          case 'config': UI.openSettings(); break;
          case 'title': UI.askTitle(); break;
        }
      });

      window.addEventListener('keydown', function (e) {
        var k = e.key;
        if (k === 'Control') { E.setCtrl(true); return; }
        if (stack.length) {
          if (k === 'Escape') { e.preventDefault(); closeOverlay(stack[stack.length - 1]); return; }
          if (UI._viewerStep && (k === 'ArrowLeft' || k === 'ArrowRight')) { UI._viewerStep(k === 'ArrowLeft' ? -1 : 1); return; }
          return;
        }
        if (!E.active) return;
        var tag = e.target && e.target.tagName;
        if ((k === 'Enter' || k === ' ') && (tag === 'BUTTON' || tag === 'INPUT') && !e.target.closest('#quickmenu')) return;
        if (k === 'Enter' || k === ' ' || k === 'Spacebar') {
          e.preventDefault();
          if (e.repeat && E.waiting !== 'text') return;
          if (ui.classList.contains('hidden-ui')) { ui.classList.remove('hidden-ui'); return; }
          E.advance();
        } else if (k === 'Escape') {
          e.preventDefault();
          if (ui.classList.contains('qm-open')) { UI.closeQm(); return; }
          if (ui.classList.contains('hidden-ui')) { ui.classList.remove('hidden-ui'); return; }
          UI.openPause();
        } else if (/^[1-9]$/.test(k)) {
          E.pickByNumber(+k);
        } else if (k === 'ArrowUp' || k === 'PageUp') {
          e.preventDefault();
          UI.openBacklog();
        } else if (k === 'a' || k === 'A') {
          E.setAuto(!E.mode.auto);
        } else if (k === 'h' || k === 'H') {
          ui.classList.toggle('hidden-ui');
        }
      });
      window.addEventListener('keyup', function (e) { if (e.key === 'Control') E.setCtrl(false); });
      window.addEventListener('blur', function () { E.setCtrl(false); });
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) { Au.suspend(); P.flush(); E.setCtrl(false); } else Au.resume();
      });
      window.addEventListener('pagehide', function () { P.flush(); });
      // 禁止雙指縮放（iOS）
      document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
      document.addEventListener('dblclick', function (e) { e.preventDefault(); });
      var fsChange = function () { if (dom.fsInput) dom.fsInput.checked = isFs(); };
      document.addEventListener('fullscreenchange', fsChange);
      document.addEventListener('webkitfullscreenchange', fsChange);
    },
  });

  // ================================================================ 全螢幕
  function fsSupported() {
    var d = document.documentElement;
    var can = !!(d.requestFullscreen || d.webkitRequestFullscreen);
    var enabled = document.fullscreenEnabled != null ? document.fullscreenEnabled : document.webkitFullscreenEnabled;
    return can && enabled !== false;
  }
  function isFs() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function isStandalone() {
    try {
      return window.matchMedia('(display-mode: fullscreen)').matches || window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    } catch (e) { return false; }
  }
  function enterFs() {
    var d = document.documentElement;
    try {
      var p = d.requestFullscreen ? d.requestFullscreen({ navigationUI: 'hide' }) : d.webkitRequestFullscreen ? d.webkitRequestFullscreen() : null;
      if (p && p.catch) p.catch(function () { VN.toast('無法進入全螢幕'); });
    } catch (e) { /* 忽略 */ }
  }
  function exitFs() {
    try {
      if (!isFs()) return;
      var p = document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen ? document.webkitExitFullscreen() : null;
      if (p && p.catch) p.catch(function () {});
    } catch (e) { /* 忽略 */ }
  }
  VN.fullscreen = { supported: fsSupported, active: isFs, enter: enterFs, exit: exitFs, standalone: isStandalone };
})();
