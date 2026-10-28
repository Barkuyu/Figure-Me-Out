/* ================= 角色（依參考圖：白襯衫牛仔寬褲／黑T黑長褲／紫帽T工裝褲） ================= */
const OUTFITS = [
  { key: 'f', label: '蘇蘇', sub: '', skill: { name: '顛倒乾坤', desc: '揮動魔法，讓其他所有玩家的移動方向整整顛倒 5 秒，趁他們手忙腳亂時掌握先機。冷卻 40 秒。' }, H: 1.66, skin: '#efcbb0', hipX: .088, shX: .185, tz: .56, hair: '#4a2f22', hair2: '#8d5c3b', female: true,
    torso: [[.001, -.16], [.205, -.16], [.195, -.08], [.162, .05], [.15, .17], [.152, .28], [.17, .38], [.182, .46], [.172, .51], [.12, .545], [.056, .56], [.05, .595], [.001, .595]] },
  { key: 'm1', label: '艾迪', sub: '', skill: { name: '銅牆鐵壁', desc: '展開護盾 3 秒，穩穩擋下一次輸入攻擊；擋住後號碼立刻刷新，讓對手前功盡棄。冷卻 40 秒。' }, H: 1.78, skin: '#d8a883', hipX: .1, shX: .245, tz: .52, hair: '#0f0f12',
    torso: [[.001, -.09], [.197, -.09], [.2, .0], [.186, .1], [.19, .22], [.224, .36], [.25, .46], [.246, .53], [.176, .57], [.07, .595], [.058, .63], [.001, .63]] },
  { key: 'm2', label: '艾伯特', sub: '', skill: { name: '紫電干擾', desc: '釋放紫色電波：數字鍵先閃光預警，隨後其他玩家的按鍵錯亂 5 秒（手機鍵位亂跳、鍵盤會按錯數字）。冷卻 60 秒。' }, H: 1.76, skin: '#c99a76', hipX: .098, shX: .228, tz: .52, hair: '#0d0d10',
    torso: [[.001, -.10], [.222, -.10], [.227, -.02], [.212, .1], [.217, .22], [.238, .36], [.257, .46], [.252, .53], [.19, .57], [.13, .60], [.118, .645], [.001, .645]] }
];
const SKINPATCH = [.975, .975];

