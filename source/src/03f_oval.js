/* ================= 地圖 6：白宮室內辦公室（橢圓辦公室＋西廂／東廂；面積同熱血高校，障礙物 1.1 倍） ================= */
const OVAL_ENV = { sunCol: [.80, .74, .64], sky: [.55, .52, .50], gnd: [.50, .43, .36], fog: [.62, .57, .52], fogR: [90, 320], interior: [-43.5, -35.5, 43.5, 35.5], intK: .9, intH: 5.6 };
function buildOval(W) {
  const B = (...a) => W.box(...a), rr = rng(1600), HX = 43, HZ = 35, WH = 5.4, rects = [];
  const rect = (x, z, w, d) => rects.push([x - w / 2, z - d / 2, x + w / 2, z + d / 2]);
  const free = (x, z, w, d, mg) => { for (const q of rects) if (x + w / 2 + mg > q[0] && x - w / 2 - mg < q[2] && z + d / 2 + mg > q[1] && z - d / 2 - mg < q[3]) return false; return true; };
  const keepClear = []; const inKeep = (x, z, w, d) => keepClear.some(q => x + w / 2 > q[0] && x - w / 2 < q[2] && z + d / 2 > q[1] && z - d / 2 < q[3]);
  const put = (mat, x, z, w, d, h, y0, mg) => { if (inKeep(x, z, w, d) || !free(x, z, w, d, mg === undefined ? 1.5 : mg)) return false; B(mat, x, z, w, d, h, y0 || 0); rect(x, z, w, d); return true; };
  const solid = (mat, x, z, w, d, h, y0) => { B(mat, x, z, w, d, h, y0 || 0); rect(x, z, w, d); };
  // ---- 地板、外牆、天花板 ----
  W.quadTop('parquet', -70, -55, 70, 55, 0);
  for (const [cx, cz, w, d] of [[0, -HZ - .3, 2 * HX + 1.2, .6], [0, HZ + .3, 2 * HX + 1.2, .6], [-HX - .3, 0, .6, 2 * HZ], [HX + .3, 0, .6, 2 * HZ]]) B('stripe', cx, cz, w, d, WH, 0, { colH: 9 });
  B('ceil', 0, 0, 2 * HX, 2 * HZ, .4, WH + .2, { collide: false });
  for (let x = -36; x <= 36; x += 12) for (let z = -28; z <= 28; z += 14) B('light', x, z, 2.6, .9, .06, WH + .14, { collide: false });
  // ---- 橢圓辦公室（A=20, B=14.5，中心 (0,-9)） ----
  const CX = 0, CZ = -9, A = 20, BB = 14.5, N = 80, pt = k => [CX + Math.cos(k / N * Math.PI * 2) * A, CZ + Math.sin(k / N * Math.PI * 2) * BB];
  const gate = (mx, mz) => { for (const sx of [-9, 9]) if (mz > 3 && Math.abs(mx - sx) < 2.4) return true; if (Math.abs(mz - CZ) < 2.4 && Math.abs(mx) > A - 2.4) return true; return false; };
  for (let k = 0; k < N; k++) { const p = pt(k), q = pt(k + 1), mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2; if (gate(mx, mz)) continue; const w = Math.abs(q[0] - p[0]) + .55, d = Math.abs(q[1] - p[1]) + .55; B('stripe', mx, mz, w, d, WH, 0); }
  for (const sx of [-9, 9]) for (const dx of [-2.6, 2.6]) { B('whitepaint', sx + dx, CZ + BB - .1, .7, .7, 3.9, 0, { collide: false }); B('whitepaint', sx + dx, CZ + BB - .1, 1.0, 1.0, .35, 3.9, { collide: false }); }
  for (const sz of [-1]) { B('whitepaint', CX - A, CZ - 2.8, .7, .7, 3.9, 0, { collide: false }); B('whitepaint', CX - A, CZ + 2.8, .7, .7, 3.9, 0, { collide: false }); B('whitepaint', CX + A, CZ - 2.8, .7, .7, 3.9, 0, { collide: false }); B('whitepaint', CX + A, CZ + 2.8, .7, .7, 3.9, 0, { collide: false }); }
  // 北牆三扇落地窗 + 紅色絲絨窗簾 + 星條旗
  const NZ = CZ - BB + .6;
  for (const x of [-5.2, 0, 5.2]) { B('glass', x, NZ - .15, 3.0, .1, 3.6, 1.0, { collide: false }); B('whitepaint', x, NZ - .1, 3.3, .14, .22, 4.7, { collide: false }); }
  for (const x of [-7.6, -2.6, 2.6, 7.6]) B('drape', x, NZ + .2, 1.5, .5, 4.5, .25, { collide: false });
  const flag = W.atlasAdd('flagUS', 256, 160, (g, w, h) => { for (let i = 0; i < 13; i++) { g.fillStyle = i % 2 ? '#f4f4f4' : '#b22234'; g.fillRect(0, i * h / 13, w, h / 13 + 1); } g.fillStyle = '#3c3b6e'; g.fillRect(0, 0, w * .42, h * 7 / 13); g.fillStyle = '#fff'; for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) g.fillRect(8 + c * 24 + (r % 2) * 12, 8 + r * 14, 4, 4); });
  for (const sx of [-1, 1]) { B('gold', sx * 10.8, NZ + .6, .12, .12, 5.0, 0, { collide: false }); W.wdecal(flag, sx * 10.8 - 1.6, NZ + .55, sx * 10.8 + 1.6, NZ + .55, 2.1, 4.2, 'decal'); }
  // 書櫃拱形壁龕（東西兩側各兩座）：碰撞型障礙
  for (const [ang, w] of [[Math.PI * .72, 4.6], [Math.PI * 1.28, 4.6], [Math.PI * .28, 4.6], [Math.PI * 1.72, 4.6]]) { const x = CX + Math.cos(ang) * (A - 1.1), z = CZ + Math.sin(ang) * (BB - 1.1); B('books', x, z, Math.abs(Math.sin(ang)) > .75 ? w : .6, Math.abs(Math.sin(ang)) > .75 ? .6 : w, 3.4, 0); rect(x, z, 5, 5); }
  // 總統辦公桌（決心桌）與座椅
  solid('wood', 0, -21.4, 7.2, 2.6, 1.15); B('gold', 0, -20.15, 7.4, .08, .18, 1.0, { collide: false }); solid('leather', 0, -23.1, 1.5, 1.4, 1.5);
  for (const sx of [-1, 1]) solid('wood', sx * 4.6, -23.2, 1.1, .7, 1.9); // 邊桌／國旗座
  // 中庭：地毯、沙發、扶手椅、茶几
  W.quadTop('carpet', -17, -21.6, 17, 3.6, .012, true);
  for (const sx of [-1, 1]) { solid('sofaC', sx * 11.6, -9, 1.9, 7.4, .6); solid('sofaC', sx * 12.6, -9, .6, 7.4, 1.25); solid('wood', sx * 11.8, -13.6, 1.4, 1.4, .95); solid('wood', sx * 11.8, -4.4, 1.4, 1.4, .95); }
  for (const sx of [-1, 1]) { solid('leather', sx * 3.4, -4.4, 1.6, 1.6, .6); solid('leather', sx * 3.4, -3.6, 1.6, .5, 1.3); }
  solid('stone', 0, -9, 4.4, 2.8, .5); B('gold', 0, -9, .8, .8, .18, .5, { collide: false });
  for (const sx of [-1, 1]) { W.prop([{ g: gCyl(.05, .05, 1.9, 8, 1), t: [sx * 11.8, 1.9, -13.6], c: [.86, .68, .22] }, { g: gCyl(.2, .34, .42, 12, 1), t: [sx * 11.8, 2.5, -13.6], c: [.96, .92, .78] }, { g: gCyl(.2, .34, .42, 12, 1), t: [sx * 11.8, 2.5, -4.4], c: [.96, .92, .78] }]); }
  // 掛畫（壁紙牆上）
  const art = W.atlasAdd('paint', 192, 128, (g, w, h) => { g.fillStyle = '#7fb4d8'; g.fillRect(0, 0, w, h); g.fillStyle = '#d9c28a'; g.fillRect(0, h * .6, w, h * .4); g.fillStyle = '#6e8f5a'; g.beginPath(); g.moveTo(0, h * .6); g.lineTo(w * .3, h * .35); g.lineTo(w * .55, h * .6); g.fill(); g.strokeStyle = '#7a5a22'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); });
  W.wdecal(art, -13.2, NZ + 1.1, -9.6, NZ + 1.1, 1.9, 3.4, 'decal'); W.wdecal(art, 9.6, NZ + 1.1, 13.2, NZ + 1.1, 1.9, 3.4, 'decal');
  keepClear.push([-21, -25, 21, 7.5], [-43, -35, -24, -22], [24, -35, 43, -22]);
  // ---- 西廂／東廂：以 x=±24 的隔牆分出辦公室，每道隔牆開門 ----
  const wallH = (x0, x1, z, gaps) => { let cur = x0; for (const [g0, g1] of gaps) { if (g0 > cur) solid('stripe', (cur + g0) / 2, z, g0 - cur, .5, WH); cur = g1; } if (x1 > cur) solid('stripe', (cur + x1) / 2, z, x1 - cur, .5, WH); };
  const wallV = (x, z0, z1, gaps) => { let cur = z0; for (const [g0, g1] of gaps) { if (g0 > cur) solid('stripe', x, (cur + g0) / 2, .5, g0 - cur, WH); cur = g1; } if (z1 > cur) solid('stripe', x, (cur + z1) / 2, .5, z1 - cur, WH); };
  for (const sg of [-1, 1]) {
    const x0 = sg < 0 ? -HX : 24, x1 = sg < 0 ? -24 : HX, gx = sg * 33.5;
    wallV(sg * 24, -HZ, 7.5, [[-30, -26], [-17, -13], [-4, 0]]);
    for (const z of [-22, -10, 2]) wallH(x0, x1, z, [[gx - 2.2, gx + 2.2]]);
    solid('wood', sg * 33.5, -16.5, 9, 1.2, 1.0); solid('wood', sg * 28.5, -6, 1.2, 4.5, 1.0); // 長會議桌／櫃台
  }
  // 南側大廳：兩排柱子與接待台
  for (let x = -40; x <= 40; x += 8) for (const z of [14, 28]) solid('whitepaint', x, z, 1.2, 1.2, 4.6);
  solid('wood', 0, 31, 8, 1.4, 1.1); solid('stone', 0, 20.5, 2.6, 2.6, .9); B('gold', 0, 20.5, 1.2, 1.2, 2.2, .9);
  // ---- 家具填充：補足到熱血高校 1.1 倍（總數 ≈ 276，阻擋型 ≥ 141） ----
  const cnt = () => W.boxes.filter(b => !b.nc).length, blk = () => W.boxes.filter(b => !b.nc && b.y1 - b.y0 >= 1.2).length; let guard = 0;
  const zonesOK = (x, z) => !(Math.abs(x) < 24 && z > -26 && z < 7.5); // 橢圓辦公室內部不再放置
  while ((cnt() < 276 || blk() < 141) && guard++ < 9000) {
    const x = (rr() * 2 - 1) * (HX - 2.5), z = (rr() * 2 - 1) * (HZ - 2.5), t = rr(); if (!zonesOK(x, z)) continue;
    if (t < .35) put('wood', x, z, 1.0 + rr() * .5, .6 + rr() * .4, 1.8 + rr() * .6, 0); // 檔案櫃
    else if (t < .6) { if (put('stone', x, z, .9, .9, 1.4, 0)) B('grass', x, z, .7, .7, .5, 1.4, { collide: false }); } // 盆栽
    else if (t < .8) put('whitepaint', x, z, .9, .9, 1.5 + rr() * 2.2, 0); // 雕像基座／立柱
    else put('wood', x, z, 2.0, 1.0, .85, 0); // 辦公桌（低矮）
  }
}
MAPS.oval = {
  id: 'oval', indoor: true, noShadow: true, orbit: { c: [0, -6], r: 24, h: 24, ly: 1.4 }, preview: [0, -2], name: '白宮室內辦公室', sub: '橢圓辦公室 · 標準面積 86×70 m', desc: '以美國總統辦公室為藍本放大成對戰場：奶油金條紋壁紙的橢圓大廳、紅色窗簾與星條旗、決心桌、沙發、人字拼木地板與圓形地毯，外圍是西廂／東廂辦公室與柱廊大廳。障礙物為熱血高校的 1.1 倍。',
  bounds: { x0: -43, x1: 43, z0: -35, z1: 35 }, flagPos: [[-35, -30], [35, -30]], zoneRed: [-42, -33.5, -28, -23], zoneBlue: [28, -33.5, 42, -23], faceRed: [-24, -10], faceBlue: [24, -10],
  interior: [-43.5, -35.5, 43.5, 35.5], env: OVAL_ENV, night: false,
  pickSpots: [[-12, -9], [12, -9], [0, -14], [0, -3], [-32, -16], [32, -16], [-32, -4], [32, -4], [-32, 12], [32, 12], [-18, 20], [18, 20], [0, 24], [-8, 32], [8, 32], [-30, 28], [30, 28], [-22, -30], [22, -30], [0, -30]],
  build(W) { buildOval(W); }
};
