#!/usr/bin/env node
/*
 * 《潮約之歌》劇本建置工具（零相依，Node 16+）
 *
 *   node tools/build.js                 讀 script/ 產生 game/data/script.js
 *   node tools/build.js --src <資料夾>   改從其他資料夾讀劇本（例如測試用 tools/test-fixtures）
 *   node tools/build.js --out <檔案>     改寫到其他檔案
 *   node tools/build.js --check         只檢查，不寫檔
 *   node tools/build.js --list-assets   列出每個素材檔名與是否已存在
 *
 * 劇本格式見 script/劇本格式.md。
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SIDE_DIR = '人魚篇';                 // 支線資料夾名稱（也是標題畫面按鈕文字）
const DEFAULT_PROTAGONIST = '孫承完';      // 角色設定.md 找不到「主角」時的預設
const STATS = ['心動', '信任', '採息'];
const ENDINGS = ['伴侶', '朋友', 'BAD'];
const TRANSITIONS = { '淡出': 'out', '淡入': 'in', '閃白': 'flash' };
const DEFAULT_FORMS = ['人類', '預設', '普通', '原本'];   // 【形態】寫這些等於回到預設圖組
const ASSET_TYPES = {
  bg: ['.jpg', '.jpeg', '.png', '.webp'],
  sprites: ['.png', '.webp', '.jpg', '.jpeg'],
  face: ['.png', '.webp', '.jpg', '.jpeg'],
  cg: ['.jpg', '.jpeg', '.png', '.webp'],
  bgm: ['.mp3', '.ogg'],
  se: ['.mp3', '.ogg'],
};
const KNOWN_COMMANDS = ['背景', '立繪', '形態', '退場', 'CG', 'CG結束', '音樂', '音效', '轉場', '震動', '數值', '旗標', '如果', '跳至', '選擇', '結局', '…完'];

// ---------------------------------------------------------------- CLI
function parseArgs(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) {
    let a = argv[i];
    let v = null;
    const eq = a.indexOf('=');
    if (a.startsWith('--') && eq > 0) { v = a.slice(eq + 1); a = a.slice(0, eq); }
    switch (a) {
      case '--src': case '--out': case '--assets':
        o[a.slice(2)] = v != null ? v : argv[++i];
        break;
      case '--check': o.check = true; break;
      case '--list-assets': o.listAssets = true; break;
      case '-h': case '--help': o.help = true; break;
      default: o.unknown = (o.unknown || []).concat(a);
    }
  }
  return o;
}

// ---------------------------------------------------------------- helpers
/** 統一中間點寫法（・ · ‧ • ･ 都視為 ・），並做 Unicode NFC。只用在名稱上，不改台詞。 */
function normName(s) {
  return String(s || '').normalize('NFC').replace(/[·‧•∙⋅･]/g, '・').trim();
}
function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}
function splitList(s) {
  return String(s || '').split(/[、，,]/).map((x) => x.trim()).filter(Boolean);
}
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i].concat(new Array(n).fill(0)));
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[m][n];
}
function rel(p) {
  const r = path.relative(process.cwd(), p);
  return (r && !r.startsWith('..') ? r : p).split(path.sep).join('/');
}

// ---------------------------------------------------------------- diagnostics
class Diag {
  constructor() { this.items = []; }
  error(file, line, msg) { this.items.push({ level: 'error', file, line, msg }); }
  warn(file, line, msg) { this.items.push({ level: 'warn', file, line, msg }); }
  get errors() { return this.items.filter((x) => x.level === 'error'); }
  get warnings() { return this.items.filter((x) => x.level === 'warn'); }
  print() {
    const sorted = this.items.slice().sort((a, b) =>
      (a.file || '').localeCompare(b.file || '') || (a.line || 0) - (b.line || 0));
    for (const it of sorted) {
      const loc = it.file ? (it.line ? `${it.file}:${it.line}` : it.file) : '';
      const tag = it.level === 'error' ? '【錯誤】' : '【警告】';
      const out = `${tag}${loc ? loc + '：' : ''}${it.msg}`;
      if (it.level === 'error') console.error(out); else console.warn(out);
    }
  }
}