function inkblot(g, cx, cy, sc, seed) {
  const r = rng(seed), cols = ['#a98be0', '#c9b8f0', '#8d79c4', '#dcdcec'];
  g.save(); g.translate(cx, cy); g.scale(sc, sc);
  for (let m = 0; m < 2; m++) {
    g.save(); if (m) g.scale(-1, 1);
    for (let k = 0; k < 30; k++) { const x = r() * 62 + 3, y = (r() - .5) * 150, rad = 3 + r() * 13; g.fillStyle = cols[(r() * cols.length) | 0]; g.globalAlpha = .5 + r() * .45; g.beginPath(); g.ellipse(x, y, rad, rad * (.5 + r() * .9), r() * 3, 0, TAU); g.fill(); }
    g.strokeStyle = '#dcdcec'; g.globalAlpha = .55; g.lineWidth = 1.4;
    for (let k = 0; k < 16; k++) { const x1 = r() * 60, y1 = (r() - .5) * 150; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 + (r() - .3) * 50, y1 + (r() - .5) * 50); g.stroke(); }
    g.restore();
  }
  g.restore(); g.globalAlpha = 1;
}
function paintTorso(o) {
  const W = 1024, Hh = 512, c = cv(W, Hh), g = c.getContext('2d');
  const folds = (col, n, a) => { g.strokeStyle = col; g.globalAlpha = a; for (let i = 0; i < n; i++) { const x = Math.random() * W; g.lineWidth = 2 + Math.random() * 6; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 14, 150, x - 14, 330, x + 6, Hh); g.stroke(); } g.globalAlpha = 1; };
  if (o.key === 'f') {
    g.fillStyle = '#f1ede5'; g.fillRect(0, 0, W, Hh); folds('#cfc8bb', 46, .35); folds('#ffffff', 20, .5); dots(g, W, Hh, 2500, ['#e6e0d3', '#fbf8f1'], 1, 2, .35);
    const cx = 512, top = 70;
    // 敞開前襟：黑色背心上緣 + 黑白條紋 + 露出腰線 + 牛仔褲
    const half = (y) => 74 + (y - top) * .1;
    g.fillStyle = '#eec9ae'; g.beginPath(); g.moveTo(cx - half(top), top); g.lineTo(cx + half(top), top); g.lineTo(cx + half(Hh), Hh); g.lineTo(cx - half(Hh), Hh); g.fill();
    g.fillStyle = '#16161a'; g.fillRect(cx - half(top), top, 2 * half(top), 48);
    for (let y = 118, k = 0; y < 270; y += 19, k++) { g.fillStyle = k % 2 ? '#f6f4ef' : '#17171b'; g.fillRect(cx - half(y), y, 2 * half(y), 19); }
    g.fillStyle = '#9ab4d2'; g.beginPath(); g.moveTo(cx - half(382), 382); g.lineTo(cx + half(382), 382); g.lineTo(cx + half(Hh), Hh); g.lineTo(cx - half(Hh), Hh); g.fill();
    g.fillStyle = '#7f9bbb'; g.fillRect(cx - 2, 382, 4, 130); g.fillStyle = '#c9a050'; g.beginPath(); g.arc(cx, 392, 6, 0, TAU); g.fill();
    const sh = g.createLinearGradient(cx - 100, 0, cx + 100, 0); sh.addColorStop(0, 'rgba(0,0,0,.28)'); sh.addColorStop(.12, 'rgba(0,0,0,0)'); sh.addColorStop(.88, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.28)'); g.fillStyle = sh; g.fillRect(cx - 100, top, 200, Hh);
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(cx - half(Hh) - 3, top, 3, Hh); g.fillRect(cx + half(Hh), top, 3, Hh);
    // 項鍊
    g.strokeStyle = '#d9d2c4'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - 40, 0); g.quadraticCurveTo(cx, 60, cx + 40, 0); g.stroke();
  } else if (o.key === 'm1') {
    g.fillStyle = '#18181c'; g.fillRect(0, 0, W, Hh); folds('#32323a', 40, .35); folds('#000', 40, .35);
    for (const [x, y] of [[440, 170], [584, 170]]) { const q = g.createRadialGradient(x, y, 4, x, y, 90); q.addColorStop(0, 'rgba(255,255,255,.13)'); q.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = q; g.fillRect(x - 90, y - 90, 180, 180); }
    g.fillStyle = '#2a2a30'; g.fillRect(0, 0, W, 16); g.fillStyle = '#101013'; g.fillRect(0, 16, W, 4); dots(g, W, Hh, 3000, ['#26262c', '#0c0c0e'], 1, 2, .4);
    const sh = g.createLinearGradient(0, 0, 0, Hh); sh.addColorStop(.7, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.25)'); g.fillStyle = sh; g.fillRect(0, 0, W, Hh);
  } else {
    g.fillStyle = '#3b1f5e'; g.fillRect(0, 0, W, Hh); folds('#52307a', 40, .35); folds('#1d0d33', 46, .4); dots(g, W, Hh, 3500, ['#4a2a70', '#2c1548'], 1, 2.2, .4);
    g.fillStyle = '#2d1649'; g.beginPath(); g.moveTo(512 - 175, 335); g.lineTo(512 + 175, 335); g.lineTo(512 + 205, 500); g.lineTo(512 - 205, 500); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2; g.setLineDash([8, 6]); g.stroke(); g.setLineDash([]);
    g.strokeStyle = '#cfc6dc'; g.lineWidth = 5; for (const dx of [-34, 34]) { g.beginPath(); g.moveTo(512 + dx, 14); g.lineTo(512 + dx * 1.1, 215); g.stroke(); }
    inkblot(g, 512, 205, 1.15, 11); inkblot(g, 0, 190, 1.7, 21); inkblot(g, W, 190, 1.7, 21);
    g.fillStyle = '#25123d'; g.fillRect(0, 0, W, 14); g.fillStyle = '#34195a'; g.fillRect(0, Hh - 22, W, 22);
  }
  return c;
}
function paintFace(o) {
  const W = 1024, Hh = 512, c = cv(W, Hh), g = c.getContext('2d'), f = !!o.female;
  g.fillStyle = o.skin; g.fillRect(0, 0, W, Hh);
  g.fillStyle = o.skin; g.fillRect(940, 0, 84, 70);
  // 兩側陰影 / 顴骨
  let q = g.createLinearGradient(260, 0, 764, 0); q.addColorStop(0, 'rgba(120,60,30,.30)'); q.addColorStop(.25, 'rgba(120,60,30,0)'); q.addColorStop(.75, 'rgba(120,60,30,0)'); q.addColorStop(1, 'rgba(120,60,30,.30)'); g.fillStyle = q; g.fillRect(260, 0, 504, Hh);
  q = g.createLinearGradient(0, 380, 0, Hh); q.addColorStop(0, 'rgba(100,50,30,0)'); q.addColorStop(1, 'rgba(100,50,30,.4)'); g.fillStyle = q; g.fillRect(0, 380, W, 132);
  const hair = o.hair;
  // 眼睛（Q 版大眼：大圓眼、深色虹膜、雙高光）
  for (const sgn of [-1, 1]) {
    const ex = 512 + sgn * 86, ey = 250;
    g.fillStyle = '#fbf8f4'; g.beginPath(); g.ellipse(ex, ey, 50, 56, 0, 0, TAU); g.fill();
    g.save(); g.beginPath(); g.ellipse(ex, ey, 50, 56, 0, 0, TAU); g.clip();
    const ir = g.createRadialGradient(ex, ey - 8, 6, ex, ey + 4, 46); ir.addColorStop(0, o.female ? '#7a4a38' : '#5a3a2a'); ir.addColorStop(.55, '#2c1812'); ir.addColorStop(1, '#120a07');
    g.fillStyle = ir; g.beginPath(); g.ellipse(ex - sgn * 2, ey + 6, 38, 44, 0, 0, TAU); g.fill();
    g.fillStyle = '#050303'; g.beginPath(); g.ellipse(ex - sgn * 2, ey + 8, 19, 24, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,.95)'; g.beginPath(); g.arc(ex - 14, ey - 16, 13, 0, TAU); g.fill(); g.beginPath(); g.arc(ex + 13, ey + 22, 6.5, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.arc(ex + 16, ey - 4, 4, 0, TAU); g.fill();
    g.restore();
    g.strokeStyle = '#160b08'; g.lineCap = 'round'; g.lineWidth = f ? 8 : 7; g.beginPath(); g.ellipse(ex, ey, 51, 57, 0, PI * 1.02, PI * 1.98); g.stroke();
    if (f) { g.lineWidth = 4; for (let k = 0; k < 3; k++) { const a2 = PI * (1.78 + k * .1 + (sgn > 0 ? 0 : -.0)); g.beginPath(); g.moveTo(ex + sgn * Math.cos(PI * (1.05 + k * .12)) * -50, ey + Math.sin(PI * (1.1 + k * .12)) * 56); g.lineTo(ex + sgn * (52 + k * 5), ey - 40 - k * 6); g.stroke(); } }
    // 眉毛
    g.strokeStyle = hair; g.globalAlpha = .9; g.lineWidth = f ? 7 : 11; g.beginPath(); g.moveTo(512 + sgn * 52, 168); g.quadraticCurveTo(512 + sgn * 92, 150, 512 + sgn * 128, 170); g.stroke(); g.globalAlpha = 1;
    // 腮紅
    const b = g.createRadialGradient(512 + sgn * 128, 338, 3, 512 + sgn * 128, 338, 56); b.addColorStop(0, 'rgba(240,110,110,.42)'); b.addColorStop(1, 'rgba(240,110,110,0)'); g.fillStyle = b; g.fillRect(512 + sgn * 128 - 60, 280, 120, 120);
  }
  // 鼻
  q = g.createLinearGradient(486, 0, 538, 0); q.addColorStop(0, 'rgba(120,64,44,.0)'); q.addColorStop(.18, 'rgba(120,64,44,.2)'); q.addColorStop(.5, 'rgba(255,230,210,.07)'); q.addColorStop(.82, 'rgba(120,64,44,.2)'); q.addColorStop(1, 'rgba(120,64,44,0)'); g.fillStyle = q; g.fillRect(486, 222, 52, 105);
  g.fillStyle = 'rgba(60,25,20,.5)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(512 + s * 10, 334, 4.5, 3.2, 0, 0, TAU); g.fill(); }
  // 嘴（開心的小笑口）
  const my = 392;
  g.fillStyle = '#7a2a30'; g.beginPath(); g.moveTo(512 - 26, my - 4); g.quadraticCurveTo(512, my + 4, 512 + 26, my - 4); g.quadraticCurveTo(512 + 20, my + 34, 512, my + 34); g.quadraticCurveTo(512 - 20, my + 34, 512 - 26, my - 4); g.fill();
  g.fillStyle = '#ee7d86'; g.beginPath(); g.ellipse(512, my + 24, 12, 7, 0, 0, TAU); g.fill();
  g.strokeStyle = '#5a1f24'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(512 - 28, my - 5); g.quadraticCurveTo(512, my + 6, 512 + 28, my - 5); g.stroke();
  if (!f) { // 鬍渣
    g.fillStyle = '#1a1210'; g.globalAlpha = .22; for (let i = 0; i < 1400; i++) { const x = 512 + (Math.random() - .5) * 300, y = 340 + Math.random() * 150; g.fillRect(x, y, 1.6, 1.6); } g.globalAlpha = 1;
  }
  if (o.key === 'm1') { // 刷邊
    for (const sgn of [-1, 1]) { q = g.createLinearGradient(512 + sgn * 170, 0, 512 + sgn * 300, 0); q.addColorStop(0, 'rgba(20,18,16,0)'); q.addColorStop(.5, 'rgba(20,18,16,.75)'); q.addColorStop(1, 'rgba(20,18,16,.9)'); g.fillStyle = q; g.fillRect(Math.min(512 + sgn * 170, 512 + sgn * 300), 40, 130, 190); }
  }
  if (o.key === 'm2') { q = g.createLinearGradient(0, 40, 0, 250); q.addColorStop(0, 'rgba(0,0,0,.6)'); q.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = q; g.fillRect(0, 40, W, 210); }
  return c;
}

