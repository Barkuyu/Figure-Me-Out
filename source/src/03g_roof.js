/* ================= 地圖 7：大樓頂端（直升機坪屋頂＋台北天際線；面積同熱血高校，障礙物 1.1 倍） ================= */
const ROOF_ENV = { sunCol: [.86, .82, .72], sky: [.50, .60, .78], gnd: [.42, .42, .42], fog: [.78, .86, .94], fogR: [110, 420], interior: [999, 999, 1000, 1000], intK: .7, intH: 7 };
function buildRoof(W) {
  const B = (...a) => W.box(...a), rr = rng(101), HX = 43, HZ = 35, rects = [];
  const rect = (x, z, w, d) => rects.push([x - w / 2, z - d / 2, x + w / 2, z + d / 2]);
  const free = (x, z, w, d, mg) => { for (const q of rects) if (x + w / 2 + mg > q[0] && x - w / 2 - mg < q[2] && z + d / 2 + mg > q[1] && z - d / 2 - mg < q[3]) return false; return true; };
  const keep = [[-43, -12, -33, 12], [33, -12, 43, 12], [-19, -8, -1, 12]]; // 兩側出生區與直升機坪保持淨空
  const inKeep = (x, z, w, d) => keep.some(q => x + w / 2 > q[0] && x - w / 2 < q[2] && z + d / 2 > q[1] && z - d / 2 < q[3]);
  const put = (mat, x, z, w, d, h, y0, mg) => { if (inKeep(x, z, w, d) || !free(x, z, w, d, mg === undefined ? 1.5 : mg)) return false; B(mat, x, z, w, d, h, y0 || 0); rect(x, z, w, d); return true; };
  const solid = (mat, x, z, w, d, h, y0) => { B(mat, x, z, w, d, h, y0 || 0); rect(x, z, w, d); };
  // ---- 屋頂地面（灰色方磚）與直升機坪 ----
  W.quadTop('rtile', -43.6, -35.6, 43.6, 35.6, 0); W.quadTop('rtile', -300, -300, 300, -35.6, -9); W.quadTop('rtile', -300, 35.6, 300, 300, -9);
  W.quadTop('helipad', -18, -8, -2, 12, .015, true); for (const [x, z] of [[-18, -8], [-2, -8], [-18, 12], [-2, 12]]) B('glowY', x, z, .35, .35, .22, 0, { collide: false });
  // ---- 女兒牆與欄杆（四周） ----
  for (const [cx, cz, w, d] of [[0, -HZ - .35, 2 * HX + 1.4, .7], [0, HZ + .35, 2 * HX + 1.4, .7], [-HX - .35, 0, .7, 2 * HZ], [HX + .35, 0, .7, 2 * HZ]]) { B('concrete', cx, cz, w, d, 1.15, 0, { colH: 9 }); B('steel', cx, cz, w, d, .08, 1.15, { collide: false }); }
  for (let x = -42; x <= 42; x += 3) for (const sz of [-1, 1]) B('steel', x, sz * (HZ + .3), .08, .08, 1.0, 1.15, { collide: false });
  // ---- 主要結構：機房樓梯間（北側）、電梯機房、水塔、冷氣機組列、太陽能板 ----
  solid('bldgA', 0, -29, 20, 10, 4.8); B('concrete', 0, -29, 20.6, 10.6, .3, 4.8, { collide: false }); solid('steel', 11.8, -26, 1.6, 5, 1.0); for (let k = 0; k < 6; k++) B('steel', 12.4 + k * .0, -28.5 + k * .8, 1.2, .5, .5 + k * .45, 0); // 外掛鐵梯
  solid('bldgB', -30, -27, 8, 6, 3.6); solid('bldgB', 28, -26, 9, 7, 3.2);
  for (const sx of [-1, 1]) { solid('tankM', sx * 14, 24, 4.4, 4.4, 3.2, 1.2); for (const [dx, dz] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) B('steel', sx * 14 + dx, 24 + dz, .3, .3, 1.2, 0); W.prop([{ g: gSphere(1.6, 12, 8, 0, Math.PI * 2, 0, 1.4), t: [sx * 14, 4.9, 24], c: [.35, .48, .7] }]); }
  for (let k = 0; k < 5; k++) { put('acunit', 22 + (k % 3) * 3.2, 4 + Math.floor(k / 3) * 2.4, 2.6, 1.8, 1.4, 0, .6); put('acunit', -22 - (k % 3) * 3.2, -2 - Math.floor(k / 3) * 2.4, 2.6, 1.8, 1.4, 0, .6); }
  for (let k = 0; k < 4; k++) { put('panel', -30 + k * 6, 29, 4.6, .3, 2.2, 0, 1.2); put('panel', 12 + k * 6, -4, 4.6, .3, 2.2, 0, 1.2); }
  W.prop([{ g: gCyl(.12, .12, 18, 6, 1), t: [-30, 13, -27], c: [.55, .55, .6] }, { g: gCyl(.12, .12, 12, 6, 1), t: [28, 10, -26], c: [.55, .55, .6] }]); // 天線桿
  // 長管線與天窗（可跳過、可閃躲）
  for (const z of [-18, 20]) { B('steel', 0, z, 40, .5, .55, 0); rect(0, z, 40, .5); }
  for (const x of [-34, 34]) { B('glass', x, 12, 4, 6, 1.0, 0); rect(x, 12, 4, 6); }
  // ---- 隨機屋頂設備填充（通風口、配電箱、水泥墩）：總數 ≈ 276，阻擋型 ≥ 141 ----
  const cnt = () => W.boxes.filter(b => !b.nc).length, blk = () => W.boxes.filter(b => !b.nc && b.y1 - b.y0 >= 1.2).length; let guard = 0;
  while ((cnt() < 276 || blk() < 141) && guard++ < 9000) {
    const x = (rr() * 2 - 1) * (HX - 2.5), z = (rr() * 2 - 1) * (HZ - 2.5), t = rr();
    if (t < .3) put('acunit', x, z, 1.8 + rr() * .8, 1.2 + rr() * .6, 1.3 + rr() * .5, 0); // 冷氣室外機
    else if (t < .55) put('concrete', x, z, 1.0 + rr(), 1.0 + rr(), 1.2 + rr() * 2.0, 0); // 水泥墩／通風井
    else if (t < .75) put('cOrg', x, z, 1.2, 1.2, 1.3 + rr() * 1.2, 0); // 維修箱
    else if (t < .9) put('steel', x, z, .7, .7, 1.4 + rr() * 1.5, 0); // 管線立柱
    else put('wood', x, z, 3 + rr() * 2, 1.0, 1.0, 0); // 木棧板堆
  }
  // ---- 背景：台北天際線（玻璃帷幕摩天樓＋周邊大樓＋遠山，皆為裝飾） ----
  const TX = 14, TZ = -135; B('bldgB', TX, TZ, 46, 34, 16, -9, { collide: false });
  const segs = 8; for (let k = 0; k < segs; k++) { const w = 21 - k * .75, y0 = 7 + k * 19; B('towerG', TX, TZ, w, w, 19, y0, { collide: false }); B('gold', TX, TZ, w + 1.6, w + 1.6, .8, y0 + 18, { collide: false }); }
  B('towerG', TX, TZ, 11, 11, 20, 7 + segs * 19, { collide: false }); B('steel', TX, TZ, 1.6, 1.6, 20, 7 + segs * 19 + 20, { collide: false });
  for (let k = 0; k < 46; k++) { const a = -Math.PI * .95 + rr() * Math.PI * .9, r = 85 + rr() * 90, w = 8 + rr() * 16, h = 14 + rr() * 60; B(rr() < .5 ? 'bldgA' : (rr() < .5 ? 'bldgB' : 'towerG'), Math.cos(a) * r * 1.5, Math.sin(a) * r - 20, w, w * (.7 + rr() * .6), h, -9, { collide: false }); }
  for (let k = 0; k < 14; k++) B('hillG', -220 + k * 34 + rr() * 12, -290 - rr() * 40, 60 + rr() * 30, 40, 34 + rr() * 30, -9, { collide: false });
}
MAPS.roof = {
  id: 'roof', orbit: { c: [0, 0], r: 30, h: 16, ly: 1.5 }, preview: [-6, 6], name: '大樓頂端', sub: '直升機坪屋頂 · 標準面積 86×70 m', desc: '都會大樓頂端：灰色方磚屋面、白色 H 直升機坪、女兒牆與欄杆，周圍是水塔、冷氣機組、太陽能板與機房，遠方可以看到台北天際線的玻璃帷幕摩天樓與群山。障礙物為熱血高校的 1.1 倍。',
  bounds: { x0: -43, x1: 43, z0: -35, z1: 35 }, flagPos: [[-38, 0], [38, 0]], zoneRed: [-42, -11, -34, 11], zoneBlue: [34, -11, 42, 11], faceRed: [-8, 2], faceBlue: [8, 2],
  interior: [999, 999, 1000, 1000], env: ROOF_ENV, night: false,
  pickSpots: [[-24, -24], [24, 24], [-24, 24], [24, -24], [0, -14], [0, 14], [-10, 2], [10, 2], [-30, 0], [30, 0], [-12, 28], [12, -28], [-38, 26], [38, -26], [-38, -26], [38, 26], [0, 0], [0, 30], [0, -33], [-20, -14]],
  build(W) { buildRoof(W); }
};