// ---------------------------------------------------------------- 角色設定.md
function loadCharacters(srcDir) {
  const candidates = [path.join(srcDir, '角色設定.md'), path.join(ROOT, 'script', '角色設定.md')];
  const file = candidates.find((f) => fs.existsSync(f));
  const chars = {};
  let protagonist = null;
  if (!file) return { chars, protagonist: DEFAULT_PROTAGONIST, file: null };
  const lines = fs.readFileSync(file, 'utf8').replace(/^﻿/, '').split(/\r?\n/);
  let cur = null;
  for (const raw of lines) {
    const line = raw.trim();
    const h = line.match(/^##\s+(.+)$/);
    if (h) {
      const heading = h[1].trim();
      const name = normName(heading.split(/[（(\s]/)[0]);
      cur = name ? (chars[name] = { exprs: [], face: false }) : null;
      if (cur && /主角/.test(heading) && !protagonist) protagonist = name;
      continue;
    }
    if (!cur) continue;
    const m = line.match(/\*\*(立繪表情|頭像表情)\*\*\s*[：:]\s*(.+)$/);
    if (m) {
      cur.exprs = splitList(m[2]).map(normName);
      if (m[1] === '頭像表情') {
        cur.face = true;
        if (!protagonist) protagonist = Object.keys(chars).find((k) => chars[k] === cur);
      }
    }
  }
  if (!protagonist) protagonist = DEFAULT_PROTAGONIST;
  if (chars[protagonist]) chars[protagonist].face = true;
  return { chars, protagonist, file };
}

// ---------------------------------------------------------------- conditions & effects
function normOps(s) {
  return s.replace(/≥|＞＝|>＝|＞=/g, '>=').replace(/≤|＜＝|<＝|＜=/g, '<=').replace(/≠|！＝|!＝|！=/g, '!=')
    .replace(/＝＝|==|＝/g, '==').replace(/＞/g, '>').replace(/＜/g, '<').replace(/：/g, ':');
}
function parseTerm(t) {
  t = t.trim();
  let m = t.match(/^(非)?\s*旗標\s*:\s*(\S.*)$/);
  if (m) return { f: normName(m[2]), neg: !!m[1] };
  m = t.match(/^([^\s<>=!]+)\s*(>=|<=|==|!=|>|<|=)\s*([-−]?\d+)$/);
  if (m) return { s: normName(m[1]), op: m[2] === '=' ? '==' : m[2], v: parseInt(m[3].replace('−', '-'), 10) };
  return null;
}
/** 回傳 { or: [ [term, term], [term] ] }（且 優先於 或）或 { error } */
function parseCondition(src) {
  const s = normOps(String(src || '').trim());
  if (!s) return { error: '條件是空的' };
  const parts = s.split(/\s+(且|或)\s+/);
  const seq = [];
  parts.forEach((p, i) => {
    if (i % 2) { seq.push(p); return; }
    if (parseTerm(p) || !/[且或]/.test(p)) { seq.push(p); return; }
    p.split(/(且|或)/).forEach((x) => seq.push(x.trim()));
  });
  const or = [[]];
  for (let i = 0; i < seq.length; i++) {
    if (i % 2) {
      if (seq[i] === '或') or.push([]);
      else if (seq[i] !== '且') return { error: `看不懂「${seq[i]}」` };
      continue;
    }
    const term = parseTerm(seq[i]);
    if (!term) return { error: `看不懂條件「${seq[i]}」（例：心動 >= 8、旗標:坦白、非旗標:坦白）` };
    or[or.length - 1].push(term);
  }
  if (or.some((g) => !g.length)) return { error: '「且／或」前後缺少條件' };
  return { or };
}
/** 解析效果清單「心動 +1、信任 -1、旗標:知道名字」 */
function parseEffects(src) {
  const items = splitList(normOps(src));
  const out = [];
  for (const it of items) {
    let m = it.match(/^(非)?\s*旗標\s*:\s*(\S.*)$/);
    if (m) { out.push({ f: normName(m[2]), clear: !!m[1] }); continue; }
    m = it.match(/^([^\s+\-−＋－=]+)\s*([+\-−＋－]|==|=)\s*(\d+)$/);
    if (m) {
      const sign = m[2];
      const v = parseInt(m[3], 10);
      if (sign === '=' || sign === '==') out.push({ s: normName(m[1]), set: v });
      else out.push({ s: normName(m[1]), d: (sign === '+' || sign === '＋') ? v : -v });
      continue;
    }
    return { error: `看不懂效果「${it}」（例：心動 +1、信任 -1、旗標:知道名字）` };
  }
  if (!out.length) return { error: '效果是空的' };
  return { list: out };
}

// ---------------------------------------------------------------- 單檔解析
const RE_CMD = /^【([^】]+)】\s*(.*)$/;
const RE_CHOICE = /^([A-Za-zＡ-Ｚａ-ｚ])\s*[.．、:：)）]\s*(.+)$/;
const RE_DIALOGUE = /^([^\s：:「」『』（）()]{1,24}?)\s*[：:]\s*(.*)$/;
const BAD_NAME_CHARS = /[。，、！!？?,.…—「」『』（）()《》]/;

function parseFile(file, ctx) {
  const { diag } = ctx;
  const fileRel = file.rel;
  const text = fs.readFileSync(file.abs, 'utf8').replace(/^﻿/, '');
  const lines = text.split(/\r?\n/);
  const ops = [];
  const occ = new Map();
  let inComment = false;
  let commentStart = 0;
  let choice = null; // 目前正在收集選項的 op

  const err = (ln, msg) => diag.error(fileRel, ln, msg);
  const warn = (ln, msg) => diag.warn(fileRel, ln, msg);
  const ref = (ln, label, kind) => ctx.refs.push({ file: fileRel, line: ln, label, kind });

  const sayId = (k, who, t) => {
    const base = `${file.key}|${k}|${who || ''}|${t}`;
    const n = (occ.get(base) || 0) + 1;
    occ.set(base, n);
    return hash(base + '#' + n);
  };
  const checkExpr = (ln, who, expr) => {
    const c = ctx.chars[who];
    if (c && c.exprs.length && !c.exprs.includes(expr)) {
      warn(ln, `「${who}」的表情「${expr}」不在角色設定.md 的清單（${c.exprs.join('、')}）`);
    }
  };
  const finishChoice = () => {
    if (!choice) return;
    if (!choice.options.length) err(choice.ln, `${choice.title} 下面沒有選項（格式：A. 文字 →（效果）→ 標籤）`);
    else if (choice.options.length === 1) warn(choice.ln, `${choice.title} 只有一個選項`);
    choice = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const ln = i + 1;
    let raw = lines[i];

    // HTML 註解（可跨行）
    if (inComment) {
      const e = raw.indexOf('-->');
      if (e < 0) continue;
      raw = raw.slice(e + 3);
      inComment = false;
    }
    raw = raw.replace(/<!--[\s\S]*?-->/g, '');
    const cs = raw.indexOf('<!--');
    if (cs >= 0) { raw = raw.slice(0, cs); inComment = true; commentStart = ln; }

    const line = raw.trim();
    if (!line) continue;
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) continue;
    if (line.startsWith('>')) continue;

    // 選項行
    if (choice) {
      const cm = line.match(RE_CHOICE);
      if (cm && /→|->/.test(line)) {
        const key = cm[1].normalize('NFKC').toUpperCase();
        const parts = cm[2].split(/\s*(?:→|->)\s*/).map((x) => x.trim());
        let textPart = parts[0], effPart = null, label = null;
        if (parts.length === 2) label = parts[1];
        else if (parts.length === 3) { effPart = parts[1]; label = parts[2]; }
        if (!textPart || !label || parts.length > 3) {
          err(ln, `選項格式錯誤：「${line}」（格式：A. 文字 →（效果）→ 標籤，效果可省略）`);
          continue;
        }
        const opt = { key, text: textPart, to: label, ln };
        if (effPart != null) {
          const em = effPart.match(/^[（(](.*)[）)]$/);
          if (!em) { err(ln, `選項效果要用括號包起來：「${effPart}」（例：（心動 +1、旗標:知道名字））`); continue; }
          const eff = parseEffects(em[1]);
          if (eff.error) { err(ln, eff.error); continue; }
          opt.eff = eff.list;
          eff.list.forEach((e) => { if (e.s && !STATS.includes(e.s)) warn(ln, `未知的數值「${e.s}」（已知：${STATS.join('、')}）`); });
        }
        if (choice.options.some((o) => o.key === key)) warn(ln, `選項代號「${key}」重複`);
        choice.options.push(opt);
        ref(ln, label, '選項');
        continue;
      }
      if (cm) {
        err(ln, `選項缺少「→ 標籤」：「${line}」`);
        continue;
      }
      finishChoice();
    }

    // 標籤 / 標題
    if (line.startsWith('#')) {
      const lm = line.match(/^##(?!#)\s*(\S+)\s*(.*)$/);
      if (lm) {
        const id = lm[1];
        ops.push({ t: 'label', id, title: lm[2].trim(), ln });
        ctx.labelDefs.push({ id, file: fileRel, line: ln, fi: file.index, oi: ops.length - 1 });
        continue;
      }
      const tm = line.match(/^#(?!#)\s*(.+)$/);
      if (tm) {
        const t = tm[1].trim();
        ops.push({ t: 'title', text: t, card: t !== '開場', ln });
        if (!file.title && t !== '開場') file.title = t;
      }
      continue; // ### 以上忽略
    }

    // 指令
    const cmdM = line.match(RE_CMD);
    if (cmdM) {
      const name = cmdM[1].trim();
      const nameKey = name.replace(/\s+/g, '');
      const arg = cmdM[2].trim();
      const push = (op) => { op.ln = ln; ops.push(op); return op; };

      if (nameKey.startsWith('選擇')) {
        choice = push({ t: 'choice', title: name, options: [] });
        if (arg) warn(ln, `【${name}】後面的文字「${arg}」會被忽略`);
        continue;
      }
      if (nameKey.length > 1 && nameKey.endsWith('完')) {
        push({ t: 'chend', text: name });
        continue;
      }
      switch (nameKey.toUpperCase() === 'CG' ? 'CG' : nameKey.toUpperCase() === 'CG結束' ? 'CG結束' : nameKey) {
        case '背景': {
          if (!arg) { err(ln, '【背景】後面要寫背景名稱'); break; }
          const bg = normName(arg);
          push({ t: 'bg', name: bg });
          ctx.used.bg.add(bg);
          break;
        }
        case '立繪': {
          const list = splitList(arg).map((x) => {
            const n = normName(x);
            const dot = n.indexOf('・');
            return dot >= 0 ? { c: n.slice(0, dot).trim(), e: n.slice(dot + 1).trim() || '普通' } : { c: n, e: '普通' };
          });
          if (!list.length) { err(ln, '【立繪】後面要寫角色（例：【立繪】裴柱現・笑、阿英）'); break; }
          for (const s of list) {
            if (s.c === ctx.protagonist) warn(ln, `「${s.c}」是主角，沒有立繪（以對話框旁的頭像顯示），這行會被忽略`);
            else { checkExpr(ln, s.c, s.e); ctx.used.sprites.add(`${s.c}_${s.e}`); }
          }
          push({ t: 'show', list: list.filter((s) => s.c !== ctx.protagonist) });
          break;
        }
        case '形態': {
          // 【形態】裴柱現・人魚 → 切換圖組；【形態】裴柱現 或 裴柱現・人類 → 回到預設
          const list = splitList(arg).map((x) => {
            const n = normName(x);
            const dot = n.indexOf('・');
            const c = (dot >= 0 ? n.slice(0, dot) : n).trim();
            let f = dot >= 0 ? n.slice(dot + 1).trim() : '';
            if (DEFAULT_FORMS.includes(f)) f = '';
            return { c, f: f || null };
          });
          if (!list.length || list.some((s) => !s.c)) { err(ln, '【形態】後面要寫「角色・形態」（例：【形態】裴柱現・人魚；【形態】裴柱現 = 回到預設）'); break; }
          for (const s of list) {
            if (s.f && s.f.includes('・')) { err(ln, `【形態】只能寫一個形態：「${s.c}・${s.f}」`); continue; }
            if (s.c === ctx.protagonist) warn(ln, `「${s.c}」是主角，沒有立繪，【形態】不會有效果`);
            if (s.f) ctx.used.sprites.add(`${s.c}_${s.f}_普通`);
          }
          push({ t: 'form', list });
          break;
        }
        case '退場': {
          if (!arg) { err(ln, '【退場】後面要寫角色或「全部」'); break; }
          if (arg === '全部') push({ t: 'hide', all: true });
          else push({ t: 'hide', list: splitList(arg).map((x) => normName(x).split('・')[0]) });
          break;
        }
        case 'CG': {
          const m = arg.match(/^(\S+)\s*(.*)$/);
          if (!m) { err(ln, '【CG】後面要寫「編號 名稱」（例：【CG】02 營火邊的歌聲）'); break; }
          const id = normName(m[1]);
          const title = m[2].trim();
          if (!title) warn(ln, `CG ${id} 沒有名稱`);
          const prev = ctx.cgs.get(id);
          if (prev && title && prev.title && prev.title !== title) warn(ln, `CG ${id} 的名稱「${title}」和之前的「${prev.title}」（${prev.where}）不同，以前者為準`);
          if (!prev || (!prev.title && title)) ctx.cgs.set(id, { id, title, where: `${fileRel}:${ln}` });
          push({ t: 'cg', id, title: (prev && prev.title) || title });
          break;
        }
        case 'CG結束': push({ t: 'cgEnd' }); break;
        case '音樂': {
          if (!arg) { err(ln, '【音樂】後面要寫曲名、「停」或「淡出」'); break; }
          if (arg === '停') push({ t: 'bgm', stop: 'stop' });
          else if (arg === '淡出') push({ t: 'bgm', stop: 'fade' });
          else { const n = normName(arg); push({ t: 'bgm', name: n }); ctx.used.bgm.add(n); }
          break;
        }
        case '音效': {
          const names = splitList(arg).map(normName);
          if (!names.length) { err(ln, '【音效】後面要寫音效名稱'); break; }
          names.forEach((n) => ctx.used.se.add(n));
          push({ t: 'se', names });
          break;
        }
        case '轉場': {
          const k = TRANSITIONS[arg];
          if (!k) { err(ln, `未知的轉場「${arg}」（可用：${Object.keys(TRANSITIONS).join('、')}）`); break; }
          push({ t: 'trans', kind: k });
          break;
        }
        case '震動': push({ t: 'shake' }); break;
        case '數值': {
          const eff = parseEffects(arg);
          if (eff.error) { err(ln, eff.error.replace('效果', '數值')); break; }
          if (eff.list.some((e) => e.f)) { err(ln, '【數值】只能改數值，旗標請用【旗標】'); break; }
          eff.list.forEach((e) => { if (!STATS.includes(e.s)) warn(ln, `未知的數值「${e.s}」（已知：${STATS.join('、')}），會當成新數值（初始 0）`); });
          push({ t: 'stat', list: eff.list });
          break;
        }
        case '旗標': {
          const names = splitList(arg).map((x) => normName(x.replace(/^旗標\s*[:：]\s*/, '')));
          if (!names.length) { err(ln, '【旗標】後面要寫旗標名稱'); break; }
          names.forEach((n) => ctx.flagsSet.add(n));
          push({ t: 'flag', names });
          break;
        }
        case '如果': {
          const m = arg.match(/^(.*?)\s*(?:→|->)\s*([^→]+)$/);
          if (!m) { err(ln, `【如果】格式錯誤：「${arg}」（格式：【如果】條件 → 標籤）`); break; }
          const cond = parseCondition(m[1]);
          if (cond.error) { err(ln, `條件錯誤：${cond.error}`); break; }
          cond.or.forEach((g) => g.forEach((t) => {
            if (t.s && !STATS.includes(t.s)) warn(ln, `未知的數值「${t.s}」（已知：${STATS.join('、')}）`);
            if (t.f) ctx.flagsTested.push({ f: t.f, file: fileRel, line: ln });
          }));
          const to = m[2].trim();
          push({ t: 'if', cond: cond.or, to });
          ref(ln, to, '【如果】');
          break;
        }
        case '跳至': {
          if (!arg) { err(ln, '【跳至】後面要寫標籤'); break; }
          push({ t: 'jump', to: arg });
          ref(ln, arg, '【跳至】');
          break;
        }
        case '結局': {
          const m = arg.match(/^(\S+?)\s*「(.+)」\s*$/) || arg.match(/^(\S+)\s*(.*)$/);
          const code = m ? (m[1].toUpperCase() === 'BAD' ? 'BAD' : m[1]) : '';
          if (!m || !ENDINGS.includes(code)) { err(ln, `【結局】代號要是 ${ENDINGS.join('／')}（格式：【結局】伴侶「珍珠之淚」），目前是「${arg}」`); break; }
          if (!m[2]) warn(ln, '【結局】沒有寫名稱（格式：【結局】伴侶「珍珠之淚」）');
          push({ t: 'ending', code, name: (m[2] || '').replace(/^「|」$/g, '') });
          break;
        }
        default: {
          const sugg = KNOWN_COMMANDS.map((k) => ({ k, d: levenshtein(k, nameKey) })).sort((a, b) => a.d - b.d)[0];
          const hint = sugg && sugg.d <= Math.max(1, Math.floor(nameKey.length / 2)) ? `，是不是要寫【${sugg.k}】？` : '';
          err(ln, `未知的指令【${name}】${hint}`);
        }
      }
      continue;
    }

    // 不在【選擇】底下的選項行
    if (RE_CHOICE.test(line) && /→|->/.test(line) && /→\s*\S+\s*$/.test(line)) {
      warn(ln, `這行看起來像選項，但前面沒有【選擇】，會被當成旁白：「${line}」`);
    }

    // 對話
    const dm = line.match(RE_DIALOGUE);
    if (dm) {
      const nameRaw = normName(dm[1]);
      const dot = nameRaw.indexOf('・');
      const who = dot >= 0 ? nameRaw.slice(0, dot).trim() : nameRaw;
      const expr = dot >= 0 ? nameRaw.slice(dot + 1).trim() : null;
      const content = dm[2].trim();
      const nameOk = who && (/^[？?]+$/.test(who) || !BAD_NAME_CHARS.test(who));
      if (nameOk && /^[「『（]/.test(content)) {
        const op = { t: 'say', k: 'd', who, text: content, ln };
        if (expr) { op.expr = expr; checkExpr(ln, who, expr); if (who === ctx.protagonist) ctx.used.face.add(`${who}_${expr}`); else ctx.used.sprites.add(`${who}_${expr}`); }
        op.id = sayId('d', who, content);
        ops.push(op);
        continue;
      }
      if (nameOk && content && (ctx.chars[who] || /^[？?]+$/.test(who))) {
        warn(ln, `「${who}」的台詞沒有用「」包起來，這行會被當成旁白`);
      }
    }

    // 內心話 / 旁白
    if (/^（[\s\S]*）$/.test(line)) {
      ops.push({ t: 'say', k: 'i', text: line, id: sayId('i', '', line), ln });
    } else {
      ops.push({ t: 'say', k: 'n', text: line, id: sayId('n', '', line), ln });
    }
  }
  finishChoice();
  if (inComment) warn(commentStart, '註解「<!--」沒有對應的「-->」，之後的內容全部被忽略了');
  return ops;
}

// ---------------------------------------------------------------- 檔案清單
function listNumbered(dir, allowZero) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isFile())
    .map((d) => d.name.normalize('NFC'))
    .map((n) => ({ n, m: n.match(/^(\d{2})_(.+)\.md$/i) }))
    .filter((x) => x.m && (allowZero || x.m[1] !== '00'))
    .sort((a, b) => parseInt(a.m[1], 10) - parseInt(b.m[1], 10) || a.n.localeCompare(b.n))
    .map((x) => ({ name: x.n, num: parseInt(x.m[1], 10), rest: x.m[2] }));
}
function titleFromFileName(rest) {
  // 「第一章_生日營火」→「第一章　生日營火」
  return rest.replace(/_/g, '　');
}

