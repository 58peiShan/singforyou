/* 音樂與音效：有檔案就播檔案，沒有就用 WebAudio 即時合成的佔位音樂／音效。
   瀏覽器規定：要等玩家第一次點擊／按鍵後才能出聲。 */
(function () {
  'use strict';
  var VN = window.VN;

  var ctx = null, bgmBus = null, seBus = null, reverbIn = null, noiseBuf = null;
  var seOut = null;        // 劇情音效目前要接到哪裡：平常是 seBus，「（室內）」時是隔窗濾波
  var seMuffled = false;
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
    seOut = seBus;
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
    /** 劇情音效。「名稱（室內）」＝隔著窗戶聽到的：變小聲、高音被玻璃擋掉（有專門的「名稱（室內）.mp3」就照原樣播） */
    playSe: function (name) {
      if (!unlocked || !ctx) return;
      var exact = VN.Assets.url('se', name);
      if (exact) return playSeFile(exact);
      var m = MUFFLE_RE.exec(name);
      var base = m ? name.slice(0, m.index).trim() : name;
      var url = VN.Assets.se(base);
      if (url) return playSeFile(url, !!m);
      var fn = SE[base] || SE[VN.baseName(base)];
      if (!fn) {
        var guess = [[/撥.*弦/, '撥和弦'], [/吉他|和弦|弦/, '刷和弦'], [/浪|潮/, '海浪'], [/水|跳|潛/, '水花'], [/火/, '營火'], [/雷/, '雷'], [/雨/, '雨'], [/步|跑|走/, '腳步'], [/門/, '開門'], [/人|群|喧/, '人群'], [/玻璃|碎|破/, '玻璃碎裂']];
        for (var i = 0; i < guess.length; i++) if (guess[i][0].test(base)) { fn = SE[guess[i][1]]; break; }
      }
      if (!fn) return;
      var mf = m ? muffleOut() : null;
      seOut = mf ? mf.node : seBus;
      seMuffled = !!mf;
      try { fn(ctx.currentTime + 0.02); } catch (e) { /* 忽略 */ }
      seOut = seBus;
      seMuffled = false;
      if (mf) setTimeout(mf.done, 12000);
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
    /** 介面回饋音：hover（滑過按鈕）、click（按下按鈕）、page（點對話框翻下一句）。設定裡可以關掉，音量跟著音效音量 */
    ui: function (kind) {
      if (!unlocked || !ctx) return;
      var s = VN.Persist && VN.Persist.g ? VN.Persist.settings : null;
      if (s && s.uiSound === false) return;
      var now = performance.now();
      if (now - (uiLast[kind] || 0) < (UI_GAP[kind] || 40)) return;   // 連續觸發時不要疊成一團
      uiLast[kind] = now;
      var url = VN.Assets.se(UI_FILE[kind]);
      if (url) return playSeFile(url);
      var fn = UI_SYNTH[kind];
      if (fn) { try { fn(ctx.currentTime + 0.005); } catch (e) { /* 忽略 */ } }
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

  function playSeFile(url, muffled) {
    var a = new Audio(url);
    var level = muffled ? MUFFLE_GAIN : 1;
    if (useGraph && ctx) {
      try {
        var s = ctx.createMediaElementSource(a);
        if (muffled) {
          var mf = muffleOut();
          s.connect(mf.node);
          a.addEventListener('ended', mf.done);
          a.addEventListener('error', mf.done);
        } else s.connect(seBus);
      } catch (e) { a.volume = VN.clamp(vol.se * level, 0, 1); }
    } else a.volume = VN.clamp(vol.se * level, 0, 1);   // 雙擊開啟（file://）時無法濾波，只能變小聲
    var p = a.play();
    if (p && p.catch) p.catch(function () {});
  }

  // ------------------------------------------------------------ 隔著窗戶：玻璃和牆擋掉高音，只剩悶悶的低頻，再帶一點室內的共鳴
  var MUFFLE_RE = /[（(](室內|隔窗)[）)]\s*$/;
  var MUFFLE_GAIN = 0.5;
  function muffleOut() {
    var g = ctx.createGain(); g.gain.value = MUFFLE_GAIN;
    var lp1 = ctx.createBiquadFilter(); lp1.type = 'lowpass'; lp1.frequency.value = 850; lp1.Q.value = 0.7;
    var lp2 = ctx.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 1500; lp2.Q.value = 0.5;
    var room = ctx.createBiquadFilter(); room.type = 'peaking'; room.frequency.value = 280; room.Q.value = 1; room.gain.value = 3;
    g.connect(lp1); lp1.connect(lp2); lp2.connect(room); room.connect(seBus);
    var done = function () { try { g.disconnect(); lp1.disconnect(); lp2.disconnect(); room.disconnect(); } catch (e) { /* 已斷開 */ } };
    return { node: g, done: done };
  }

  // ------------------------------------------------------------ 介面回饋音（放了 se/介面滑過.mp3 等檔案就改用檔案）
  var uiLast = {};
  var UI_GAP = { hover: 45, click: 30, page: 50 };
  var UI_FILE = { hover: '介面滑過', click: '介面點擊', page: '介面翻頁' };
  var UI_SYNTH = {
    // 音樂盒般的清脆一聲，音高在五聲音階裡隨機，掃過整排按鈕會像撥琴
    hover: function (t) {
      var m = [86, 88, 91, 93, 95][Math.floor(Math.random() * 5)];
      voice(seBus, t, m, 'sine', 0.05, 0.003, 0.24, null, 0, 0, null);
      voice(seBus, t, m + 12, 'sine', 0.012, 0.002, 0.09, null, 0, 0, null);
    },
    // 兩個音往上的「叮鈴」
    click: function (t) {
      voice(seBus, t, 88, 'sine', 0.075, 0.003, 0.3, null, 0, 0, null);
      voice(seBus, t, 76, 'triangle', 0.025, 0.004, 0.18, null, 0, 0, 1800);
      voice(seBus, t + 0.065, 95, 'sine', 0.06, 0.003, 0.5, null, 0, 0, null);
    },
    // 翻書頁的輕柔沙沙聲，加一點點木頭般的觸感
    page: function (t) {
      var n = nz(t, 0.16, 'bandpass', 2400, 0.7);
      n.f.frequency.setValueAtTime(1600, t);
      n.f.frequency.exponentialRampToValueAtTime(4200, t + 0.12);
      n.g.gain.setValueAtTime(0.0001, t);
      n.g.gain.exponentialRampToValueAtTime(0.13, t + 0.025);
      n.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
      var o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(300, t + 0.05);
      var g = ctx.createGain(); env(g, t, 0.002, 0.035, 0.06);
      o.connect(g); g.connect(seBus); o.start(t); o.stop(t + 0.08);
    },
  };

  // ------------------------------------------------------------ 吉他：Karplus-Strong 撥弦合成
  // 一條弦 = 一段長度等於一個週期的延遲線，填入雜訊後反覆「平均＋衰減」，就會變成會自然衰減的弦音
  var pluckCache = {};
  var seVerb = null;
  function pluckBuffer(midi, variant) {
    var key = midi + ':' + variant;
    if (pluckCache[key]) return pluckCache[key];
    var sr = ctx.sampleRate;
    var len = Math.floor(sr * 3.2);
    var buf = ctx.createBuffer(1, len, sr);
    var out = buf.getChannelData(0);
    var N = Math.max(2, Math.round(sr / mtof(midi) + 0.5));   // 「和下一個樣本平均」會讓週期少半個樣本，這裡補回來
    var line = new Float32Array(N);
    var a = variant ? 0.72 : 0.55, lp = 0, mean = 0, peak = 0, i;
    for (i = 0; i < N; i++) { lp += a * ((Math.random() * 2 - 1) - lp); line[i] = lp; mean += lp; }   // 濾過的雜訊：音色比較溫暖
    mean /= N;
    for (i = 0; i < N; i++) { line[i] -= mean; peak = Math.max(peak, Math.abs(line[i])); }
    for (i = 0; i < N; i++) line[i] /= peak || 1;
    var rho = 0.9972, p = 0;
    for (i = 0; i < len; i++) {
      var q = p + 1 === N ? 0 : p + 1;
      var y = line[p];
      line[p] = rho * 0.5 * (y + line[q]);
      out[i] = y;
      p = q;
    }
    var fade = Math.floor(sr * 0.25);
    for (i = 0; i < fade; i++) out[len - 1 - i] *= i / fade;
    pluckCache[key] = buf;
    return buf;
  }
  /** 吉他的輸出：琴身共鳴（低頻峰）＋一點空氣感＋小房間殘響 */
  function guitarOut(sec) {
    if (!seVerb) {
      var conv = ctx.createConvolver();
      var len = Math.floor(ctx.sampleRate * 1.1);
      var ir = ctx.createBuffer(2, len, ctx.sampleRate);
      for (var ch = 0; ch < 2; ch++) {
        var d = ir.getChannelData(ch);
        for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      }
      conv.buffer = ir;
      seVerb = ctx.createGain();
      seVerb.gain.value = 0.16;
      seVerb.connect(conv);
      conv.connect(seBus);
    }
    var g = ctx.createGain();
    var body = ctx.createBiquadFilter(); body.type = 'peaking'; body.frequency.value = 190; body.Q.value = 1.1; body.gain.value = 4;
    var air = ctx.createBiquadFilter(); air.type = 'peaking'; air.frequency.value = 2600; air.Q.value = 0.8; air.gain.value = 2.5;
    var top = ctx.createBiquadFilter(); top.type = 'lowpass'; top.frequency.value = 6000;
    g.connect(body); body.connect(air); air.connect(top);
    top.connect(seOut);
    if (!seMuffled) top.connect(seVerb);
    setTimeout(function () { try { g.disconnect(); body.disconnect(); air.disconnect(); top.disconnect(); } catch (e) { /* 已斷開 */ } }, (sec + 4) * 1000);
    return g;
  }
  /** 刷一下：chord 是六條弦（低音 E → 高音 E）的 MIDI 音高，null = 不彈；dir 'd' 下刷、'u' 上刷（只掃高音那幾條） */
  function strum(out, ring, t, chord, dir, amp, spread) {
    var strings = [];
    for (var s = 0; s < 6; s++) if (chord[s] != null) strings.push(s);
    if (dir === 'u') strings = strings.slice(-4).reverse();
    strings.forEach(function (s, k) {
      var tt = t + k * spread + Math.random() * 0.004;
      var prev = ring[s];
      if (prev) prev.gain.setTargetAtTime(0.0001, tt, 0.015);   // 同一條弦再被彈到時，先前的振動會被止住
      var src = ctx.createBufferSource();
      src.buffer = pluckBuffer(chord[s], Math.random() < 0.5 ? 0 : 1);
      var g = ctx.createGain();
      g.gain.value = amp * (dir === 'u' ? 0.55 : 1) * (1 - k * 0.04);
      src.connect(g); g.connect(out); src.start(tt);
      src.onended = function () { try { g.disconnect(); } catch (e) { /* 已斷開 */ } };
      ring[s] = g;
    });
    // 撥片刮過弦的「刷」聲
    var n = nz(t, 0.09, 'bandpass', dir === 'u' ? 4200 : 3200, 1.2);
    env(n.g, t, 0.004, amp * 0.22, 0.07 + strings.length * spread);
  }
  // 和弦指法（G 大調，和〈營火之歌〉同調）
  var GTR = {
    G: [43, 47, 50, 55, 59, 67],
    C: [null, 48, 52, 55, 60, 64],
    D: [null, null, 50, 57, 62, 66],
  };

  // ------------------------------------------------------------ 佔位音效
  function nz(t, dur, filterType, freq, q) {
    var src = ctx.createBufferSource(); src.buffer = noiseBuf;
    var f = ctx.createBiquadFilter(); f.type = filterType; f.frequency.value = freq; if (q) f.Q.value = q;
    var g = ctx.createGain();
    src.connect(f); f.connect(g); g.connect(seOut);
    src.loop = true;   // 雜訊只有 4 秒，從隨機位置開始時要循環，長的音效才不會中途斷掉
    src.start(t, Math.random() * 2);
    src.stop(t + dur + 0.1);
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
        o.connect(g); g.connect(seOut); o.start(tt); o.stop(tt + 0.1);
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
    // 雨：寬頻的雨幕＋打在地上的嘶嘶聲＋大小雨滴；寫成「雨（室內）」時，隔窗濾波只留下悶悶的雨幕，再加上雨點敲玻璃的細碎聲
    '雨': function (t) {
      var D = 4.2;
      var swell = function (g, peak) {
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + 0.6);
        g.gain.setValueAtTime(peak, t + 2.8); g.gain.linearRampToValueAtTime(0.0001, t + D);
      };
      swell(nz(t, D, 'bandpass', 1100, 0.3).g, 0.3);
      swell(nz(t, D, 'bandpass', 2600, 0.5).g, 0.26);
      var i, tt;
      for (i = 0; i < 40; i++) {
        tt = t + Math.random() * (D - 0.8);
        env(nz(tt, 0.02, 'highpass', 4000).g, tt, 0.001, 0.08, 0.015);
      }
      for (i = 0; i < 14; i++) {
        tt = t + Math.random() * (D - 0.8);
        env(nz(tt, 0.05, 'bandpass', 900 + Math.random() * 900, 2.5).g, tt, 0.002, 0.12, 0.04);
      }
      if (!seMuffled) return;
      for (i = 0; i < 12; i++) {   // 窗玻璃本身在房間裡響，所以不經過悶音濾波
        tt = t + 0.3 + Math.random() * (D - 1.2);
        var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 2400 + Math.random() * 1600;
        var g = ctx.createGain(); env(g, tt, 0.001, 0.012 + Math.random() * 0.01, 0.03);
        o.connect(g); g.connect(seBus); o.start(tt); o.stop(tt + 0.06);
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
        o.connect(g); g.connect(seOut); o.start(tt); o.stop(tt + 0.15);
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
      o.connect(f); f.connect(g); g.connect(seOut); o.start(t); v.start(t); o.stop(t + 0.9); v.stop(t + 0.9);
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
        o.connect(f); f.connect(g); g.connect(seOut); o.start(tt); o.stop(tt + 0.3);
      }
    },
    '玻璃碎裂': function (t) {
      var n = nz(t, 0.5, 'highpass', 3500);
      env(n.g, t, 0.002, 0.6, 0.4);
      for (var i = 0; i < 14; i++) {
        var tt = t + Math.random() * 0.6;
        var o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 2500 + Math.random() * 4000;
        var g = ctx.createGain(); env(g, tt, 0.001, 0.07, 0.15 + Math.random() * 0.3);
        o.connect(g); g.connect(seOut); o.start(tt); o.stop(tt + 0.5);
      }
    },
    // 隨手刷一小段：G → C → D → G（下、下上的民謠節奏），最後一下讓它響著
    '刷和弦': function (t) {
      var e = 60 / 96 / 2;   // 八分音符
      var seq = [[0, 'G', 'd', 1], [2, 'G', 'd', 0.8], [3, 'G', 'u', 0.75], [4, 'C', 'd', 0.95], [6, 'C', 'd', 0.8], [7, 'C', 'u', 0.75], [8, 'D', 'd', 0.9], [9, 'D', 'u', 0.7], [10, 'G', 'd', 1]];
      var out = guitarOut(seq[seq.length - 1][0] * e + 3.2);
      var ring = [];
      seq.forEach(function (x) { strum(out, ring, t + x[0] * e, GTR[x[1]], x[2], 0.15 * x[3], x[2] === 'u' ? 0.009 : 0.012); });
    },
    // 慢慢撥下一個 G 和弦，讓它一直響
    '撥和弦': function (t) {
      strum(guitarOut(3.4), [], t, GTR.G, 'd', 0.17, 0.032);
    },
  };
})();
