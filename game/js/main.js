/* 啟動 */
(function () {
  'use strict';
  var VN = window.VN;
  var game = document.getElementById('game');

  function bootError(html) {
    game.classList.remove('booting');
    var box = VN.el('div.boot-error', null, [VN.el('div', { html: html })]);
    game.appendChild(box);
  }

  var D = window.GAME_DATA;
  if (!D || !D.files) {
    bootError('<p>找不到劇本資料 <code>game/data/script.js</code>。</p><p>請先雙擊專案資料夾裡的 <code>build.bat</code>（或執行 <code>node tools/build.js</code>），再重新開啟這個頁面。</p>');
    return;
  }

  try {
    VN.Persist.load();
    VN.Stage.init();
    VN.Engine.init();
    VN.UI.initTitle();
    VN.UI.initInput();
    VN.Audio.applyVolumes();
    VN.UI.showTitle();
    game.classList.remove('booting');
    document.title = '《' + (D.title || '潮約之歌') + '》';
  } catch (err) {
    console.error(err);
    bootError('<p>遊戲啟動失敗：' + String(err && err.message ? err.message : err).replace(/</g, '&lt;') + '</p>');
    return;
  }

  // 網站上（http/https）註冊離線快取，加入主畫面後沒有網路也能玩
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').then(function () {
        return navigator.serviceWorker.ready;
      }).then(function (reg) {
        // 把所有素材交給離線快取預先下載
        var urls = {};
        var as = D.assets || {};
        Object.keys(as).forEach(function (type) {
          Object.keys(as[type]).forEach(function (k) { urls['assets/' + type + '/' + encodeURIComponent(as[type][k])] = 1; });
        });
        var list = Object.keys(urls);
        if (reg.active && list.length) reg.active.postMessage({ type: 'precache', urls: list });
      }).catch(function () { /* 不支援就算了 */ });
    });
  }
})();
