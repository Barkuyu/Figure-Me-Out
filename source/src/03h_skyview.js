/* ================= 地圖 8：89 樓觀景台（台北 101 風阻尼球；面積同熱血高校，障礙物 1.1 倍） ================= */
const SKY89_ENV = { sunCol: [1.0, .9, .74], sky: [.30, .26, .42], gnd: [.68, .62, .58], fog: [.07, .06, .12], fogR: [70, 260], interior: [-43.5, -35.5, 43.5, 35.5], intK: 1.0, intH: 14.0 };
function buildSky89(W) {
  const B = (...a) => W.box(...a), rr = rng(8901), HX = 43, HZ = 35, CH = 14.0, rects = [];
  const rect = (x, z, w, d) => rects.push([x - w / 2, z - d / 2, x + w / 2, z + d / 2]);
  const free = (x, z, w, d, mg) => { for (const q of rects) if (x + w / 2 + mg > q[0] && x - w / 2 - mg < q[2] && z + d / 2 + mg > q[1] && z - d / 2 - mg < q[3]) return false; return true; };
  const keep = [[-43, -11, -33, 11], [33, -11, 43, 11]]; const inKeep = (x, z, w, d) => keep.some(q => x + w / 2 > q[0] && x - w / 2 < q[2] && z + d / 2 > q[1] && z - d / 2 < q[3]) || Math.hypot(x, z) < 15;
  const put = (mat, x, z, w, d, h, y0, mg) => { if (inKeep(x, z, w, d) || !free(x, z, w, d, mg === undefined ? 1.5 : mg)) return false; B(mat, x, z, w, d, h, y0 || 0); rect(x, z, w, d); return true; };
  const solid = (mat, x, z, w, d, h, y0) => { B(mat, x, z, w, d, h, y0 || 0); rect(x, z, w, d); };
  // ---- 地板（漩渦紋深灰地毯）、天花板與暖光環 ----
  W.quadTop('swirl', -70, -55, 70, 55, 0);
  B('ceil', 0, 0, 2 * HX, 2 * HZ, .4, CH, { collide: false });
  const ring = (R, N, mat, w, h, y0, col, see) => { for (let k = 0; k < N; k++) { const a = k / N * Math.PI * 2, b = (k + 1) / N * Math.PI * 2, x0 = Math.cos(a) * R, z0 = Math.sin(a) * R, x1 = Math.cos(b) * R, z1 = Math.sin(b) * R; B(mat, (x0 + x1) / 2, (z0 + z1) / 2, Math.abs(x1 - x0) + w, Math.abs(z1 - z0) + w, h, y0, col ? { collide: false } : (see === false ? { see: false } : undefined)); } };
  ring(10.6, 48, 'warmLight', .7, .16, CH - .16, true); ring(11.6, 48, 'ceil', 1.1, .9, CH - .9, true); ring(19, 40, 'warmLight', .5, .12, CH - .12, true); // 球體正上方的環形燈槽 + 外圈暖光環
  for (let k = 0; k < 70; k++) B('warmLight', (rr() * 2 - 1) * 40, (rr() * 2 - 1) * 32, .12, .12, .05, CH - .05, { collide: false }); // 星空般的天花板小燈
  for (let x = -36; x <= 36; x += 12) for (let z = -28; z <= 28; z += 14) if (Math.hypot(x, z) > 20) B('light', x, z, 1.1, 1.1, .05, CH - .05, { collide: false });
  // ---- 外牆：整面落地玻璃帷幕（可透視夜景、不可穿越）＋四角階梯缺角（呼應 101 樓層平面） ----
  for (const [cx, cz, w, d] of [[0, -HZ - .25, 2 * HX + .5, .5], [0, HZ + .25, 2 * HX + .5, .5], [-HX - .25, 0, .5, 2 * HZ], [HX + .25, 0, .5, 2 * HZ]]) { B('glassT', cx, cz, w, d, CH, 0, { see: false, colH: 9 }); B('steel', cx, cz, w + .1, d + .1, .12, 1.1, { collide: false }); }
  for (let x = -40; x <= 40; x += 8) for (const sz of [-1, 1]) B('steel', x, sz * (HZ + .2), .25, .35, CH, 0, { collide: false });
  for (let z = -32; z <= 32; z += 8) for (const sx of [-1, 1]) B('steel', sx * (HX + .2), z, .35, .25, CH, 0, { collide: false });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { solid('arenaW', sx * 40.5, sz * 32.5, 5, 5, CH); solid('arenaW', sx * 37.2, sz * 34.2, 3.4, 1.8, CH); solid('arenaW', sx * 42.2, sz * 28.8, 1.8, 3.4, CH); B('warmLight', sx * 40.5, sz * 32.5, 5.1, 5.1, .08, 1.0, { collide: false }); }
  // ---- 中央：懸吊式風阻尼球（球體完全懸空，四條鋼索自天花板垂下承載，下方液壓阻尼器）----
  const BR = 3.7, BY = 5.9, BB0 = BY - BR, items = []; // 球心 5.9 m、半徑 3.7 m ⇒ 球底離地 2.2 m，完全懸空
  { // 階層式圓盤堆疊（上下皆內縮成球形；每片略為外突，形成照片中的層層陰影線）
    const N = 26, H = (BR * 2 - .5) / N, y0 = BB0 + .25, rAt = y => Math.sqrt(Math.max(.25, BR * BR - (y - BY) * (y - BY)));
    for (let k = 0; k < N; k++) {
      const yb = y0 + k * H, yt = yb + H;
      const rb = rAt(yb), rt = rAt(yt), c = .70 + (k % 2) * .06;
      items.push({ g: gCyl(Math.max(rt, rb) + .06, Math.max(rt, rb) + .06, H * .34, 30, 1), t: [0, yb + H * .17, 0], c: [1, c - .06, .16] }); // 外突裙邊
      items.push({ g: gCyl(rt, rb, H, 30, 1), t: [0, (yb + yt) / 2, 0], c: [1, c, .2] });
    }
    items.push({ g: gCyl(rAt(y0) * .99, rAt(y0) * .86, .55, 30, 1), t: [0, BB0 + .02, 0], c: [.86, .62, .16] }); // 球底收邊
    items.push({ g: gCyl(.9, .9, .35, 24, 1), t: [0, BY + BR - .18, 0], c: [1, .82, .26] }); // 球頂圓盤
  }
  W.prop(items);
  const tube = (A, Z, r, col, seg) => { // 由 A 點連到 Z 點的圓柱
    const dx = Z[0] - A[0], dy = Z[1] - A[1], dz = Z[2] - A[2], L = Math.hypot(dx, dy, dz) || .01;
    return { g: gCyl(r, r, L, seg || 8, 1), t: [(A[0] + Z[0]) / 2, (A[1] + Z[1]) / 2, (A[2] + Z[2]) / 2], r: [Math.acos(clamp(dy / L, -1, 1)), Math.atan2(dx, dz), 0], c: col };
  };
  const cab = [], CT = CH - .25, AR = 5.0, TY = BY + 2.8, TR = Math.sqrt(Math.max(.3, BR * BR - 2.8 * 2.8));
  for (let k = 0; k < 4; k++) { // 四條主吊索：自天花板斜垂而下，咬在球體上半部
    const a = k / 4 * Math.PI * 2 + Math.PI / 4, cs = Math.cos(a), sn = Math.sin(a);
    cab.push(tube([cs * AR, CT, sn * AR], [cs * (TR - .2), TY, sn * (TR - .2)], .24, [.80, .70, .33], 9));
    cab.push({ g: gCyl(.42, .42, .5, 12, 1), t: [cs * AR, CT + .2, sn * AR], c: [.55, .55, .6] }); // 天花板吊點
    cab.push({ g: gCyl(.46, .52, .7, 12, 1), t: [cs * (TR - .25), TY - .1, sn * (TR - .25)], r: [.5, Math.atan2(cs, sn), 0], c: [.78, .8, .85] }); // 球面鎖頭
  }
  for (let k = 0; k < 8; k++) { // 八支液壓阻尼器：自地面錨座斜撐到球體底盤
    const a = k / 8 * Math.PI * 2 + Math.PI / 8, cs = Math.cos(a), sn = Math.sin(a);
    cab.push(tube([cs * 6.1, .35, sn * 6.1], [cs * 2.5, BB0 + .35, sn * 2.5], .26, [.80, .83, .88], 8));
    cab.push(tube([cs * 6.1, .35, sn * 6.1], [cs * 4.5, BB0 * .6, sn * 4.5], .32, [.62, .65, .70], 8)); // 外筒
    cab.push({ g: gBox(1.3, .3, 1.3), t: [cs * 6.4, .15, sn * 6.4], r: [0, -a, 0], c: [.34, .34, .38] }); // 地面錨座
  }
  W.prop(cab);
  // 球體本身：懸空的視線遮蔽（離地 2.7 m，因此不影響地面導航）
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + Math.PI / 8; W.col(Math.cos(a) * 2.9, Math.sin(a) * 2.9, 3.6, 3.6, BR * 2 - .6, BB0 + .3); }
  W.col(0, 0, 6.4, 6.4, BR * 2 - .6, BB0 + .3);
  rects.push([-11, -11, 11, 11]);
  // 玻璃欄杆（看得見、走不過）＋ 外圍空氣牆（整段封頂，連跳躍也無法進入球體周圍）
  ring(9.2, 40, 'glassT', .5, 1.15, 0, false, false); ring(9.2, 40, 'steel', .6, .09, 1.15, true);
  for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; B('steel', Math.cos(a) * 9.2, Math.sin(a) * 9.2, .14, .14, 1.22, 0, { collide: false }); } // 欄杆立柱
  { // 空氣牆：沿欄杆整圈封到天花板（連跳躍也進不去），內部再以隱形條塊填滿，讓電腦玩家不會把球體區當成可走區域
    const air = (x0, z0, x1, z1) => W.boxes.push({ x0, x1, z0, z1, y0: 0, y1: CH, see: false, aw: true });
    const AW = 9.2;
    for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2, b = (k + 1) / 48 * Math.PI * 2, x0 = Math.cos(a) * AW, z0 = Math.sin(a) * AW, x1 = Math.cos(b) * AW, z1 = Math.sin(b) * AW; air(Math.min(x0, x1) - .3, Math.min(z0, z1) - .3, Math.max(x0, x1) + .3, Math.max(z0, z1) + .3); }
    for (let z = -AW; z < AW - .01; z += 1.5) { const z1 = Math.min(z + 1.5, AW), hw = Math.sqrt(Math.max(0, AW * AW - Math.max(Math.abs(z), Math.abs(z1)) ** 2)); if (hw > .3) air(-hw, z, hw, z1); }
  }
  W.quadTop('ballGold', -.1, -.1, .1, .1, -3); // 保留材質桶
  // ---- 告示牌（參考樓層導覽） ----
  const board = (txt, bg) => W.text(txt, { w: 512, h: 96, bg, fg: '#fff', border: '#d9c28a', font: '800 56px' });
  W.wdecal(board('89F 觀景台 Sky View', '#2a2630'), -14, -HZ + .3, 14, -HZ + .3, 5.2, 6.8, 'neon'); W.wdecal(board('風阻尼球 Tuned Mass Damper', '#2a2630'), 14, HZ - .3, -14, HZ - .3, 5.2, 6.8, 'neon');
  W.wdecal(board('無限天際 Infinite Corner', '#1d3a52'), HX - .3, -10, HX - .3, 10, 5.2, 6.8, 'neon'); W.wdecal(board('kafeD 咖啡', '#5a3a1e'), -HX + .3, 10, -HX + .3, -10, 5.2, 6.8, 'neon');
  // ---- 兩側服務核心（電梯／服務台），中軸對稱 ----
  for (const sx of [-1, 1]) { solid('hull', sx * 25, -26, 8, 5, 3.6); solid('hull', sx * 25, 26, 8, 5, 3.6); solid('wood', sx * 24, -17, 5, 1.2, 1.1); solid('wood', sx * 24, 17, 5, 1.2, 1.1); }
  // ---- 觀景台設施填充：服務櫃台、展示柱、盆栽、長椅、立牌；總數約 276，阻擋型約 141 以上 ----
  const cnt = () => W.boxes.filter(b => !b.nc && !b.aw).length, blk = () => W.boxes.filter(b => !b.nc && !b.aw && b.y1 - b.y0 >= 1.2).length; let guard = 0;
  while ((cnt() < 276 || blk() < 141) && guard++ < 9000) {
    const x = (rr() * 2 - 1) * (HX - 3), z = (rr() * 2 - 1) * (HZ - 3), t = rr();
    if (t < .28) put('hull', x, z, 1.0 + rr() * .4, 1.0 + rr() * .4, 2.0 + rr() * 1.2, 0); // 玻璃展示柱
    else if (t < .5) { if (put('stone', x, z, 1.0, 1.0, 1.3, 0)) B('grass', x, z, .8, .8, .5, 1.3, { collide: false }); } // 盆栽
    else if (t < .7) put('wood', x, z, 2.4 + rr(), 1.0, 1.25, 0); // 服務台／櫃檯
    else if (t < .85) put('steel', x, z, .9, .3, 2.0 + rr() * .8, 0); // 資訊立牌
    else put('wood', x, z, 2.2, .8, .55, 0, .8); // 長椅（低）
  }
}
MAPS.sky89 = {
  id: 'sky89', indoor: true, skyKind: 'neon', noShadow: true, orbit: { c: [0, 0], r: 24, h: 20, ly: 4 }, preview: [0, 0], name: '89樓觀景台', sub: '台北 101 · 風阻尼球 · 標準面積 86×70 m', desc: '以台北 101 的 89 樓觀景台為藍本：中央是階層式金黃風阻尼球，四條粗吊索垂自天花板，周圍有玻璃欄杆與液壓阻尼器，環繞著深灰漩渦紋地毯、星空般的天花板與落地玻璃夜景。四角有階梯缺角呼應樓層平面。障礙物為熱血高校的 1.1 倍。',
  bounds: { x0: -43, x1: 43, z0: -35, z1: 35 }, flagPos: [[-38, 0], [38, 0]], zoneRed: [-42, -10, -34, 10], zoneBlue: [34, -10, 42, 10], faceRed: [-14, 0], faceBlue: [14, 0],
  interior: [-43.5, -35.5, 43.5, 35.5], env: SKY89_ENV, night: false,
  pickSpots: [[-20, -14], [20, 14], [-20, 14], [20, -14], [0, -22], [0, 22], [-14, 0], [14, 0], [-30, -24], [30, 24], [-30, 24], [30, -24], [-8, -16], [8, 16], [-8, 16], [8, -16], [-32, 0], [32, 0], [-18, 28], [18, -28]],
  build(W) { buildSky89(W); }
};
