/* ================= 地圖 9：音樂教室（合奏廳＋琴房走廊；面積同熱血高校 86×70，障礙物數量同熱血高校 251） ================= */
const MUSIC_ENV = { sunCol: [.95, .90, .78], sky: [.62, .68, .76], gnd: [.55, .48, .38], fog: [.70, .70, .66], fogR: [95, 330], interior: [-43.5, -35.5, 43.5, 35.5], intK: .92, intH: 7.2 };
function buildMusic(W) {
  const B = (...a) => W.box(...a), rr = rng(9031), HX = 43, HZ = 35, CH = 7.2, rects = [];
  const rect = (x, z, w, d) => rects.push([x - w / 2, z - d / 2, x + w / 2, z + d / 2]);
  const free = (x, z, w, d, mg) => { for (const q of rects) if (x + w / 2 + mg > q[0] && x - w / 2 - mg < q[2] && z + d / 2 + mg > q[1] && z - d / 2 - mg < q[3]) return false; return true; };
  const keep = [[-43, -11, -34, 11], [34, -11, 43, 11]];
  const inKeep = (x, z, w, d) => keep.some(q => x + w / 2 > q[0] && x - w / 2 < q[2] && z + d / 2 > q[1] && z - d / 2 < q[3]);
  const put = (mat, x, z, w, d, h, y0, mg) => { if (inKeep(x, z, w, d) || !free(x, z, w, d, mg === undefined ? 1.4 : mg)) return false; B(mat, x, z, w, d, h, y0 || 0); rect(x, z, w, d); return true; };
  const solid = (mat, x, z, w, d, h, y0) => { B(mat, x, z, w, d, h, y0 || 0); rect(x, z, w, d); };
  // ---- 地板、天花板、外牆 ----
  W.quadTop('parquet', -70, -55, 70, 55, 0);
  B('ceil', 0, 0, 2 * HX, 2 * HZ, .4, CH, { collide: false });
  for (let x = -36; x <= 36; x += 9) for (let z = -28; z <= 28; z += 11) B('light', x, z, 2.4, .8, .06, CH - .07, { collide: false });
  for (const [cx, cz, w, d] of [[0, -HZ - .3, 2 * HX + 1.2, .6], [0, HZ + .3, 2 * HX + 1.2, .6], [-HX - .3, 0, .6, 2 * HZ], [HX + .3, 0, .6, 2 * HZ]]) B('wall', cx, cz, w, d, CH, 0, { colH: 9 });
  // 牆面吸音板（整圈，不參與碰撞）
  for (let x = -39; x <= 39; x += 6) for (const sz of [-1, 1]) B('acous', x, sz * (HZ - .35), 5.4, .25, 3.2, 2.0, { collide: false });
  for (let z = -31; z <= 31; z += 6) for (const sx of [-1, 1]) B('acous', sx * (HX - .35), z, .25, 5.4, 3.2, 2.0, { collide: false });
  // ---- 北側：合奏舞台（抬高 0.45 m，可直接踏上）＋ 五線譜黑板 ----
  solid('plank', 0, -28, 34, 11, .45);
  for (const sx of [-1, 1]) solid('plank', sx * 18.6, -28, 3.2, 11, .3); // 兩側踏階
  B('staff', 0, -HZ + .45, 24, .3, 3.4, 1.6, { collide: false }); // 五線譜黑板
  for (const sx of [-1, 1]) B('wood', sx * 13.6, -HZ + .5, 3.0, .4, 2.4, 0, { collide: false });
  solid('ebony', 0, -26.4, 1.0, 1.0, .25, .45); // 指揮台
  B('brass', 0, -26.4, .08, .08, 1.1, .7, { collide: false });
  // 平台鋼琴（琴身＋翻起的琴蓋＋三支琴腳）
  solid('ebony', -9.5, -24.5, 4.6, 2.8, 1.05, .45);
  W.prop([{ g: gBox(4.3, .12, 2.5), t: [-9.5, 2.1, -24.5], r: [0, 0, .26], c: [.09, .09, .1] },
  { g: gBox(4.4, .1, .6), t: [-9.5, 1.56, -25.85], c: [.95, .95, .92] },
  { g: gCyl(.1, .1, 1.5, 8, 1), t: [-11.4, 1.2, -23.3], c: [.09, .09, .1] }]);
  // 定音鼓、爵士鼓、豎琴
  for (let k = 0; k < 3; k++) { const x = 9 + k * 3.4, z = -25.4 + (k % 2) * 1.2; solid('brass', x, z, 2.0, 2.0, 1.0, .45); W.prop([{ g: gCyl(1.0, .78, 1.0, 16, 1), t: [x, .95, z], c: [.80, .62, .26] }, { g: gCyl(1.05, 1.05, .12, 16, 1), t: [x, 1.51, z], c: [.93, .90, .80] }]); }
  solid('wood', 16.6, -30, 1.6, 2.4, 1.9, .45); // 豎琴
  W.prop([{ g: gBox(.14, 3.0, .14), t: [16.6, 2.6, -30.9], c: [.72, .56, .24] }, { g: gBox(.14, .14, 2.4), t: [16.6, 4.0, -29.9], r: [.5, 0, 0], c: [.72, .56, .24] }]);
  // 舞台上的譜架與座椅（三層弧形排列）
  for (let rw = 0; rw < 3; rw++) for (let k = -5; k <= 5; k++) {
    const a = k * .14, x = Math.sin(a) * (10 + rw * 3.2), z = -22.5 - Math.cos(a) * (6.5 - rw * 1.4);
    if (Math.abs(x) > 15) continue;
    B('ebony', x, z, .5, .5, .9, .45, { see: false }); // 椅子
    B('steel', x, z - 1.0, .5, .12, 1.15, .45, { collide: false });
  }
  rects.push([-18, -35, 18, -21.5]);
  // ---- 東側：六間隔音琴房（玻璃門可透視，門口錯開） ----
  for (let i = 0; i < 3; i++) for (const sz of [-1, 1]) {
    const x0 = 22 + i * 7, cz = sz * 19.5;
    solid('whitepaint', x0, cz, .5, 13, CH); solid('whitepaint', x0 + 7, cz, .5, 13, CH);
    solid('whitepaint', x0 + 3.5, cz - sz * 6.5, 7, .5, CH);
    B('glassT', x0 + 3.5, cz + sz * 6.5, 4.4, .4, CH, 0, { see: false }); rect(x0 + 3.5, cz + sz * 6.5, 4.4, .4);
    solid('ebony', x0 + 3.5, cz - sz * 4.6, 3.4, 1.2, 1.25); // 直立鋼琴
    B('cream', x0 + 3.5, cz - sz * 3.8, 3.2, .18, .12, 1.25, { collide: false });
    solid('wood', x0 + 3.5, cz - sz * 2.6, .9, .7, .55); // 琴椅
    B('acous', x0 + .35, cz, .22, 11, 3.0, 1.8, { collide: false });
  }
  // 東側縱向走廊盡頭的櫃台
  solid('wood', 39.5, 27, 5.0, 1.4, 1.1);
  // ---- 西側：樂器櫃牆 ＋ 器材室 ----
  for (let z = 13; z <= 28; z += 4.4) solid('wood', -40.4, z, 4.4, 4.0, 2.4);
  for (let z = -30; z <= -17; z += 4.4) solid('wood', -40.4, z, 4.4, 4.0, 2.4);
  solid('whitepaint', -30, 30, 22, .5, CH); solid('whitepaint', -19, 23.5, .5, 13.5, CH);
  for (const [x, z] of [[-36, 26], [-30, 26], [-24, 26], [-36, 32], [-24, 32]]) solid('steel', x, z, 3.2, 2.2, 2.2); // 器材室層架
  // ---- 中央：合奏席（階梯式低台）與座椅排 ----
  for (let t = 0; t < 3; t++) solid('plank', 0, -2 + t * 5.2, 30 - t * 4, 4.4, .35 + t * .35);
  for (let t = 0; t < 3; t++) for (let k = -6; k <= 6; k++) { const x = k * 2.2, y0 = .35 + t * .35; if (Math.abs(x) > 13 - t * 1.8) continue; B('ebony', x, -2 + t * 5.2 + 1.2, .5, .5, .9, y0, { see: false }); }
  rects.push([-16, -5, 16, 12]);
  // 中央大譜架與音響
  for (const sx of [-1, 1]) { solid('ebony', sx * 19, 4, 1.4, 1.4, 2.6); B('panel', sx * 19, 4, 1.2, .12, 1.0, 1.4, { collide: false }); }
  // ---- 南側：聽眾區長椅與置物櫃 ----
  for (let k = -4; k <= 4; k++) solid('wood', k * 7.4, 31.5, 5.6, 1.0, .95);
  for (let k = -4; k <= 4; k++) solid('steel', k * 7.4, 26.5, 4.4, 1.2, 2.3);
  // ---- 告示牌 ----
  const board = (txt, bg) => W.text(txt, { w: 512, h: 96, bg, fg: '#fff', border: '#d9c28a', font: '800 52px' });
  W.wdecal(board('音樂教室 Music Room', '#2b3b2f'), -12, -HZ + .34, 12, -HZ + .34, 5.2, 6.4, 'neon');
  W.wdecal(board('琴房 Practice Rooms', '#2b2f3b'), HX - .34, -12, HX - .34, 12, 5.0, 6.2, 'neon');
  W.wdecal(board('樂器室 Instrument Store', '#3b2f2b'), -20, HZ - .34, -40, HZ - .34, 5.0, 6.2, 'neon');
  // ---- 填充到 251 個障礙物（與熱血高校相同） ----
  const cnt = () => W.boxes.filter(b => !b.nc && !b.aw).length, blk = () => W.boxes.filter(b => !b.nc && !b.aw && b.y1 - b.y0 >= 1.2).length; let guard = 0;
  while ((cnt() < 251 || blk() < 126) && guard++ < 9000) {
    const x = (rr() * 2 - 1) * (HX - 3), z = (rr() * 2 - 1) * (HZ - 3), t = rr(), need = blk() < 126;
    if (need) { const m = ['wood', 'ebony', 'steel', 'cream', 'brass'][(guard * 3 + Math.abs(x * 7 | 0)) % 5]; // 樂器櫃／大提琴箱／喇叭柱／鼓塔
      if (!put(m, x, z, .8 + rr() * .7, .7 + rr() * .5, 1.4 + rr() * 1.1, 0)) put('steel', x, z, .6, .6, 1.3 + rr() * .5, 0, 1.0); continue; }
    if (t < .3) put('ebony', x, z, 1.3, .8, 1.3, 0); // 大提琴盒
    else if (t < .5) put('steel', x, z, .5, .5, 1.2, 0, 1.0); // 譜架
    else if (t < .7) { if (put('stone', x, z, .9, .9, 1.3, 0)) B('grass', x, z, .7, .7, .5, 1.3, { collide: false }); } // 盆栽
    else if (t < .85) put('wood', x, z, 2.0, .8, .5, 0, .9); // 長椅
    else put('cream', x, z, 1.1, 1.1, .85, 0, .9); // 鼓箱
  }
}
MAPS.music = {
  id: 'music', indoor: true, noShadow: true, orbit: { c: [0, -2], r: 26, h: 16, ly: 2 }, preview: [0, -6], name: '音樂教室', sub: '合奏廳 · 標準面積 86×70 m',
  desc: '學校的大型音樂教室：北側是抬高的合奏舞台，有平台鋼琴、定音鼓、豎琴與五線譜黑板；東側一整排隔音琴房，西側是樂器櫃牆與器材室，中央三層合奏席可踏上，四周牆面鋪滿吸音板。',
  bounds: { x0: -43, x1: 43, z0: -35, z1: 35 }, flagPos: [[-38, 0], [38, 0]], zoneRed: [-42, -10, -35, 10], zoneBlue: [35, -10, 42, 10], faceRed: [-10, 0], faceBlue: [10, 0],
  interior: [-43.5, -35.5, 43.5, 35.5], env: MUSIC_ENV, night: false,
  pickSpots: [[0, -24], [-9.5, -20], [9.5, -20], [0, 2], [-14, 6], [14, 6], [0, 14], [-28, -6], [28, -6], [-28, 10], [25.5, -19.5], [25.5, 19.5], [32.5, -19.5], [32.5, 19.5], [-32, 26], [-6, 28], [12, 28], [-20, 16], [20, 28], [0, 32]],
  build(W) { buildMusic(W); }
};