function buildOutfit(i) {
  const O = OUTFITS[i], H = O.H, s = H / 1.75, hipY = .49 * H, shY = .815 * H, hh = .13 * H, chinY = H - hh, hc = chinY + .5 * hh, hw = .078 * s;
  const skin = rgb(O.skin), dim = { H, hipY, shY, hh, chinY, hc, hw, hipX: O.hipX, shX: O.shX };
  // ---- 軀幹
  const pts = O.torso.map(p => [p[0], hipY + p[1]]);
  const tg = mergeGeos([{ g: gLathe(pts, 26), r: [0, PI, 0], s: [1, 1, O.tz], vmap: [pts[0][1], pts[pts.length - 1][1]] }]);
  // ---- 頭
  const prof = [[0, 0], [.3, 0], [.55, .05], [.72, .12], [.86, .25], [.96, .4], [1, .55], [.99, .7], [.92, .82], [.72, .92], [.45, .97], [0, 1]].map(p => [p[0] * hw, chinY + p[1] * hh]);
  const hp = [
    { g: gLathe(prof, 30), r: [0, PI, 0], s: [1, 1, 1.15], vmap: [chinY, chinY + hh] },
    { g: gCyl(.05 * s, .056 * s, .13 * s, 12, 1, true), t: [0, chinY - .035, -.006], uv: SKINPATCH },
    { g: gSphere(.0105, 8, 6), t: [0, chinY + .38 * hh, hw * 1.15 * .96 - .002], s: [1.1, 1.3, 1.2], uv: SKINPATCH },
    { g: gSphere(.024, 8, 6), t: [-hw * .98, hc - .005, -.004], s: [.5, 1, .8], uv: SKINPATCH },
    { g: gSphere(.024, 8, 6), t: [hw * .98, hc - .005, -.004], s: [.5, 1, .8], uv: SKINPATCH }
  ];
  const hg = mergeGeos(hp);
  // ---- 頭髮 / 帽子
  const hairP = [], hR = rgb(O.hair);
  const wave = (g, amp, fr) => { for (let k = 0; k < g.p.length; k += 3) { const x = g.p[k], y = g.p[k + 1], z = g.p[k + 2], a = Math.atan2(x, z), f = 1 + amp * Math.sin(a * fr + y * 15); g.p[k] = x * f; g.p[k + 2] = z * f; } return g; };
  if (O.key === 'f') {
    const r1 = rgb(O.hair), r2 = rgb(O.hair2), top = hc + hh * .02;
    const grad = (y) => mixc(r1, r2, clamp((top - y) / .5, 0, 1) ** 1.4);
    hairP.push({ g: gSphere(1, 24, 14, 0, TAU, 0, 1.5), t: [0, hc + .022, -.004], r: [-.3, 0, 0], s: [hw * 1.09, hh * .6, hw * 1.09 * 1.18], cfn: (x, y) => mixc(r1, r2, clamp((y - hc) / .1 * -.2, 0, .3)) });
    hairP.push({ g: wave(gCyl(hw * 1.13, hw * 1.42, .56, 26, 8, true, .26 * PI, 1.48 * PI), .05, 7), t: [0, hc + .03 - .28, -.012], s: [1, 1, 1.12], cfn: (x, y) => grad(y) });
    for (const sg of [-1, 1]) hairP.push({ g: wave(gCyl(.04, .014, .4, 10, 5), .1, 3), t: [sg * (hw * 1.0), hc - .1 - .2, hw * .55], r: [0, 0, -sg * .06], s: [1.1, 1, .55], cfn: (x, y) => grad(y + .1) });
  } else if (O.key === 'm1') {
    hairP.push({ g: gSphere(1, 20, 12, 0, TAU, 0, 1.28), t: [0, hc + .028, -.004], r: [-.2, 0, 0], s: [hw * 1.04, hh * .62, hw * 1.04 * 1.18], c: hR });
    for (let k = 0; k < 8; k++) { const a = -.8 + k * .23; hairP.push({ g: gCyl(0, .02, .07, 6, 1), t: [Math.sin(a) * hw * .78, hc + hh * .5, hw * 1.02 * Math.cos(a) * 1.1], r: [1.0 + Math.sin(k * 2) * .15, a, 0], c: shade(hR, 1.5) }); }
    for (const sg of [-1, 1]) hairP.push({ g: gBox(.012, .045, .05), t: [sg * hw * 1.0, hc - .005, .0], c: [.07, .07, .08] });
    for (const sg of [-1, 1]) hairP.push({ g: gSphere(.0075, 6, 5), t: [sg * hw * 1.02, hc - .06, -.002], c: [.75, .75, .78] });
  } else {
    const cap = [.05, .05, .055];
    hairP.push({ g: gSphere(1, 22, 11, 0, TAU, 0, PI / 2), t: [0, hc + hh * .2, -.006], r: [-.12, 0, 0], s: [hw * 1.14, hh * .62, hw * 1.14 * 1.2], c: cap });
    hairP.push({ g: gCyl(1, 1, .012, 18, 1, false, -1.3, 2.6), t: [0, hc + hh * .24, .08], r: [.08, 0, 0], s: [hw * 1.05, 1, .105], c: [.03, .03, .035] });
    const pur = [.25, .13, .4];
    hairP.push({ g: gSphere(1, 26, 14, PI / 2 + .95, TAU - 1.9, 0, 2.35), t: [0, hc - .005, -.02], s: [hw * 1.62, hh * .95, hw * 1.62 * 1.12], cfn: (x, y, z) => shade(pur, .7 + .5 * clamp((y - (hc - .15)) / .3, 0, 1)) });
    hairP.push({ g: gCyl(.14, .205, .13, 20, 1, true), t: [0, shY + .005, -.02], s: [1, 1, .85], c: shade(pur, .9) });
    for (const sg of [-1, 1]) hairP.push({ g: gSphere(.0075, 6, 5), t: [sg * hw * 1.02, hc - .06, -.002], c: [.75, .75, .78] });
  }
  const hairG = mergeGeos(hairP);

  // ---- 手臂（樞軸在肩）
  const Lu = .29 * s, Lf = .26 * s, armG = [];
  for (let side = 0; side < 2; side++) {
    const sg = side ? 1 : -1, P = [];
    const elbowRot = -.32, ex = 0, ey = -Lu;
    const fc = [0, ey - Math.cos(elbowRot) * Lf / 2, -Math.sin(elbowRot) * Lf / 2 * -1];
    // 前臂中心：沿 Rx(elbowRot)*(0,-Lf/2,0) → (0,-cos*Lf/2, -sin*Lf/2) ，elbowRot<0 => z>0 (向前)
    const fcz = -Math.sin(elbowRot) * Lf / 2 * 1, fcy = ey - Math.cos(elbowRot) * Lf / 2;
    const wx = 0, wy = ey - Math.cos(elbowRot) * Lf, wz = -Math.sin(elbowRot) * Lf;
    if (O.key === 'f') {
      const w = rgb('#f1ede6');
      P.push({ g: gCyl(.062, .074, Lu, 12, 3), t: [0, -Lu / 2, 0], cfn: (x, y) => shade(w, .9 + .1 * Math.sin(y * 40)) });
      P.push({ g: gCyl(.078, .074, Lf * .84, 12, 3), t: [0, fcy + .02, fcz - .005], r: [elbowRot, 0, 0], cfn: (x, y) => shade(w, .9 + .1 * Math.sin(y * 36)) });
      P.push({ g: gCyl(.05, .043, .04, 12, 1), t: [0, wy + .075 * 0 + .03, wz - .008], r: [elbowRot, 0, 0], c: shade(w, .8) });
      P.push({ g: gSphere(.04, 10, 8), t: [0, wy - .045, wz + .012], s: [1, 1.35, .9], c: skin });
      if (side === 0) { P.push({ g: gCyl(.037, .037, .016, 14, 1, true), t: [0, wy + .006, wz - .002], r: [elbowRot, 0, 0], c: [.82, .68, .3] }); P.push({ g: gBox(.03, .006, .03), t: [0, wy + .006, wz + .035], r: [elbowRot, 0, 0], c: [.9, .9, .9] }); }
      else { P.push({ g: gCyl(.036, .036, .01, 14, 1, true), t: [0, wy - .005, wz - .002], r: [elbowRot, 0, 0], c: [.96, .95, .92] }); }
    } else if (O.key === 'm1') {
      const bl = [.07, .07, .08];
      P.push({ g: gCyl(.062, .056, Lu * .92, 12, 2), t: [0, -Lu * .46, 0], c: skin }); P.push({ g: gSphere(.062, 10, 8), t: [0, -Lu * .3, .012], s: [1, 1.2, 1], c: shade(skin, 1.03) });
      P.push({ g: gCyl(.081, .078, Lu * .46, 12, 1), t: [0, -Lu * .23, 0], c: bl });
      P.push({ g: gCyl(.05, .038, Lf, 10, 2), t: [0, fcy, fcz], r: [elbowRot, 0, 0], c: shade(skin, .98) });
      P.push({ g: gSphere(.04, 10, 8), t: [0, wy - .04, wz + .014], s: [1, 1.35, .9], c: skin });
      if (side === 0) { P.push({ g: gCyl(.036, .036, .02, 14, 1, true), t: [0, wy + .012, wz - .004], r: [elbowRot, 0, 0], c: [.08, .08, .09] }); P.push({ g: gBox(.034, .008, .034), t: [0, wy + .012, wz + .036], r: [elbowRot, 0, 0], c: [.12, .12, .14] }); }
    } else {
      const pu = rgb('#3b1f5e');
      P.push({ g: gCyl(.07, .066, Lu, 12, 3), t: [0, -Lu / 2, 0], cfn: (x, y) => shade(pu, .85 + .2 * Math.sin(y * 30)) });
      P.push({ g: gCyl(.066, .05, Lf * .96, 12, 3), t: [0, fcy + .005, fcz], r: [elbowRot, 0, 0], cfn: (x, y) => shade(pu, .85 + .2 * Math.sin(y * 34)) });
      P.push({ g: gCyl(.048, .046, .05, 12, 1), t: [0, wy + .02, wz - .004], r: [elbowRot, 0, 0], c: [.18, .1, .3] });
      P.push({ g: gSphere(.04, 10, 8), t: [0, wy - .045, wz + .012], s: [1, 1.35, .9], c: skin });
      const lil = [[.66, .55, .85], [.8, .8, .87], [.55, .47, .78]];
      for (let k = 0; k < 7; k++) P.push({ g: gSphere(.025 + (k % 3) * .006, 7, 5), t: [sg * .04 + sg * (k % 2) * .02, -.04 - k * .065, .01 - (k % 2) * .05], s: [.5, 1.4, 1], c: lil[k % 3] });
    }
    armG.push(mergeGeos(P));
  }

  // ---- 腿（樞軸在髖）
  const legG = [];
  const shoe = (P, o) => {
    const y0 = -hipY; // 地面
    P.push({ g: gBox(.115, o.sole, .275), t: [0, y0 + o.sole / 2, .055], c: o.soleC });
    P.push({ g: gSphere(1, 12, 8), t: [0, y0 + o.sole + .028, .065], s: [.056, .042, .14], c: o.up });
    if (o.toe) P.push({ g: gSphere(1, 10, 7), t: [0, y0 + o.sole + .026, .15], s: [.054, .036, .07], c: o.toe });
    if (o.heel) P.push({ g: gSphere(1, 10, 7), t: [0, y0 + o.sole + .035, -.04], s: [.052, .045, .045], c: o.heel });
    P.push({ g: gCyl(.04, .042, .05, 10, 1, true), t: [0, y0 + o.sole + .06, .0], c: o.up });
  };
  for (let side = 0; side < 2; side++) {
    const sg = side ? 1 : -1, P = [];
    if (O.key === 'f') {
      const j = rgb('#a3bbd6'), jd = rgb('#7e98b8'), Lt = .44, Ls = hipY - Lt - .04;
      P.push({ g: gCyl(.108, .094, Lt, 14, 3), t: [0, -Lt / 2, 0], cfn: (x, y) => mixc(shade(j, 1.08), j, clamp(-y / Lt, 0, 1)) });
      P.push({ g: gCyl(.094, .136, Ls, 14, 4), t: [0, -Lt - Ls / 2, 0], cfn: (x, y) => mixc(j, jd, clamp((-y - Lt) / Ls, 0, 1) ** 1.5) });
      P.push({ g: gCyl(.138, .14, .015, 14, 1, true), t: [0, -hipY + .045, 0], c: shade(jd, .8) });
      shoe(P, { sole: .052, soleC: [.93, .91, .86], up: [.96, .95, .92] });
    } else if (O.key === 'm1') {
      const t = rgb('#1c1c20'), Lt = .45, Ls = hipY - Lt - .095;
      P.push({ g: gCyl(.1, .088, Lt, 14, 3), t: [0, -Lt / 2, 0], cfn: (x, y) => shade(t, 1.1 - clamp(-y / Lt, 0, 1) * .15) });
      P.push({ g: gCyl(.088, .076, Ls, 14, 3), t: [0, -Lt - Ls / 2, 0], c: shade(t, .95) });
      shoe(P, { sole: .036, soleC: [.97, .97, .96], up: [.97, .97, .96] });
    } else {
      const t = rgb('#17171c'), Lt = .45, Ls = hipY - Lt - .07;
      P.push({ g: gCyl(.118, .112, Lt, 14, 3), t: [0, -Lt / 2, 0], cfn: (x, y) => shade(t, 1.05 + .08 * Math.sin(y * 25)) });
      P.push({ g: gCyl(.112, .128, Ls, 14, 3), t: [0, -Lt - Ls / 2, 0], cfn: (x, y) => shade(t, 1.0 + .08 * Math.sin(y * 22)) });
      P.push({ g: gBox(.075, .19, .14), t: [sg * .115, -.3, .01], c: shade(t, 1.25) }); P.push({ g: gBox(.082, .035, .15), t: [sg * .115, -.215, .01], c: shade(t, .8) });
      P.push({ g: gBox(.012, .15, .03), t: [sg * .158, -.3, .085], c: [.35, .35, .38] }); P.push({ g: gBox(.04, .012, .02), t: [sg * .13, -.265, .085], c: [.4, .4, .42] });
      P.push({ g: gCyl(.128, .13, .02, 14, 1, true), t: [0, -hipY + .075, 0], c: [.1, .1, .12] });
      shoe(P, { sole: .042, soleC: [.93, .93, .96], up: [.23, .14, .38], toe: [.72, .7, .77], heel: [.72, .7, .77] });
    }
    legG.push(mergeGeos(P));
  }
  const faceTex = R.tex(paintFace(O), { aniso: 8 }), torsoTex = R.tex(paintTorso(O), { aniso: 8 });
  return {
    O, dim, meshes: { torso: R.mkMesh(tg), head: R.mkMesh(hg), hair: R.mkMesh(hairG), armL: R.mkMesh(armG[0]), armR: R.mkMesh(armG[1]), legL: R.mkMesh(legG[0]), legR: R.mkMesh(legG[1]) },
    mats: { torso: R.mat({ tex: torsoTex, spec: O.key === 'f' ? .04 : .08 }), head: R.mat({ tex: faceTex, spec: .12 }), cloth: R.mat({ spec: .05 }), hair: R.mat({ spec: .4 }) },
    skin, plateY: chinY + .6 * hh + .1, plateZ: .1
  };
}
const AV = { cache: [], plateMesh: null, bandMesh: null, bandMat: [], blob: null, blobMat: null, tmp: M4.create(), tmp2: M4.create(), Mr: M4.create() };
function getOutfit(i) { if (!AV.cache[i]) AV.cache[i] = buildOutfit(i); return AV.cache[i]; }
function initAvatarShared() {
  const q1 = gPlane(1, 1), q2 = gPlane(1, 1);
  for (let k = 0; k < q1.u.length; k += 2) { q1.u[k] = .005 + q1.u[k] * .49; q2.u[k] = .505 + q2.u[k] * .49; }
  AV.plateMesh = R.mkMesh(mergeGeos([{ g: q1, t: [0, 0, .002] }, { g: q2, t: [0, 0, -.002], r: [0, PI, 0] }]));
  AV.bandMesh = R.mkMesh(mergeGeos([{ g: gCyl(.064, .064, .05, 14, 1, true), c: [1, 1, 1] }]));
  AV.bandMat = [R.mat({ tint: [.85, .2, .2, 1], spec: .1 }), R.mat({ tint: [.2, .4, .88, 1], spec: .1 })];
  const b = gPlane(1, 1); AV.blob = R.mkMesh(mergeGeos([{ g: b, r: [-PI / 2, 0, 0] }]));
  AV.blobMat = R.mat({ tex: R.tex(TG.blob(), { nomip: true }), unlit: 1, blend: 1, noDepth: 1, fog: 0, tint: [1, 1, 1, 1] });
}
/* 額頭號碼牌 */
function makePlate(a) {
  const c = cv(512, 128); a.plateCv = c; a.plateTex = R.tex(c, { aniso: 8 }); a.plateMat = R.mat({ tex: a.plateTex, unlit: 1, fog: 1, tint: [1, 1, 1, 1] });
  drawPlate(a);
}
function drawPlate(a) {
  const c = a.plateCv, g = c.getContext('2d'), team = a.team;
  const border = team === 0 ? '#d93a3a' : team === 1 ? '#3a6fd9' : '#2a2018';
  g.fillStyle = '#f4c64e'; g.fillRect(0, 0, 256, 128); g.fillStyle = border; g.fillRect(0, 0, 256, 10); g.fillRect(0, 118, 256, 10); g.fillRect(0, 0, 10, 128); g.fillRect(246, 0, 10, 128);
  g.fillStyle = '#0d0d0d'; g.font = '900 96px "Arial Black",Impact,"Helvetica Neue",Arial,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const txt = a.number || '0'.repeat(G.codeLen || 4); let w = g.measureText(txt).width; const sc = Math.min(1, 220 / w); g.save(); g.translate(128, 68); g.scale(sc, 1); g.fillText(txt, 0, 0); g.restore();
  g.fillStyle = '#c9a469'; g.fillRect(256, 0, 256, 128); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(256, 56, 256, 16); dots(g, 512, 128, 400, ['#b8935a', '#d7b87c'], 1, 2, .4);
  R.updateTex(a.plateTex);
}
function createAvatar(outfitIdx) { return { outfit: getOutfit(outfitIdx), outfitIdx }; }

