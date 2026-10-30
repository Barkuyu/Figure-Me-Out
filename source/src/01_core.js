'use strict';
/* ================= 基礎工具 ================= */
const TAU = Math.PI * 2, PI = Math.PI;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const randi = (a, b) => Math.floor(rand(a, b + 1));
const pick = a => a[(Math.random() * a.length) | 0];
const angDiff = (a, b) => { let d = (b - a) % TAU; if (d > PI) d -= TAU; if (d < -PI) d += TAU; return d; };
const $ = id => document.getElementById(id);
function rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }
const shade = (c, k) => [clamp(c[0] * k, 0, 1), clamp(c[1] * k, 0, 1), clamp(c[2] * k, 0, 1)];
const mixc = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

/* ================= 設定 / 裝置偵測 ================= */
const CODE_OPTS = [3, 4, 5, 6, 'rand', 'mix'];
const codeLabel = v => v === 'rand' ? '隨機' : v === 'mix' ? '大亂鬥' : v + ' 碼';
const S = { mode: 'dm', count: 20, diff: 1, outfit: 0, input: 'auto', quality: 'auto', sens: 1, auto: true, fps: true, sound: true, countSet: false, codeLen: 4, trollLv: 3, time: 5, skills: true, rnd: {}, pref: undefined, demoMode: 'dm', map: 'hb', demoMap: 'hb', layout: {}, layoutV: 0, netBots: true, netName: '' };
try { Object.assign(S, JSON.parse(localStorage.getItem('fmo2') || '{}')); } catch (e) { }
if (S.layoutV < 2) { S.layout = {}; S.layoutV = 2; }
const saveS = () => { try { localStorage.setItem('fmo2', JSON.stringify(S)); } catch (e) { } };

