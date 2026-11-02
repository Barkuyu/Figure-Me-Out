/* ================= 地圖 4：無遠弗屆（外太空；面積為熱血高校 1.2 倍，障礙物 1.2 倍多；低重力＋延遲起跳） ================= */
const SPACE_ENV = { sunCol: [.84, .68, .52], sky: [.40, .33, .50], gnd: [.46, .38, .30], fog: [.42, .35, .50], fogR: [70, 260], interior: [999, 999, 1000, 1000], intK: .7, intH: 7 };
function buildSpace(W) {
  const B = (...a) => W.box(...a), rr = rng(5150), BX = 43, BZ = 35, rects = [];
  const rect = (x, z, w, d) => rects.push([x - w / 2, z - d / 2, x + w / 2, z + d / 2]);
  const free = (x, z, w, d, mg) => { for (const q of rects) if (x + w / 2 + mg > q[0] && x - w / 2 - mg < q[2] && z + d / 2 + mg > q[1] && z - d / 2 - mg < q[3]) return false; return true; };
  const keep = [[-43, -13, -34, 13], [34, -13, 43, 13]]; // 出生區：保持淨空
  const inKeep = (x, z, w, d) => keep.some(q => x + w / 2 > q[0] - 1 && x - w / 2 < q[2] + 1 && z + d / 2 > q[1] - 1 && z - d / 2 < q[3] + 1);
  const put = (mat, x, z, w, d, h, y0, mg) => { if (inKeep(x, z, w, d) || !free(x, z, w, d, mg === undefined ? 1.6 : mg)) return false; B(mat, x, z, w, d, h, y0 || 0); rect(x, z, w, d); return true; };
  const wall = (mat, x, z, w, d, h, y0) => { B(mat, x, z, w, d, h, y0 || 0); rect(x, z, w, d); };
  const mir = (fn) => { fn(1); fn(-1); }; // 左右對稱
  W.quadTop('regolith', -160, -130, 160, 130, 0);
  for (const [cx, cz, w, d] of [[0, -BZ - 1, 2 * BX + 6, 2], [0, BZ + 1, 2 * BX + 6, 2], [-BX - 1, 0, 2, 2 * BZ + 2], [BX + 1, 0, 2, 2 * BZ + 2]]) B('moonrock', cx, cz, w, d, 5, 0, { colH: 9 });
  for (let k = 0; k < 26; k++) { const a = rr() * Math.PI * 2, r = 58 + rr() * 38, w = 8 + rr() * 16, h = 8 + rr() * 22; B('moonrock', Math.cos(a) * r * 1.2, Math.sin(a) * r * .95, w, w * (.6 + rr() * .6), h, 0, { collide: false }); } // 遠方山脈（裝飾）
  // ---- 中央：墜毀的太空船（主戰場） ----
  wall('hull', -1, -3.2, 17, .5, 3.4); wall('hull', -4, 3.2, 8, .5, 3.4); wall('hull', 5.5, 3.2, 3.5, .5, 3.4); // 側艙壁：x∈[1.5,3.7] 為側門
  wall('hullD', -9.7, 0, .5, 6.9, 3.4); B('hullD', -1, 0, 12.5, 6.4, .35, 3.4, { collide: false }); rect(-1, 0, 12.5, 6.4);
  wall('hull', 9.4, -4.2, 1.4, 2.6, 2.4); wall('hull', 9.4, 4.2, 1.4, 2.6, 2.4); wall('cOrg', 2.5, 0, 1.5, 1.5, 1.5);
  W.prop([{ g: gSphere(1.4, 12, 8), t: [11.5, 1.2, 0], c: [.5, .52, .6] }]);
  // ---- 兩側基地：生活艙（紅）／雷達站（藍），左右對稱 ----
  mir(sg => { const m = sg > 0 ? 'hullD' : 'hull'; for (const [cx, cz, w, d] of [[sg * 26, -5.5, 9, .5], [sg * 26, 5.5, 9, .5], [sg * 30.5, 0, .5, 11.5]]) wall(m, cx, cz, w, d, 3.4); wall(m, sg * 21.5, -3.6, .5, 3.8, 3.4); wall(m, sg * 21.5, 3.6, .5, 3.8, 3.4); wall(sg > 0 ? 'cTeal' : 'cYel', sg * 26.5, -3, 2.2, 1.2, 1.8); wall(sg > 0 ? 'cOrg' : 'cYel', sg * 26.5, 3, 2.2, 1.2, 2.4); });
  W.prop([{ g: gSphere(5.2, 16, 10, 0, Math.PI * 2, 0, 1.2), t: [-26, 3.4, 0], c: [.7, .78, .85] }]);
  wall('hull', 26, 0, .6, .6, 7); W.prop([{ g: gSphere(2.4, 14, 8, 0, Math.PI * 2, 0, 1.3), t: [26, 7.4, 0], r: [.5, 0, 0], c: [.82, .84, .9] }]);
  // ---- 太陽能板：南北各一列 ----
  for (const sz of [-1, 1]) for (let k = 0; k < 4; k++) put('panel', -13.5 + k * 9, sz * 20, 5, .3, 2.4, 0, 1.5);
  // ---- 貨櫃堆：成對排列（可疊高，太空跳躍可登上） ----
  const cm = ['cYel', 'cOrg', 'cTeal', 'cRed', 'cBlue', 'cGrn'];
  [[14, 9], [14, -9], [-14, 9], [-14, -9], [30, 20], [-30, -20], [30, -20], [-30, 20]].forEach(([x, z], k) => { const ax = k % 2 === 0; if (put(cm[k % 6], x, z, ax ? 6 : 2.4, ax ? 2.4 : 6, 2.5, 0, 1.2)) B(cm[(k + 2) % 6], x + (ax ? 1 : 0), z + (ax ? 0 : 1), ax ? 3.6 : 2.4, ax ? 2.4 : 3.6, 2.4, 2.5); });
  // ---- 階梯平台 ----
  mir(sg => { const px = sg * 9, pz = -27; if (put('moonrock', px, pz, 8, 6, 2.2, 0, 1)) { B('moonrock', px - sg * 4.8, pz + 1.2, 2.4, 2.4, 1.1); rect(px - sg * 4.8, pz + 1.2, 2.4, 2.4); } });
  // ---- 天線塔 / 探測車 / 隕石坑 ----
  for (const [x, z] of [[-6, 27], [6, -27]]) { for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put('steel', x + dx * 1.2, z + dz * 1.2, .25, .25, 6, 0, .3); B('hullD', x, z, 3.2, 3.2, .25, 4.2, { collide: false }); }
  for (const [x, z, ax] of [[-12, 12, 1], [14, -16, 0], [22, 26, 1], [-22, -26, 0]]) put('hull', x, z, ax ? 4 : 2.2, ax ? 2.2 : 4, 1.5, 0, 1);
  for (const [cx, cz, R] of [[-14, -14, 4.5], [16, 14, 5]]) for (let k = 0; k < 8; k++) { const a = k * Math.PI * 2 / 8; put('moonrock', cx + Math.cos(a) * R, cz + Math.sin(a) * R, 1.6, 1.6, .7 + rr() * .3, 0, .3); }
  // ---- 散落岩塊：補足到熱血高校阻擋型障礙物（高度≥1.2 m）的 1.3 倍 ≈ 166 個 ----
  const blockers = () => W.boxes.filter(b => !b.nc && b.y1 - b.y0 >= 1.2).length; let guard = 0;
  while (blockers() < 166 && guard++ < 8000) { const w = 1.0 + rr() * 2.2, d = 1.0 + rr() * 2.2, h = 1.3 + rr() * 1.7; put(rr() < .5 ? 'moonrock' : 'regolith', (rr() * 2 - 1) * (BX - 3), (rr() * 2 - 1) * (BZ - 3), w, d, h, 0, 1.4); }
  guard = 0; for (let k = 0; k < 40 && guard < 3000; guard++) { if (put('moonrock', (rr() * 2 - 1) * (BX - 3), (rr() * 2 - 1) * (BZ - 3), .8 + rr() * .8, .8 + rr() * .8, .5 + rr() * .4, 0, 1.2)) k++; } // 低矮石塊（可探頭觀察）
}
MAPS.space = {
  id: 'space', skyKind: 'space', space: true, gravK: 1.2, orbit: { c: [0, 0], r: 31, h: 13, ly: 1.4 }, preview: [0, 14], name: '無遠弗屆', sub: '外太空 · 標準面積 86×70 m · 延遲跳躍', desc: '身處外太空：紫灰色大氣層與土黃色巨大行星。面積與熱血高校相同，中央是墜毀的太空船，兩側為生活艙與雷達站；障礙物約為熱血高校的 1.3 倍，動線以太空船為中心、左右對稱。場地機制「延遲跳躍」：按下跳躍後延遲 0.3 秒才起跳，但跳得更高（×1.2）、更遠（×2）。',
  bounds: { x0: -43, x1: 43, z0: -35, z1: 35 }, flagPos: [[-38.5, 0], [38.5, 0]], zoneRed: [-42, -12, -35, 12], zoneBlue: [35, -12, 42, 12], faceRed: [-8, 0], faceBlue: [8, 0],
  interior: [999, 999, 1000, 1000], env: SPACE_ENV, night: false, noShadow: false,
  pickSpots: [[-22, -14], [22, 14], [-22, 14], [22, -14], [0, -20], [0, 20], [-7, 0], [7, 0], [-34, 22], [34, -22], [-34, -22], [34, 22], [-12, 26], [12, -26], [-28, 0], [28, 0], [0, 10], [0, -10], [-38, 28], [38, -28]],
  build(W) { buildSpace(W); }
};
