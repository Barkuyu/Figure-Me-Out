/* ================= 地圖 11：甜點烘焙室（中央廚房＋展示區；面積同熱血高校 86×70，障礙物數量同熱血高校 251） ================= */
const BAKE_ENV = { sunCol: [1.0, .96, .88], sky: [.74, .80, .86], gnd: [.72, .70, .66], fog: [.80, .80, .78], fogR: [100, 340], interior: [-43.5, -35.5, 43.5, 35.5], intK: 1.0, intH: 6.6 };
function buildBakery(W) {
  const B = (...a) => W.box(...a), rr = rng(11213), HX = 43, HZ = 35, CH = 6.6, rects = [];
  const rect = (x, z, w, d) => rects.push([x - w / 2, z - d / 2, x + w / 2, z + d / 2]);
  const free = (x, z, w, d, mg) => { for (const q of rects) if (x + w / 2 + mg > q[0] && x - w / 2 - mg < q[2] && z + d / 2 + mg > q[1] && z - d / 2 - mg < q[3]) return false; return true; };
  const keep = [[-43, -11, -35, 11], [35, -11, 43, 11]];
  const inKeep = (x, z, w, d) => keep.some(q => x + w / 2 > q[0] && x - w / 2 < q[2] && z + d / 2 > q[1] && z - d / 2 < q[3]);
  const put = (mat, x, z, w, d, h, y0, mg) => { if (inKeep(x, z, w, d) || !free(x, z, w, d, mg === undefined ? 1.2 : mg)) return false; B(mat, x, z, w, d, h, y0 || 0); rect(x, z, w, d); return true; };
  const solid = (mat, x, z, w, d, h, y0) => { B(mat, x, z, w, d, h, y0 || 0); rect(x, z, w, d); };
  // 一座分層蛋糕（純裝飾，不參與碰撞）
  const cake = (x, z, y, R, tiers, col) => {
    const it = []; let r = R, yy = y;
    for (let k = 0; k < tiers; k++) { it.push({ g: gCyl(r, r, .42, 20, 1), t: [x, yy + .21, z], c: col }); it.push({ g: gCyl(r + .05, r + .05, .1, 20, 1), t: [x, yy + .46, z], c: [.99, .95, .86] }); yy += .52; r *= .74; }
    for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; it.push({ g: gCyl(.1, .1, .16, 8, 1), t: [x + Math.cos(a) * r * .8, yy + .06, z + Math.sin(a) * r * .8], c: [.92, .32, .36] }); }
    W.prop(it);
  };
  // ---- 地板（白色磁磚）、天花板、外牆 ----
  W.quadTop('tileW', -70, -55, 70, 55, 0);
  for (let k = -3; k <= 3; k++) B('straw', k * 11, 27.6, 9.4, 3.6, .02, .02, { collide: false }); // 外場區的粉色地坪
  B('ceil', 0, 0, 2 * HX, 2 * HZ, .4, CH, { collide: false });
  for (let x = -38; x <= 38; x += 7.6) for (let z = -30; z <= 30; z += 10) B('light', x, z, 3.2, .7, .06, CH - .07, { collide: false });
  for (const [cx, cz, w, d] of [[0, -HZ - .3, 2 * HX + 1.2, .6], [0, HZ + .3, 2 * HX + 1.2, .6], [-HX - .3, 0, .6, 2 * HZ], [HX + .3, 0, .6, 2 * HZ]]) { B('whitepaint', cx, cz, w, d, CH, 0, { colH: 9 }); B('tileW', cx, cz, w - .05, d - .05, 2.4, 0, { collide: false }); }
  // ---- 北側：烤箱牆、發酵櫃與抽油煙罩 ----
  for (let k = -4; k <= 4; k++) {
    const x = k * 8.4; solid('inox', x, -32.6, 7.2, 3.2, 2.6);
    for (const y of [.5, 1.35]) B('ebony', x, -30.9, 5.6, .25, .7, y, { collide: false }); // 爐門玻璃
    B('brass', x, -30.9, 5.6, .3, .12, 2.25, { collide: false });
    B('inox', x, -31.4, 7.6, 2.4, .5, 3.6, { collide: false }); // 抽油煙罩
  }
  // ---- 冷藏庫（西北角的獨立房間，門口朝南） ----
  solid('inox', -32, -22, 20, .6, CH); solid('inox', -42, -16, .6, 12, CH); solid('inox', -22.3, -16, .6, 12, CH);
  solid('inox', -36.5, -10.3, 11, .6, CH); B('glassT', -28.5, -10.3, 5, .5, CH, 0, { see: false }); rect(-28.5, -10.3, 5, .5); // 冷藏庫門口留在 x -26 ~ -22
  for (const z of [-19.5, -15.5]) for (const sx of [-37, -27]) solid('steel', sx, z, 7.0, 1.2, 2.3); // 冷藏層架
  // ---- 中央：四排不鏽鋼工作檯（中間留走道） ----
  for (let r0 = 0; r0 < 4; r0++) for (let k = 0; k < 3; k++) {
    const x = -22 + k * 22 + (r0 % 2) * 2, z = -4 + r0 * 9;
    solid('inox', x, z, 9.5, 2.2, .95);
    B('marble', x, z, 9.8, 2.5, .14, .95, { collide: false }); // 大理石檯面
    if ((r0 + k) % 2 === 0) cake(x + 2.6, z, 1.09, .8, 3, [.99, .93, .79]); else { cake(x - 2.6, z, 1.09, .7, 2, [.42, .26, .16]); }
    for (let i = 0; i < 3; i++) B('cream', x - 3.4 + i * 3.4, z + .6, .55, .55, .3, 1.09, { collide: false }); // 麵糰
  }
  // ---- 攪拌機排（西側） ----
  for (let k = 0; k < 4; k++) {
    const z = -4 + k * 9; solid('inox', -32, z, 2.6, 2.6, 1.5);
    W.prop([{ g: gCyl(1.0, .8, 1.1, 16, 1), t: [-32, 2.05, z], c: [.80, .83, .86] }, { g: gCyl(.18, .18, 1.1, 8, 1), t: [-32, 3.1, z], c: [.55, .57, .6] }, { g: gBox(1.0, .35, .5), t: [-32, 3.6, z], c: [.72, .75, .78] }]);
  }
  // ---- 南側：展示冷櫃與外場座位 ----
  for (let k = -3; k <= 3; k++) {
    const x = k * 11; solid('marble', x, 30.5, 9.4, 1.8, 1.05);
    B('glassT', x, 30.5, 9.6, 2.0, 1.0, 1.05, { see: false, collide: false });
    for (let i = 0; i < 3; i++) cake(x - 3 + i * 3, 30.5, 1.08, .55, 2, i === 1 ? [.90, .40, .48] : [.62, .86, .74]);
  }
  for (let k = -3; k <= 3; k++) { solid('wood', k * 11, 25, 2.2, 2.2, .78); for (const sx of [-1, 1]) solid('wood', k * 11 + sx * 2.2, 25, .9, .9, 1.0); }
  // ---- 東側：原料倉（麵粉袋堆）與洗滌區 ----
  for (let k = 0; k < 5; k++) { const z = -32 + k * 6; solid('cream', 37.5, z, 4.6, 4.0, 1.5); B('cream', 37.5, z, 4.0, 3.4, .9, 1.5, { collide: false }); }
  for (let k = 0; k < 3; k++) solid('inox', 26 + k * 0, -22 + k * 5, 6.0, 2.0, 1.0); // 洗滌槽
  // ---- 冷卻架（高大障礙，散布在中段） ----
  for (const [x, z] of [[-13, -18], [-3, -18], [7, -18], [17, -18], [-13, 20], [-3, 20], [7, 20], [17, 20], [27, 8], [27, 16]]) {
    solid('steel', x, z, 1.4, 3.6, 2.4);
    for (let i = 0; i < 4; i++) B('inox', x, z, 1.5, 3.4, .07, .5 + i * .6, { collide: false });
  }
  // ---- 中央大蛋糕展示台 ----
  solid('marble', 0, 8, 5.2, 5.2, 1.0);
  cake(0, 8, 1.0, 2.1, 4, [.99, .91, .76]);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; B('brass', Math.cos(a) * 4.6, 8 + Math.sin(a) * 4.6, .3, .3, 1.0, 0, { collide: false }); }
  // ---- 告示牌 ----
  const board = (txt, bg) => W.text(txt, { w: 512, h: 96, bg, fg: '#fff', border: '#e7c9a0', font: '800 50px' });
  W.wdecal(board('甜點烘焙室 Pâtisserie', '#7a4a26'), -13, -HZ + .34, 13, -HZ + .34, 4.4, 5.6, 'neon');
  W.wdecal(board('冷藏庫 Cold Room', '#3a4a52'), -34, -10.0, -41, -10.0, 4.0, 5.0, 'neon');
  W.wdecal(board('外場 Café', '#7a4a26'), 13, HZ - .34, -13, HZ - .34, 4.4, 5.6, 'neon');
  W.wdecal(board('原料倉 Dry Store', '#5a4a2a'), HX - .34, -14, HX - .34, 2, 4.0, 5.0, 'neon');
  // ---- 填充到 251 個障礙物（與熱血高校相同） ----
  const cnt = () => W.boxes.filter(b => !b.nc && !b.aw).length, blk = () => W.boxes.filter(b => !b.nc && !b.aw && b.y1 - b.y0 >= 1.2).length; let guard = 0;
  while ((cnt() < 251 || blk() < 126) && guard++ < 40000) {
    const x = (rr() * 2 - 1) * (HX - 2.5), z = (rr() * 2 - 1) * (HZ - 2.5), t = rr(), need = blk() < 126;
    if (need) { const m = ['steel', 'inox', 'cream', 'wood'][(guard * 3 + Math.abs(x * 3 | 0)) % 4]; // 推車架／層架／粉袋塔／木架
      if (!put(m, x, z, .8 + rr() * .6, .8 + rr() * .5, 1.3 + rr() * 1.2, 0)) put('inox', x, z, .7, .7, 1.3, 0, .9); continue; }
    if (t < .3) put('inox', x, z, 1.6, 1.0, .95, 0); // 不鏽鋼小檯
    else if (t < .5) { if (put('cream', x, z, 1.2, 1.2, 1.1, 0)) B(['choco', 'straw', 'mint'][guard % 3], x, z, 1.0, 1.0, .5, 1.1, { collide: false }); } // 麵粉袋堆與色彩托盤
    else if (t < .68) { if (put('marble', x, z, 1.3, 1.3, 1.0, 0)) cake(x, z, 1.0, .5, 2, rr() < .5 ? [.90, .40, .48] : [.34, .20, .12]); } // 蛋糕小台
    else if (t < .84) put(guard % 2 ? 'wood' : 'straw', x, z, 1.0, 1.0, .75, 0, .9); // 圓凳／木箱
    else put('inox', x, z, .8, .8, 1.3, 0, .9); // 攪拌桶
  }
}
MAPS.bakery = {
  id: 'bakery', indoor: true, noShadow: true, orbit: { c: [0, 4], r: 26, h: 16, ly: 2 }, preview: [0, 2], name: '甜點烘焙室', sub: '中央廚房 · 標準面積 86×70 m',
  desc: '明亮的大型烘焙廚房：北面一整排烤箱與抽油煙罩，西北角是獨立冷藏庫，中央四排不鏽鋼工作檯與大理石檯面擺滿蛋糕，南側展示冷櫃與外場座位，東側是麵粉倉與洗滌區。',
  bounds: { x0: -43, x1: 43, z0: -35, z1: 35 }, flagPos: [[-38, 0], [38, 0]], zoneRed: [-42, -10, -36, 10], zoneBlue: [36, -10, 42, 10], faceRed: [-10, 0], faceBlue: [10, 0],
  interior: [-43.5, -35.5, 43.5, 35.5], env: BAKE_ENV, night: false,
  pickSpots: [[0, 0], [-11, -9], [11, -9], [0, 14], [-22, 4], [22, 4], [0, -27], [-16, -27], [16, -27], [-32, -16], [31, -28], [31, 16], [-20, 28], [20, 28], [0, 22], [-33, 24], [33, 28], [-8, 8], [8, -18], [0, 32]],
  build(W) { buildBakery(W); }
};
