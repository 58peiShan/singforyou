/* 音樂與音效：有檔案就播檔案，沒有就用 WebAudio 即時合成的佔位音樂／音效。
   瀏覽器規定：要等玩家第一次點擊／按鍵後才能出聲。 */
(function () {
  'use strict';
  var VN = window.VN;

  var ctx = null, bgmBus = null, seBus = null, reverbIn = null, noiseBuf = null;
  var unlocked = false;
  var useGraph = /^https?:$/.test(location.protocol); // file:// 下不能把 <audio> 接進 WebAudio
  var cur = null;          // 目前的音樂軌
  var wantName = null;     // 劇本要求的音樂（尚未解鎖時先記住）
  var tracks = [];         // 所有還在發聲的軌（含淡出中）
  var timer = null;
  var vol = { bgm: 0.7, se: 0.8 };

  function mtof(m) { return 440 * Math.pow(2, (m - 69) / 12); }

  // ------------------------------------------------------------ 初始化
  function ensureCtx() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { ctx = new AC(); } catch (e) { ctx = null; return null; }
    var comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    comp.connect(ctx.destination);
    bgmBus = ctx.createGain();
    seBus = ctx.createGain();
    bgmBus.connect(comp);
    seBus.connect(comp);
    // 殘響
    var conv = ctx.createConvolver();
    var len = Math.floor(ctx.sampleRate * 2.6);
    var ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var ch = 0; ch < 2; ch++) {
      var d = ir.getChannelData(ch);
      for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    conv.buffer = ir;
    reverbIn = ctx.createGain();
    reverbIn.gain.value = 0.9;
    reverbIn.connect(conv);
    conv.connect(bgmBus);
    // 粉紅雜訊
    var nlen = ctx.sampleRate * 4;
    noiseBuf = ctx.createBuffer(1, nlen, ctx.sampleRate);
    var nd = noiseBuf.getChannelData(0);
    var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (var j = 0; j < nlen; j++) {
      var w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852;
      b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
      nd[j] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
    applyVolumes();
    return ctx;
  }

  function applyVolumes() {
    var s = VN.Persist && VN.Persist.g ? VN.Persist.settings : null;
    if (s) { vol.bgm = s.bgmVol / 100; vol.se = s.seVol / 100; }
    if (ctx) {
      bgmBus.gain.setTargetAtTime(vol.bgm * vol.bgm, ctx.currentTime, 0.05);
      seBus.gain.setTargetAtTime(vol.se * vol.se, ctx.currentTime, 0.05);
    }
    tracks.forEach(function (t) { if (t.refresh) t.refresh(); });
  }

  function noiseSource() {
    var src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    src.loopStart = Math.random() * 2;
    return src;
  }

  // ------------------------------------------------------------ 佔位音樂的曲風
  // chords：[低音, 和弦音...]（MIDI 編號，60 = 中央 C）
  var PRESETS = {
    '標題曲': { bpm: 64, spc: 16, chords: [[38, 62, 66, 69, 73], [35, 59, 62, 66, 69], [43, 55, 59, 62, 66], [45, 57, 61, 64, 69]], arp: [1, 2, 3, 4, 3, 2, 4, 3], arpUp: 12, arpP: 0.7, arpWave: 'sine', pad: 'triangle', cut: 1400, bell: 0.12, scale: [74, 76, 78, 81, 83, 86, 88], ocean: 0.55, vol: 0.9 },
    '貝貝國': { bpm: 54, spc: 16, chords: [[38, 62, 65, 69, 76], [34, 58, 62, 65, 69], [43, 55, 58, 62, 69], [45, 57, 62, 64, 69]], arp: [4, 3, 2, 4, 1, 3, 2, 4], arpUp: 12, arpP: 0.45, arpWave: 'triangle', pad: 'sine', cut: 900, bell: 0.22, scale: [74, 76, 77, 81, 83, 86], deep: 0.35, vol: 0.95 },
    '白鹽灣日常': { bpm: 100, spc: 8, chords: [[36, 60, 64, 67, 72], [43, 59, 62, 67, 71], [45, 57, 60, 64, 69], [41, 57, 60, 65, 69]], arp: [1, 3, 2, 4, 3, 2, 4, 3], arpUp: 12, arpP: 0.85, arpWave: 'triangle', pad: 'triangle', cut: 1800, bell: 0.14, scale: [72, 74, 76, 79, 81, 84], bassPulse: 4, ocean: 0.35, vol: 0.8 },
    '營火之歌': { bpm: 84, spc: 6, chords: [[43, 55, 59, 62, 67], [40, 52, 55, 59, 64], [36, 52, 55, 60, 64], [38, 54, 57, 62, 66]], arp: [1, 2, 3, 4, 3, 2], arpUp: 12, arpP: 0.95, arpWave: 'triangle', pluck: 0.9, pad: 'sine', cut: 1000, bell: 0.08, scale: [67, 69, 71, 74, 76, 79], ocean: 0.25, crackle: 0.5, vol: 0.85 },
    '心動': { bpm: 76, spc: 8, chords: [[41, 65, 69, 72, 76], [40, 64, 67, 71, 74], [38, 62, 65, 69, 72], [36, 60, 64, 67, 71]], arp: [1, 3, 4, 2, 3, 4, 2, 3], arpUp: 12, arpP: 0.8, arpWave: 'sine', box: true, pad: 'triangle', cut: 1500, bell: 0.2, scale: [77, 79, 81, 84, 86, 88], vol: 0.85 },
    '夜': { bpm: 54, spc: 16, chords: [[45, 57, 60, 64, 69], [41, 53, 57, 60, 65], [36, 55, 60, 64, 67], [43, 55, 59, 62, 67]], arp: [1, 2, 3, 4, 3, 2, 3, 4], arpUp: 12, arpP: 0.4, arpWave: 'sine', pad: 'sine', cut: 900, bell: 0.1, scale: [69, 72, 74, 76, 79, 81], ocean: 0.25, vol: 0.9 },
    '暴風雨': { bpm: 132, spc: 8, chords: [[38, 50, 53, 57, 62], [34, 46, 50, 53, 58], [36, 48, 52, 55, 60], [33, 45, 49, 52, 57]], arp: null, pad: 'sawtooth', cut: 650, trem: 8, bassPulse: 1, heart: 0, wind: 0.7, ocean: 0.5, vol: 0.7 },
    '緊張': { bpm: 138, spc: 8, chords: [[38, 50, 53, 57], [39, 51, 55, 58], [38, 50, 53, 57], [37, 49, 52, 55]], arp: [1, 1, 2, 1, 3, 1, 2, 1], arpUp: 0, arpP: 1, arpWave: 'square', arpCut: 900, pad: 'sawtooth', cut: 520, bassPulse: 1, heart: 1, vol: 0.62 },
    '結局曲': { bpm: 70, spc: 8, chords: [[36, 60, 64, 67, 71], [45, 57, 60, 64, 67], [41, 57, 60, 64, 65], [43, 55, 59, 62, 67]], arp: [1, 2, 3, 4, 3, 2, 4, 3], arpUp: 12, arpP: 0.7, arpWave: 'sine', pad: 'triangle', cut: 1500, bell: 0.18, scale: [72, 74, 76, 79, 81, 84], ocean: 0.3, vol: 0.9 },
  };
  var PRESET_NAMES = Object.keys(PRESETS);
  function presetFor(name) {
    var base = VN.baseName(name);
    var p = PRESETS[name] || PRESETS[base];
    if (!p) {
      // 用關鍵字猜，再不行用名稱雜湊挑一首
      var guess = [[/暴風|颱風|雨/, '暴風雨'], [/緊張|危險|追/, '緊張'], [/夜|月|星/, '夜'], [/心|戀|吻/, '心動'], [/營火|火|歌/, '營火之歌'], [/海底|貝貝|人魚|深/, '貝貝國'], [/結局|尾聲|明年/, '結局曲'], [/日常|白鹽|灣|鎮/, '白鹽灣日常'], [/標題/, '標題曲']];
      for (var i = 0; i < guess.length; i++) if (guess[i][0].test(name)) { p = PRESETS[guess[i][1]]; break; }
      if (!p) p = PRESETS[PRESET_NAMES[VN.hash(base) % PRESET_NAMES.length]];
    }
    var quiet = /安靜|靜|鋼琴|弱|小聲/.test(name) && name !== base;
    if (quiet) p = Object.assign({}, p, { vol: p.vol * 0.7, arpP: (p.arpP || 0) * 0.55, bassPulse: 0, heart: 0, crackle: 0, bell: (p.bell || 0) * 0.7, cut: (p.cut || 1200) * 0.8 });
    return p;
  }

  // ------------------------------------------------------------ 合成器音色
  function env(g, t, a, peak, d, sus, rel, end) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
    if (sus != null) {
      g.gain.exponentialRampToValueAtTime(Math.max(sus, 0.0002), t + a + d);
      g.gain.setValueAtTime(Math.max(sus, 0.0002), end);
      g.gain.exponentialRampToValueAtTime(0.0001, end + rel);
    } else {
      g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
    }
  }
  function voice(out, t, midi, type, peak, a, d, sus, rel, end, cut, detune) {
    var o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = mtof(midi);
    if (detune) o.detune.value = detune;
    var g = ctx.createGain();
    var f = null;
    if (cut) { f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cut; f.Q.value = 0.4; o.connect(f); f.connect(g); } else o.connect(g);
    g.connect(out);
    env(g, t, a, peak, d, sus, rel, end || t + a + d);
    o.start(t);
    var stopAt = (sus != null ? end + rel : t + a + d) + 0.05;
    o.stop(stopAt);
    o.onended = function () { try { g.disconnect(); if (f) f.disconnect(); } catch (e) { /* 已斷開 */ } };
  }

  // ------------------------------------------------------------ 佔位音樂軌
  function SynthTrack(name) {
    this.name = name;
    this.p = presetFor(name);
    this.out = ctx.createGain();
    this.out.gain.value = 0.0001;
    this.out.connect(bgmBus);
    this.send = ctx.createGain();
    this.send.gain.value = 0.35;
    this.out.connect(this.send);
    this.send.connect(reverbIn);
    this.stepDur = 60 / this.p.bpm / 2;
    this.next = ctx.currentTime + 0.12;
    this.step = 0;
    this.alive = true;
    this.srcs = [];
    this.rnd = VN.rng(name);
    var p = this.p;
    if (p.ocean) this.ocean(p.ocean);
    if (p.wind) this.wind(p.wind);
    if (p.deep) this.deep(p.deep);
  }
  SynthTrack.prototype.ocean = function (level) {
    var src = noiseSource();
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 650;
    var g = ctx.createGain(); g.gain.value = level * 0.55;
    var lfo = ctx.createOscillator(); lfo.frequency.value = 0.085;
    var lg = ctx.createGain(); lg.gain.value = level * 0.45;
    lfo.connect(lg); lg.connect(g.gain);
    var lfo2 = ctx.createOscillator(); lfo2.frequency.value = 0.085;
    var lg2 = ctx.createGain(); lg2.gain.value = 380;
    lfo2.connect(lg2); lg2.connect(lp.frequency);
    src.connect(lp); lp.connect(g); g.connect(this.out);
    src.start(); lfo.start(); lfo2.start();
    this.srcs.push(src, lfo, lfo2);
  };
  SynthTrack.prototype.wind = function (level) {
    var src = noiseSource();
    var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 1.4;
    var g = ctx.createGain(); g.gain.value = level * 0.8;
    var lfo = ctx.createOscillator(); lfo.frequency.value = 0.13;
    var lg = ctx.createGain(); lg.gain.value = 420;
    lfo.connect(lg); lg.connect(bp.frequency);
    src.connect(bp); bp.connect(g); g.connect(this.out);
    src.start(); lfo.start();
    this.srcs.push(src, lfo);
  };
  SynthTrack.prototype.deep = function (level) {
    var src = noiseSource();
    var lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 220;
    var g = ctx.createGain(); g.gain.value = level;
    src.connect(lp); lp.connect(g); g.connect(this.out);
    src.start();
    this.srcs.push(src);
  };
  SynthTrack.prototype.schedule = function () {
    if (!this.alive) return;
    var horizon = ctx.currentTime + 0.3;
    while (this.next < horizon) {
      this.play(this.step, this.next);
      this.next += this.stepDur;
      this.step++;
    }
  };
  SynthTrack.prototype.play = function (step, t) {
    var p = this.p, out = this.out, r = this.rnd;
    var ci = Math.floor(step / p.spc) % p.chords.length;
    var chord = p.chords[ci];
    var inChord = step % p.spc;
    var chordDur = p.spc * this.stepDur;
    if (inChord === 0) {
      // 和弦墊音
      for (var i = 1; i < chord.length; i++) {
        voice(out, t, chord[i], p.pad, 0.032, 0.9, 0.6, 0.024, 1.6, t + chordDur - 0.2, p.cut, (i % 2 ? 6 : -6));
      }
      if (p.trem) {
        for (var k = 0; k < p.spc; k++) voice(out, t + k * this.stepDur, chord[1] + 12, 'sawtooth', 0.012, 0.02, this.stepDur * 0.8, null, 0, 0, 900);
      }
      // 低音
      voice(out, t, chord[0], 'sine', 0.12, 0.05, 0.4, 0.07, 0.6, t + chordDur - 0.3, 600);
    }
    if (p.bassPulse && inChord % p.bassPulse === 0 && inChord !== 0) {
      voice(out, t, chord[0] + (inChord % 4 === 2 ? 12 : 0), 'triangle', 0.07, 0.01, this.stepDur * 0.9, null, 0, 0, 500);
    }
    if (p.heart && inChord % 4 === 0) this.thump(t, 0.32);
    if (p.heart && inChord % 4 === 1) this.thump(t, 0.18);
    if (p.arp && r() < p.arpP) {
      var n = chord[p.arp[step % p.arp.length] % chord.length] + (p.arpUp || 0);
      if (p.box) voice(out, t, n + 12, 'sine', 0.05, 0.004, 1.3, null, 0, 0, null);
      voice(out, t, n, p.arpWave || 'triangle', p.pluck ? 0.07 : 0.055, 0.006, p.pluck ? 0.9 : 0.7, null, 0, 0, p.arpCut || 2600);
    }
    if (p.bell && r() < p.bell && inChord % 2 === 0) {
      var m = p.scale[Math.floor(r() * p.scale.length)];
      voice(out, t, m, 'sine', 0.045, 0.005, 2.2, null, 0, 0, null);
      voice(out, t, m + 19, 'sine', 0.008, 0.005, 0.9, null, 0, 0, null);
    }
    if (p.crackle && r() < p.crackle) this.crackle(t + r() * this.stepDur);
  };
  SynthTrack.prototype.thump = function (t, peak) {
    var o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18);
    var g = ctx.createGain(); env(g, t, 0.005, peak, 0.25);
    o.connect(g); g.connect(this.out); o.start(t); o.stop(t + 0.3);
  };
  SynthTrack.prototype.crackle = function (t) {
    var src = ctx.createBufferSource(); src.buffer = noiseBuf;
    var hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2500;
    var g = ctx.createGain(); env(g, t, 0.002, 0.05 + Math.random() * 0.06, 0.03);
    src.connect(hp); hp.connect(g); g.connect(this.out);
    src.start(t, Math.random() * 3, 0.06);
  };
  SynthTrack.prototype.fadeIn = function (sec) {
    var g = this.out.gain, now = ctx.currentTime;
    g.cancelScheduledValues(now); g.setValueAtTime(Math.max(g.value, 0.0001), now);
    g.linearRampToValueAtTime(this.p.vol, now + Math.max(sec, 0.05));
  };
  SynthTrack.prototype.stop = function (sec) {
    var self = this, g = this.out.gain, now = ctx.currentTime;
    sec = Math.max(sec || 0.05, 0.05);
    g.cancelScheduledValues(now); g.setValueAtTime(Math.max(g.value, 0.0001), now);
    g.linearRampToValueAtTime(0.0001, now + sec);
    setTimeout(function () {
      self.alive = false;
      self.srcs.forEach(function (s) { try { s.stop(); } catch (e) { /* 已停止 */ } });
      try { self.out.disconnect(); self.send.disconnect(); } catch (e) { /* 已斷開 */ }
      tracks = tracks.filter(function (x) { return x !== self; });
    }, sec * 1000 + 300);
  };

  // ------------------------------------------------------------ 檔案音樂軌
  function FileTrack(name, url) {
    var self = this;
    this.name = name;
    this.level = 0;
    this.target = 0;
    this.alive = true;
    var a = (this.el = new Audio());
    a.loop = true;
    a.preload = 'auto';
    a.src = url;
    this.graph = null;
    if (useGraph && ctx) {
      try {
        var src = ctx.createMediaElementSource(a);
        this.graph = ctx.createGain();
        this.graph.gain.value = 0;
        src.connect(this.graph);
        this.graph.connect(bgmBus);
      } catch (e) { this.graph = null; }
    }
    a.addEventListener('error', function () {
      if (!self.alive || cur !== self) return;
      // 檔案壞掉 → 改用佔位音樂
      self.alive = false;
      cur = null;
      startTrack(name, 1, true);
    });
  }
  FileTrack.prototype.refresh = function () {
    if (!this.graph) this.el.volume = VN.clamp(this.level * vol.bgm, 0, 1);
  };
  FileTrack.prototype.ramp = function (target, sec, done) {
    var self = this;
    clearInterval(this.iv);
    if (this.graph) {
      var g = this.graph.gain, now = ctx.currentTime;
      g.cancelScheduledValues(now); g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(target, now + Math.max(sec, 0.02));
      this.level = target;
      if (done) setTimeout(done, sec * 1000 + 50);
      return;
    }
    var from = this.level, t0 = performance.now(), ms = Math.max(sec * 1000, 20);
    this.iv = setInterval(function () {
      var k = Math.min(1, (performance.now() - t0) / ms);
      self.level = from + (target - from) * k;
      self.refresh();
      if (k >= 1) { clearInterval(self.iv); if (done) done(); }
    }, 40);
  };
  FileTrack.prototype.fadeIn = function (sec) {
    var p = this.el.play();
    if (p && p.catch) p.catch(function () { /* 尚未解鎖，之後重試 */ });
    this.ramp(1, sec);
  };
  FileTrack.prototype.stop = function (sec) {
    var self = this;
    this.alive = false;
    this.ramp(0, sec || 0.05, function () {
      try { self.el.pause(); self.el.removeAttribute('src'); self.el.load(); } catch (e) { /* 忽略 */ }
      tracks = tracks.filter(function (x) { return x !== self; });
    });
  };

  // ------------------------------------------------------------ 控制
  function tick() {
    tracks.forEach(function (t) { if (t.schedule) t.schedule(); });
  }
  function startTrack(name, fadeSec, forceSynth) {
    if (!ensureCtx()) return;
    var url = forceSynth ? null : VN.Assets.bgm(name);
    var t = url ? new FileTrack(name, url) : new SynthTrack(name);
    tracks.push(t);
    cur = t;
    t.fadeIn(fadeSec);
    if (!timer) timer = setInterval(tick, 60);
    tick();
  }

  var Au = (VN.Audio = {
    get unlocked() { return unlocked; },
    current: function () { return wantName; },
    unlock: function () {
      if (unlocked) return;
      if (!ensureCtx()) return;
      unlocked = true;
      try {
        // iOS：在手勢中播一個無聲 buffer 才能真正解鎖
        var b = ctx.createBuffer(1, 1, 22050);
        var s = ctx.createBufferSource(); s.buffer = b; s.connect(ctx.destination); s.start(0);
      } catch (e) { /* 忽略 */ }
      if (ctx.state !== 'running' && ctx.resume) ctx.resume();
      if (wantName && !cur) startTrack(wantName, 1.5);
    },
    /** 換音樂（同名不重播），fade 秒數交叉淡入 */
    playBgm: function (name, fade) {
      if (fade == null) fade = 1.6;
      if (!name) return Au.stopBgm(fade);
      if (wantName === name && cur && cur.alive) return;
      wantName = name;
      if (!unlocked) return;
      if (cur) cur.stop(fade);
      cur = null;
      startTrack(name, fade);
    },
    stopBgm: function (fade) {
      wantName = null;
      if (cur) cur.stop(fade == null ? 0.4 : fade);
      cur = null;
    },
    playSe: function (name) {
      if (!unlocked || !ctx) return;
      var url = VN.Assets.se(name);
      if (url) return playSeFile(url);
      var fn = SE[name] || SE[VN.baseName(name)];
      if (!fn) {
        var guess = [[/浪|潮/, '海浪'], [/水|跳|潛/, '水花'], [/火/, '營火'], [/雷/, '雷'], [/雨/, '雨'], [/步|跑|走/, '腳步'], [/門/, '開門'], [/人|群|喧/, '人群'], [/玻璃|碎|破/, '玻璃碎裂']];
        for (var i = 0; i < guess.length; i++) if (guess[i][0].test(name)) { fn = SE[guess[i][1]]; break; }
      }
      if (fn) { try { fn(ctx.currentTime + 0.02); } catch (e) { /* 忽略 */ } }
    },
    applyVolumes: applyVolumes,
    /** 除錯用：目前的音訊狀態 */
    debug: function () {
      return { ctx: ctx ? ctx.state : null, unlocked: unlocked, want: wantName, tracks: tracks.map(function (t) { return t.name + (t.el ? '(檔案)' : '(合成)') + (t.alive ? '' : '(淡出中)'); }), vol: vol };
    },
    /** 試聽音效音量用 */
    blip: function () {
      if (!unlocked || !ctx) return;
      voice(seBus, ctx.currentTime + 0.01, 84, 'sine', 0.25, 0.005, 0.4, null, 0, 0, null);
    },
    suspend: function () {
      if (ctx && ctx.state === 'running' && ctx.suspend) ctx.suspend();
      tracks.forEach(function (t) { if (t.el) t.el.pause(); });
    },
    resume: function () {
      if (!unlocked) return;
      if (ctx && ctx.state !== 'running' && ctx.resume) ctx.resume();
      tracks.forEach(function (t) { if (t.el && t.alive) { var p = t.el.play(); if (p && p.catch) p.catch(function () {}); } });
    },
  });

  function playSeFile(url) {
    var a = new Audio(url);
    if (useGraph && ctx) {
      try { var s = ctx.createMediaElementSource(a); s.connect(seBus); } catch (e) { a.volume = vol.se; }
    } else a.volume = VN.clamp(vol.se, 0, 1);
    var p = a.play();
    if (p && p.catch) p.catch(function () {});
  }

  // ------------------------------------------------------------ 佔位音效
  function nz(t, dur, filterType, freq, q) {
    var src = ctx.createBufferSource(); src.buffer = noiseBuf;
    var f = ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; if (q) f.Q.value = q;
    var g = ctx.createGain();
    src.connect(f); f.connect(g); g.connect(seBus);
    src.start(t, Math.random() * 2, dur + 0.1);
    return { g: g, f: f };
  }
  var SE = {
    '海浪': function (t) {
      var n = nz(t, 3.4, 'lowpass', 300, 0.6);
      n.f.frequency.setValueAtTime(300, t); n.f.frequency.linearRampToValueAtTime(1500, t + 1.1); n.f.frequency.linearRampToValueAtTime(350, t + 3.3);
      n.g.gain.setValueAtTime(0.0001, t); n.g.gain.linearRampToValueAtTime(0.55, t + 1.0); n.g.gain.linearRampToValueAtTime(0.0001, t + 3.4);
      var w = nz(t + 0.8, 2.2, 'highpass', 3000);
      w.g.gain.setValueAtTime(0.0001, t + 0.8); w.g.gain.linearRampToValueAtTime(0.08, t + 1.2); w.g.gain.linearRampToValueAtTime(0.0001, t + 3);
    },
    '水花': function (t) {
      var n = nz(t, 0.7, 'highpass', 1200);
      env(n.g, t, 0.01, 0.5, 0.6);
      for (var i = 0; i < 7; i++) {
        var tt = t + 0.05 + Math.random() * 0.5;
        var o = ctx.createOscillator(); o.type = 'sine';
        var f0 = 700 + Math.random() * 1400;
        o.frequency.setValueAtTime(f0, tt); o.frequency.exponentialRampToValueAtTime(f0 * 1.8, tt + 0.06);
        var g = ctx.createGain(); env(g, tt, 0.003, 0.08, 0.07);
        o.connect(g); g.connect(seBus); o.start(tt); o.stop(tt + 0.1);
      }
    },
    '營火': function (t) {
      var n = nz(t, 2.6, 'lowpass', 380);
      n.g.gain.setValueAtTime(0.0001, t); n.g.gain.linearRampToValueAtTime(0.3, t + 0.4); n.g.gain.linearRampToValueAtTime(0.0001, t + 2.6);
      for (var i = 0; i < 26; i++) {
        var tt = t + Math.random() * 2.4;
        var c = nz(tt, 0.03, 'highpass', 2000 + Math.random() * 3000);
        env(c.g, tt, 0.002, 0.15 + Math.random() * 0.25, 0.025);
      }
    },
    '雨': function (t) {
      var n = nz(t, 3.2, 'bandpass', 2600, 0.5);
      n.g.gain.setValueAtTime(0.0001, t); n.g.gain.linearRampToValueAtTime(0.35, t + 0.6); n.g.gain.setValueAtTime(0.35, t + 2.4); n.g.gain.linearRampToValueAtTime(0.0001, t + 3.2);
      for (var i = 0; i < 30; i++) {
        var tt = t + Math.random() * 3;
        var c = nz(tt, 0.02, 'highpass', 4000);
        env(c.g, tt, 0.001, 0.08, 0.015);
      }
    },
    '雷': function (t) {
      var c = nz(t, 0.3, 'highpass', 900);
      env(c.g, t, 0.003, 0.7, 0.25);
      var r = nz(t + 0.05, 4, 'lowpass', 160);
      r.g.gain.setValueAtTime(0.0001, t + 0.05); r.g.gain.linearRampToValueAtTime(0.9, t + 0.3); r.g.gain.exponentialRampToValueAtTime(0.0001, t + 4);
    },
    '腳步': function (t) {
      for (var i = 0; i < 4; i++) {
        var tt = t + i * 0.38;
        var o = ctx.createOscillator(); o.type = 'sine';
        o.frequency.setValueAtTime(95, tt); o.frequency.exponentialRampToValueAtTime(48, tt + 0.1);
        var g = ctx.createGain(); env(g, tt, 0.004, 0.45, 0.12);
        o.connect(g); g.connect(seBus); o.start(tt); o.stop(tt + 0.15);
        var n = nz(tt, 0.06, 'bandpass', 1800, 1);
        env(n.g, tt, 0.002, 0.12, 0.05);
      }
    },
    '開門': function (t) {
      var o = ctx.createOscillator(); o.type = 'sawtooth';
      o.frequency.setValueAtTime(170, t); o.frequency.linearRampToValueAtTime(260, t + 0.5); o.frequency.linearRampToValueAtTime(210, t + 0.8);
      var v = ctx.createOscillator(); v.frequency.value = 23; var vg = ctx.createGain(); vg.gain.value = 18; v.connect(vg); vg.connect(o.frequency);
      var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1100; f.Q.value = 3;
      var g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.18, t + 0.1); g.gain.linearRampToValueAtTime(0.0001, t + 0.85);
      o.connect(f); f.connect(g); g.connect(seBus); o.start(t); v.start(t); o.stop(t + 0.9); v.stop(t + 0.9);
      var c = nz(t + 0.9, 0.06, 'bandpass', 2400, 2); env(c.g, t + 0.9, 0.002, 0.4, 0.06);
    },
    '人群': function (t) {
      var n = nz(t, 3, 'bandpass', 900, 0.8);
      n.g.gain.setValueAtTime(0.0001, t); n.g.gain.linearRampToValueAtTime(0.28, t + 0.6); n.g.gain.linearRampToValueAtTime(0.0001, t + 3);
      for (var i = 0; i < 18; i++) {
        var tt = t + Math.random() * 2.5;
        var o = ctx.createOscillator(); o.type = 'triangle';
        var f0 = 180 + Math.random() * 220;
        o.frequency.setValueAtTime(f0, tt); o.frequency.linearRampToValueAtTime(f0 * (0.8 + Math.random() * 0.5), tt + 0.25);
        var f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 700 + Math.random() * 900; f.Q.value = 4;
        var g = ctx.createGain(); env(g, tt, 0.04, 0.035, 0.22);
        o.connect(f); f.connect(g); g.connect(seBus); o.start(tt); o.stop(tt + 0.3);
      }
    },
    '玻璃碎裂': function (t) {
      var n = nz(t, 0.5, 'highpass', 3500);
      env(n.g, t, 0.002, 0.6, 0.4);
      for (var i = 0; i < 14; i++) {
        var tt = t + Math.random() * 0.6;
        var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 2500 + Math.random() * 4000;
        var g = ctx.createGain(); env(g, tt, 0.001, 0.07, 0.15 + Math.random() * 0.3);
        o.connect(g); g.connect(seBus); o.start(tt); o.stop(tt + 0.5);
      }
    },
  };
})();