const VP = { // 手機直拿時以 CSS 旋轉 90° 呈現橫向畫面；這裡負責座標換算
  rot: false,
  get W() { return this.rot ? innerHeight : innerWidth; }, get H() { return this.rot ? innerWidth : innerHeight; },
  px(x, y) { return this.rot ? y : x; }, py(x, y) { return this.rot ? innerWidth - x : y; },
  rect(el) { const r = el.getBoundingClientRect(); if (!this.rot) return r; const W = innerWidth, l = r.top, rt = r.bottom, t = W - r.right, b = W - r.left; return { left: l, right: rt, top: t, bottom: b, width: rt - l, height: b - t }; },
  update() { this.rot = !!Device.mobile && innerHeight > innerWidth; document.body.classList.toggle('rot', this.rot); const st = document.documentElement.style; st.setProperty('--sw', innerWidth + 'px'); st.setProperty('--sh', innerHeight + 'px'); }
};
const Device = {
  mobile: false, auto: false, lowEnd: false, refresh: 60, lastTouch: 0,
  detectMobile() {
    const ua = navigator.userAgent || '';
    const uaM = /Android|iPhone|iPad|iPod|Mobile|HarmonyOS|HMSCore/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    let coarse = false, noHover = false;
    try { coarse = matchMedia('(pointer:coarse)').matches; noHover = matchMedia('(hover:none)').matches; } catch (e) { }
    const touch = (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
    return uaM || (coarse && touch && noHover);
  },
  init() {
    this.auto = this.detectMobile();
    this.lowEnd = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;
    this.update(true);
  },
  update(force) {
    const m = S.input === 'auto' ? this.auto : S.input === 'mobile';
    if (m !== this.mobile || force) {
      this.mobile = m;
      document.body.classList.toggle('mobile', m);
      document.body.classList.toggle('desktop', !m);
      if (window.onDeviceChange) window.onDeviceChange();
    }
  },
  label() { return (this.mobile ? '📱 手機／觸控模式' : '🖥️ 電腦／鍵盤滑鼠模式') + (S.input === 'auto' ? '（已自動偵測）' : '（手動指定）'); }
};

/* ================= 音效（WebAudio 合成） ================= */
const Sfx = {
  ctx: null, master: null, nb: null,
  init() {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = .45; this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate; this.nb = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.nb.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    } catch (e) { this.ctx = null; }
  },
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => { }); },
  tone(f, d, type, v, slide, delay) {
    if (!this.ctx || !S.sound) return;
    const c = this.ctx, t = c.currentTime + (delay || 0), o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v || .2, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + d + .02);
  },
  noise(d, v, lp, delay, hp) {
    if (!this.ctx || !S.sound) return;
    const c = this.ctx, t = c.currentTime + (delay || 0), s = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
    s.buffer = this.nb; f.type = hp ? 'highpass' : 'lowpass'; f.frequency.value = lp || 2000;
    g.gain.setValueAtTime(v || .3, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    s.connect(f); f.connect(g); g.connect(this.master); s.start(t, Math.random() * .5); s.stop(t + d + .02);
  },
  click() { this.noise(.012, .06, 2400, 0, true); this.tone(2100, .028, 'sine', .04, -600); this.tone(880, .07, 'triangle', .035, -180, .004); },
  tick() { this.tone(660, .08, 'sine', .12); },
  bell() { // 擂台賽叮叮叮
    for (let k = 0; k < 3; k++) { const d = k * .26; [[1, .22], [2.76, .1], [5.4, .06], [8.9, .035]].forEach(([m, v]) => this.tone(820 * m, .95, 'sine', v, 0, d)); this.noise(.04, .18, 5000, d, true); }
  },
  key() { this.tone(900, .04, 'square', .05); },
  del() { this.tone(500, .05, 'square', .05); },
  wrong() { this.tone(160, .28, 'sawtooth', .16, -60); },
  kill() { this.tone(660, .1, 'triangle', .2); this.tone(990, .18, 'triangle', .2, 0, .09); this.tone(1320, .22, 'triangle', .16, 0, .2); },
  die() { this.tone(300, .5, 'sawtooth', .18, -240); this.noise(.3, .2, 800); },
  shutter() { this.noise(.05, .35, 4000, 0, true); this.noise(.08, .25, 3000, .07, true); },
  throwS() { this.noise(.18, .2, 1500, 0, true); },
  bang(v) { this.noise(.6, .55 * v, 900); this.tone(2600, 1.4, 'sine', .08 * v, -300); },
  pop(v) { this.noise(.5, .3 * v, 500); },
  beep(v) { this.tone(1400, .08, 'square', .1 * v); },
  warn() { this.tone(740, .09, 'square', .09); this.tone(740, .09, 'square', .09, 0, .14); },
  pick() { this.tone(520, .08, 'triangle', .15); this.tone(780, .12, 'triangle', .15, 0, .07); },
  flag() { this.tone(440, .12, 'triangle', .18); this.tone(660, .12, 'triangle', .18, 0, .1); this.tone(880, .2, 'triangle', .18, 0, .2); },
  step() { this.noise(.05, .06, 600); },
  win() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, .25, 'triangle', .2, 0, i * .12)); },
  warn() { for (let i = 0; i < 3; i++) this.tone(1200, .12, 'square', .1, 0, i * .33); },
  arenaGo() { this.bell(); this.tone(180, .5, 'sawtooth', .16, 120, .05); },
  siren() { for (let i = 0; i < 8; i++) { this.tone(i % 2 ? 760 : 1040, .25, 'sawtooth', .13, i % 2 ? 260 : -260, i * .25); } },
  skill() { this.tone(520, .12, 'triangle', .16, 300); this.tone(780, .2, 'sine', .14, 200, .08); this.noise(.12, .12, 3000, 0, true); },
  victory() { // 金色閃光 + 號角式勝利音
    this.noise(.5, .25, 6000, 0, true); [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => { this.tone(f, .5, 'triangle', .2, 0, .1 + i * .11); this.tone(f * 2, .4, 'sine', .07, 0, .1 + i * .11); });
    [[523, 659, 784], [587, 740, 880], [659, 784, 1047]].forEach((ch, j) => ch.forEach(f => this.tone(f, 1.0, 'sawtooth', .05, 0, .8 + j * .35))); this.tone(1047, 1.4, 'triangle', .22, 0, 1.9); this.tone(1568, 1.4, 'sine', .12, 0, 1.9);
  },
  defeat() { // 失敗：下行的悲傷音
    [392, 370, 349, 294].forEach((f, i) => { this.tone(f, .6, 'triangle', .2, -14, i * .38); this.tone(f / 2, .6, 'sine', .12, 0, i * .38); }); this.tone(196, 1.4, 'sawtooth', .08, -30, 1.5);
  }
};