/* 繪製一名角色（Q 版比例：大頭、短腿、圓潤身體） */
const CHIBI = { legS: .52, torS: .72, armS: .74, wide: 1.26, head: 2.0 };
const _m1 = M4.create(), _m2 = M4.create(), _U = M4.create();
function placeM(out, base, tx, ty, tz, rx, rz, sx, sy, sz, ox, oy, oz) { // out = base * T(t)*R*S(s) * T(o)
  M4.trs(_m1, tx, ty, tz, rx, 0, rz, sx, sy, sz);
  if (ox !== undefined) { M4.trs(_m2, ox, oy, oz, 0, 0, 0, 1, 1, 1); M4.mul(_m1, _m1, _m2); }
  M4.mul(out, base, _m1); return out;
}
function drawAvatar(a, opt) {
  const O = a.av.outfit, d = O.dim, Mr = AV.Mr, T = AV.tmp, M = AV.tmp2, mt = O.meshes, ms = O.mats, C = CHIBI;
  const ph = a.animT || 0, sp = a.sp || 0, red = a.redT > 0 && !R.shadowPass;
  if (red) { const e = .45 + .3 * Math.sin(G.time * 14); for (const m of [ms.torso, ms.head, ms.cloth, ms.hair]) { m.emis = [e, .02, .02]; m.tint = [1, .62, .62, 1]; } }
  const bob = Math.abs(Math.sin(ph * 2)) * .03 * sp, fall = a.fall || 0;
  M4.trs(Mr, a.x, a.y + bob, a.z, -fall * (PI / 2), a.yaw + PI, 0, 1, 1, 1);
  const hipN = d.hipY * C.legS, shN = (d.shY - d.hipY) * C.torS, chinN = (d.chinY - d.hipY) * C.torS;
  const lean = clamp((a.lo || 0) / LEANMAX, -1, 1) * .38;
  M4.trs(T, 0, hipN, 0, 0, 0, -lean, 1, 1, 1); M4.mul(_U, Mr, T); const U = _U;
  placeM(M, U, 0, 0, 0, 0, 0, C.wide, C.torS, C.wide, 0, -d.hipY, 0); R.draw(mt.torso, M, ms.torso);
  placeM(M, U, 0, chinN, 0, 0, 0, C.head, C.head, C.head, 0, -d.chinY, 0); R.draw(mt.head, M, ms.head); R.draw(mt.hair, M, ms.hair);
  const sw = Math.sin(ph) * .85 * sp, arm = a.armUp || 0;
  // 腿
  placeM(M, Mr, -d.hipX * C.wide, hipN, 0, sw, 0, C.wide, C.legS, C.wide); R.draw(mt.legL, M, ms.cloth);
  placeM(M, Mr, d.hipX * C.wide, hipN, 0, -sw, 0, C.wide, C.legS, C.wide); R.draw(mt.legR, M, ms.cloth);
  // 手（隨上半身傾斜）
  const sy = shN - .03;
  placeM(M, U, -d.shX * C.wide + .02, sy, 0, -sw * .8 - .05 - arm, .05, C.wide, C.armS, C.wide); R.draw(mt.armL, M, ms.cloth);
  const Ar = placeM(AV.Ar || (AV.Ar = M4.create()), U, d.shX * C.wide - .02, sy, 0, sw * .8 - .05 - arm * .5, -.05, C.wide, C.armS, C.wide); R.draw(mt.armR, Ar, ms.cloth);
  if (red) for (const m of [ms.torso, ms.head, ms.cloth, ms.hair]) { m.emis = [0, 0, 0]; m.tint = [1, 1, 1, 1]; }
  if (R.shadowPass) return;
  if (a.team >= 0) { M4.trs(T, 0, -.09, 0, 0, 0, 0, 1, 1, 1); M4.mul(M, Ar, T); R.draw(AV.bandMesh, M, AV.bandMat[a.team]); }
  // 號碼牌（略向後仰，戴在額頭上）
  const sc = a.plateScale || 1, k = C.head;
  placeM(M, U, 0, chinN + (O.plateY - d.chinY) * k + .04 * (sc - 1), O.plateZ * k, -.14, 0, .40 * sc * 1.1, .19 * sc * 1.1, 1); R.draw(AV.plateMesh, M, a.plateMat);
}
function drawBlob(a, tint) {
  const T = AV.tmp, s = a.blobS || 1.1;
  M4.trs(T, a.x + .12, (a.gy || 0) + .035, a.z + .08, 0, 0, 0, s, 1, s); R.draw(AV.blob, T, AV.blobMat);
}
