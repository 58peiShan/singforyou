/* 素材查找與佔位圖：背景、立繪剪影、主角頭像、CG 卡片、存檔縮圖 */
(function () {
  'use strict';
  var VN = window.VN;
  var el = VN.el;
  var uid = 0;
  function nextId() { uid += 1; return 'u' + uid; }

  // ================================================================ 素材查找
  var A = (VN.Assets = {
    data: function () { return (window.GAME_DATA && window.GAME_DATA.assets) || {}; },
    file: function (type, base) {
      var t = this.data()[type];
      return t && Object.prototype.hasOwnProperty.call(t, base) ? t[base] : null;
    },
    url: function (type, base) {
      var f = this.file(type, VN.normName(base));
      return f ? 'assets/' + type + '/' + encodeURIComponent(f) : null;
    },
    bg: function (name) { return this.url('bg', name); },
    cg: function (id) { return this.url('cg', id); },
    /** 立繪：有【形態】時先找 角色_形態_表情 → 角色_形態_普通，再退回一般的 角色_表情 → 角色_普通 */
    sprite: function (c, e, form) {
      e = e || '普通';
      var u = null;
      if (form) u = this.url('sprites', c + '_' + form + '_' + e) || this.url('sprites', c + '_' + form + '_普通');
      return u || this.url('sprites', c + '_' + e) || this.url('sprites', c + '_普通') || this.url('sprites', c);
    },
    face: function (c, e) { return this.url('face', c + '_' + (e || '普通')) || this.url('face', c + '_普通') || this.url('face', c); },
    bgm: function (name) { return this.url('bgm', name) || this.url('bgm', baseName(name)); },
    se: function (name) { return this.url('se', name) || this.url('se', baseName(name)); },
    ui: function (name) { return this.url('ui', name); },
  });
  function baseName(n) { return String(n || '').replace(/[（(][^）)]*[）)]\s*$/, '').trim(); }
  VN.baseName = baseName;

  /** 建立 <img>，載入失敗時換成 fallback() 產生的元素 */
  function imgOr(url, cls, fallback) {
    if (!url) return fallback();
    var img = el('img' + (cls ? '.' + cls.split(' ').join('.') : ''), { src: url, alt: '', draggable: 'false', decoding: 'async' });
    img.addEventListener('error', function () {
      var fb = fallback();
      if (img.parentNode) img.parentNode.replaceChild(fb, img);
    });
    return img;
  }
  VN.imgOr = imgOr;

  // ================================================================ 角色配色
  var CHAR_COLOR = {
    '孫承完': '#e5636e',
    '裴柱現': '#7d52b8',
    '阿英': '#3f9389',
    '康': '#e08a3a',
    '珊婆': '#d9668c',
    '澪': '#6f92b8',
    '潮后': '#8e3fa6',
  };
  VN.charColor = function (name) {
    if (!name) return null;
    if (CHAR_COLOR[name]) return CHAR_COLOR[name];
    if (/^[？?]+$/.test(name)) return '#5d6b80';
    var h = VN.hash(name) % 360;
    return 'hsl(' + h + ', 38%, 45%)';
  };

  // ================================================================ 背景佔位
  var SKY = {
    day: ['#3a8ad3', '#6fb8e8', '#b4def4', '#e6f6fb'],
    dusk: ['#1f2350', '#5e3a78', '#b8577a', '#ef8f68', '#ffcf94'],
    night: ['#02060f', '#061330', '#0c2250', '#1a3466'],
    dawn: ['#2b3a6b', '#7676a6', '#d39cad', '#f7cfb0', '#fff0da'],
  };
  var SKY_RAIN = {
    day: ['#4c5b6d', '#73828f', '#9eaab4'],
    dusk: ['#2f2c44', '#5a4c63', '#857078'],
    night: ['#03060d', '#0b1220', '#18212f'],
    dawn: ['#46506a', '#7a7f95', '#a6a3ad'],
  };
  var SKY_STORM = ['#06090c', '#121b21', '#202c31', '#33403f'];
  var SEA = {
    day: ['#3aa6d6', '#1f73ad', '#0d4479'],
    dusk: ['#b06a80', '#5e3f78', '#241f4a'],
    night: ['#123463', '#0a2046', '#030c22'],
    dawn: ['#93abcf', '#5d79a7', '#304a79'],
    rain: ['#4f6170', '#2f4252', '#16222e'],
    storm: ['#2a3a3c', '#16211f', '#070b0b'],
  };
  var SAND = {
    day: ['#f4e3bd', '#dfc08b'],
    dusk: ['#d8a07e', '#8f6157'],
    night: ['#353a52', '#1f2337'],
    dawn: ['#ecd2b8', '#c6a28c'],
    rain: ['#a59d8c', '#776f62'],
    storm: ['#4b4a44', '#2a2a27'],
  };

  function detect(name, forCG) {
    var n = String(name || '');
    var t = { name: n, scene: 'generic', time: null, weather: null };
    if (/全黑|黑畫面|黑幕/.test(n)) { t.scene = 'black'; return t; }
    if (/全白|白畫面|白光/.test(n)) { t.scene = 'white'; return t; }
    if (/黃昏|夕|傍晚|日落/.test(n)) t.time = 'dusk';
    else if (/清晨|黎明|日出|早晨|拂曉|破曉|天亮/.test(n)) t.time = 'dawn';
    else if (/夜|晚|月|星/.test(n)) t.time = 'night';
    else if (/白天|中午|午後|下午|早上|日間|晴/.test(n)) t.time = 'day';
    if (/暴風雨|颱風|風暴/.test(n)) t.weather = 'storm';
    else if (/雨/.test(n)) t.weather = 'rain';

    var rules = [
      [/海底|深海|貝貝國|王座|海中|水中|鱗/, 'deep'],
      [/海蝕洞|洞窟|洞穴/, 'cave'],
      [/酒吧|退潮/, 'bar'],
      [/小屋/, 'hut'],
      [/房間|臥室|室內|家|屋/, 'room'],
      [/舞台/, 'stage'],
      [/祭/, 'festival'],
      [/燈塔/, 'lighthouse'],
      [/救生站|瞭望台|救生員/, 'station'],
      [/礁石|岩/, 'reef'],
      [/營火/, 'campfire'],
      [/道路|公路|街|鎮|路|腳踏車/, 'road'],
      [/沙灘|海灘|海邊|岸|灣|海螺|救援/, 'beach'],
      [/海面|海上|外海|海|魚尾|潮/, 'sea'],
    ];
    for (var i = 0; i < rules.length; i++) {
      if (rules[i][0].test(n)) { t.scene = rules[i][1]; break; }
    }
    if (t.scene === 'generic' && forCG) t.scene = 'mood';
    if (!t.time) {
      if (/^(bar|festival|stage|campfire)$/.test(t.scene)) t.time = 'night';
      else if (t.scene === 'mood') t.time = ['dusk', 'night', 'dawn', 'day'][VN.hash(n) % 4];
      else t.time = 'day';
    }
    return t;
  }
  A.detectBg = detect;

  function grad(colors, dir) {
    var stops = colors.map(function (c, i) { return c + ' ' + Math.round((i / (colors.length - 1)) * 100) + '%'; });
    return 'linear-gradient(' + (dir || '180deg') + ', ' + stops.join(', ') + ')';
  }
  function wavePath(amp, periods) {
    // 每個週期 400 寬，可無縫平鋪
    var d = 'M0,50 C100,' + (50 - amp) + ' 300,' + (50 + amp) + ' 400,50';
    for (var i = 1; i < periods; i++) d += ' S' + (400 * i + 300) + ',' + (50 + amp) + ' ' + (400 * (i + 1)) + ',50';
    return d;
  }
  function waveBand(top, h, color, opts) {
    opts = opts || {};
    var amp = opts.amp || 18;
    var d = wavePath(amp, 8);
    var svg = '<svg viewBox="0 0 3200 100" preserveAspectRatio="none"><path d="' + d + ' L3200,100 L0,100Z" fill="' + color + '"' + (opts.opacity ? ' fill-opacity="' + opts.opacity + '"' : '') + '/>' +
      (opts.crest ? '<path d="' + d + '" fill="none" stroke="' + opts.crest + '" stroke-width="2.5" vector-effect="non-scaling-stroke"/>' : '') + '</svg>';
    return el('div.wave-band' + (opts.cls ? '.' + opts.cls : ''), {
      html: svg,
      style: { top: top + '%', height: h + '%', animationDuration: (opts.dur || 20) + 's', animationDirection: opts.rev ? 'reverse' : 'normal' },
    });
  }

  function renderBg(name, opts) {
    opts = opts || {};
    var t = detect(name, opts.cg);
    var root = el('div.bgp' + (opts.mini ? '.mini' : ''), { dataset: { scene: t.scene, time: t.time || '' } });
    var rnd = VN.rng(name || 'x');
    function add(cls, style, html) {
      var d = el('div.' + cls.split(' ').join('.'), { style: style || {}, html: html || null });
      root.appendChild(d);
      return d;
    }

    if (t.scene === 'black') { root.style.background = '#000'; return root; }
    if (t.scene === 'white') { root.style.background = '#fbfaf6'; return root; }

    var time = t.time;
    var wx = t.weather;
    var skyCols = wx === 'storm' ? SKY_STORM : wx === 'rain' ? SKY_RAIN[time] : SKY[time];
    var seaCols = wx ? SEA[wx] : SEA[time];
    var sandCols = wx ? SAND[wx] : SAND[time];
    var clear = !wx;

    function sky(hz) {
      add('sky', { background: grad(skyCols) });
      if (time === 'night' && clear) stars(70, hz || 60);
      if (clear) celestial(hz || 55);
      if (wx) add('mist', { top: (hz || 50) - 22 + '%' });
    }
    function stars(n, maxY) {
      var box = add('stars', { bottom: (100 - maxY) + '%' });
      for (var i = 0; i < n; i++) {
        var s = el('i.star' + (rnd() < 0.12 ? '.big' : ''), {
          style: { left: (rnd() * 100).toFixed(2) + '%', top: (Math.pow(rnd(), 1.4) * 100).toFixed(2) + '%', animationDelay: (rnd() * 3).toFixed(2) + 's', opacity: (0.35 + rnd() * 0.65).toFixed(2) },
        });
        box.appendChild(s);
      }
    }
    function celestial(hz) {
      if (time === 'night') {
        add('glow', { left: '76%', top: '18%', width: '42%', height: '62%', background: 'radial-gradient(closest-side, rgba(200,215,255,.22), transparent)' });
        add('orb', { left: '76%', top: '18%', width: '7.5%', background: 'radial-gradient(circle at 38% 35%, #fffef8, #efe9d8 50%, #cfc9bb)', boxShadow: '0 0 30px rgba(255,250,230,.6), 0 0 90px rgba(190,210,255,.35)' });
      } else if (time === 'day') {
        add('glow', { left: '80%', top: '12%', width: '60%', height: '80%', background: 'radial-gradient(closest-side, rgba(255,252,230,.85), rgba(255,250,220,.25) 40%, transparent)' });
        add('orb', { left: '80%', top: '12%', width: '6%', background: '#fffdf0', boxShadow: '0 0 40px 10px rgba(255,250,220,.9)' });
      } else if (time === 'dusk') {
        add('glow', { left: '58%', top: hz + '%', width: '110%', height: '70%', background: 'radial-gradient(closest-side, rgba(255,190,120,.75), rgba(255,140,110,.25) 45%, transparent)' });
        add('orb', { left: '58%', top: (hz - 3) + '%', width: '11%', background: 'radial-gradient(circle, #fff1c8, #ffb36b 60%, #ff8a5c)', boxShadow: '0 0 50px 12px rgba(255,160,100,.6)' });
      } else if (time === 'dawn') {
        add('glow', { left: '26%', top: hz + '%', width: '100%', height: '60%', background: 'radial-gradient(closest-side, rgba(255,230,200,.8), rgba(255,200,190,.2) 50%, transparent)' });
        add('orb', { left: '26%', top: (hz - 1.5) + '%', width: '7%', background: 'radial-gradient(circle, #fffaf0, #ffd9b0 70%)', boxShadow: '0 0 40px 10px rgba(255,220,190,.6)' });
      }
    }
    function sea(top, bottom) {
      bottom = bottom == null ? 0 : bottom;
      add('sea', { top: top + '%', bottom: bottom + '%', background: grad(seaCols) });
      if (clear && time !== 'day') {
        var sx = time === 'night' ? 76 : time === 'dusk' ? 58 : 26;
        var col = time === 'night' ? 'rgba(255,250,225,.55)' : 'rgba(255,200,140,.6)';
        add('shine shimmer', { left: sx + '%', top: top + '%', width: '16%', bottom: bottom + '%', background: 'repeating-linear-gradient(180deg, ' + col + ' 0 2px, transparent 2px 8px)', WebkitMaskImage: 'radial-gradient(50% 100% at 50% 0%, #000, transparent)', maskImage: 'radial-gradient(50% 100% at 50% 0%, #000, transparent)' });
      } else if (clear) {
        add('shine shimmer', { left: '78%', top: top + '%', width: '24%', bottom: bottom + '%', background: 'repeating-linear-gradient(180deg, rgba(255,255,255,.45) 0 2px, transparent 2px 10px)', WebkitMaskImage: 'radial-gradient(50% 100% at 50% 0%, #000, transparent)', maskImage: 'radial-gradient(50% 100% at 50% 0%, #000, transparent)' });
      }
      var span = 100 - top - bottom;
      root.appendChild(waveBand(top - 1.2, span * 0.22 + 2, seaCols[0], { amp: 10, dur: 46, opacity: 0.7, cls: 'slow' }));
      root.appendChild(waveBand(top + span * 0.18, span * 0.4, seaCols[1], { amp: 16, dur: 30, rev: true, opacity: 0.6, crest: 'rgba(255,255,255,.14)' }));
      root.appendChild(waveBand(top + span * 0.5, span * 0.6, seaCols[2], { amp: 22, dur: 20, opacity: 0.55, crest: 'rgba(255,255,255,.18)' }));
    }
    function sand(top) {
      add('sand', { top: top + '%', background: grad(sandCols) });
      add('foam', { top: (top - 0.8) + '%' });
    }
    function weather() {
      if (wx) {
        add('rain');
        add('rain r2');
        if (wx === 'storm') add('lightning');
      }
    }
    function silhouette(svg, h, extra) {
      var d = add('silhouette', Object.assign({ height: h + '%' }, extra || {}), svg);
      return d;
    }
    var dark = time === 'night' ? '#050b18' : time === 'dusk' ? '#2a1c33' : time === 'dawn' ? '#3a3a55' : '#33414f';
    if (wx === 'storm') dark = '#05080a';

    switch (t.scene) {
      case 'deep': {
        add('sky', { background: 'linear-gradient(180deg, #0e5a7e 0%, #0a3b63 30%, #06234a 62%, #020b1e 100%)' });
        add('rays');
        add('glow', { left: '50%', top: '0%', width: '120%', height: '60%', background: 'radial-gradient(closest-side, rgba(150,230,255,.25), transparent)' });
        silhouette('<svg viewBox="0 0 1000 200" preserveAspectRatio="none"><path d="M0,200 L0,120 C60,100 90,140 150,118 C210,96 250,130 320,124 C400,118 430,90 520,110 C600,128 640,100 720,104 C800,108 860,132 920,112 C960,100 990,110 1000,108 L1000,200Z" fill="#031228"/>' +
          '<path d="M90,200 C80,150 110,120 96,70 M110,200 C120,160 100,130 124,90 M860,200 C850,140 880,110 868,60 M880,200 C894,150 870,120 890,84" stroke="#062a3a" stroke-width="9" fill="none" stroke-linecap="round"/>' +
          '<circle cx="640" cy="112" r="5" fill="#f5efe6" opacity=".7"/></svg>', 26);
        for (var b = 0; b < 16; b++) {
          var sz = (4 + rnd() * 14).toFixed(1);
          add('bubble', { left: (rnd() * 100).toFixed(1) + '%', width: sz + 'px', height: sz + 'px', animationDuration: (7 + rnd() * 9).toFixed(1) + 's', animationDelay: (-rnd() * 12).toFixed(1) + 's' });
        }
        if (/王座|貝貝國/.test(name)) {
          silhouette('<svg viewBox="0 0 1000 300" preserveAspectRatio="xMidYMax meet"><g fill="#0b2e4f" stroke="#3a7fa0" stroke-opacity=".35"><path d="M430,300 L430,140 C430,70 470,30 500,10 C530,30 570,70 570,140 L570,300Z"/><path d="M400,300 L400,190 L600,190 L600,300Z"/></g><circle cx="500" cy="70" r="10" fill="#f6eedd" opacity=".8"/></svg>', 46);
        }
        break;
      }
      case 'cave': {
        add('sky', { background: grad(skyCols) });
        if (clear) celestial(50);
        sea(52);
        silhouette('<svg viewBox="0 0 1000 600" preserveAspectRatio="none"><defs><radialGradient id="cv" cx="50%" cy="55%" r="70%"><stop offset="55%" stop-color="#1a1d24"/><stop offset="100%" stop-color="#05060a"/></radialGradient></defs><path fill="url(#cv)" fill-rule="evenodd" d="M0,0 H1000 V600 H0 Z M180,600 C170,420 240,170 420,120 C520,92 640,110 740,190 C860,290 860,470 840,600 Z"/>' +
          '<path d="M180,600 C170,420 240,170 420,120 C520,92 640,110 740,190 C860,290 860,470 840,600" fill="none" stroke="rgba(150,200,220,.18)" stroke-width="6"/></svg>', 100, { top: 0 });
        add('glow', { left: '50%', top: '96%', width: '80%', height: '30%', background: 'radial-gradient(closest-side, rgba(120,200,220,.25), transparent)' });
        break;
      }
      case 'room':
      case 'hut': {
        var hut = t.scene === 'hut';
        var wall = hut
          ? (time === 'night' ? ['#2b2219', '#1c160f'] : time === 'dawn' ? ['#8b7663', '#5d4c3d'] : ['#b39271', '#7b5f45'])
          : (time === 'night' ? ['#1d2440', '#111629'] : time === 'dawn' ? ['#c9b6b3', '#8f8095'] : time === 'dusk' ? ['#c78e7a', '#7a5263'] : ['#efe4d3', '#d3c1a6']);
        add('sky', { background: grad(wall) });
        if (hut) add('sky', { background: 'repeating-linear-gradient(90deg, rgba(0,0,0,.0) 0 9%, rgba(0,0,0,.18) 9% 9.4%)' });
        // 窗戶
        var win = add('window', { left: hut ? '56%' : '14%', top: '14%', width: hut ? '30%' : '34%', height: '42%', overflow: 'hidden', borderRadius: '4px', boxShadow: '0 0 0 10px ' + (time === 'night' ? '#151a2c' : '#f4efe6') + ', 0 0 0 12px rgba(0,0,0,.25), 0 30px 60px rgba(0,0,0,.25)' });
        var inner = renderBg('窗外海面' + (time === 'night' ? '夜' : time === 'dusk' ? '黃昏' : time === 'dawn' ? '清晨' : '白天') + (wx === 'rain' ? '雨' : wx === 'storm' ? '暴風雨' : ''), { mini: opts.mini });
        inner.style.position = 'absolute';
        inner.style.inset = '0';
        win.appendChild(inner);
        win.appendChild(el('div', { style: { position: 'absolute', left: '50%', top: 0, bottom: 0, width: '6px', marginLeft: '-3px', background: time === 'night' ? '#151a2c' : '#f4efe6' } }));
        win.appendChild(el('div', { style: { position: 'absolute', top: '50%', left: 0, right: 0, height: '6px', marginTop: '-3px', background: time === 'night' ? '#151a2c' : '#f4efe6' } }));
        if (!hut) {
          var cA = time === 'night' ? 'rgba(42,62,96,.95)' : time === 'dusk' ? 'rgba(150,110,130,.9)' : 'rgba(120,170,190,.85)';
          var cB = time === 'night' ? 'rgba(66,92,130,.9)' : time === 'dusk' ? 'rgba(190,150,160,.8)' : 'rgba(160,205,215,.7)';
          add('curtain', { left: '8%', top: '10%', width: '9%', height: '56%', background: 'linear-gradient(90deg, ' + cA + ', ' + cB + ', ' + cA + ')', borderRadius: '0 0 40% 0' });
          add('curtain', { left: '45%', top: '10%', width: '9%', height: '56%', background: 'linear-gradient(90deg, ' + cA + ', ' + cB + ', ' + cA + ')', borderRadius: '0 0 0 40%' });
          add('shelf', { left: '64%', top: '30%', width: '22%', height: '2%', background: 'rgba(80,55,40,.6)', borderRadius: '2px' });
          add('shelf', { left: '66%', top: '24.5%', width: '3%', height: '5.6%', background: '#e5636e', borderRadius: '2px' });
          add('shelf', { left: '70%', top: '23%', width: '2.4%', height: '7%', background: '#4fa89d', borderRadius: '2px' });
          add('shelf', { left: '76%', top: '25%', width: '5%', height: '5%', background: 'radial-gradient(circle at 40% 40%, #fff, #f2c6d4)', borderRadius: '50% 50% 10% 10%' });
        } else {
          // 救生圈
          add('ring', { left: '22%', top: '24%', width: '13%', aspectRatio: '1', borderRadius: '50%', background: 'repeating-conic-gradient(#e5463f 0 45deg, #f6f1ea 45deg 90deg)', WebkitMaskImage: 'radial-gradient(circle, transparent 38%, #000 39%)', maskImage: 'radial-gradient(circle, transparent 38%, #000 39%)', boxShadow: '0 6px 14px rgba(0,0,0,.3)' });
        }
        add('floor', { left: 0, right: 0, bottom: 0, height: '24%', background: hut ? 'linear-gradient(180deg, #5a4330, #2e2117)' : (time === 'night' ? 'linear-gradient(180deg, #1a1a2a, #0d0d18)' : 'linear-gradient(180deg, #b48b62, #7c5a3d)') });
        if (time === 'night') {
          add('glow flicker', { left: hut ? '30%' : '78%', top: '58%', width: '70%', height: '90%', background: 'radial-gradient(closest-side, rgba(255,190,110,.42), rgba(255,170,90,.1) 55%, transparent)' });
          add('sky', { background: 'radial-gradient(120% 90% at 50% 40%, transparent 35%, rgba(2,4,14,.55))' });
        } else if (time === 'dawn') {
          add('glow', { left: '30%', top: '30%', width: '90%', height: '90%', background: 'radial-gradient(closest-side, rgba(255,220,190,.35), transparent)' });
        }
        break;
      }
      case 'bar': {
        add('sky', { background: 'linear-gradient(180deg, #2a1610 0%, #3a2016 45%, #1a0d08 100%)' });
        add('sky', { background: 'repeating-linear-gradient(90deg, rgba(0,0,0,0) 0 12%, rgba(0,0,0,.25) 12% 12.4%)' });
        // 酒架
        for (var s2 = 0; s2 < 3; s2++) {
          add('shelf', { left: '8%', right: '8%', top: (16 + s2 * 14) + '%', height: '1.4%', background: 'rgba(120,80,50,.8)' });
          for (var k = 0; k < 14; k++) {
            var hh = 5 + rnd() * 5;
            add('bottle', { left: (10 + k * 5.8 + rnd() * 2).toFixed(1) + '%', top: (16 + s2 * 14 - hh) + '%', width: '1.6%', height: hh.toFixed(1) + '%', borderRadius: '30% 30% 8% 8%', background: ['rgba(80,160,120,.75)', 'rgba(180,100,60,.75)', 'rgba(200,190,150,.6)', 'rgba(100,130,190,.7)'][Math.floor(rnd() * 4)] });
          }
        }
        if (/退潮/.test(name)) {
          add('neon', { left: '50%', top: '6.5%', transform: 'translate(-50%,-50%)', fontFamily: 'var(--font-serif)', fontSize: opts.mini ? '7px' : 'clamp(18px, 4.6vh, 40px)', letterSpacing: '.3em', color: '#bff6ee', textShadow: '0 0 8px #6fe0d0, 0 0 22px #3fbfb0, 0 0 40px #2a9d8f', whiteSpace: 'nowrap' }).textContent = '退潮';
        }
        for (var bk = 0; bk < 14; bk++) {
          var bs = (3 + rnd() * 7).toFixed(1);
          add('bokeh', { left: (rnd() * 100).toFixed(1) + '%', top: (rnd() * 60).toFixed(1) + '%', width: bs + '%', aspectRatio: '1', background: 'radial-gradient(circle, rgba(255,200,120,.55), rgba(255,170,80,0) 70%)', animationDelay: (-rnd() * 6).toFixed(1) + 's' });
        }
        add('counter', { left: 0, right: 0, bottom: 0, height: '28%', background: 'linear-gradient(180deg, #6b4128 0%, #4a2a18 8%, #2b170d 100%)', boxShadow: '0 -4px 0 #8a5a38' });
        add('sky', { background: 'radial-gradient(120% 90% at 50% 40%, transparent 40%, rgba(0,0,0,.5))' });
        break;
      }
      case 'festival':
      case 'stage': {
        sky(56);
        sea(56, t.scene === 'stage' ? 26 : 22);
        add('sand', { top: (t.scene === 'stage' ? 74 : 78) + '%', background: 'linear-gradient(180deg, #2b2a3c, #15141f)', borderRadius: 0 });
        // 燈籠串
        var rows = t.scene === 'stage' ? 1 : 2;
        for (var r2 = 0; r2 < rows; r2++) {
          var y0 = 8 + r2 * 16;
          var svgPath = '<svg viewBox="0 0 1000 100" preserveAspectRatio="none"><path d="M-10,' + (10) + ' Q500,' + (90) + ' 1010,' + (10) + '" stroke="rgba(30,20,20,.8)" stroke-width="2" fill="none" vector-effect="non-scaling-stroke"/></svg>';
          add('silhouette', { top: y0 + '%', height: '14%', bottom: 'auto' }, svgPath);
          for (var L = 0; L < 11; L++) {
            var x = 4 + L * 9.2;
            var u = (x - 50) / 50;
            var y = y0 + 1.4 + 11.2 * (1 - u * u) * 0.8;
            add('lantern', { left: x + '%', top: y + '%', background: L % 3 === 0 ? 'radial-gradient(circle at 50% 40%, #fff2c0, #ffb347 55%, #d9532f)' : 'radial-gradient(circle at 50% 40%, #ffe0d0, #ff7a6b 55%, #b8323f)', boxShadow: '0 0 14px 4px rgba(255,150,90,.55)', animationDelay: (-rnd() * 4).toFixed(1) + 's' });
          }
        }
        if (t.scene === 'stage') {
          add('stage', { left: '18%', right: '18%', bottom: '0', height: '30%', background: 'linear-gradient(180deg, #7a4a2a, #4a2a16)', boxShadow: '0 -6px 0 #a8744a, 0 0 60px rgba(255,180,100,.25)' });
          add('glow', { left: '50%', top: '72%', width: '70%', height: '60%', background: 'radial-gradient(closest-side, rgba(255,240,200,.38), transparent)' });
          add('beam', { left: '50%', top: '-6%', width: '70%', height: '8%', transformOrigin: '0 50%', rotate: '62deg', background: 'linear-gradient(90deg, rgba(255,250,220,.45), transparent)', animation: 'none' });
          add('beam', { left: '50%', top: '-6%', width: '70%', height: '8%', transformOrigin: '0 50%', rotate: '118deg', background: 'linear-gradient(90deg, rgba(255,250,220,.45), transparent)', animation: 'none' });
        } else {
          add('glow flicker', { left: '50%', top: '96%', width: '120%', height: '50%', background: 'radial-gradient(closest-side, rgba(255,170,90,.45), transparent)' });
        }
        break;
      }
      case 'lighthouse': {
        sky(58);
        sea(58);
        silhouette('<svg viewBox="0 0 1000 600" preserveAspectRatio="xMinYMax slice"><path d="M0,600 L0,430 C60,400 120,410 170,380 C220,350 300,360 340,400 C380,440 420,470 460,600Z" fill="' + dark + '"/>' +
          '<path d="M200,385 L214,170 L266,170 L280,385Z" fill="#e9e3d8"/><path d="M206,300 L274,300 L276,330 L204,330Z M210,232 L270,232 L272,258 L208,258Z" fill="#c8454a"/>' +
          '<rect x="208" y="140" width="64" height="32" fill="' + (time === 'day' ? '#bfe6f2' : '#ffe9a8') + '"/><path d="M200,140 L240,108 L280,140Z" fill="#2f3440"/><rect x="198" y="168" width="84" height="8" fill="#2f3440"/>' +
          '<path d="M200,385 L214,170 L240,170 L240,385Z" fill="rgba(0,0,0,.12)"/></svg>', 72, { top: 'auto' });
        if (time !== 'day') {
          add('glow', { left: '24%', top: '40%', width: '22%', height: '22%', background: 'radial-gradient(closest-side, rgba(255,240,180,.9), transparent)' });
          add('beam', { left: '24%', top: '40%', width: '90%', height: '9%', marginTop: '-4.5%', background: 'linear-gradient(90deg, rgba(255,245,200,.6), rgba(255,245,200,0))', clipPath: 'polygon(0 45%, 100% 0, 100% 100%, 0 55%)' });
        }
        break;
      }
      case 'station': {
        sky(48);
        sea(48);
        sand(70);
        silhouette('<svg viewBox="0 0 1000 600" preserveAspectRatio="xMaxYMax slice"><g fill="' + (time === 'day' ? '#f5efe5' : dark) + '"><rect x="700" y="250" width="200" height="120" rx="6"/><path d="M680,255 L800,190 L920,255Z" fill="' + (time === 'day' ? '#d8453f' : dark) + '"/></g>' +
          '<g stroke="' + (time === 'day' ? '#9b7a55' : dark) + '" stroke-width="14"><path d="M720,370 L690,560 M880,370 L910,560 M705,470 L895,470"/></g>' +
          '<rect x="730" y="285" width="60" height="45" fill="' + (time === 'day' ? '#9fd3e6' : time === 'night' ? '#ffcf7a' : '#f3b98a') + '" opacity=".9"/>' +
          '<path d="M900,250 L900,140" stroke="' + (time === 'day' ? '#666' : dark) + '" stroke-width="5"/><path d="M902,142 L960,158 L902,176Z" fill="#e5463f"/>' +
          '<path d="M902,160 L960,158 L902,176Z" fill="#f6f1ea"/></svg>', 70, { top: 'auto' });
        break;
      }
      case 'reef': {
        sky(52);
        sea(52);
        silhouette('<svg viewBox="0 0 1000 600" preserveAspectRatio="none"><g fill="' + dark + '"><path d="M0,600 L0,420 L40,380 L90,400 L130,350 L190,390 L240,370 L300,430 L330,600Z"/><path d="M640,600 L670,460 L720,440 L760,400 L810,430 L860,380 L920,410 L1000,390 L1000,600Z"/><path d="M430,470 L460,440 L500,450 L520,480Z" opacity=".8"/></g>' +
          '<path d="M0,420 L40,380 L90,400 L130,350 L190,390 L240,370 L300,430" stroke="rgba(255,255,255,.12)" stroke-width="3" fill="none"/></svg>', 60, { top: 'auto' });
        add('foam', { top: '86%', left: '0', right: '60%' });
        break;
      }
      case 'road': {
        sky(50);
        sea(50, 30);
        add('road', { left: '-5%', right: '-5%', bottom: 0, height: '30%', background: time === 'night' ? 'linear-gradient(180deg, #1c2030, #0b0d16)' : 'linear-gradient(180deg, #6b6f78, #3b3e46)' });
        add('road-line', { left: 0, right: 0, bottom: '12%', height: '1.2%', background: 'repeating-linear-gradient(90deg, rgba(255,240,200,.75) 0 6%, transparent 6% 12%)' });
        silhouette('<svg viewBox="0 0 1000 100" preserveAspectRatio="none"><path d="M0,30 L1000,30" stroke="' + (time === 'night' ? '#30364a' : '#d8d8d8') + '" stroke-width="5"/><g stroke="' + (time === 'night' ? '#30364a' : '#bdbdbd') + '" stroke-width="7">' +
          (function () { var s = ''; for (var i = 20; i < 1000; i += 70) s += '<path d="M' + i + ',30 L' + i + ',80"/>'; return s; })() + '</g></svg>', 10, { bottom: '28%' });
        silhouette('<svg viewBox="0 0 1000 600" preserveAspectRatio="xMaxYMax slice"><path d="M860,600 L860,140 Q860,110 830,110 L780,110" stroke="' + (time === 'day' ? '#55606e' : '#1a1e2a') + '" stroke-width="10" fill="none"/><rect x="760" y="104" width="40" height="14" rx="4" fill="' + (time === 'day' ? '#55606e' : '#ffe2a0') + '"/></svg>', 80, { top: 'auto' });
        if (time === 'night' || time === 'dusk') add('glow', { left: '78%', top: '28%', width: '30%', height: '40%', background: 'radial-gradient(closest-side, rgba(255,220,150,.35), transparent)' });
        break;
      }
      case 'campfire': {
        sky(52);
        sea(52, 26);
        sand(72);
        add('glow flicker', { left: '50%', top: '86%', width: '90%', height: '70%', background: 'radial-gradient(closest-side, rgba(255,150,60,.65), rgba(255,100,40,.2) 50%, transparent)' });
        silhouette('<svg viewBox="0 0 1000 300" preserveAspectRatio="xMidYMax meet"><path d="M440,280 L560,250 M440,250 L560,280" stroke="#3a2416" stroke-width="16" stroke-linecap="round"/>' +
          '<path d="M500,260 C450,240 470,190 488,160 C492,190 506,196 510,170 C530,200 556,236 500,260Z" fill="#ffb347"/><path d="M500,258 C478,246 486,214 496,198 C500,214 512,214 512,204 C524,224 524,248 500,258Z" fill="#fff0b0"/></svg>', 34, { top: 'auto' });
        for (var sp = 0; sp < 10; sp++) {
          var z = (2 + rnd() * 3).toFixed(1);
          add('bubble', { left: (46 + rnd() * 8).toFixed(1) + '%', bottom: '18%', width: z + 'px', height: z + 'px', border: '0', background: '#ffcf7a', boxShadow: '0 0 6px #ffae4a', animationDuration: (3 + rnd() * 3).toFixed(1) + 's', animationDelay: (-rnd() * 4).toFixed(1) + 's' });
        }
        break;
      }
      case 'beach': {
        sky(50);
        sea(50);
        sand(72);
        break;
      }
      case 'sea': {
        sky(40);
        sea(40);
        break;
      }
      case 'mood': {
        var hue = VN.hash(name) % 360;
        add('sky', { background: 'radial-gradient(90% 80% at 30% 30%, hsla(' + hue + ',55%,55%,.85), transparent 60%), radial-gradient(90% 90% at 75% 75%, hsla(' + ((hue + 60) % 360) + ',50%,45%,.85), transparent 65%), linear-gradient(160deg, hsl(' + ((hue + 200) % 360) + ',45%,14%), hsl(' + ((hue + 230) % 360) + ',40%,8%))' });
        for (var m2 = 0; m2 < 18; m2++) {
          var ms = (2 + rnd() * 10).toFixed(1);
          add('bokeh', { left: (rnd() * 100).toFixed(1) + '%', top: (rnd() * 100).toFixed(1) + '%', width: ms + '%', aspectRatio: '1', background: 'radial-gradient(circle, rgba(255,250,240,.45), transparent 70%)', animationDelay: (-rnd() * 6).toFixed(1) + 's' });
        }
        if (/淚|珍珠/.test(name)) add('orb', { left: '50%', top: '42%', width: '9%', background: 'radial-gradient(circle at 35% 30%, #fff, #f1e8ff 45%, #b9aed6)', boxShadow: '0 0 50px rgba(255,255,255,.7)' });
        break;
      }
      default: {
        sky(62);
        silhouette('<svg viewBox="0 0 1000 300" preserveAspectRatio="none"><path d="M0,300 L0,160 C120,120 220,150 330,120 C460,86 560,140 700,110 C820,86 900,120 1000,100 L1000,300Z" fill="' + dark + '" opacity=".75"/><path d="M0,300 L0,220 C150,190 300,230 500,200 C700,170 850,210 1000,190 L1000,300Z" fill="' + dark + '"/></svg>', 42, { top: 'auto' });
      }
    }
    weather();
    if (!opts.cg) add('vignette');
    if (opts.label && name && !opts.mini) root.appendChild(el('div.bg-name', { text: name }));
    return root;
  }
  A.renderBgPlaceholder = renderBg;

  /** 背景元素：有圖用圖，沒有用佔位 */
  A.renderBg = function (name, opts) {
    opts = opts || {};
    var url = name ? A.bg(name) : null;
    if (!name) return el('div.bgp', { style: { background: '#000' } });
    if (!url) return renderBg(name, { mini: opts.mini, label: !opts.mini });
    var wrap = el('div.bgp' + (opts.mini ? '.mini' : ''));
    wrap.appendChild(imgOr(url, 'bg-img', function () { return renderBg(name, { mini: opts.mini, label: !opts.mini }); }));
    return wrap;
  };

  // ================================================================ 立繪剪影
  var HEAD = 'M144,228 C144,182 168,160 200,160 C232,160 256,182 256,228 C256,272 234,304 200,308 C166,304 144,272 144,228 Z';
  var HEAD_ROUND = 'M138,234 C138,186 164,166 200,166 C236,166 262,186 262,234 C262,280 236,306 200,308 C164,306 138,280 138,234 Z';
  var NECK = 'M180,292 L220,292 L225,392 Q200,402 175,392 Z';
  var TORSO = 'M50,650 C60,506 102,452 168,430 Q200,446 232,430 C298,452 340,506 350,650 Z';
  // 身體整組往上移，讓脖子不要太長（頭部座標不變）
  var SHIFT = 46;
  function B(str) { return '<g transform="translate(0,-' + SHIFT + ')">' + str + '</g>'; }

  function defs(u, p) {
    return '<defs>' +
      '<linearGradient id="h' + u + '" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="' + p.hairA + '"/><stop offset="1" stop-color="' + p.hairB + '"/></linearGradient>' +
      '<radialGradient id="s' + u + '" cx="50%" cy="58%" r="62%"><stop offset="0" stop-color="' + p.skinA + '"/><stop offset="1" stop-color="' + p.skinB + '"/></radialGradient>' +
      '<linearGradient id="c' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p.clothA + '"/><stop offset="1" stop-color="' + p.clothB + '"/></linearGradient>' +
      '<linearGradient id="f' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".35" stop-color="#000" stop-opacity="0"/></linearGradient>' +
      (p.defs ? p.defs(u) : '') +
      '</defs>';
  }
  function face(u, round) {
    var h = round ? HEAD_ROUND : HEAD;
    return '<path d="' + NECK + '" fill="url(#s' + u + ')"/><path d="M180,330 L220,330 L222,350 Q200,362 178,350Z" fill="#000" opacity=".08"/>' +
      '<path d="' + h + '" fill="url(#s' + u + ')"/><path d="' + h + '" fill="url(#f' + u + ')"/>';
  }
  var RIM = ' stroke="rgba(255,255,255,.22)" stroke-width="2"';

  var CHARS = {
    '裴柱現': {
      hairA: '#121735', hairB: '#2a1846', skinA: '#fdfaf7', skinB: '#e9e1ee', clothA: '#f7f4fb', clothB: '#cbc2e2',
      draw: function (u) {
        return '<path d="M200,132 C110,132 96,214 104,292 C110,350 88,380 96,430 C104,480 76,520 84,600 L316,600 C324,520 296,480 304,430 C312,380 290,350 296,292 C304,214 290,132 200,132 Z" fill="url(#h' + u + ')"' + RIM + '/>' +
          B('<path d="' + TORSO + '" fill="url(#s' + u + ')"/>' +
          '<path d="M72,650 C84,520 116,470 158,452 L172,470 C186,506 214,506 228,470 L242,452 C284,470 316,520 328,650 Z" fill="url(#c' + u + ')"/>' +
          '<path d="M158,452 L168,432 M242,452 L232,432" stroke="#e2dcef" stroke-width="5" stroke-linecap="round"/>' +
          '<circle cx="200" cy="488" r="6.5" fill="#fff" stroke="#d9d0ea" stroke-width="1.5"/><circle cx="198" cy="486" r="2" fill="#fff"/>') +
          face(u) +
          '<path d="M146,226 C130,280 140,330 124,390 C116,430 128,470 118,520 C140,480 150,440 148,400 C156,350 150,300 160,250 Z" fill="url(#h' + u + ')"/>' +
          '<path d="M254,226 C270,280 260,330 276,390 C284,430 272,470 282,520 C260,480 250,440 252,400 C244,350 250,300 240,250 Z" fill="url(#h' + u + ')"/>' +
          '<path d="M140,252 C128,178 162,140 204,140 C248,140 278,180 262,256 C254,226 244,206 226,194 C214,220 186,232 160,236 C152,240 146,246 140,252 Z" fill="url(#h' + u + ')"' + RIM + '/>' +
          '<g stroke="#a052b8" stroke-opacity=".55" stroke-width="5" fill="none" stroke-linecap="round"><path d="M172,148 C146,166 132,214 128,272"/><path d="M232,148 C258,166 272,214 274,268"/><path d="M114,340 C104,400 102,460 94,540"/><path d="M290,350 C298,410 300,470 306,540"/></g>' +
          '<g stroke="#e9c8ff" stroke-opacity=".35" stroke-width="2" fill="none" stroke-linecap="round"><path d="M188,146 C170,160 158,190 154,214"/><path d="M134,410 C130,440 126,470 122,500"/></g>';
      },
    },
    '阿英': {
      hairA: '#15161b', hairB: '#2b2e38', skinA: '#f3d6b8', skinB: '#d6ad88', clothA: '#2a2e38', clothB: '#151820', scale: 1.05,
      draw: function (u) {
        return '<path d="M226,156 C270,108 326,136 322,206 C318,272 292,330 304,420 C280,356 266,290 268,236 C270,196 256,172 228,166 Z" fill="url(#h' + u + ')"' + RIM + '/>' +
          B('<path d="' + TORSO + '" fill="url(#c' + u + ')"' + RIM + '/>' +
          '<path d="M170,432 L200,486 L230,432 Q200,446 170,432Z" fill="url(#s' + u + ')"/>' +
          '<path d="M150,440 L200,500 L250,440" stroke="#4a4f5c" stroke-width="7" fill="none"/>' +
          '<path d="M178,440 Q200,470 222,440" stroke="#cfd6de" stroke-width="1.6" fill="none"/><path d="M196,462 q4,-6 8,0 q-4,6 -8,0" fill="#93d8cc"/>') +
          face(u) +
          '<ellipse cx="200" cy="214" rx="62" ry="58" fill="url(#h' + u + ')"/>';
      },
      // 頭髮往後梳：先畫頭形，再把臉和瀏海疊在上面
      post: function (u) { return '<path d="M150,236 C150,196 172,184 200,184 C228,184 250,196 250,236 C250,274 230,302 200,306 C170,302 150,274 150,236Z" fill="url(#s' + u + ')"/><path d="M150,236 C150,196 172,184 200,184 C228,184 250,196 250,236" fill="url(#f' + u + ')"/>' +
        '<path d="M146,236 C144,206 160,178 200,176 C240,178 256,206 254,236 C258,190 238,160 200,160 C162,160 142,190 146,236Z" fill="url(#h' + u + ')"/>' +
        '<path d="M146,232 C138,262 142,292 152,306 C150,280 152,258 160,238 Z" fill="url(#h' + u + ')"/><path d="M254,232 C262,262 258,292 248,306 C250,280 248,258 240,238 Z" fill="url(#h' + u + ')"/><circle cx="230" cy="160" r="7" fill="#e5636e"/>'; },
    },
    '康': {
      hairA: '#3b2416', hairB: '#5a3a24', skinA: '#e2ab7e', skinB: '#c08257', clothA: '#f07a4a', clothB: '#d9572f', round: true,
      defs: function (u) {
        return '<pattern id="p' + u + '" width="70" height="70" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">' +
          '<g transform="translate(18 20)"><circle r="9" fill="#ffe08a"/><circle cx="-9" cy="-4" r="7" fill="#fff4d6"/><circle cx="9" cy="-4" r="7" fill="#fff4d6"/><circle cx="-6" cy="8" r="7" fill="#fff4d6"/><circle cx="6" cy="8" r="7" fill="#fff4d6"/><circle r="4" fill="#e5463f"/></g>' +
          '<path d="M44,46 q10,-14 22,-4 q-12,2 -22,4z M40,52 q-6,12 4,18 q0,-10 -4,-18z" fill="#2a9d8f"/>' +
          '<g transform="translate(56 12)"><circle r="5" fill="#fff4d6"/><circle r="2.4" fill="#e5463f"/></g></pattern>';
      },
      draw: function (u) {
        return B('<path d="M38,650 C48,500 96,446 166,426 Q200,442 234,426 C304,446 352,500 362,650 Z" fill="url(#c' + u + ')"' + RIM + '/>' +
          '<path d="M38,650 C48,500 96,446 166,426 Q200,442 234,426 C304,446 352,500 362,650 Z" fill="url(#p' + u + ')" opacity=".9"/>' +
          '<path d="M166,426 L200,500 L234,426 Q200,442 166,426Z" fill="url(#s' + u + ')"/>' +
          '<path d="M166,426 L186,470 L150,470Z M234,426 L214,470 L250,470Z" fill="#f6f1ea" opacity=".9"/>') +
          face(u, true) +
          '<circle cx="200" cy="140" r="34" fill="url(#h' + u + ')"' + RIM + '/><path d="M178,150 Q200,160 222,150" stroke="#2a9d8f" stroke-width="5" fill="none"/>' +
          '<path d="M136,246 C126,184 160,160 200,160 C240,160 274,184 264,246 C258,214 242,196 222,190 C210,206 190,212 170,210 C154,214 142,228 136,246 Z" fill="url(#h' + u + ')"' + RIM + '/>' +
          '<path d="M142,236 C136,256 138,276 146,290" stroke="url(#h' + u + ')" stroke-width="5" fill="none" stroke-linecap="round"/>' +
          // 舉起的手和魚丸串
          B('<path d="M300,470 C318,440 320,410 306,388 L328,382 C342,412 340,452 322,482 Z" fill="url(#c' + u + ')"/>' +
          '<path d="M300,470 C318,440 320,410 306,388 L328,382 C342,412 340,452 322,482 Z" fill="url(#p' + u + ')" opacity=".9"/>' +
          '<line x1="316" y1="384" x2="336" y2="250" stroke="#d9b47a" stroke-width="5" stroke-linecap="round"/>' +
          '<g fill="#b9763f" stroke="#7a4522" stroke-width="2"><circle cx="333" cy="270" r="15"/><circle cx="329" cy="298" r="15"/><circle cx="325" cy="326" r="15"/></g>' +
          '<g fill="#fff" opacity=".55"><circle cx="328" cy="265" r="4"/><circle cx="324" cy="293" r="4"/><circle cx="320" cy="321" r="4"/></g>' +
          '<ellipse cx="316" cy="388" rx="18" ry="16" fill="url(#s' + u + ')"/>');
      },
    },
    '澪': {
      hairA: '#f4f6fb', hairB: '#a9b4c9', skinA: '#f9f8fb', skinB: '#e0e3ee', clothA: '#24405f', clothB: '#11223a', scale: 1.02,
      draw: function (u) {
        return '<path d="M200,130 C122,130 106,200 108,280 L100,600 L300,600 L292,280 C294,200 278,130 200,130 Z" fill="url(#h' + u + ')"' + RIM + '/>' +
          B('<path d="' + TORSO + '" fill="url(#c' + u + ')"' + RIM + '/>' +
          '<path d="M166,432 L200,470 L234,432 L226,410 Q200,424 174,410Z" fill="#cfd8e6"/>' +
          '<path d="M92,520 C150,500 250,500 308,520" stroke="#cfd8e6" stroke-width="3" fill="none" opacity=".7"/>') +
          face(u) +
          '<path d="M142,240 C134,172 166,140 200,140 C236,140 268,172 260,240 L258,206 L142,206 Z" fill="url(#h' + u + ')"' + RIM + '/>' +
          '<path d="M142,206 L130,420 L156,420 L160,214Z M258,206 L270,420 L244,420 L240,214Z" fill="url(#h' + u + ')"/>' +
          '<g stroke="#ffffff" stroke-opacity=".55" stroke-width="2"><path d="M172,146 L160,204"/><path d="M226,146 L240,204"/><path d="M120,300 L114,560"/><path d="M284,300 L290,560"/></g>' +
          '<path d="M150,270 l4,12 l-4,10 l-4,-10z" fill="#9fd8ff"/>';
      },
    },
    '潮后': {
      hairA: '#2a0f3d', hairB: '#5a2276', skinA: '#fbf4f2', skinB: '#e6d8e2', clothA: '#2a1340', clothB: '#12071f', scale: 1.04,
      draw: function (u) {
        return '<path d="M200,128 C100,128 80,220 92,300 C100,360 70,420 76,480 C82,540 62,570 60,600 L340,600 C338,570 318,540 324,480 C330,420 300,360 308,300 C320,220 300,128 200,128 Z" fill="url(#h' + u + ')"' + RIM + '/>' +
          B('<path d="' + TORSO + '" fill="url(#c' + u + ')"' + RIM + '/>' +
          '<path d="M150,440 C170,480 230,480 250,440" stroke="#d9b56a" stroke-width="5" fill="none"/>' +
          '<g fill="#fff">' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (i) { var a = Math.PI * (0.15 + 0.7 * i / 8); return '<circle cx="' + (200 - Math.cos(a) * 46).toFixed(1) + '" cy="' + (436 + Math.sin(a) * 28).toFixed(1) + '" r="5"/>'; }).join('') + '</g>') +
          face(u) +
          '<path d="M140,252 C128,176 162,138 204,138 C248,138 278,178 262,254 C252,220 236,200 214,192 C196,214 170,224 150,234 Z" fill="url(#h' + u + ')"' + RIM + '/>' +
          '<g fill="#ff7a6b" stroke="#c94458" stroke-width="2"><path d="M150,160 L156,112 L168,146 L176,96 L188,140 L200,84 L212,140 L224,96 L232,146 L244,112 L250,160 Q200,146 150,160Z"/></g>' +
          '<circle cx="200" cy="132" r="6" fill="#fff"/>' +
          '<g stroke="#b06ad0" stroke-opacity=".5" stroke-width="5" fill="none" stroke-linecap="round"><path d="M110,330 C98,400 92,470 84,560"/><path d="M292,330 C304,400 310,470 318,560"/></g>';
      },
    },
    '珊婆': {
      hairA: '#f7b3c8', hairB: '#d9668c', skinA: '#e8664a', skinB: '#b8412c', clothA: '#5a6b80', clothB: '#2c3646', wide: true,
      realScale: { '': 0.32 },   // 真實立繪：寄居蟹（預設形態）縮成小隻；人魚形態維持全身高度
      draw: function (u) {
        return '<path d="M40,600 C50,470 130,420 210,418 C300,416 360,470 370,600 Z" fill="url(#c' + u + ')"' + RIM + '/>' +
          '<path d="M90,480 C140,450 220,446 300,470" stroke="rgba(255,255,255,.12)" stroke-width="4" fill="none"/>' +
          // 腳
          '<g stroke="url(#s' + u + ')" stroke-width="9" stroke-linecap="round" fill="none"><path d="M170,392 L140,424 L130,430"/><path d="M186,398 L170,430 L164,438"/><path d="M250,396 L278,426 L290,430"/><path d="M236,400 L252,432 L258,440"/></g>' +
          // 螺殼
          '<path d="M300,300 C300,220 240,180 190,200 C150,216 140,270 170,300 C196,326 236,320 246,290 C254,266 236,246 216,252 C200,258 200,276 212,280" fill="none" stroke="#fff" stroke-opacity=".0"/>' +
          '<ellipse cx="236" cy="300" rx="92" ry="84" fill="url(#h' + u + ')"' + RIM + '/>' +
          '<path d="M300,300 C300,232 244,206 204,226 C170,244 168,292 196,312 C220,330 254,318 258,290 C262,266 240,252 224,262 C210,270 214,290 228,290" fill="none" stroke="#fff4f8" stroke-opacity=".75" stroke-width="5" stroke-linecap="round"/>' +
          '<path d="M160,250 C176,226 200,216 224,214" stroke="#fff" stroke-opacity=".45" stroke-width="4" fill="none" stroke-linecap="round"/>' +
          // 身體與鉗子
          '<path d="M140,330 C150,300 190,296 206,320 C220,346 200,388 168,392 C140,394 128,360 140,330Z" fill="url(#s' + u + ')"/>' +
          '<path d="M140,350 C110,346 92,330 96,306 C120,300 136,316 140,330Z" fill="url(#s' + u + ')"/><path d="M96,306 C88,290 96,276 112,276 C110,290 104,298 96,306Z" fill="url(#s' + u + ')"/>' +
          '<path d="M150,380 C126,396 104,394 96,378 C110,366 132,368 150,380Z" fill="url(#s' + u + ')"/>' +
          // 眼柄
          '<g stroke="url(#s' + u + ')" stroke-width="6" stroke-linecap="round"><path d="M160,312 L146,264"/><path d="M176,308 L176,258"/></g>' +
          '<circle cx="146" cy="260" r="9" fill="#1b1b22"/><circle cx="176" cy="254" r="9" fill="#1b1b22"/><circle cx="149" cy="257" r="3" fill="#fff"/><circle cx="179" cy="251" r="3" fill="#fff"/>';
      },
    },
  };
  var GENERIC = {
    hairA: '#56688a', hairB: '#2a3550', skinA: '#7e8fae', skinB: '#4c5c7c', clothA: '#3e4e6e', clothB: '#1f2840',
    draw: function (u) {
      return '<path d="M200,140 C130,140 118,200 122,260 C126,300 130,330 140,350 L260,350 C270,330 274,300 278,260 C282,200 270,140 200,140Z" fill="url(#h' + u + ')"/>' +
        B('<path d="' + TORSO + '" fill="url(#c' + u + ')"' + RIM + '/>') + face(u) +
        '<path d="M140,250 C130,180 162,148 200,148 C240,148 272,180 260,250 C252,216 236,200 200,198 C166,200 148,216 140,250Z" fill="url(#h' + u + ')"' + RIM + '/>';
    },
  };

  // 表情小記號
  function emote(expr, x, y, s) {
    s = s || 1;
    var g = function (inner) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' + inner + '</g>'; };
    var sparkle = function (cx, cy, r, c) { return '<path d="M' + cx + ',' + (cy - r) + ' Q' + cx + ',' + cy + ' ' + (cx + r) + ',' + cy + ' Q' + cx + ',' + cy + ' ' + cx + ',' + (cy + r) + ' Q' + cx + ',' + cy + ' ' + (cx - r) + ',' + cy + ' Q' + cx + ',' + cy + ' ' + cx + ',' + (cy - r) + 'Z" fill="' + c + '"/>'; };
    var drop = function (cx, cy, c) { return '<path d="M' + cx + ',' + (cy - 14) + ' C' + (cx + 9) + ',' + (cy - 2) + ' ' + (cx + 9) + ',' + (cy + 8) + ' ' + cx + ',' + (cy + 8) + ' C' + (cx - 9) + ',' + (cy + 8) + ' ' + (cx - 9) + ',' + (cy - 2) + ' ' + cx + ',' + (cy - 14) + 'Z" fill="' + c + '" stroke="#fff" stroke-width="1.5"/>'; };
    switch (expr) {
      case '笑': case '大笑':
        return g(sparkle(0, 0, 14, '#ffe08a') + sparkle(20, 18, 8, '#fff3c4'));
      case '得意':
        return g(sparkle(0, 0, 18, '#ffd76a') + sparkle(22, -14, 8, '#fff') + sparkle(-16, 20, 6, '#fff3c4'));
      case '害羞':
        return '<g opacity=".7"><ellipse cx="170" cy="262" rx="15" ry="8" fill="#ff8fa3"/><ellipse cx="230" cy="262" rx="15" ry="8" fill="#ff8fa3"/></g>' +
          '<g stroke="#ff8fa3" stroke-width="2.5" stroke-linecap="round" opacity=".9"><path d="M162,258 l-5,8 M170,258 l-5,8 M178,258 l-5,8 M222,258 l-5,8 M230,258 l-5,8 M238,258 l-5,8"/></g>';
      case '生氣': case '怒':
        return g('<g stroke="#ff4d5a" stroke-width="5" fill="none" stroke-linecap="round"><path d="M-12,-4 Q-4,-4 -4,-12"/><path d="M4,-12 Q4,-4 12,-4"/><path d="M12,4 Q4,4 4,12"/><path d="M-4,12 Q-4,4 -12,4"/></g>');
      case '驚慌': case '驚訝': case '慌張':
        return g('<g stroke="#ffffff" stroke-width="4" stroke-linecap="round"><path d="M-10,-6 L-16,-22"/><path d="M2,-10 L2,-28"/><path d="M14,-6 L22,-20"/></g>') + (expr !== '驚訝' ? drop(x - 4, y + 34, '#9fd8ff') : '');
      case '難過':
        return drop(178, 286, '#9fd8ff');
      case '哭':
        return drop(176, 286, '#9fd8ff') + drop(224, 292, '#9fd8ff');
      case '擔心':
        return drop(x, y + 20, '#9fd8ff');
      case '恍惚':
        return g('<path d="M0,0 m-14,0 a14,14 0 1,1 28,0 a10,10 0 1,1 -20,0 a6,6 0 1,1 12,0" stroke="#ffb3d0" stroke-width="3.5" fill="none" stroke-linecap="round"/>');
      case '魅惑':
        return g('<path d="M0,10 C-22,-6 -12,-24 0,-12 C12,-24 22,-6 0,10Z" fill="#ff6f9f" stroke="#fff" stroke-width="2"/>');
      case '冷笑':
        return g(sparkle(0, 0, 14, '#bfe8ff') + sparkle(18, 16, 6, '#fff'));
      case '吐槽':
        return g('<rect x="-22" y="-14" width="44" height="26" rx="12" fill="#fff" opacity=".92"/><path d="M-8,12 L-14,22 L0,12Z" fill="#fff" opacity=".92"/><g fill="#333"><circle cx="-10" cy="-1" r="3"/><circle cx="0" cy="-1" r="3"/><circle cx="10" cy="-1" r="3"/></g>');
      case '認真':
        return g('<g stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".85"><path d="M-14,-8 L14,-8"/><path d="M-8,2 L10,2"/></g>');
      default:
        return '';
    }
  }

  A.spriteSVG = function (char, expr, form) {
    var p = CHARS[char] || GENERIC;
    var u = nextId();
    var body = p.draw(u) + (p.post ? p.post(u) : '');
    if (form && /人魚|魚/.test(form)) {
      // 人魚形態的佔位：肩頸浮出藍紫色鱗片與水光
      body += '<g opacity=".85">' + [[150, 470], [170, 500], [132, 510], [250, 470], [230, 500], [268, 510], [200, 530], [160, 545], [240, 545]].map(function (q) {
        return '<path d="M' + q[0] + ',' + q[1] + ' q8,-10 16,0 q-8,10 -16,0z" fill="#7f8cff" stroke="#d6c8ff" stroke-width="1.2"/>';
      }).join('') + '</g><path d="M60,600 C120,560 280,560 340,600" stroke="#9fe0ff" stroke-opacity=".5" stroke-width="6" fill="none"/>';
    } else if (form) {
      body += '<circle cx="200" cy="120" r="70" fill="#93d8cc" opacity=".12"/>';
    }
    var ex = char === '珊婆' ? emote(expr, 300, 200, 1.1) : emote(expr, 286, 168, 1);
    return '<svg viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet" aria-hidden="true">' + defs(u, p) + body + ex + '</svg>';
  };
  A.spriteScale = function (char) { var p = CHARS[char]; return (p && p.scale) || 1; };
  /** 真實立繪的縮放，依形態（'' = 預設形態）；沒設定就是 1 */
  A.realScale = function (char, form) {
    var r = CHARS[char] && CHARS[char].realScale;
    var v = r && r[form || ''];
    return v == null ? 1 : v;
  };
  A.isWide = function (char) { var p = CHARS[char]; return !!(p && p.wide); };

  /** 立繪的一層（圖片或剪影） */
  A.spriteLayer = function (char, expr, form) {
    var url = A.sprite(char, expr, form);
    function ph() {
      return el('div.layer.ph' + (A.isWide(char) ? '.wide' : ''), { html: A.spriteSVG(char, expr, form) });
    }
    if (!url) return { node: ph(), placeholder: true };
    var img = imgOr(url, 'layer', ph);
    return { node: img, placeholder: false };
  };

  // ================================================================ 主角頭像
  A.faceSVG = function (expr) {
    var u = nextId();
    var ex = emote(expr, 150, 52, 0.75);
    if (expr === '害羞') ex = '<g opacity=".7"><ellipse cx="84" cy="108" rx="9" ry="5" fill="#ff8fa3"/><ellipse cx="116" cy="108" rx="9" ry="5" fill="#ff8fa3"/></g>';
    if (expr === '難過') ex = '<path d="M86,104 c5,7 5,12 0,13 c-5,-1 -5,-6 0,-13z" fill="#9fd8ff" stroke="#fff" stroke-width="1"/>';
    return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>' +
      '<radialGradient id="fb' + u + '" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#3b97a0"/><stop offset="1" stop-color="#0f3352"/></radialGradient>' +
      '<linearGradient id="fh' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a5583a"/><stop offset="1" stop-color="#6a3020"/></linearGradient>' +
      '<radialGradient id="fs' + u + '" cx="50%" cy="55%" r="65%"><stop offset="0" stop-color="#ebb893"/><stop offset="1" stop-color="#c98a62"/></radialGradient></defs>' +
      '<rect width="200" height="200" fill="url(#fb' + u + ')"/>' +
      '<path d="M100,30 C52,30 38,72 44,112 C48,140 36,160 46,196 L154,196 C164,160 152,140 156,112 C162,72 148,30 100,30 Z" fill="url(#fh' + u + ')"/>' +
      '<path d="M18,200 C24,168 54,150 80,146 Q100,156 120,146 C146,150 176,168 182,200 Z" fill="#d23a40"/>' +
      '<path d="M80,146 L92,172 L100,160 L108,172 L120,146 Q100,156 80,146Z" fill="#f4f0ea"/>' +
      '<path d="M86,150 Q92,184 100,188 Q108,184 114,150" stroke="#f4f0ea" stroke-width="2" fill="none"/><rect x="94" y="184" width="12" height="7" rx="2" fill="#c9d2da"/>' +
      '<path d="M88,124 L112,124 L114,152 Q100,160 86,152 Z" fill="url(#fs' + u + ')"/>' +
      '<path d="M68,94 C68,68 82,56 100,56 C118,56 132,68 132,94 C132,120 118,136 100,138 C82,136 68,120 68,94 Z" fill="url(#fs' + u + ')"/>' +
      '<path d="M64,106 C56,62 82,40 104,40 C132,40 148,66 136,108 C130,86 122,74 108,68 C102,82 86,90 74,94 C70,98 66,102 64,106 Z" fill="url(#fh' + u + ')"/>' +
      '<path d="M134,78 C158,84 164,112 152,140 C148,118 142,102 130,92 Z" fill="url(#fh' + u + ')"/><circle cx="136" cy="80" r="5" fill="#ff8f7e"/>' +
      '<g stroke="#d9874f" stroke-opacity=".5" stroke-width="2" fill="none"><path d="M88,52 C78,60 72,74 70,88"/></g>' +
      ex + '</svg>';
  };
  A.faceNode = function (char, expr) {
    var url = A.face(char, expr);
    var wrap = el('div.face-av');
    var ph = function () { return el('div', { style: { width: '100%', height: '100%' }, html: A.faceSVG(expr) }); };
    wrap.appendChild(url ? imgOr(url, '', ph) : ph());
    return { node: wrap, placeholder: !url };
  };

  // ================================================================ CG
  A.cgCard = function (id, title, opts) {
    opts = opts || {};
    var card = el('div.cg-card' + (opts.mini ? '.mini' : ''));
    card.appendChild(renderBg(title || ('CG ' + id), { cg: true, mini: opts.mini }));
    card.appendChild(el('div.frame'));
    if (!opts.noLabel) {
      card.appendChild(el('div.label', null, [
        el('span.num', { text: 'CG ' + id }),
        el('span.name', { text: title || '' }),
        opts.mini ? null : el('span.deco', { html: '<svg viewBox="0 0 240 10" preserveAspectRatio="none" style="width:100%;height:100%"><path d="M0,5 C20,0 40,10 60,5 S100,0 120,5 S160,10 180,5 S220,0 240,5" stroke="#9a6a1c" stroke-width="1.5" fill="none"/><circle cx="120" cy="5" r="3" fill="#9a6a1c"/></svg>' }),
      ]));
    }
    return card;
  };
  /** CG 檢視元素（有圖：模糊底＋主圖；沒圖：佔位卡） */
  A.cgView = function (id, title, opts) {
    opts = opts || {};
    var view = el('div.cg-view' + (opts.fit ? '.fit' : ''));
    var url = A.cg(id);
    var blur = el('div.cg-blur');
    var main = el('div.cg-main');
    if (url) {
      blur.appendChild(el('img', { src: url, alt: '' }));
      main.appendChild(imgOr(url, '', function () { blur.innerHTML = ''; blur.appendChild(A.cgCard(id, title, { noLabel: true })); return A.cgCard(id, title); }));
    } else {
      view.classList.add('ph');
      blur.appendChild(A.cgCard(id, title, { noLabel: true, mini: true }));
      main.appendChild(A.cgCard(id, title));
    }
    view.appendChild(blur);
    view.appendChild(main);
    return view;
  };

  // ================================================================ 存檔縮圖
  A.miniStage = function (snap) {
    var box = el('div.mini-stage');
    snap = snap || {};
    box.appendChild(A.renderBg(snap.bg, { mini: true }));
    var sp = snap.sprites || [];
    var pos = VN.layoutPositions ? VN.layoutPositions(sp.length, false) : [];
    var forms = snap.forms || {};
    sp.forEach(function (s, i) {
      var f = forms[s.c] || null;
      var url = A.sprite(s.c, s.e, f);
      var node = el('div.mini-sprite' + (url ? '.real' : ''), { style: { left: (pos[i] || 50) + '%' } });
      if (url) node.appendChild(imgOr(url, '', function () { return el('div', { html: A.spriteSVG(s.c, s.e, f), style: { width: '100%', height: '100%' } }); }));
      else node.innerHTML = A.spriteSVG(s.c, s.e, f);
      box.appendChild(node);
    });
    if (snap.cg) {
      var url2 = A.cg(snap.cg.id);
      var cg = el('div.mini-cg');
      if (url2) cg.appendChild(imgOr(url2, 'bg-img', function () { return A.cgCard(snap.cg.id, snap.cg.title, { mini: true }); }));
      else cg.appendChild(A.cgCard(snap.cg.id, snap.cg.title, { mini: true }));
      box.appendChild(cg);
    }
    if (snap.faded) box.appendChild(el('div', { style: { position: 'absolute', inset: '0', background: 'rgba(0,0,0,.85)' } }));
    return box;
  };
})();