/* ================= 矩陣 ================= */
const M4 = {
  _t: new Float32Array(16),
  create() { const m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; },
  identity(o) { o.fill(0); o[0] = o[5] = o[10] = o[15] = 1; return o; },
  mul(o, a, b) {
    const r = this._t;
    for (let c = 0; c < 4; c++) {
      const b0 = b[c * 4], b1 = b[c * 4 + 1], b2 = b[c * 4 + 2], b3 = b[c * 4 + 3];
      r[c * 4] = a[0] * b0 + a[4] * b1 + a[8] * b2 + a[12] * b3;
      r[c * 4 + 1] = a[1] * b0 + a[5] * b1 + a[9] * b2 + a[13] * b3;
      r[c * 4 + 2] = a[2] * b0 + a[6] * b1 + a[10] * b2 + a[14] * b3;
      r[c * 4 + 3] = a[3] * b0 + a[7] * b1 + a[11] * b2 + a[15] * b3;
    }
    o.set(r); return o;
  },
  // M = T * Rz*Ry*Rx * S
  trs(o, tx, ty, tz, rx, ry, rz, sx, sy, sz) {
    const cx = Math.cos(rx), sxn = Math.sin(rx), cy = Math.cos(ry), syn = Math.sin(ry), cz = Math.cos(rz), szn = Math.sin(rz);
    const r00 = cz * cy, r01 = cz * syn * sxn - szn * cx, r02 = cz * syn * cx + szn * sxn;
    const r10 = szn * cy, r11 = szn * syn * sxn + cz * cx, r12 = szn * syn * cx - cz * sxn;
    const r20 = -syn, r21 = cy * sxn, r22 = cy * cx;
    o[0] = r00 * sx; o[1] = r10 * sx; o[2] = r20 * sx; o[3] = 0;
    o[4] = r01 * sy; o[5] = r11 * sy; o[6] = r21 * sy; o[7] = 0;
    o[8] = r02 * sz; o[9] = r12 * sz; o[10] = r22 * sz; o[11] = 0;
    o[12] = tx; o[13] = ty; o[14] = tz; o[15] = 1; return o;
  },
  persp(o, fovy, asp, n, f) {
    const t = 1 / Math.tan(fovy / 2); o.fill(0);
    o[0] = t / asp; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = 2 * f * n / (n - f); return o;
  },
  // 相機世界矩陣 = T(pos)*Ry(yaw)*Rx(pitch)*Rz(roll)
  camWorld(o, x, y, z, yaw, pitch, roll) { return this.trs(o, x, y, z, pitch, yaw, roll, 1, 1, 1).constructor === Float32Array ? this._camw(o, x, y, z, yaw, pitch, roll) : o; },
  _camw(o, x, y, z, yaw, pitch, roll) {
    // Ry*Rx*Rz
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch), cz = Math.cos(roll), sz = Math.sin(roll);
    // Rx*Rz
    const a00 = cz, a01 = -sz, a02 = 0, a10 = cx * sz, a11 = cx * cz, a12 = -sx, a20 = sx * sz, a21 = sx * cz, a22 = cx;
    // Ry * (Rx*Rz)
    const r00 = cy * a00 + sy * a20, r01 = cy * a01 + sy * a21, r02 = cy * a02 + sy * a22;
    const r10 = a10, r11 = a11, r12 = a12;
    const r20 = -sy * a00 + cy * a20, r21 = -sy * a01 + cy * a21, r22 = -sy * a02 + cy * a22;
    o[0] = r00; o[1] = r10; o[2] = r20; o[3] = 0; o[4] = r01; o[5] = r11; o[6] = r21; o[7] = 0; o[8] = r02; o[9] = r12; o[10] = r22; o[11] = 0; o[12] = x; o[13] = y; o[14] = z; o[15] = 1; return o;
  },
  // 剛體反矩陣（旋轉 + 平移）
  rigidInv(o, m) {
    const r00 = m[0], r10 = m[1], r20 = m[2], r01 = m[4], r11 = m[5], r21 = m[6], r02 = m[8], r12 = m[9], r22 = m[10], tx = m[12], ty = m[13], tz = m[14];
    o[0] = r00; o[1] = r01; o[2] = r02; o[3] = 0; o[4] = r10; o[5] = r11; o[6] = r12; o[7] = 0; o[8] = r20; o[9] = r21; o[10] = r22; o[11] = 0;
    o[12] = -(r00 * tx + r10 * ty + r20 * tz); o[13] = -(r01 * tx + r11 * ty + r21 * tz); o[14] = -(r02 * tx + r12 * ty + r22 * tz); o[15] = 1; return o;
  }
};
M4.camWorld = function (o, x, y, z, yaw, pitch, roll) { return M4._camw(o, x, y, z, yaw, pitch, roll); };

