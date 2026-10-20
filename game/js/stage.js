/* 舞台演出：背景交叉淡入、立繪排位與表情、主角頭像、CG、轉場、震動、章節卡 */
(function () {
  'use strict';
  var VN = window.VN;
  var el = VN.el;
  var A = VN.Assets;

  var dom = {};
  var bgFront = 0;           // 目前顯示中的背景槽
  var bgName = null;
  var sprites = [];          // [{c, e, f, node, real}]
  var forms = {};            // 角色 → 形態
  var cgState = null;
  var faded = false;
  var faceExpr = null;
  var faceShown = false;
  var speakerNow = null;
  var cardResolve = null;
  var cardTimer = null;

  /** 立繪橫向位置（%） */
  VN.layoutPositions = function (n, portrait) {
    if (n <= 0) return [];
    if (n === 1) return [50];
    if (n === 2) return portrait ? [27, 73] : [29, 71];
    if (n === 3) return portrait ? [17, 50, 83] : [19, 50, 81];
    var out = [];
    for (var i = 0; i < n; i++) out.push(((i + 0.5) / n) * 100);
    return out;
  };

  var S = (VN.Stage = {
    init: function () {
      dom.stage = document.getElementById('stage');
      dom.shaker = document.getElementById('shaker');
      dom.bg = [document.getElementById('bg0'), document.getElementById('bg1')];
      dom.area = document.getElementById('sprite-area');
      dom.cg = document.getElementById('cg-layer');
      dom.fade = document.getElementById('fx-fade');
      dom.flash = document.getElementById('fx-flash');
      dom.face = document.getElementById('face');
      dom.textbox = document.getElementById('textbox');
      dom.card = document.getElementById('card');
      var relayout = function () { S.layout(true); };
      window.addEventListener('resize', relayout);
      window.addEventListener('orientationchange', function () { setTimeout(relayout, 250); });
      dom.card.addEventListener('click', function (e) { e.stopPropagation(); S.dismissCard(); });
    },

    reset: function () {
      dom.bg.forEach(function (b) { b.innerHTML = ''; b.classList.remove('on'); });
      bgName = null;
      sprites.forEach(function (s) { s.node.remove(); });
      sprites = [];
      forms = {};
      dom.cg.innerHTML = '';
      dom.cg.classList.remove('on');
      cgState = null;
      S.setFaded(false, true);
      S.hideFace(true);
      faceExpr = null;
      speakerNow = null;
      S.closeCard(true);
    },

    // ------------------------------------------------------------ 背景
    setBg: function (name, instant) {
      if (name === bgName && dom.bg[bgFront].firstChild) return;
      bgName = name;
      var back = 1 - bgFront;
      var slotNew = dom.bg[back], slotOld = dom.bg[bgFront];
      slotNew.innerHTML = '';
      slotNew.appendChild(A.renderBg(name));
      slotNew.classList.toggle('instant', !!instant);
      slotOld.classList.toggle('instant', !!instant);
      // 新的在上面淡入
      slotNew.style.zIndex = 2;
      slotOld.style.zIndex = 1;
      void slotNew.offsetWidth;
      slotNew.classList.add('on');
      bgFront = back;
      clearTimeout(S._bgT);
      S._bgT = setTimeout(function () {
        slotOld.classList.remove('on');
        slotOld.innerHTML = '';
      }, instant ? 0 : 900);
    },
    get bg() { return bgName; },

    // ------------------------------------------------------------ 立繪
    find: function (c) { for (var i = 0; i < sprites.length; i++) if (sprites[i].c === c) return sprites[i]; return null; },

    _makeLayer: function (s) {
      var L = A.spriteLayer(s.c, s.e, s.f);
      var node = L.node;
      node.classList.add('layer');
      if (!L.placeholder && node.tagName === 'IMG') {
        node.addEventListener('load', function () { S.layout(false); });
        node.addEventListener('error', function () { s.real = false; setTimeout(function () { S.layout(false); }, 30); });
      }
      s.real = !L.placeholder;
      return node;
    },
    show: function (list, instant) {
      var added = [];
      list.forEach(function (it) {
        var s = S.find(it.c);
        if (s) { S.setExpr(it.c, it.e || '普通', instant); return; }
        s = { c: it.c, e: it.e || '普通', f: forms[it.c] || null };
        s.node = el('div.sprite.instant', { dataset: { char: it.c } });
        s.node.style.setProperty('--nc', VN.charColor(it.c));
        s.pose = el('div.pose');
        s.node.appendChild(s.pose);
        s.pose.appendChild(S._makeLayer(s));
        sprites.push(s);
        dom.area.appendChild(s.node);
        added.push(s);
      });
      S.layout(true, added);
      void dom.area.offsetWidth;
      added.forEach(function (s) {
        if (!instant) s.node.classList.remove('instant');
        s.node.classList.add('on');
        if (instant) requestAnimationFrame(function () { s.node.classList.remove('instant'); });
      });
      S.layout(!!instant);
      S.highlight(speakerNow);
    },

    setExpr: function (c, e, instant) {
      var s = S.find(c);
      if (!s) return false;
      e = e || '普通';
      if (s.e === e && s.f === (forms[c] || null)) return true;
      s.e = e;
      s.f = forms[c] || null;
      S._swapLayer(s, instant);
      return true;
    },
    _swapLayer: function (s, instant) {
      var old = s.pose.querySelector('.layer:not(.old)');
      var nn = S._makeLayer(s);
      if (old && !instant) {
        old.classList.add('old');
        nn.classList.add('new');
        s.pose.appendChild(nn);
        setTimeout(function () { old.remove(); nn.classList.remove('new'); }, 360);
      } else {
        if (old) old.remove();
        s.pose.appendChild(nn);
      }
      S.layout(!!instant);
    },

    setForm: function (c, f, instant) {
      f = f || null;
      if ((forms[c] || null) === f) return;
      if (f) forms[c] = f; else delete forms[c];
      var s = S.find(c);
      if (s) { s.f = f; S._swapLayer(s, instant); }
    },
    get forms() { return Object.assign({}, forms); },

    hide: function (names, instant) {
      var gone = names === 'all' ? sprites.slice() : sprites.filter(function (s) { return names.indexOf(s.c) >= 0; });
      if (!gone.length) return;
      sprites = sprites.filter(function (s) { return gone.indexOf(s) < 0; });
      gone.forEach(function (s) {
        if (instant) { s.node.remove(); return; }
        s.node.classList.remove('on');
        s.node.classList.add('leaving');
        setTimeout(function () { s.node.remove(); }, 520);
      });
      S.layout(!!instant);
    },

    layout: function (instant, only) {
      if (!dom.area) return;
      var W = dom.area.clientWidth || dom.stage.clientWidth;
      var H = dom.stage.clientHeight;
      var portrait = dom.stage.clientHeight > dom.stage.clientWidth;
      var tbTop = dom.textbox.offsetTop || H * 0.7;
      var n = sprites.length;
      var pos = VN.layoutPositions(n, portrait);
      sprites.forEach(function (s, i) {
        var aspect;
        if (s.real) {
          var img = s.pose.querySelector('img.layer:not(.old)');
          aspect = img && img.naturalWidth ? img.naturalWidth / img.naturalHeight : 1 / 1.4;
        } else aspect = A.isWide(s.c) ? 3 / 3.4 : 2 / 3;
        // 真實立繪是全身圖（約 1:1.4），橫式約 90% 舞台高、直式略小；佔位剪影是半身
        var base = (s.real ? (portrait ? 0.7 : 0.9) : (portrait ? 0.62 : 0.8) * A.spriteScale(s.c)) * H;
        var slotW = W / Math.max(n, 1);
        var maxH = n > 1 ? (slotW / aspect) * 1.3 : W / aspect;
        var h = Math.min(base, maxH);
        // 對話框上緣以上至少要露出的比例：全身圖露出上半身，半身剪影要露出肩膀
        var visible = s.real ? 0.5 : 0.8;
        var bottom = Math.max(0, H - tbTop - (1 - visible) * h);
        if (s.real && !portrait) bottom = Math.min(bottom, H * 0.04);
        var st = s.node.style;
        if (instant && (!only || only.indexOf(s) >= 0)) s.node.classList.add('instant');
        st.left = pos[i] + '%';
        st.height = Math.round(h) + 'px';
        st.bottom = Math.round(bottom) + 'px';
        st.zIndex = String(10 + (i === Math.floor(n / 2) ? 2 : 1));
      });
      if (instant) {
        void dom.area.offsetWidth;
        sprites.forEach(function (s) { if (s.node.classList.contains('on')) s.node.classList.remove('instant'); });
      }
    },

    highlight: function (speaker) {
      speakerNow = speaker || null;
      var target = speaker ? S.find(speaker) : null;
      sprites.forEach(function (s) {
        s.node.classList.toggle('lit', !!target && s === target);
        s.node.classList.toggle('dim', !!target && s !== target);
      });
    },

    // ------------------------------------------------------------ 主角頭像
    showFace: function (char, expr, instant) {
      expr = expr || '普通';
      dom.textbox.classList.add('has-face');
      if (faceShown && faceExpr === expr && dom.face.firstChild) return;
      var old = dom.face.querySelector('.face-av:not(.old)');
      var oldChip = dom.face.querySelector('.face-chip');
      var F = A.faceNode(char, expr);
      if (old && !instant) { old.classList.add('old'); setTimeout(function () { old.remove(); }, 320); } else if (old) old.remove();
      if (oldChip) oldChip.remove();
      dom.face.insertBefore(F.node, dom.face.firstChild);
      if (F.placeholder) dom.face.appendChild(el('div.face-chip', { text: expr }));
      faceExpr = expr;
      faceShown = true;
      dom.face.classList.add('on');
    },
    hideFace: function () {
      faceShown = false;
      dom.face.classList.remove('on');
      dom.textbox.classList.remove('has-face');
    },

    // ------------------------------------------------------------ CG
    showCG: function (id, title, instant) {
      var view = A.cgView(id, title);
      var old = dom.cg.firstChild;
      dom.cg.classList.toggle('instant', !!instant);
      if (old && dom.cg.classList.contains('on') && !instant) {
        view.style.opacity = '0';
        view.style.transition = 'opacity .7s ease';
        dom.cg.appendChild(view);
        void view.offsetWidth;
        view.style.opacity = '1';
        setTimeout(function () { if (old.parentNode) old.remove(); }, 750);
      } else {
        dom.cg.innerHTML = '';
        dom.cg.appendChild(view);
      }
      void dom.cg.offsetWidth;
      dom.cg.classList.add('on');
      cgState = { id: id, title: title };
    },
    hideCG: function (instant) {
      cgState = null;
      dom.cg.classList.toggle('instant', !!instant);
      dom.cg.classList.remove('on');
      clearTimeout(S._cgT);
      S._cgT = setTimeout(function () { if (!cgState) dom.cg.innerHTML = ''; }, instant ? 0 : 750);
    },
    get cg() { return cgState; },

    // ------------------------------------------------------------ 效果
    setFaded: function (on, instant) {
      faded = !!on;
      dom.fade.classList.toggle('instant', !!instant);
      dom.fade.classList.toggle('on', faded);
      if (instant) { void dom.fade.offsetWidth; dom.fade.classList.remove('instant'); }
    },
    get faded() { return faded; },
    flash: function () {
      dom.flash.classList.remove('go');
      void dom.flash.offsetWidth;
      dom.flash.classList.add('go');
    },
    shake: function () {
      dom.shaker.classList.remove('shake');
      void dom.shaker.offsetWidth;
      dom.shaker.classList.add('shake');
    },

    // ------------------------------------------------------------ 卡片
    /** kind: title / end / ending / tbc；回傳 Promise，點擊或時間到時 resolve */
    card: function (kind, data, autoMs) {
      S.closeCard(true);
      var c = dom.card;
      c.className = '';
      c.innerHTML = '';
      var inner = el('div.card-inner');
      var line = '<svg class="c-line" viewBox="0 0 320 14" preserveAspectRatio="none"><path d="M0,7 C27,0 53,14 80,7 S133,0 160,7 S213,14 240,7 S293,0 320,7" stroke="#e2b85a" stroke-width="1.5" fill="none"/><path d="M160,1.5 L165.5,7 L160,12.5 L154.5,7 Z" fill="#f6dc8c" stroke="#5e3e0b" stroke-width=".8"/></svg>';
      if (kind === 'title') {
        var parts = String(data.text).split(/[\s　]+/);
        if (parts.length > 1) inner.appendChild(el('span.c-small', { text: parts[0] }));
        inner.appendChild(el('span.c-big', { text: parts.length > 1 ? parts.slice(1).join('　') : parts[0] }));
        inner.insertAdjacentHTML('beforeend', line);
      } else if (kind === 'end') {
        inner.insertAdjacentHTML('beforeend', line);
        inner.appendChild(el('span.c-big', { text: data.text }));
        inner.insertAdjacentHTML('beforeend', line);
        inner.appendChild(el('span.c-note', { text: '點擊繼續' }));
      } else if (kind === 'ending') {
        c.classList.add('ending');
        if (data.code === 'BAD') c.classList.add('bad');
        inner.appendChild(el('span.c-pearl'));
        inner.appendChild(el('span.c-small', { text: data.label }));
        inner.appendChild(el('span.c-big', { text: '「' + data.name + '」' }));
        inner.insertAdjacentHTML('beforeend', line);
        inner.appendChild(el('span.c-note', { text: '點擊回到標題畫面' }));
      } else if (kind === 'tbc') {
        inner.appendChild(el('span.c-small', { text: data.small || '' }));
        inner.appendChild(el('span.c-big', { text: data.text }));
        inner.insertAdjacentHTML('beforeend', line);
        inner.appendChild(el('span.c-note', { text: data.note || '點擊回到標題畫面' }));
      }
      c.appendChild(inner);
      c.classList.add('show');
      void c.offsetWidth;
      c.classList.add('on');
      return new Promise(function (resolve) {
        cardResolve = resolve;
        if (autoMs) cardTimer = setTimeout(S.dismissCard, autoMs);
      });
    },
    get cardOpen() { return !!cardResolve; },
    dismissCard: function () {
      if (!cardResolve) return;
      var r = cardResolve;
      cardResolve = null;
      clearTimeout(cardTimer);
      var c = dom.card;
      c.classList.remove('on');
      setTimeout(function () { if (!cardResolve) { c.classList.remove('show'); c.innerHTML = ''; } }, 650);
      r();
    },
    closeCard: function (instant) {
      clearTimeout(cardTimer);
      cardResolve = null;
      dom.card.classList.remove('on');
      if (instant) { dom.card.classList.remove('show'); dom.card.innerHTML = ''; }
    },

    // ------------------------------------------------------------ 存讀
    snapshot: function () {
      return {
        bg: bgName,
        sprites: sprites.map(function (s) { return { c: s.c, e: s.e }; }),
        forms: Object.assign({}, forms),
        cg: cgState ? { id: cgState.id, title: cgState.title } : null,
        faded: faded,
      };
    },
    restore: function (snap) {
      S.reset();
      snap = snap || {};
      forms = Object.assign({}, snap.forms || {});
      if (snap.bg) S.setBg(snap.bg, true);
      if (snap.sprites && snap.sprites.length) S.show(snap.sprites, true);
      if (snap.cg) S.showCG(snap.cg.id, snap.cg.title, true);
      S.setFaded(!!snap.faded, true);
    },
  });
})();
