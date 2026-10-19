/* 跨周目資料（CG、結局、讀過的章節與台詞、設定）與存檔欄位 */
(function () {
  'use strict';
  var VN = window.VN;
  var Store = VN.Store;

  var SLOT_PAGES = 3;
  var SLOTS_PER_PAGE = 6;

  function defaultSettings() {
    return {
      fullscreen: false,  // 偏好：開始遊戲時自動進入全螢幕
      bgmVol: 70,
      seVol: 80,
      textSpeed: 6,       // 1～10（10 = 立即顯示）
      autoSpeed: 5,       // 1～10（越大越快）
      skipReadOnly: true,
    };
  }
  function defaults() {
    return { v: 1, cgs: {}, endings: {}, chapters: {}, side: {}, read: {}, choices: {}, settings: defaultSettings() };
  }

  var saveTimer = null;
  var P = (VN.Persist = {
    SLOT_PAGES: SLOT_PAGES,
    SLOTS_PER_PAGE: SLOTS_PER_PAGE,
    g: null,

    load: function () {
      var g = Store.get('global', null);
      var d = defaults();
      if (!g || typeof g !== 'object') g = d;
      ['cgs', 'endings', 'chapters', 'side', 'read', 'choices'].forEach(function (k) {
        if (!g[k] || typeof g[k] !== 'object') g[k] = {};
      });
      g.settings = Object.assign(defaultSettings(), g.settings || {});
      this.g = g;
      return g;
    },
    flush: function () {
      clearTimeout(saveTimer);
      saveTimer = null;
      Store.set('global', this.g);
    },
    /** 頻繁更新（已讀台詞）用延遲寫入 */
    saveSoon: function () {
      if (saveTimer) return;
      var self = this;
      saveTimer = setTimeout(function () { self.flush(); }, 800);
    },

    get settings() { return this.g.settings; },
    setSetting: function (k, v) { this.g.settings[k] = v; this.flush(); },

    unlockCG: function (id) {
      if (this.g.cgs[id]) return false;
      this.g.cgs[id] = Date.now();
      this.flush();
      return true;
    },
    hasCG: function (id) { return !!this.g.cgs[id]; },

    reachEnding: function (code, name) {
      this.g.endings[code] = { name: name || '', at: Date.now() };
      this.flush();
    },
    anyEnding: function () { return Object.keys(this.g.endings).length > 0; },

    markChapter: function (route, num) {
      var bucket = route === 'side' ? this.g.side : this.g.chapters;
      if (bucket[num]) return;
      bucket[num] = Date.now();
      this.flush();
    },
    chapterRead: function (num) { return !!this.g.chapters[num]; },
    sideRead: function (num) { return !!this.g.side[num]; },

    isRead: function (id) { return !!this.g.read[id]; },
    markRead: function (id) {
      if (!id || this.g.read[id]) return;
      this.g.read[id] = 1;
      this.saveSoon();
    },
    markChoice: function (key) {
      if (this.g.choices[key]) return;
      this.g.choices[key] = 1;
      this.saveSoon();
    },
    choiceSeen: function (key) { return !!this.g.choices[key]; },

    // -------------------------------------------------- 存檔
    slotKey: function (slot) { return slot === 'auto' ? 'save.auto' : 'save.' + slot; },
    readSlot: function (slot) {
      var s = Store.get(this.slotKey(slot), null);
      return s && typeof s === 'object' && s.state ? s : null;
    },
    writeSlot: function (slot, data) {
      data.slot = slot;
      return Store.set(this.slotKey(slot), data);
    },
    deleteSlot: function (slot) { Store.remove(this.slotKey(slot)); },
    allSlots: function () {
      var out = [];
      for (var i = 1; i <= SLOT_PAGES * SLOTS_PER_PAGE; i++) out.push(i);
      return out;
    },
    /** 最新的存檔（含自動存檔） */
    latest: function () {
      var best = null;
      var self = this;
      ['auto'].concat(this.allSlots()).forEach(function (k) {
        var s = self.readSlot(k);
        if (s && (!best || (s.time || 0) > (best.time || 0))) best = s;
      });
      return best;
    },
  });
})();