/* ================= 幾何產生器（純陣列） ================= */
function geo() { return { p: [], n: [], u: [], c: null, i: [] }; }
function gBox(w, h, d) {
  const x = w / 2, y = h / 2, z = d / 2, g = geo();
  const F = [[1, 0, 0, [x, -y, z], [x, -y, -z], [x, y, -z], [x, y, z]], [-1, 0, 0, [-x, -y, -z], [-x, -y, z], [-x, y, z], [-x, y, -z]],
  [0, 1, 0, [-x, y, z], [x, y, z], [x, y, -z], [-x, y, -z]], [0, -1, 0, [-x, -y, -z], [x, -y, -z], [x, -y, z], [-x, -y, z]],
  [0, 0, 1, [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]], [0, 0, -1, [x, -y, -z], [-x, -y, -z], [-x, y, -z], [x, y, -z]]];
  const uv = [[0, 0], [1, 0], [1, 1], [0, 1]];
  for (const f of F) { const o = g.p.length / 3; for (let k = 0; k < 4; k++) { g.p.push(f[3 + k][0], f[3 + k][1], f[3 + k][2]); g.n.push(f[0], f[1], f[2]); g.u.push(uv[k][0], uv[k][1]); } g.i.push(o, o + 1, o + 2, o, o + 2, o + 3); }
  return g;
}
function gPlane(w, h) {
  const g = geo(), x = w / 2, y = h / 2;
  g.p.push(-x, -y, 0, x, -y, 0, x, y, 0, -x, y, 0); g.n.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1); g.u.push(0, 0, 1, 0, 1, 1, 0, 1); g.i.push(0, 1, 2, 0, 2, 3); return g;
}
function gCyl(rt, rb, h, seg, hs, open, ts, tl) {
  seg = seg || 12; hs = hs || 1; ts = ts || 0; tl = tl === undefined ? TAU : tl;
  const g = geo(), grid = [], hh = h / 2, slope = (rb - rt) / h; let idx = 0;
  for (let y = 0; y <= hs; y++) {
    const row = [], v = y / hs, r = v * (rb - rt) + rt;
    for (let x = 0; x <= seg; x++) {
      const u = x / seg, th = u * tl + ts, s = Math.sin(th), c = Math.cos(th);
      g.p.push(r * s, -v * h + hh, r * c);
      const l = Math.hypot(1, slope); g.n.push(s / l, slope / l, c / l); g.u.push(u, 1 - v); row.push(idx++);
    }
    grid.push(row);
  }
  for (let x = 0; x < seg; x++) for (let y = 0; y < hs; y++) {
    const a = grid[y][x], b = grid[y + 1][x], c = grid[y + 1][x + 1], d = grid[y][x + 1];
    if (rt > 0 || y !== 0) g.i.push(a, b, d); if (rb > 0 || y !== hs - 1) g.i.push(b, c, d);
  }
  if (!open) for (const top of [true, false]) {
    const r = top ? rt : rb; if (r <= 0) continue; const sg = top ? 1 : -1, cs = idx;
    for (let x = 1; x <= seg; x++) { g.p.push(0, hh * sg, 0); g.n.push(0, sg, 0); g.u.push(.5, .5); idx++; }
    const ce = idx;
    for (let x = 0; x <= seg; x++) { const u = x / seg, th = u * tl + ts, c = Math.cos(th), s = Math.sin(th); g.p.push(r * s, hh * sg, r * c); g.n.push(0, sg, 0); g.u.push(c * .5 + .5, s * .5 * sg + .5); idx++; }
    for (let x = 0; x < seg; x++) { const c = cs + x, i = ce + x; if (top) g.i.push(i, i + 1, c); else g.i.push(i + 1, i, c); }
  }
  return g;
}
function gSphere(r, ws, hs, ps, pl, ts, tl) {
  ws = ws || 12; hs = hs || 8; ps = ps || 0; pl = pl === undefined ? TAU : pl; ts = ts || 0; tl = tl === undefined ? PI : tl;
  const g = geo(), grid = []; let idx = 0; const te = ts + tl;
  for (let iy = 0; iy <= hs; iy++) {
    const row = [], v = iy / hs;
    for (let ix = 0; ix <= ws; ix++) {
      const u = ix / ws, ph = ps + u * pl, th = ts + v * tl;
      const x = -Math.cos(ph) * Math.sin(th), y = Math.cos(th), z = Math.sin(ph) * Math.sin(th);
      g.p.push(r * x, r * y, r * z); g.n.push(x, y, z); g.u.push(u, 1 - v); row.push(idx++);
    }
    grid.push(row);
  }
  for (let iy = 0; iy < hs; iy++) for (let ix = 0; ix < ws; ix++) {
    const a = grid[iy][ix + 1], b = grid[iy][ix], c = grid[iy + 1][ix], d = grid[iy + 1][ix + 1];
    if (iy !== 0 || ts > 0) g.i.push(a, b, d); if (iy !== hs - 1 || te < PI) g.i.push(b, c, d);
  }
  return g;
}
function gLathe(pts, seg) {
  const g = geo(), n = pts.length; seg = seg || 20;
  const nm = [];
  for (let j = 0; j < n; j++) {
    const a = pts[Math.max(0, j - 1)], b = pts[Math.min(n - 1, j + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; nm.push([dy / l, -dx / l]);
  }
  for (let i = 0; i <= seg; i++) {
    const ph = i / seg * TAU, s = Math.sin(ph), c = Math.cos(ph);
    for (let j = 0; j < n; j++) { g.p.push(pts[j][0] * s, pts[j][1], pts[j][0] * c); g.n.push(nm[j][0] * s, nm[j][1], nm[j][0] * c); g.u.push(i / seg, j / (n - 1)); }
  }
  for (let i = 0; i < seg; i++) for (let j = 0; j < n - 1; j++) {
    const a = j + i * n, b = j + (i + 1) * n, c = b + 1, d = a + 1; g.i.push(a, b, d, c, d, b);
  }
  return g;
}
/** 合併：items=[{g, t,r,s, c|cfn, uv|vmap}] -> 單一 geo（含頂點色） */
function mergeGeos(items) {
  const out = { p: [], n: [], u: [], c: [], i: [] };
  const m = new Float32Array(16);
  for (const it of items) {
    const g = it.g, T = it.t || [0, 0, 0], Rr = it.r || [0, 0, 0], Sc = it.s || [1, 1, 1];
    M4.trs(m, T[0], T[1], T[2], Rr[0], Rr[1], Rr[2], Sc[0], Sc[1], Sc[2]);
    const base = out.p.length / 3, cnt = g.p.length / 3;
    const R = new Float32Array(16); M4.trs(R, 0, 0, 0, Rr[0], Rr[1], Rr[2], 1, 1, 1);
    const col = it.c || [1, 1, 1];
    for (let k = 0; k < cnt; k++) {
      const x = g.p[k * 3], y = g.p[k * 3 + 1], z = g.p[k * 3 + 2];
      const px = m[0] * x + m[4] * y + m[8] * z + m[12], py = m[1] * x + m[5] * y + m[9] * z + m[13], pz = m[2] * x + m[6] * y + m[10] * z + m[14];
      out.p.push(px, py, pz);
      const nx = g.n[k * 3] / Sc[0], ny = g.n[k * 3 + 1] / Sc[1], nz = g.n[k * 3 + 2] / Sc[2];
      let qx = R[0] * nx + R[4] * ny + R[8] * nz, qy = R[1] * nx + R[5] * ny + R[9] * nz, qz = R[2] * nx + R[6] * ny + R[10] * nz;
      const l = Math.hypot(qx, qy, qz) || 1; out.n.push(qx / l, qy / l, qz / l);
      if (it.uv) out.u.push(it.uv[0], it.uv[1]);
      else if (it.vmap) out.u.push(g.u[k * 2], clamp((py - it.vmap[0]) / (it.vmap[1] - it.vmap[0]), 0, 1));
      else out.u.push(g.u[k * 2], g.u[k * 2 + 1]);
      const cc = it.cfn ? it.cfn(px, py, pz) : col; out.c.push(cc[0], cc[1], cc[2]);
    }
    for (let k = 0; k < g.i.length; k++) out.i.push(g.i[k] + base);
  }
  return out;
}

/* ================= 程序化貼圖 ================= */
function cv(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function dots(g, w, h, n, cols, smin, smax, a) { for (let i = 0; i < n; i++) { g.fillStyle = cols[(Math.random() * cols.length) | 0]; g.globalAlpha = a; const s = smin + Math.random() * (smax - smin); g.fillRect(Math.random() * w, Math.random() * h, s, s); } g.globalAlpha = 1; }
function blotch(g, w, h, n, rmin, rmax, a) { for (let i = 0; i < n; i++) { const x = Math.random() * w, y = Math.random() * h, r = rmin + Math.random() * (rmax - rmin), d = Math.random() < .5; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, d ? `rgba(40,34,28,${a})` : `rgba(255,250,240,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); } }
const TG = {
  pave() {
    const c = cv(256, 256), g = c.getContext('2d'); g.fillStyle = '#aaa59a'; g.fillRect(0, 0, 256, 256);
    blotch(g, 256, 256, 16, 30, 80, .1); dots(g, 256, 256, 3500, ['#8d887c', '#bdb8ab', '#9a958a', '#cfc9bb'], 1, 2.4, .5);
    g.strokeStyle = 'rgba(70,66,58,.75)'; g.lineWidth = 2; g.strokeRect(1, 1, 254, 254); g.beginPath(); g.moveTo(128, 0); g.lineTo(128, 256); g.moveTo(0, 128); g.lineTo(256, 128); g.stroke(); return c;
  },
  wall() { // 8m 磚：奶油色牆 + 底部橘色踢腳 1.1m
    const c = cv(512, 512), g = c.getContext('2d'); g.fillStyle = '#e8dbbb'; g.fillRect(0, 0, 512, 512);
    blotch(g, 512, 512, 20, 40, 120, .07); dots(g, 512, 512, 3000, ['#d6c8a6', '#f3e9cf', '#cbbd9a'], 1.5, 3, .16);
    g.fillStyle = '#d4703a'; g.fillRect(0, 512 - 70, 512, 70); g.fillStyle = '#a34e22'; g.fillRect(0, 512 - 72, 512, 3);
    dots(g, 512, 70, 500, ['#bb5a2a', '#e2824a', '#a84d20'], 1.5, 3, .22);
    const gr = g.createLinearGradient(0, 512 - 90, 0, 512); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(40,30,20,.28)'); g.fillStyle = gr; g.fillRect(0, 512 - 90, 512, 90);
    g.strokeStyle = 'rgba(120,100,70,.25)'; g.lineWidth = 1; for (let x = 0; x < 512; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 440); g.stroke(); } return c;
  },
  facade() { // 寬 4m、高 4.5m
    const c = cv(512, 512), g = c.getContext('2d'); g.fillStyle = '#e4d6b4'; g.fillRect(0, 0, 512, 512);
    blotch(g, 512, 512, 14, 40, 100, .06); dots(g, 512, 512, 2200, ['#d2c4a1', '#f0e6cc'], 1.5, 3, .16);
    g.fillStyle = '#d4703a'; g.fillRect(0, 512 - 125, 512, 125); dots(g, 512, 125, 700, ['#bb5a2a', '#e2824a'], 1, 2.5, .4);
    const win = (cx) => {
      const w = 190, h = 200, x = cx - w / 2, y = 128;
      g.fillStyle = '#f4f1ea'; g.fillRect(x - 8, y - 8, w + 16, h + 16);
      const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#2f434e'); gr.addColorStop(.55, '#6b8896'); gr.addColorStop(1, '#3b4f5a'); g.fillStyle = gr; g.fillRect(x, y, w, h);
      g.fillStyle = 'rgba(255,255,255,.14)'; g.beginPath(); g.moveTo(x, y + h * .65); g.lineTo(x + w * .6, y); g.lineTo(x + w * .85, y); g.lineTo(x, y + h * .95); g.fill();
      g.fillStyle = '#f4f1ea'; g.fillRect(cx - 3, y, 6, h); g.fillRect(x, y + h * .45, w, 6); g.fillStyle = '#b9b3a4'; g.fillRect(x - 12, y + h + 8, w + 24, 8);
    };
    win(128); win(384); return c;
  },
  stone() { // 2.4m，磚塊 0.6 x 0.3
    const c = cv(256, 256), g = c.getContext('2d'); g.fillStyle = '#a9a595'; g.fillRect(0, 0, 256, 256);
    for (let r = 0; r < 8; r++) { const off = (r % 2) * 32; for (let k = -1; k < 5; k++) { const x = k * 64 + off, y = r * 32, l = 205 + Math.random() * 35; g.fillStyle = `rgb(${l},${l - 3},${l - 12})`; g.fillRect(x + 1, y + 1, 62, 30); } }
    dots(g, 256, 256, 2500, ['#8d897a', '#e8e4d6', '#bcb8a8'], 1, 2, .4); return c;
  },
  plank() { // 2.1m，14 片地板條
    const c = cv(256, 256), g = c.getContext('2d'); const base = ['#8c5f3a', '#946642', '#85583a', '#9a6c46', '#7f5334'];
    for (let r = 0; r < 14; r++) {
      const y = r * 18.28; g.fillStyle = base[r % 5]; g.fillRect(0, y, 256, 18.28);
      g.strokeStyle = 'rgba(40,24,12,.22)'; g.lineWidth = 1; for (let k = 0; k < 7; k++) { const yy = y + 2 + Math.random() * 14; g.beginPath(); g.moveTo(0, yy); g.bezierCurveTo(80, yy + (Math.random() - .5) * 3, 170, yy + (Math.random() - .5) * 3, 256, yy); g.stroke(); }
      g.fillStyle = 'rgba(25,14,6,.65)'; g.fillRect(0, y + 17.2, 256, 1.6); const jx = Math.random() * 256; g.fillRect(jx, y, 1.6, 18.28);
    }
    dots(g, 256, 256, 1200, ['#a97a52', '#6e4529'], 1, 2, .3); return c;
  },
  fence() { // 1.6m 直板
    const c = cv(256, 256), g = c.getContext('2d'); for (let b = 0; b < 10; b++) { const x = b * 25.6, l = 38 + Math.random() * 14; g.fillStyle = `rgb(${l},${l - 6},${l - 12})`; g.fillRect(x, 0, 25.6, 256); g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(x + 24, 0, 1.8, 256); g.strokeStyle = 'rgba(255,255,255,.05)'; for (let k = 0; k < 6; k++) { g.beginPath(); const xx = x + 3 + Math.random() * 18; g.moveTo(xx, 0); g.lineTo(xx + (Math.random() - .5) * 3, 256); g.stroke(); } }
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, 40, 256, 5); g.fillRect(0, 200, 256, 5); return c;
  },
  climb() { // 3m x 3m：青綠底 + 彩色三角 + 岩點
    const c = cv(512, 512), g = c.getContext('2d'); g.fillStyle = '#1f8e88'; g.fillRect(0, 0, 512, 512);
    dots(g, 512, 512, 3000, ['#1a7a75', '#25a099'], 1, 3, .3);
    const tri = (pts, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0], pts[1]); g.lineTo(pts[2], pts[3]); g.lineTo(pts[4], pts[5]); g.closePath(); g.fill(); };
    tri([0, 0, 300, 0, 0, 300], '#f1b92e'); tri([512, 512, 512, 180, 180, 512], '#e0702c'); tri([512, 0, 512, 170, 342, 0], '#d6473b'); tri([0, 512, 0, 360, 150, 512], '#f6e7c8');
    const cols = ['#f4d03f', '#e8542f', '#f6f0e0', '#4f7bd8', '#8e4fc9', '#d6473b'];
    const rr = rng(7); for (let i = 0; i < 34; i++) { const x = rr() * 500 + 6, y = rr() * 500 + 6, r = 9 + rr() * 9; g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(x + 3, y + 4, r, r * .9, 0, 0, TAU); g.fill(); g.fillStyle = cols[i % cols.length]; g.beginPath(); g.ellipse(x, y, r, r * .9, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(x - r * .3, y - r * .3, r * .4, r * .3, 0, 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 3; g.strokeRect(0, 0, 512, 512); return c;
  },
  grass() {
    const c = cv(256, 256), g = c.getContext('2d'); g.fillStyle = '#5f7f3a'; g.fillRect(0, 0, 256, 256); blotch(g, 256, 256, 22, 20, 70, .12);
    for (let i = 0; i < 3500; i++) { const x = Math.random() * 256, y = Math.random() * 256, l = 3 + Math.random() * 6; g.strokeStyle = ['#4a6a2c', '#6f9444', '#587a34', '#7da64e', '#3f5b26'][i % 5]; g.globalAlpha = .55; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - .5) * 4, y - l); g.stroke(); } g.globalAlpha = 1; return c;
  },
  gym() { // 籃球場地板 1024x512（對應 34x23.4m）
    const c = cv(1024, 512), g = c.getContext('2d'); const W = 1024, H = 512;
    for (let y = 0; y < H; y += 8) { const l = 150 + Math.random() * 25; g.fillStyle = `rgb(${l + 40},${l - 5},${l - 70})`; g.fillRect(0, y, W, 8); g.fillStyle = 'rgba(60,30,10,.3)'; g.fillRect(0, y + 7, W, 1); const jx = Math.random() * W; g.fillRect(jx, y, 1.5, 8); g.fillRect((jx + 300) % W, y, 1.5, 8); }
    blotch(g, W, H, 24, 40, 140, .06);
    const kz = 'rgba(205,90,45,.55)'; g.fillStyle = kz; g.fillRect(70, 150, 190, 212); g.fillRect(W - 260, 150, 190, 212);
    g.strokeStyle = '#f4efe2'; g.lineWidth = 4; g.strokeRect(40, 36, W - 80, H - 72); g.beginPath(); g.moveTo(W / 2, 36); g.lineTo(W / 2, H - 36); g.stroke();
    g.beginPath(); g.arc(W / 2, H / 2, 64, 0, TAU); g.stroke(); g.strokeRect(40, 150, 220, 212); g.strokeRect(W - 260, 150, 220, 212);
    g.beginPath(); g.arc(260, H / 2, 70, -PI / 2, PI / 2); g.stroke(); g.beginPath(); g.arc(W - 260, H / 2, 70, PI / 2, PI * 1.5); g.stroke();
    g.beginPath(); g.arc(40, H / 2, 250, -1.05, 1.05); g.stroke(); g.beginPath(); g.arc(W - 40, H / 2, 250, PI - 1.05, PI + 1.05); g.stroke();
    const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, 'rgba(0,0,0,.15)'); gr.addColorStop(.5, 'rgba(255,255,255,.05)'); gr.addColorStop(1, 'rgba(0,0,0,.15)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); return c;
  },
  court() { // 戶外球場 512x512（18x14m）
    const c = cv(512, 512), g = c.getContext('2d'); g.fillStyle = '#3d7a68'; g.fillRect(0, 0, 512, 512); dots(g, 512, 512, 5000, ['#34695a', '#488a76', '#2f5f51'], 1, 2.4, .5); blotch(g, 512, 512, 14, 30, 90, .08);
    g.fillStyle = '#d1763a'; g.fillRect(8, 160, 110, 192); g.fillRect(394, 160, 110, 192); g.strokeStyle = '#f0ece0'; g.lineWidth = 4; g.strokeRect(8, 8, 496, 496); g.beginPath(); g.moveTo(256, 8); g.lineTo(256, 504); g.stroke();
    g.beginPath(); g.arc(256, 256, 50, 0, TAU); g.stroke(); g.strokeRect(8, 160, 110, 192); g.strokeRect(394, 160, 110, 192); g.beginPath(); g.arc(8, 256, 200, -1.15, 1.15); g.stroke(); g.beginPath(); g.arc(504, 256, 200, PI - 1.15, PI + 1.15); g.stroke(); return c;
  },
  crate() {
    const c = cv(128, 128), g = c.getContext('2d'); g.fillStyle = '#e08a2e'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#7a3f10'; g.lineWidth = 8; g.strokeRect(4, 4, 120, 120);
    g.fillStyle = '#fff6df'; g.font = '900 86px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', 64, 70); return c;
  },
  puff() {
    const c = cv(128, 128), g = c.getContext('2d'); const gr = g.createRadialGradient(64, 64, 0, 64, 64, 63);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,255,255,.82)'); gr.addColorStop(.5, 'rgba(255,255,255,.42)'); gr.addColorStop(.75, 'rgba(255,255,255,.12)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
  },
  blob() { const c = cv(64, 64), g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, 'rgba(0,0,0,.6)'); gr.addColorStop(.6, 'rgba(0,0,0,.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c; },
  glow() { const c = cv(64, 64), g = c.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.25, 'rgba(255,248,220,.7)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return c; },
  leaf() {
    const c = cv(256, 256), g = c.getContext('2d'); g.fillStyle = '#4a7a30'; g.fillRect(0, 0, 256, 256);
    const cols = ['#356a26', '#5c9238', '#74ad45', '#437a2c', '#8fbf55', '#2c5a21', '#7fb046'];
    for (let i = 0; i < 520; i++) { const x = Math.random() * 256, y = Math.random() * 256, r = 4 + Math.random() * 9, a = Math.random() * PI; g.fillStyle = cols[i % cols.length]; g.globalAlpha = .75; g.beginPath(); g.ellipse(x, y, r, r * .45, a, 0, TAU); g.fill(); for (const ox of [-256, 256]) for (const oy of [-256, 256, 0]) if (x + ox > -12 && x + ox < 268 && y + oy > -12 && y + oy < 268 && (ox || oy)) { g.beginPath(); g.ellipse(x + ox, y + oy, r, r * .45, a, 0, TAU); g.fill(); } }
    g.globalAlpha = .35; g.fillStyle = '#0f2a0c'; for (let i = 0; i < 120; i++) { g.beginPath(); g.arc(Math.random() * 256, Math.random() * 256, 3 + Math.random() * 6, 0, TAU); g.fill(); } g.globalAlpha = 1; return c;
  },
  bark() {
    const c = cv(128, 256), g = c.getContext('2d'); g.fillStyle = '#4a3828'; g.fillRect(0, 0, 128, 256);
    for (let i = 0; i < 60; i++) { const x = Math.random() * 128, w = 2 + Math.random() * 6, l = 40 + Math.random() * 30; g.fillStyle = `rgba(${20 + Math.random() * 40},${14 + Math.random() * 25},${8 + Math.random() * 15},.55)`; g.fillRect(x, Math.random() * 256, w, l); g.fillStyle = 'rgba(160,130,95,.18)'; g.fillRect(x + w, Math.random() * 256, 1.5, l); } return c;
  },
  tile() { // 4m 地磚（2x2 大磚，米白拋光 + 深色拼邊）
    const c = cv(512, 512), g = c.getContext('2d'); g.fillStyle = '#d9d2c3'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 4; i++) { const x = (i % 2) * 256, y = (i >> 1) * 256, l = 214 + Math.random() * 14; g.fillStyle = `rgb(${l},${l - 6},${l - 18})`; g.fillRect(x + 2, y + 2, 252, 252); }
    blotch(g, 512, 512, 18, 40, 120, .07); dots(g, 512, 512, 2600, ['#c4bcab', '#ece6d8', '#b8b09e'], 1, 2.4, .25);
    g.strokeStyle = 'rgba(90,80,64,.55)'; g.lineWidth = 3; g.strokeRect(1, 1, 510, 510); g.beginPath(); g.moveTo(256, 0); g.lineTo(256, 512); g.moveTo(0, 256); g.lineTo(512, 256); g.stroke();
    g.fillStyle = 'rgba(150,60,50,.28)'; g.fillRect(0, 0, 512, 14); g.fillRect(0, 498, 512, 14); g.fillRect(0, 0, 14, 512); g.fillRect(498, 0, 14, 512);
    const gr = g.createLinearGradient(0, 0, 512, 512); gr.addColorStop(0, 'rgba(255,255,255,.12)'); gr.addColorStop(.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(255,255,255,.1)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); return c;
  },
  esc() { // 電扶梯踏板：沿長度方向的凹槽（v 方向 36 階）
    const c = cv(128, 512), g = c.getContext('2d'); g.fillStyle = '#6b6f76'; g.fillRect(0, 0, 128, 512);
    for (let i = 0; i < 36; i++) { const y = i * 512 / 36; g.fillStyle = '#4a4d53'; g.fillRect(0, y, 128, 3); g.fillStyle = '#8b9098'; g.fillRect(0, y + 3, 128, 2); for (let x = 6; x < 128; x += 8) { g.fillStyle = 'rgba(30,30,34,.55)'; g.fillRect(x, y + 6, 3, 512 / 36 - 8); } }
    g.fillStyle = '#e6c331'; g.fillRect(0, 0, 6, 512); g.fillRect(122, 0, 6, 512); return c;
  },
  skyNight() {
    const c = cv(1024, 512), g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 512);
    gr.addColorStop(0, '#03040b'); gr.addColorStop(.45, '#0a1022'); gr.addColorStop(.5, '#17223a'); gr.addColorStop(.58, '#0c1222'); gr.addColorStop(1, '#05070e'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 512);
    const rr = rng(77); for (let i = 0; i < 520; i++) { const x = rr() * 1024, y = rr() * 250, r = rr() * .6 + .22; g.fillStyle = `rgba(255,255,${220 + rr() * 35 | 0},${.35 + rr() * .6})`; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    g.globalAlpha = .1; for (let i = 0; i < 12; i++) { g.fillStyle = '#6f7fb0'; g.beginPath(); g.ellipse(rr() * 1024, 190 + rr() * 50, 90 + rr() * 80, 9 + rr() * 8, 0, 0, TAU); g.fill(); } g.globalAlpha = 1; return c;
  },
  ghost() {
    const c = cv(128, 256), g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, 'rgba(225,238,255,.92)'); gr.addColorStop(.7, 'rgba(190,210,240,.55)'); gr.addColorStop(1, 'rgba(180,200,235,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(26, 250); g.quadraticCurveTo(14, 120, 30, 80); g.quadraticCurveTo(34, 18, 64, 14); g.quadraticCurveTo(96, 18, 100, 80); g.quadraticCurveTo(116, 120, 102, 250);
    for (let i = 0; i < 6; i++) g.quadraticCurveTo(102 - i * 13 - 6, 226 + (i % 2) * 20, 102 - (i + 1) * 12.7, 250); g.closePath(); g.fill();
    g.fillStyle = 'rgba(8,10,18,.95)'; g.beginPath(); g.ellipse(48, 66, 8, 13, 0, 0, TAU); g.ellipse(80, 66, 8, 13, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(64, 100, 9, 17, 0, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(205,225,255,.5)'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(26, 120); g.quadraticCurveTo(6, 150, 20, 190); g.moveTo(102, 120); g.quadraticCurveTo(124, 150, 108, 190); g.stroke(); return c;
  },
  white() { const c = cv(4, 4), g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 4, 4); return c; }
};