// ---------------------------------------------------------------- 素材
function scanAssets(assetDir, diag) {
  const out = {};
  for (const [type, exts] of Object.entries(ASSET_TYPES)) {
    out[type] = {};
    const dir = path.join(assetDir, type);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isFile()).map((d) => d.name);
    for (const f of files) {
      const ext = path.extname(f).toLowerCase();
      const rank = exts.indexOf(ext);
      if (rank < 0) continue;
      const base = normName(path.basename(f, path.extname(f)));
      const prev = out[type][base];
      if (prev) {
        const prevRank = exts.indexOf(path.extname(prev).toLowerCase());
        diag.warn(`game/assets/${type}`, 0, `「${base}」有多個檔案（${prev}、${f}），使用 ${rank < prevRank ? f : prev}`);
        if (rank >= prevRank) continue;
      }
      out[type][base] = f;
    }
    // CG 允許 2.png 對應 02
    if (type === 'cg') {
      for (const base of Object.keys(out.cg)) {
        if (/^\d+$/.test(base)) {
          const alt = String(parseInt(base, 10)).padStart(2, '0');
          if (!out.cg[alt]) out.cg[alt] = out.cg[base];
        }
      }
    }
  }
  return out;
}

// ---------------------------------------------------------------- main
function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace(/^[\s\S]*?\/\*/, '').replace(/^ \* ?/gm, ''));
    return 0;
  }
  if (args.unknown) console.warn(`【警告】看不懂的參數：${args.unknown.join(' ')}（可用 --help 查看說明）`);

  const SRC = path.resolve(args.src || path.join(ROOT, 'script'));
  const OUT = path.resolve(args.out || path.join(ROOT, 'game', 'data', 'script.js'));
  const ASSETS = path.resolve(args.assets || path.join(ROOT, 'game', 'assets'));
  const diag = new Diag();

  if (!fs.existsSync(SRC)) {
    console.error(`【錯誤】找不到劇本資料夾：${SRC}`);
    return 1;
  }
  const { chars, protagonist, file: charFile } = loadCharacters(SRC);

  const mainFiles = listNumbered(SRC, false).map((f) => ({ ...f, route: 'main', abs: path.join(SRC, f.name) }));
  const sideFiles = listNumbered(path.join(SRC, SIDE_DIR), true).map((f) => ({ ...f, route: 'side', abs: path.join(SRC, SIDE_DIR, f.name) }));
  const all = mainFiles.concat(sideFiles);
  if (!mainFiles.length) diag.error(rel(SRC), 0, '找不到任何主線劇本（檔名要像 01_第一章_xxx.md）');

  const seenNums = { main: new Map(), side: new Map() };
  all.forEach((f, i) => {
    f.index = i;
    f.key = (f.route === 'side' ? SIDE_DIR + '/' : '') + f.name.replace(/\.md$/i, '');
    f.rel = rel(f.abs);
    const m = seenNums[f.route];
    if (m.has(f.num)) diag.warn(f.rel, 0, `章節編號 ${String(f.num).padStart(2, '0')} 和 ${m.get(f.num)} 重複，依檔名排序`);
    else m.set(f.num, f.name);
  });

  const ctx = {
    diag, chars, protagonist, refs: [], labelDefs: [], cgs: new Map(), flagsSet: new Set(), flagsTested: [],
    used: { bg: new Set(), sprites: new Set(), face: new Set([`${protagonist}_普通`]), cgs: null, bgm: new Set(), se: new Set() },
  };

  const files = all.map((f) => {
    const ops = parseFile(f, ctx);
    return { key: f.key, name: f.name, route: f.route, num: f.num, title: f.title || titleFromFileName(f.rest), ops };
  });

  // 標籤
  const labels = {};
  const labelWhere = {};
  for (const d of ctx.labelDefs) {
    if (labels[d.id]) diag.error(d.file, d.line, `標籤「${d.id}」重複（第一次在 ${labelWhere[d.id]}）`);
    else { labels[d.id] = [d.fi, d.oi]; labelWhere[d.id] = `${d.file}:${d.line}`; }
  }
  for (const r of ctx.refs) {
    if (!labels[r.label]) {
      const near = Object.keys(labels).map((k) => ({ k, d: levenshtein(k, r.label) })).sort((a, b) => a.d - b.d)[0];
      const hint = near && near.d <= 2 ? `，是不是「${near.k}」？` : '';
      diag.error(r.file, r.line, `${r.kind}指向不存在的標籤「${r.label}」${hint}`);
    }
  }
  for (const t of ctx.flagsTested) {
    if (!ctx.flagsSet.has(t.f) && !files.some((f) => f.ops.some((o) => o.t === 'choice' && o.options.some((op) => (op.eff || []).some((e) => e.f === t.f))))) {
      diag.warn(t.file, t.line, `旗標「${t.f}」從來沒有被設定過（【旗標】或選項效果）`);
    }
  }
  // 選項效果裡的旗標也算設定過
  files.forEach((f) => f.ops.forEach((o) => {
    if (o.t === 'choice') o.options.forEach((op) => { (op.eff || []).forEach((e) => { if (e.f) ctx.flagsSet.add(e.f); }); delete op.ln; });
  }));

  const cgs = Array.from(ctx.cgs.values())
    .sort((a, b) => (parseInt(a.id, 10) || 0) - (parseInt(b.id, 10) || 0) || a.id.localeCompare(b.id))
    .map(({ id, title }) => ({ id, title }));

  const assets = scanAssets(ASSETS, diag);

  // 素材統計
  const bgmBase = (n) => n.replace(/[（(].*?[）)]\s*$/, '').trim();
  const need = {
    bg: Array.from(ctx.used.bg).filter((n) => n !== '全黑'),
    sprites: Array.from(ctx.used.sprites),
    face: Array.from(ctx.used.face),
    cg: cgs.map((c) => c.id),
    bgm: Array.from(ctx.used.bgm),
    se: Array.from(ctx.used.se),
  };
  const has = (type, n) => !!assets[type][n] || (type === 'bgm' && !!assets.bgm[bgmBase(n)]);

  const data = {
    title: '潮約之歌',
    builtAt: new Date().toISOString(),
    source: rel(SRC),
    protagonist,
    sideRoute: SIDE_DIR,
    stats: STATS,
    chars: Object.fromEntries(Object.entries(chars).map(([k, v]) => [k, { exprs: v.exprs, face: !!v.face }])),
    files,
    labels,
    cgs,
    assets,
  };

  // ---- 輸出
  diag.print();
  const nErr = diag.errors.length, nWarn = diag.warnings.length;
  const nLines = files.reduce((a, f) => a + f.ops.filter((o) => o.t === 'say').length, 0);
  console.log('');
  console.log(`劇本來源：${rel(SRC)}${charFile ? `（角色設定：${rel(charFile)}，主角：${protagonist}）` : ''}`);
  console.log(`主線 ${mainFiles.length} 檔：${mainFiles.map((f) => f.name).join('、') || '（無）'}`);
  console.log(`${SIDE_DIR} ${sideFiles.length} 檔${sideFiles.length ? '：' + sideFiles.map((f) => f.name).join('、') : ''}`);
  console.log(`共 ${nLines} 句台詞、${Object.keys(labels).length} 個標籤、${cgs.length} 張 CG`);
  const label = { bg: '背景', sprites: '立繪', face: '頭像', cg: 'CG', bgm: '音樂', se: '音效' };
  console.log('素材（已放入／劇本用到）：' + Object.keys(need).map((t) => `${label[t]} ${need[t].filter((n) => has(t, n)).length}/${need[t].length}`).join('、') + '　缺的會用佔位圖／佔位音樂');
  if (args.listAssets) {
    for (const t of Object.keys(need)) {
      console.log(`\n[${label[t]}] game/assets/${t}/`);
      need[t].sort().forEach((n) => console.log(`  ${has(t, n) ? '✔' : '　'} ${n}${has(t, n) ? '' : ASSET_TYPES[t][0]}`));
    }
  }

  if (nErr) {
    console.error(`\n建置失敗：${nErr} 個錯誤、${nWarn} 個警告。${args.check ? '' : `沒有更新 ${rel(OUT)}。`}`);
    return 1;
  }
  if (args.check) {
    console.log(`\n檢查完成：0 個錯誤、${nWarn} 個警告。`);
    return 0;
  }
  const js = '/* 由 tools/build.js 自動產生，請勿手動修改。修改劇本後重新執行 build.bat 即可。 */\n' +
    'window.GAME_DATA = ' + JSON.stringify(data) + ';\n';
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const tmp = OUT + '.tmp';
  fs.writeFileSync(tmp, js, 'utf8');
  fs.renameSync(tmp, OUT);
  console.log(`\n建置完成：${rel(OUT)}（${(js.length / 1024).toFixed(1)} KB），${nWarn} 個警告。`);
  return 0;
}

process.exitCode = main();
