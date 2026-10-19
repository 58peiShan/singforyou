/* 共用工具：命名空間、DOM 小工具、安全的 localStorage 包裝 */
(function () {
  'use strict';
  var VN = (window.VN = window.VN || {});

  VN.$ = function (sel, root) { return (root || document).querySelector(sel); };
  VN.$$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /** el('div.cls#id', {attr}, [children|text]) */
  VN.el = function (spec, attrs, children) {
    var m = String(spec).match(/^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i) || [];
    var node = document.createElement(m[1] || 'div');
    (m[2] || '').replace(/([.#])([\w-]+)/g, function (_, t, v) {
      if (t === '.') node.classList.add(v); else node.id = v;
    });
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'text') node.textContent = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2), v);
        else if (k === 'dataset') Object.keys(v).forEach(function (d) { node.dataset[d] = v[d]; });
        else node.setAttribute(k, v === true ? '' : v);
      });
    }
    if (children != null) {
      [].concat(children).forEach(function (c) {
        if (c == null || c === false) return;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return node;
  };

  VN.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  VN.sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  VN.nextFrame = function () { return new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); }); };

  VN.hash = function (str) {
    var h = 0x811c9dc5;
    str = String(str);
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return h >>> 0;
  };
  /** 依字串產生可重現的亂數 */
  VN.rng = function (seed) {
    var a = typeof seed === 'number' ? seed : VN.hash(seed);
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  VN.pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
  VN.fmtTime = function (ts) {
    var d = new Date(ts);
    if (isNaN(d.getTime())) return '';
    return d.getFullYear() + '/' + VN.pad2(d.getMonth() + 1) + '/' + VN.pad2(d.getDate()) + ' ' + VN.pad2(d.getHours()) + ':' + VN.pad2(d.getMinutes());
  };

  /** 名稱正規化（和 build.js 相同）：各種中間點統一成「・」 */
  VN.normName = function (s) {
    s = String(s == null ? '' : s);
    if (s.normalize) s = s.normalize('NFC');
    return s.replace(/[·‧•∙⋅･]/g, '・').trim();
  };

  VN.isTouch = function () { return ('ontouchstart' in window) || navigator.maxTouchPoints > 0; };

  // ------------------------------------------------------------ 安全儲存
  var PREFIX = 'chaoyue.' + (window.VN_DATA_TAG ? window.VN_DATA_TAG + '.' : '');
  var mem = {};
  var warned = false;
  function storage() {
    try { var s = window.localStorage; if (!s) return null; return s; } catch (e) { return null; }
  }
  VN.Store = {
    get: function (key, def) {
      var raw = null;
      try {
        var s = storage();
        raw = s ? s.getItem(PREFIX + key) : null;
        if (raw == null && Object.prototype.hasOwnProperty.call(mem, key)) raw = mem[key];
      } catch (e) {
        raw = Object.prototype.hasOwnProperty.call(mem, key) ? mem[key] : null;
      }
      if (raw == null) return def;
      try { return JSON.parse(raw); } catch (e) { return def; }
    },
    set: function (key, val) {
      var str;
      try { str = JSON.stringify(val); } catch (e) { return false; }
      mem[key] = str;
      try {
        var s = storage();
        if (!s) throw new Error('no storage');
        s.setItem(PREFIX + key, str);
        delete mem[key];
        return true;
      } catch (e) {
        if (!warned) {
          warned = true;
          setTimeout(function () {
            if (VN.toast) VN.toast('瀏覽器不允許儲存資料（可能是無痕模式或空間已滿），存檔只會保留到關閉頁面為止。', 5000);
          }, 50);
        }
        return false;
      }
    },
    remove: function (key) {
      delete mem[key];
      try { var s = storage(); if (s) s.removeItem(PREFIX + key); } catch (e) { /* 忽略 */ }
    },
  };

  // ------------------------------------------------------------ 提示訊息
  var toastTimer = null;
  VN.toast = function (msg, ms) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, ms || 2600);
  };
})();
