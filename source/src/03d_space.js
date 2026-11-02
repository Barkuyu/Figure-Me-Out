/* ================= 地圖 4：無遠弗屆（外太空；面積為熱血高校 1.2 倍，障礙物 1.2 倍多；低重力＋延遲起跳） ================= */
const SPACE_ENV = { sunCol: [.84, .68, .52], sky: [.40, .33, .50], gnd: [.46, .38, .30], fog: [.42, .35, .50], fogR: [70, 260], interior: [999, 999, 1000, 1000], intK: .7, intH: 7 };
function buildSpace(W) {
  const B = (...a) => W.box(...a), rr = rng(5150), BX = 47.6, BZ = 37.8, rects = [];
  const rect = (x, z, w, d) => rects.push([x - w / 2, z - d / 2, x + w / 2, z + d / 2]);
  const free = (x, z, w, d, mg) => { for (const q of rects) if (x + w / 2 + mg > q[0] && x - w / 2 - mg < q[2] && z + d / 2 + mg > q[1] && z - d / 2 - mg < q[3]) return false; return true; };
  const keep = [[-47.6, -15, -36, 15], [36, -15, 47.6, 15]]; // 出生區：保持淨空
  const inKeep = (x, z, w, d) => keep.some(q => x + w / 2 > q[0] - 1 && x - w / 2 < q[2] + 1 && z + d / 2 > q[1] - 1 && z - d / 2 < q[3] + 1);
  const put = (mat, x, z, w, d, h, y0, mg) => { if (inKeep(x, z, w, d) || !free(x, z, w, d, mg === undefined ? 1.2 : mg)) return false; B(mat, x, z, w, d, h, y0 || 0); rect(x, z, w, d); return true; };
  const wall = (mat, x, z, w, d, h, y0) => { B(mat, x, z, w, d, h, y0 || 0); rect(x, z, w, d); };
  // ---- 地面與邊界岩壁 ----
  W.quadTop('regolith', -160, -130, 160, 130, 0);
  for (const [cx, cz, w, d] of [[0, -BZ - 1, 2 * BX + 6, 2], [0, BZ + 1, 2 * BX + 6, 2], [-BX - 1, 0, 2, 2 * BZ + 2], [BX + 1, 0, 2, 2 * BZ + 2]]) B('moonrock', cx, cz, w, d, 5, 0, { colH: 9 });
  for (let k = 0; k < 26; k++) { const a = rr() * Math.PI * 2, r = 62 + rr() * 38, w = 8 + rr() * 16, h = 8 + rr() * 22; B('moonrock', Math.cos(a) * r * 1.2, Math.sin(a) * r * .95, w, w * (.6 + rr() * .6), h, 0, { collide: false }); } // 遠方山脈（裝飾）
  // ---- 中央：墜毀的太空船 ----
  wall('hull', 0, -3.2, 22, .5, 3.4); wall('hull', -5, 3.2, 12, .5, 3.4); wall('hull', 8.5, 3.2, 5, .5, 3.4); // 長艙壁（側門缺口在 x∈[1,6]）
  wall('hullD', -11.2, 0, .5, 6.9, 3.4); // 尾艙
  B('hullD', -1, 0, 16, 6.4, .35, 3.4, { collide: false }); rect(-1, 0, 16, 6.4);
  for (const sx of [-1, 1]) { wall('hull', 11.5, sx * 4.4, 1.4, 3, 2.4); } // 機頭殘骸
  wall('hullD', -13.5, -4.5, 3, 1.1, 2.0); wall('hullD', -13.5, 4.5, 3, 1.1, 2.0); // 尾翼
  wall('cOrg', 3.5, 0, 1.6, 1.6, 1.4); wall('cTeal', -4, 1, 1.4, 1.4, 1.6); // 艙內貨箱
  W.prop([{ g: gSphere(1.6, 12, 8), t: [14, 1.3, 0], c: [.5, .52, .6] }]); // 機頭球罩（裝飾）
  // ---- 西側：生活艙（紅隊後方） ----
  for (const [cx, cz, w, d] of [[-30, -6.5, 12, .5], [-30, 6.5, 12, .5], [-36, 0, .5, 12.5]]) wall('hull', cx, cz, w, d, 3.4);
  wall('hull', -24, -4.2, .5, 4.2, 3.4); wall('hull', -24, 4.2, .5, 4.2, 3.4); // 東牆留 4.2 寬的氣密門
  wall('cYel', -31, -3.5, 2.4, 1.2, 1.6); wall('cYel', -31, 3.5, 2.4, 1.2, 2.6);
  W.prop([{ g: gSphere(6.2, 16, 10, 0, Math.PI * 2, 0, 1.2), t: [-30, 3.4, 0], c: [.7, .78, .85] }]);
  // ---- 東側：雷達站（藍隊後方） ----
  for (const [cx, cz, w, d] of [[30, -6.5, 12, .5], [30, 6.5, 12, .5], [36, 0, .5, 12.5]]) wall('hullD', cx, cz, w, d, 3.4);
  wall('hullD', 24, -4.2, .5, 4.2, 3.4); wall('hullD', 24, 4.2, .5, 4.2, 3.4);
  wall('cTeal', 31, -3.5, 2.4, 1.2, 2.6); wall('cOrg', 31, 3.5, 2.4, 1.2, 1.6);
  wall('hull', 30, 0, .6, .6, 7); W.prop([{ g: gSphere(2.6, 14, 8, 0, Math.PI * 2, 0, 1.3), t: [30, 7.4, 0], r: [.5, 0, 0], c: [.82, .84, .9] }]);
  // ---- 太陽能板陣列（可躲、可繞） ----
  for (const sz of [-1, 1]) for (let k = 0; k < 4; k++) put('panel', -19 + k * 7.2, sz * 22, 5, .3, 2.4, 0, 1.5);
  for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) put('panel', sx * 15, -10 + k * 9.5, .3, 5, 2.4, 0, 1.5);
  // ---- 貨櫃堆（可疊高：太空跳躍可登上） ----
  const cm = ['cYel', 'cOrg', 'cTeal', 'cRed', 'cBlue', 'cGrn'];
  for (let k = 0; k < 15; k++) { const x = (rr() * 2 - 1) * 40, z = (rr() * 2 - 1) * 32, ax = rr() < .5, w = ax ? 6 : 2.4, d = ax ? 2.4 : 6, m = cm[(rr() * cm.length) | 0]; if (put(m, x, z, w, d, 2.5, 0)) { if (rr() < .55) { B(cm[(rr() * cm.length) | 0], x + (rr() - .5) * 1.5, z, ax ? 3.6 : 2.4, ax ? 2.4 : 3.6, 2.4, 2.5); } } }
  // ---- 階梯平台：岩塊 1.1 → 2.2 的高台（需二段跳或踩岩階） ----
  for (const sx of [-1, 1]) { const px = sx * 11, pz = -27; if (put('moonrock', px, pz, 9, 7, 2.2, 0, 1)) { B('moonrock', px - sx * 5.2, pz + 1.5, 2.6, 2.6, 1.1); rect(px - sx * 5.2, pz + 1.5, 2.6, 2.6); } }
  // ---- 天線塔 / 探測車 ----
  for (const [x, z] of [[-6, 27], [6, -27]]) { for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put('steel', x + dx * 1.2, z + dz * 1.2, .25, .25, 6, 0, .3); B('hullD', x, z, 3.2, 3.2, .25, 4.2, { collide: false }); }
  for (const [x, z, ax] of [[-14, 12, 1], [16, -17, 0], [24, 24, 1], [-26, -22, 0]]) put('hull', x, z, ax ? 4 : 2.2, ax ? 2.2 : 4, 1.5, 0, 1);
  // ---- 隕石坑：圈狀低岩 ----
  for (const [cx, cz, R] of [[-16, -16, 5], [18, 14, 6], [0, 26, 4]]) for (let k = 0; k < 9; k++) { const a = k * Math.PI * 2 / 9; put('moonrock', cx + Math.cos(a) * R, cz + Math.sin(a) * R, 1.8, 1.8, .7 + rr() * .6, 0, .2); }
  // ---- 隨機岩石：補足到原熱血高校的 1.25 倍以上障礙物 ----
  let guard = 0; while (W.boxes.filter(b => !b.nc).length < 318 && guard++ < 6000) {
    const w = 1.0 + rr() * 2.4, d = 1.0 + rr() * 2.4, h = 1.2 + rr() * 2.8, x = (rr() * 2 - 1) * (BX - 3), z = (rr() * 2 - 1) * (BZ - 3);
    put(rr() < .5 ? 'moonrock' : 'regolith', x, z, w, d, h, 0, .8);
  }
}
MAPS.space = {
  id: 'space', skyKind: 'space', space: true, gravK: .469, orbit: { c: [0, 0], r: 31, h: 13, ly: 1.4 }, preview: [0, 14], name: '無遠弗屆', sub: '外太空 · 1.2 倍面積 · 低重力', desc: '身處外太空：紫灰色大氣層與土黃色巨大行星。墜毀的太空船、生活艙、雷達站與大量岩塊貨櫃散布其間。場地機制「延遲重力」：按下跳躍後延遲 1 秒才起跳，但跳得更高（×1.2）、更遠（×1.8）、滯空更久（×1.6）。',
  bounds: { x0: -47.6, x1: 47.6, z0: -37.8, z1: 37.8 }, flagPos: [[-42, 0], [42, 0]], zoneRed: [-46.5, -12, -37, 12], zoneBlue: [37, -12, 46.5, 12], faceRed: [-8, 0], faceBlue: [8, 0],
  interior: [999, 999, 1000, 1000], env: SPACE_ENV, night: false, noShadow: false,
  pickSpots: [[-24, -16], [24, 16], [-24, 16], [24, -16], [0, -22], [0, 22], [-8, 0], [8, 0], [-38, 22], [38, -22], [-38, -22], [38, 22], [-14, 26], [14, -26], [-30, 0], [30, 0], [0, 10], [0, -10], [-44, 30], [44, -30]],
  build(W) { buildSpace(W); }
};
