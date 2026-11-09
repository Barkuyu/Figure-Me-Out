/* ================= 地圖 10：國家演藝廳（觀眾席階梯＋舞台；面積同熱血高校 86×70，障礙物數量同熱血高校 251） ================= */
const HALL_ENV = { sunCol: [1.0, .93, .80], sky: [.34, .24, .26], gnd: [.52, .34, .30], fog: [.26, .16, .17], fogR: [95, 330], interior: [-43.5, -35.5, 43.5, 35.5], intK: 1.22, intH: 13.5 };
function buildHall(W) {
  const B = (...a) => W.box(...a), rr = rng(10111), HX = 43, HZ = 35, CH = 13.5, rects = [];
  const rect = (x, z, w, d) => rects.push([x - w / 2, z - d / 2, x + w / 2, z + d / 2]);
  const free = (x, z, w, d, mg) => { for (const q of rects) if (x + w / 2 + mg > q[0] && x - w / 2 - mg < q[2] && z + d / 2 + mg > q[1] && z - d / 2 - mg < q[3]) return false; return true; };
  const keep = [[-43, -11, -35, 11], [35, -11, 43, 11]];
  const inKeep = (x, z, w, d) => keep.some(q => x + w / 2 > q[0] && x - w / 2 < q[2] && z + d / 2 > q[1] && z - d / 2 < q[3]);
  let lvl = () => 0; // 由地形決定物件底部高度（斜面觀眾席／舞台）
  const put = (mat, x, z, w, d, h, y0, mg) => { if (inKeep(x, z, w, d) || !free(x, z, w, d, mg === undefined ? 1.1 : mg)) return false; B(mat, x, z, w, d, h, y0 === undefined || y0 === 0 ? lvl(x, z) : y0); rect(x, z, w, d); return true; };
  const solid = (mat, x, z, w, d, h, y0) => { B(mat, x, z, w, d, h, y0 || 0); rect(x, z, w, d); };
  // ---- 地板（暗紅花紋地毯）、天花板、外牆 ----
  W.quadTop('hcarp', -70, -55, 70, 55, 0);
  B('ceil', 0, 0, 2 * HX, 2 * HZ, .5, CH, { collide: false });
  for (const [cx, cz, w, d] of [[0, -HZ - .3, 2 * HX + 1.2, .6], [0, HZ + .3, 2 * HX + 1.2, .6], [-HX - .3, 0, .6, 2 * HZ], [HX + .3, 0, .6, 2 * HZ]]) B('wood', cx, cz, w, d, CH, 0, { colH: 12 });
  for (let x = -38; x <= 38; x += 7.6) for (const sz of [-1, 1]) { B('brass', x, sz * (HZ - .3), .5, .3, CH - 1.4, 1.2, { collide: false }); B('warmLight', x, sz * (HZ - .45), 1.1, .2, .5, 3.4, { collide: false }); } // 金色壁柱與壁燈
  for (let z = -30; z <= 30; z += 7.5) for (const sx of [-1, 1]) { B('brass', sx * (HX - .3), z, .3, .5, CH - 1.4, 1.2, { collide: false }); B('warmLight', sx * (HX - .45), z, .2, 1.1, .5, 3.4, { collide: false }); }
  // 天花板藻井與水晶吊燈
  for (let k = 0; k < 3; k++) { const r = 16 - k * 5; for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2, b = (i + 1) / 48 * Math.PI * 2, x0 = Math.cos(a) * r, z0 = Math.sin(a) * r + 6, x1 = Math.cos(b) * r, z1 = Math.sin(b) * r + 6; B(k % 2 ? 'brass' : 'warmLight', (x0 + x1) / 2, (z0 + z1) / 2, Math.abs(x1 - x0) + .8, Math.abs(z1 - z0) + .8, .3 + k * .2, CH - .3 - k * .2, { collide: false }); } }
  for (const [cx, cz] of [[0, 6], [-16, 16], [16, 16], [-16, -4], [16, -4]]) {
    W.prop([{ g: gCyl(.07, .07, 2.2, 6, 1), t: [cx, CH - 1.3, cz], c: [.8, .62, .26] }, { g: gCyl(.3, 1.5, 1.5, 14, 1), t: [cx, CH - 3.1, cz], c: [1, .95, .8] }, { g: gCyl(1.5, .5, .8, 14, 1), t: [cx, CH - 4.2, cz], c: [1, .93, .74] }]);
    B('warmLight', cx, cz, 2.6, 2.6, .16, CH - 3.9, { collide: false });
  }
  // ---- 舞台（北側，抬高 1.2 m；以極緩的台面斜坡建成，讓電腦玩家也能上台）----
  const SZ1 = -17, SY = 1.2;
  W.ramp({ ax: 'z', a: SZ1, b: -34.5, ya: SY, yb: SY + .06, x0: -25, x1: 25, mat: 'plank', wallH: 0 }); // 台面
  for (const sx of [-1, 1]) W.ramp({ ax: 'z', a: -11.6, b: SZ1 + .2, ya: 0, yb: SY, x0: sx * 20 - 3.2, x1: sx * 20 + 3.2, mat: 'plank', wallH: 0 }); // 上下台的斜坡
  B('ebony', 0, SZ1 + .35, 50, .5, .5, SY - .15, { collide: false }); // 台唇
  // 鏡框式台口（兩側柱＋頂樑）與紅絨大幕
  for (const sx of [-1, 1]) { solid('brass', sx * 26.6, SZ1 - .6, 3.2, 2.6, CH - 1.0); B('velvet', sx * 23.4, SZ1 - 1.2, 3.6, 1.2, 9.0, SY, { collide: false }); }
  B('velvet', 0, SZ1 - 1.4, 44, 1.0, 3.2, CH - 4.0, { collide: false }); // 上方檐幕
  for (let k = -5; k <= 5; k++) { if (Math.abs(k) < 3) continue; B('velvet', k * 4.4, SZ1 - 1.1, 2.0, .7, 8.4, SY, { collide: false }); } // 大幕兩側的幕褶（中間拉開）
  // 舞台後方景片、側幕與樂器
  solid('ebony', 0, -33.9, 40, .8, 8.0, SY);
  for (const sx of [-1, 1]) for (const z of [-30, -26, -22]) solid('velvet', sx * 23.2, z, 1.0, 3.4, 7.0, SY);
  solid('ebony', -8, -27, 4.8, 3.0, 1.0, SY); // 平台鋼琴
  W.prop([{ g: gBox(4.5, .12, 2.6), t: [-8, SY + 1.8, -27], r: [0, 0, .25], c: [.09, .09, .1] }]);
  for (let k = 0; k < 6; k++) { const x = 2 + k * 3.2, z = -24.5 + (k % 2) * 1.6; B('ebony', x, z, .5, .5, .9, SY, { see: false }); B('steel', x, z - 1.0, .5, .12, 1.15, SY, { collide: false }); }
  rects.push([-26, -35, 26, -16]);
  // ---- 樂池圍欄（舞台前） ----
  for (let k = -3; k <= 3; k++) B('brass', k * 3.4, -14.4, 2.8, .25, 1.0, 0, { see: false });
  for (let k = 0; k < 4; k++) { const x = -6 + k * 4; solid('ebony', x, -12.6, .5, .5, .9); }
  // ---- 觀眾席：整片緩升的斜面（0 → 1.5 m，電腦玩家可正常走動）＋ 三區座椅排與兩條走道 ----
  const RZ0 = -9, RZ1 = 33, RH = 1.5, rake = z => RH * clamp((z - RZ0) / (RZ1 - RZ0), 0, 1);
  W.ramp({ ax: 'z', a: RZ0, b: RZ1, ya: 0, yb: RH, x0: -40, x1: 40, mat: 'hcarp', wallH: 0 });
  for (let t = 0; t < 8; t++) {
    const z = -5 + t * 4.8, y = rake(z);
    for (const [cx, w] of [[-26, 20], [0, 22], [26, 20]]) { B('velvet', cx, z, w, 1.5, 1.05, y, { see: false }); B('ebony', cx, z + .65, w, .3, .55, y, { collide: false }); rect(cx, z, w, 2.6); }
  }
  // ---- 後方大廳：售票口、吧台、立牌 ----
  solid('marble', 0, 33, 14, 1.6, 1.15);
  for (const sx of [-1, 1]) solid('marble', sx * 12, 30, 1.6, 6, 1.15);
  // ---- 告示牌 ----
  const board = (txt, bg) => W.text(txt, { w: 512, h: 96, bg, fg: '#f3e2b4', border: '#c9a24a', font: '800 50px' });
  W.wdecal(board('國家演藝廳 National Theater', '#3a0d14'), -14, HZ - .34, 14, HZ - .34, 6.0, 7.4, 'neon');
  W.wdecal(board('一樓觀眾席 Stalls', '#3a0d14'), -HX + .34, 14, -HX + .34, -2, 5.6, 6.8, 'neon');
  W.wdecal(board('包廂 Box Seats', '#3a0d14'), HX - .34, -2, HX - .34, 14, 5.6, 6.8, 'neon');
  // ---- 填充到 251 個障礙物（與熱血高校相同） ----
  lvl = (x, z) => z > RZ0 ? rake(z) : (z < SZ1 && Math.abs(x) < 24 ? SY : 0);
  const cnt = () => W.boxes.filter(b => !b.nc && !b.aw).length, blk = () => W.boxes.filter(b => !b.nc && !b.aw && b.y1 - b.y0 >= 1.2).length; let guard = 0;
  while ((cnt() < 251 || blk() < 120) && guard++ < 40000) {
    const x = (rr() * 2 - 1) * (HX - 2.5), z = (rr() * 2 - 1) * (HZ - 2.5), t = rr(), need = blk() < 120;
    if (need) { const m = ['brass', 'velvet', 'ebony', 'marble'][(guard * 3 + Math.abs(z * 5 | 0)) % 4]; // 金柱／絨布屏風／音響塔／石座
      if (!put(m, x, z, .7 + rr() * .6, .7 + rr() * .6, 1.5 + rr() * 1.6, 0)) put('brass', x, z, .5, .5, 1.3, 0, .9); continue; }
    if (t < .3) put('ebony', x, z, 1.1, 1.1, 1.4, 0); // 音響塔
    else if (t < .5) { if (put('marble', x, z, 1.0, 1.0, 1.1, 0)) B('grass', x, z, .8, .8, .6, lvl(x, z) + 1.1, { collide: false }); } // 盆栽
    else if (t < .7) put('velvet', x, z, 2.2, 1.2, 1.0, 0, 1.1); // 候位長椅
    else if (t < .85) put('brass', x, z, .6, .6, 1.1, 0, 1.0); // 繩欄柱
    else put('marble', x, z, 1.6, 1.0, .9, 0, 1.0); // 吧檯小桌
  }
}
MAPS.hall = {
  id: 'hall', indoor: true, noShadow: true, orbit: { c: [0, 2], r: 28, h: 20, ly: 3 }, preview: [0, 6], name: '國家演藝廳', sub: '觀眾席與舞台 · 標準面積 86×70 m',
  desc: '金紅色調的大型劇院：北側抬高 1.2 公尺的鏡框式舞台、紅絨大幕與平台鋼琴；中央八層階梯觀眾席層層升高，兩側是 3.2 公尺高的包廂（走斜坡上去），天花板掛著水晶吊燈。',
  bounds: { x0: -43, x1: 43, z0: -35, z1: 35 }, flagPos: [[-38, 0], [38, 0]], zoneRed: [-42, -10, -36, 10], zoneBlue: [36, -10, 42, 10], faceRed: [-12, 0], faceBlue: [12, 0],
  interior: [-43.5, -35.5, 43.5, 35.5], env: HALL_ENV, night: false,
  pickSpots: [[0, -26], [-8, -22], [8, -22], [0, -13], [-12, -6], [12, -6], [0, 2], [-24, 6], [24, 6], [0, 12], [-12, 18], [12, 18], [0, 26], [-30, 30], [30, 30], [-38, 8], [38, 8], [-20, -26], [20, -26], [0, 32]],
  build(W) { buildHall(W); }
};
