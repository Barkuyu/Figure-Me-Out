/* ================= 地圖 3：追逃商城（1F 106x80m = 熱血高校 1.4 倍；二樓為 1F 的 1/3） ================= */
const MALL_FH = 4.6;
function buildMall(W) {
  const B = (...a) => W.box(...a), FH = MALL_FH, CH = 9.2;
  // ---- 地板、外牆、天花板 ----
  W.quadTop('pave', -110, -90, 110, 90, 0); W.quadTop('tile', -53, -40, 53, 40, .01);
  for (const [cx, cz, w, d] of [[0, -40.5, 108, 1], [0, 40.5, 108, 1], [-53.5, 0, 1, 82], [53.5, 0, 1, 82]]) B('whitepaint', cx, cz, w, d, CH);
  if (!W.noRoof) { B('ceil', 0, 0, 108, 82, .4, CH, { collide: false }); for (let x = -48; x <= 48; x += 12) for (let z = -36; z <= 36; z += 12) B('light', x, z, 4.4, .9, .08, CH - .08, { collide: false }); }
  // 外牆霓虹條與踢腳
  B('cRed', 0, -39.95, 106, .12, .5, 0, { collide: false }); B('cRed', 0, 39.95, 106, .12, .5, 0, { collide: false }); B('cRed', -52.95, 0, .12, 80, .5, 0, { collide: false }); B('cRed', 52.95, 0, .12, 80, .5, 0, { collide: false });
  // 落地玻璃大門（南牆）
  for (let k = 0; k < 4; k++) B('glass', -9 + k * 6, 39.9, 5.6, .1, 5, .4, { collide: false });
  W.wdecal(W.text('追逃商城 CHASE MALL', { w: 1024, h: 128, bg: '#b3121b', fg: '#fff', border: '#ffd24a', font: '900 74px' }), 12, 39.78, -12, 39.78, 6.0, 7.9, 'decal');
  // ---- 二樓（樓中樓）：北側 1/3，z∈[-40,-13.4] ----
  B('tile', 0, -26.7, 106, 26.6, .4, FH - .4, { render: false }); B('ceil', 0, -26.7, 106, 26.6, .2, FH - .4, { collide: false }); B('tile', 0, -26.7, 106, 26.6, .2, FH - .2, { collide: false });
  const rail = (cx, cz, w, d) => { B('glassT', cx, cz, w, d, .95, FH, { see: false }); B('steel', cx, cz, w + .04, d + .04, .06, FH + .95, { collide: false }); };
  rail(-39.25, -13.5, 27.5, .12); rail(0, -13.5, 45, .12); rail(39.25, -13.5, 27.5, .12);
  B('steel', 0, -13.4, 106, .5, .5, FH - .9, { collide: false });
  // 電扶梯（兩座，左右對稱）
  const ES = [-24, 24];
  for (const ex of ES) {
    W.ramp({ ax: 'z', x0: ex - 1.2, x1: ex + 1.2, a: -3.9, b: -13.4, ya: 0, yb: FH, belt: 1.4, mat: 'esc', wallH: 1.0, wallMat: 'glassT', wallSee: false });
    for (const s of [-1.5, 1.5]) B('steel', ex + s, -8.6, .08, 9.6, .08, 1.95, { collide: false });
    W.wdecal(W.text('▲ 往二樓 2F', { w: 512, h: 96, bg: '#c4161c', fg: '#fff', font: '900 56px' }), ex - 1.6, -3.7, ex + 1.6, -3.7, 3.4, 4.0, 'neon');
    B('light', ex, -8.6, 2.2, 9, .06, FH + 3.6, { collide: false });
  }
  // ---- 一樓（樓中樓下方）商店：北牆 6 間 ----
  const shop = (o) => {
    const t = .3, y0 = o.y0 || 0, h = o.h || 4.2, m = o.mat || 'whitepaint', x0 = o.x0, x1 = o.x1, z0 = o.z0, z1 = o.z1, gc = o.gc, gw = o.gw || 4, door = o.door || 'S', sides = o.sides || 'NSWE';
    const hz = (z, wall) => { // 水平牆（沿 x）
      if (!sides.includes(wall)) return; if (door !== wall) { B(m, (x0 + x1) / 2, z, x1 - x0, t, h, y0); return; }
      const a = gc - gw / 2, b = gc + gw / 2; B(m, (x0 + a) / 2, z, a - x0, t, h, y0); B(m, (b + x1) / 2, z, x1 - b, t, h, y0); B(m, gc, z, gw, t, h - 2.7, y0 + 2.7);
    };
    const vt = (x, wall) => {
      if (!sides.includes(wall)) return; if (door !== wall) { B(m, x, (z0 + z1) / 2, t, z1 - z0, h, y0); return; }
      const a = gc - gw / 2, b = gc + gw / 2; B(m, x, (z0 + a) / 2, t, a - z0, h, y0); B(m, x, (b + z1) / 2, t, z1 - b, h, y0); B(m, x, gc, t, gw, h - 2.7, y0 + 2.7);
    };
    hz(z0, 'N'); hz(z1, 'S'); vt(x0, 'W'); vt(x1, 'E');
    if (o.sign) { const sg = W.text(o.sign, { w: 384, h: 96, bg: o.sc || '#1d4f9c', fg: '#fff', border: '#fff', font: '900 58px' }), sy = y0 + (h > 3.6 ? 3.0 : 2.1);
      if (door === 'S') W.wdecal(sg, gc - 2.4, z1 + .17, gc + 2.4, z1 + .17, sy, sy + 1.2, 'neon'); else if (door === 'N') W.wdecal(sg, gc + 2.4, z0 - .17, gc - 2.4, z0 - .17, sy, sy + 1.2, 'neon');
      else if (door === 'E') W.wdecal(sg, x1 + .17, gc + 2.4, x1 + .17, gc - 2.4, sy, sy + 1.2, 'neon'); else W.wdecal(sg, x0 - .17, gc - 2.4, x0 - .17, gc + 2.4, sy, sy + 1.2, 'neon'); }
  };
  const planter = (x, z, w, d, y0) => { B('stone', x, z, w, d, .8, y0 || 0); B('grass', x, z, w - .4, d - .4, .86, y0 || 0, { collide: false }); };
  const colm = (x, z, y0, h) => B('whitepaint', x, z, 1.1, 1.1, h || (CH - (y0 || 0)), y0 || 0);
  const table = (x, z, y0, ax) => { y0 = y0 || 0; B('plank', x, z, ax ? 1.0 : 1.9, ax ? 1.9 : 1.0, .08, y0 + .72); B('steel', x, z, .2, .2, .72, y0); const bx = ax ? 0 : 0, off = 1.0; if (ax) { B('cRed', x - off, z, .45, 1.6, .45, y0); B('cRed', x + off, z, .45, 1.6, .45, y0); } else { B('cRed', x, z - off, 1.6, .45, .45, y0); B('cRed', x, z + off, 1.6, .45, .45, y0); } };
  const shelf = (x, z, w, d, y0, m) => B(m || 'cYel', x, z, w, d, 1.9, y0 || 0);
  const sofa = (x, z, w, d, y0, m) => { B(m || 'cPur', x, z, w, d, .5, y0 || 0); B(m || 'cPur', x, z + (d > w ? 0 : -d * .35), d > w ? w * .3 : w, d > w ? d : d * .3, .95, y0 || 0); };
  const kiosk = (x, z, y0, m) => { y0 = y0 || 0; B('cBlk', x, z, 2.2, 1.1, 1.1, y0); B(m || 'cRed', x, z, 2.6, 1.5, .12, y0 + 2.5, { collide: false }); for (const [dx, dz] of [[-1.2, -.7], [1.2, -.7], [-1.2, .7], [1.2, .7]]) B('steel', x + dx, z + dz, .08, .08, 2.5, y0, { collide: false }); };
  const mann = [];
  const mannequin = (x, z, y0, c) => { y0 = y0 || 0; mann.push({ g: gCyl(.14, .2, .9, 8, 1), t: [x, y0 + .95, z], c }); mann.push({ g: gCyl(.1, .14, .7, 8, 1), t: [x, y0 + .35, z], c: [.2, .2, .22] }); mann.push({ g: gSphere(.11, 8, 6), t: [x, y0 + 1.55, z], c: [.9, .88, .85] }); W.col(x, z, .4, .4, 1.7, y0); };
  // 北牆一樓商店（z -40..-31）
  const SH1 = [[-52, -40, '服飾城', '#b4377a'], [-38, -26, '3C 電器', '#1d4f9c'], [-24, -12, '書店', '#7a4b1e'], [12, 24, '藥妝', '#1e8f55'], [26, 38, '玩具王國', '#d36b12'], [40, 52, '運動館', '#7b2fa1']];
  SH1.forEach(([a, b, name, col], i) => {
    const m = ['whitepaint', 'cBlue', 'cYel', 'cTeal', 'cPnk', 'cOrg'][i];
    shop({ x0: a, x1: b, z0: -40, z1: -31, gc: (a + b) / 2, gw: 4, door: 'S', mat: m, sign: name, sc: col });
    const cx = (a + b) / 2;
    if (i === 0) { for (let k = 0; k < 4; k++) mannequin(a + 2.5 + k * 2.3, -36, 0, [.7, .2 + k * .1, .4]); B('cPnk', cx, -39.2, 10, .8, 1.1); }
    if (i === 1) { for (let k = 0; k < 3; k++) B('cBlk', cx - 3 + k * 3, -36, 2.2, 1.2, 1.0); B('cBlue', cx, -39.4, 9, .8, 2.1); }
    if (i === 2) { for (let k = 0; k < 3; k++) shelf(cx, -38.2 + k * 2.4, 7.5, .6, 0, 'plank'); }
    if (i === 3) { shelf(a + 2, -35, .7, 5, 0, 'whitepaint'); shelf(b - 2, -35, .7, 5, 0, 'whitepaint'); B('cGrn', cx, -39.2, 8, .8, 1.3); }
    if (i === 4) { for (let k = 0; k < 3; k++) B('cYel', a + 3 + k * 3.2, -36, 1.6, 1.6, 1.2); sofa(b - 2.2, -38.4, 3, 1.4, 0, 'cRed'); }
    if (i === 5) { B('cPur', cx, -36, 4, 2, .9); B('cBlk', cx, -39.3, 9, .6, 2.0); }
  });
  // 中央大廳（北）雕塑 + 時鐘塔
  B('stone', 0, -34.5, 7, 7, .6); B('cYel', 0, -34.5, 1.6, 1.6, 3.4, .6); W.prop([{ g: gSphere(1.15, 14, 10), t: [0, 5.3, -34.5], c: [.95, .8, .3] }]); W.col(0, -34.5, 1.8, 1.8, 6.5);
  // 1F 北側走道：柱子、攤位、長椅、花圃
  for (const x of [-46, -32, -18, 18, 32, 46]) colm(x, -20, 0, FH - .4);
  for (const x of [-46, -32, -18, 18, 32, 46]) colm(x, -20, FH, CH - FH);
  kiosk(-30, -25, 0, 'cBlue'); kiosk(30, -25, 0, 'cBlue'); kiosk(-8, -23.5, 0, 'cGrn'); kiosk(8, -23.5, 0, 'cGrn');
  for (const x of [-40, 40]) B('plank', x, -16.5, 3.4, .9, .5);
  planter(-14, -28, 4, 2.2); planter(14, -28, 4, 2.2); planter(-44, -26, 3, 3); planter(44, -26, 3, 3);
  for (const x of [-50, 50]) B('cRed', x, -28, 1.1, 1.1, 1.0), B('cRed', x, -26.4, 1.1, 1.1, .5);
  // ---- 二樓內容 ----
  const SH2 = [[-52, -40, '電玩城', '#d2181e', 'cBlk'], [-38, -26, '咖啡廳', '#6b3f1c', 'cOrg'], [-24, -12, '美甲沙龍', '#b4377a', 'cPnk'], [12, 24, '拉麵屋', '#b4181e', 'cRed'], [26, 38, '電影院', '#1d4f9c', 'cBlue'], [40, 52, '遊戲樂園', '#1e8f55', 'cGrn']];
  SH2.forEach(([a, b, name, col, m], i) => {
    shop({ x0: a, x1: b, z0: -40, z1: -33, gc: (a + b) / 2, gw: 4, door: 'S', mat: m, sign: name, sc: col, y0: FH, h: 3.6 });
    const cx = (a + b) / 2;
    if (i === 0) { for (let k = 0; k < 5; k++) B('cBlk', a + 2 + k * 2, -39.2, 1.2, .8, 1.8, FH); for (let k = 0; k < 4; k++) B('cPur', a + 3 + k * 2, -35.8, 1.2, .8, 1.7, FH); }
    if (i === 1) { for (const k of [-3, 0, 3]) table(cx + k, -36.5, FH); B('cBlk', cx, -39.4, 8, .8, 1.2, FH); }
    if (i === 2) { sofa(cx - 2, -37.5, 2.6, 1.2, FH, 'cPnk'); sofa(cx + 2.6, -37.5, 2.6, 1.2, FH, 'cPnk'); }
    if (i === 3) { B('cBlk', cx, -39.3, 9, .8, 1.1, FH); for (const k of [-3, 3]) table(cx + k, -36.2, FH); }
    if (i === 4) { for (let r = 0; r < 3; r++) sofa(cx, -38.2 + r * 1.6, 7, 1.0, FH + r * 0.0, 'cBlue'); }
    if (i === 5) { B('cYel', cx - 2, -36.5, 2, 2, 1.0, FH); B('cOrg', cx + 2, -36.5, 2, 2, 1.8, FH); B('cPur', cx, -39.2, 8, 1, .8, FH); }
  });
  // 二樓美食區（中央）+ 觀景沙發 + 花圃 + 柱
  for (const [x, z] of [[-9, -29], [-3, -29], [3, -29], [9, -29], [-9, -22.5], [-3, -22.5], [3, -22.5], [9, -22.5]]) table(x, z, FH, (x + z) % 2 ? 0 : 0);
  planter(-14, -17.5, 5, 2, FH); planter(14, -17.5, 5, 2, FH); planter(0, -17.5, 6, 2, FH);
  sofa(-44, -22, 7, 1.2, FH, 'cOrg'); sofa(44, -22, 7, 1.2, FH, 'cOrg'); sofa(-33, -16, 6, 1.2, FH, 'cTeal'); sofa(33, -16, 6, 1.2, FH, 'cTeal');
  for (const x of [-46, -32, 32, 46]) B('cRed', x, -27, 1.3, 1.3, 1.1, FH);
  kiosk(-20, -28, FH, 'cYel'); kiosk(20, -28, FH, 'cYel'); B('cBlk', 0, -32.2, 6, .8, 1.2, FH);
  for (let k = 0; k < 4; k++) { B('cBlk', -50 + k * 1.4, -27.5, 1.1, .8, 1.8, FH); B('cBlk', 50 - k * 1.4, -27.5, 1.1, .8, 1.8, FH); }
  // 二樓玻璃護欄後的盆栽樹
  // ---- 一樓南側：西翼超市 ----
  shop({ x0: -52, x1: -33, z0: 2, z1: 22, gc: 10, gw: 4.4, door: 'E', mat: 'whitepaint', h: 4.2, sign: '超級市場', sc: '#d2181e', sides: 'NSE' });
  for (let k = 0; k < 4; k++) shelf(-44, 5.5 + k * 3.4, 12, .8, 0, k % 2 ? 'cYel' : 'cBlue');
  B('cBlk', -36, 17, 1.2, 6, 1.0); B('cBlk', -36, 11.5, 1.2, 3, 1.0); for (const z of [14.5, 8.2]) B('cRed', -37.8, z, 1.2, 2.2, .9);
  B('whitepaint', -42.5, 12, 19, 20, .2, 4.2); // 超市屋頂（可站上去）
  W.stairs('cBlue', -27.5, 17.2, '-x', 2, 11, .4, .5);
  for (const [cx, cz, w, d] of [[-42.5, 2, 19, .3], [-42.5, 22, 19, .3], [-33, 8.75, .3, 13.5], [-33, 20.5, .3, 3]]) B('steel', cx, cz, w, d, .55, 4.4);
  B('cYel', -48, 8, 2, 2, .9, 4.4); B('cYel', -40, 18, 2, 2, .9, 4.4);
  // 東翼電玩賣場（對稱）
  shop({ x0: 33, x1: 52, z0: 2, z1: 22, gc: 10, gw: 4.4, door: 'W', mat: 'cBlk', h: 4.2, sign: '電玩賣場', sc: '#1d4f9c', sides: 'NSW' });
  for (let k = 0; k < 4; k++) for (let j = 0; j < 3; j++) B('cPur', 38 + j * 4, 5.5 + k * 3.4, 1.0, .9, 1.8);
  B('cBlue', 49, 12, 1.5, 12, 1.0); B('cYel', 50.8, 12, 1, 14, 2.0);
  B('whitepaint', 42.5, 12, 19, 20, .2, 4.2);
  W.stairs('cBlue', 27.5, 17.2, '+x', 2, 11, .4, .5);
  for (const [cx, cz, w, d] of [[42.5, 2, 19, .3], [42.5, 22, 19, .3], [33, 8.75, .3, 13.5], [33, 20.5, .3, 3]]) B('steel', cx, cz, w, d, .55, 4.4);
  B('cYel', 48, 18, 2, 2, .9, 4.4); B('cYel', 40, 8, 2, 2, .9, 4.4);
  // 西南：美食街（紅隊基地）
  for (const [x, z] of [[-44, 29], [-38, 29], [-44, 33.5], [-38, 33.5], [-30, 31], [-30, 35]]) table(x, z, 0, 0);
  B('cRed', -43, 39.2, 18, .8, 1.1); B('cOrg', -43, 38.0, 18, .4, 2.1); W.wdecal(W.text('美食街 FOOD COURT', { w: 768, h: 96, bg: '#d36b12', fg: '#fff', font: '900 56px' }), -34, 39.78, -52, 39.78, 4.4, 5.6, 'neon');
  B('stone', -48, 26, 6, .7, 1.0); B('stone', -51.4, 28.4, .7, 4.2, 1.0);
  // 東南：影城大廳（藍隊基地）
  for (const [x, z] of [[45, 29.5], [49.5, 34]]) sofa(x, z, 4, 1.1, 0, 'cBlue');
  B('cBlk', 43, 39.2, 18, .8, 1.1); B('cBlue', 43, 38.0, 18, .4, 2.6); W.wdecal(W.text('影城 CINEMA', { w: 768, h: 96, bg: '#1d4f9c', fg: '#fff', font: '900 56px' }), 52, 39.78, 34, 39.78, 4.4, 5.6, 'neon');
  B('stone', 48, 26, 6, .7, 1.0); B('stone', 51.4, 28.4, .7, 4.2, 1.0);
  shop({ x0: 33, x1: 40, z0: 31, z1: 37, gc: 34.5 + 3.5, gw: 3, door: 'N', mat: 'cBlue', h: 3.4, sides: 'NSW' }); // 放映室 (小房間)
  B('cPur', 36.5, 35.2, 4, 1, .8);
  shop({ x0: -40, x1: -33, z0: 31, z1: 37, gc: -36, gw: 3, door: 'N', mat: 'cOrg', h: 3.4, sides: 'NSE' }); // 後廚小房間
  B('cBlk', -37, 35.8, 4.4, .8, 1.0);
  // ---- 中庭（x∈[-16,16]）----
  B('stone', 0, 14, 9, 9, .6); B('stone', 0, 14, 7.6, 7.6, .62, .0, { render: false }); B('cTeal', 0, 14, 8, 8, .06, .6, { collide: false }); B('cYel', 0, 14, 1.6, 1.6, 3.2, .6); W.prop([{ g: gSphere(.9, 12, 8), t: [0, 4.4, 14], c: [.3, .75, .85] }]);
  for (const [x, z] of [[-10, 14], [10, 14]]) { planter(x, z, 4, 4); W.trees({ list: [[x, z, .75]], seed: x + 9 }); }
  for (const [x, z] of [[-12, 4], [12, 4], [-12, 25], [12, 25]]) planter(x, z, 4.4, 2.2);
  for (const z of [-8, 3, 14, 25, 36]) for (const sx of [-16, 16]) colm(sx, z, 0, CH);
  kiosk(-9, 1, 0, 'cYel'); kiosk(9, 1, 0, 'cYel'); kiosk(-8, 27, 0, 'cRed'); kiosk(8, 27, 0, 'cRed');
  B('cBlue', 0, 30, 6.5, 1.2, 1.1); B('cBlk', 0, 30.7, 6.5, .3, 2.0); W.wdecal(W.text('服務台', { w: 256, h: 64, bg: '#222', fg: '#ffd24a' }), 1.6, 29.5, -1.6, 29.5, 2.2, 2.7, 'neon');
  B('cRed', 0, 36.4, 14, 3.6, .5); W.stairs('cRed', 0, 33.4, '+z', 6, 1, .25, 1); B('whitepaint', 0, 38.6, 14, .6, 2.2, .5);
  // 販賣機、ATM、購物車
  for (const x of [-6, -4.8, -3.6]) B('cRed', x, -12.3, 1.0, .9, 1.9); for (const x of [3.6, 4.8, 6]) B('cBlue', x, -12.3, 1.0, .9, 1.9);
  for (const z of [32, 34]) for (const sx of [-48, 48]) B('cGrn', sx, z - 5, 1.1, .8, .9);
  for (let k = 0; k < 5; k++) { B('steel', -31.4, 3.6 + k * 1.6, .9, .6, .9); B('steel', 31.4, 3.6 + k * 1.6, .9, .6, .9); }
  // 中段走道上的立式廣告牌 / 小型休息亭（可躲）
  for (const x of [-26, 26]) { B('cPnk', x, 9, 3, .35, 2.4); B('cPnk', x, 15, 3, .35, 2.4); B('steel', x, 12, .2, 6, .2, 2.4, { collide: false }); }
  for (const x of [-26, 26]) { B('cBlk', x, 27, 3.2, 2.2, 2.4); B('glass', x, 25.8, 3.2, .1, 1.0, 1.2, { collide: false }); B('cBlk', x, 29.1, 3.2, .1, 2.4); }
  // 大型階梯平台（可跳上）
  for (const sx of [-1, 1]) { B('tile', sx * 24, 33, 9, 1.4, .4); B('tile', sx * 24, 34.4, 9, 1.4, .8); B('tile', sx * 24, 35.8, 9, 1.4, 1.2); }
  // 裝飾：商城主視覺
  W.wdecal(W.text('SALE', { w: 256, h: 128, bg: '#d2181e', fg: '#ffe34a', font: '900 90px' }), -3, -40.0 + .38, 3, -40.0 + .38, 6.2, 8.2, 'neon');
  // 天花板吊掛看板（雙面）
  const banner = (cx, cz, w, txt, bg, along) => { const r = W.text(txt, { w: 512, h: 96, bg, fg: '#fff', border: '#fff', font: '900 60px' }); for (const sgn of [1, -1]) { const o = sgn * .04; if (along === 'x') W.wdecal(r, sgn > 0 ? cx - w / 2 : cx + w / 2, cz + o, sgn > 0 ? cx + w / 2 : cx - w / 2, cz + o, 6.6, 6.6 + w / 5.3, 'neon'); else W.wdecal(r, cx + o, sgn > 0 ? cz + w / 2 : cz - w / 2, cx + o, sgn > 0 ? cz - w / 2 : cz + w / 2, 6.6, 6.6 + w / 5.3, 'neon'); } B('steel', cx - (along === 'x' ? w / 2 - .3 : 0), cz - (along === 'x' ? 0 : w / 2 - .3), .06, .06, CH - 6.6 - w / 5.3, 6.6 + w / 5.3, { collide: false }); B('steel', cx + (along === 'x' ? w / 2 - .3 : 0), cz + (along === 'x' ? 0 : w / 2 - .3), .06, .06, CH - 6.6 - w / 5.3, 6.6 + w / 5.3, { collide: false }); };
  banner(0, 8, 8, '全館特賣 SALE', '#d2181e', 'x'); banner(0, 22, 8, '週年慶 5 折起', '#7b2fa1', 'x'); banner(-34, 14, 7, '生鮮超市', '#1e8f55', 'x'); banner(34, 14, 7, '電玩狂歡', '#1d4f9c', 'x'); banner(-10, -3, 7, '二樓美食 ▲', '#d36b12', 'x'); banner(10, -3, 7, '二樓娛樂 ▲', '#d36b12', 'x');
  // 導覽牌 / 垃圾桶 / 長椅 / 兒童遊戲區（可踩的軟積木）
  for (const [x, z] of [[-6, 20], [6, 20]]) { B('cBlk', x, z, 1.6, .25, 2.0); W.wdecal(W.text('商城導覽', { w: 256, h: 96, bg: '#1d4f9c', fg: '#fff' }), x - .7, z + .15, x + .7, z + .15, 1.2, 1.9, 'neon'); }
  for (const [x, z] of [[-14, 8], [14, 8], [-14, 20], [14, 20], [-26, 5], [26, 5], [-44, 25], [44, 25], [-5, 36], [5, 36], [-28, -14], [28, -14]]) B('cGrn', x, z, .5, .5, .9);
  for (const [x, z, ax] of [[-5, 10, 1], [5, 10, 1], [-5, 18, 1], [5, 18, 1], [0, 8.2, 0], [0, 19.8, 0]]) B('plank', x, z, ax ? .7 : 2.6, ax ? 2.6 : .7, .5);
  for (const sx of [-1, 1]) { const bx = sx * 24, bz = 21; const hs = [[0, 0, .5], [1.2, 0, .9], [2.4, 0, 1.3], [0, 1.2, .9], [1.2, 1.2, .5], [2.4, 1.2, .9], [0, 2.4, 1.3], [1.2, 2.4, .9], [2.4, 2.4, .5]]; const cc = ['cPnk', 'cYel', 'cBlue', 'cGrn', 'cOrg', 'cPur']; hs.forEach(([dx, dz, h], i) => B(cc[(i + (sx > 0 ? 3 : 0)) % 6], bx - 1.2 + dx, bz - 1.2 + dz, 1.15, 1.15, h)); }
  // 二樓：觀景平台（可站上去的展示台）
  for (const x of [-26, 26]) { B('cBlue', x, -33, 3.5, 3, .5, FH); B('cBlue', x, -33, 2, 2, 1.0, FH + .5); }
  W.prop(mann);
}
MAPS.mall = {
  id: 'mall', orbit: { c: [0, 12], r: 13, h: 7.4, ly: 1.4 }, preview: [0, 22], name: '追逃商城', sub: '1F 約 106×80 m · 樓中樓二樓', desc: '面積為熱血高校的 1.4 倍。兩座對稱電扶梯通往二樓（占 1F 的 1/3），可從欄杆直接跳下一樓、不會摔傷；店鋪、攤位、屋頂與盆栽處處可躲可踩。',
  bounds: { x0: -53, x1: 53, z0: -40, z1: 40 }, flagPos: [[-46, 30.5], [46, 30.5]], zoneRed: [-51, 27, -39, 38], zoneBlue: [39, 27, 51, 38], faceRed: [0, 8], faceBlue: [0, 8],
  interior: [-53.5, -40.5, 53.5, 40.5], env: { sunCol: [.52, .50, .46], sky: [.76, .76, .79], gnd: [.60, .57, .52], fog: [.70, .72, .78], fogR: [80, 260], interior: [-53.5, -40.5, 53.5, 40.5], intK: 1.0, intH: 9.8 }, night: false, indoor: true, noShadow: true,
  mezz: { x0: -53, x1: 53, z0: -40, z1: -13.4, h: MALL_FH },
  portals: [{ a: [-24, -3], b: [-24, -15], via: [[-24, -4.6], [-24, -12.4]] }, { a: [24, -3], b: [24, -15], via: [[24, -4.6], [24, -12.4]] }],
  pickSpots: [[-10, -8], [10, -8], [-24, 6], [24, 6], [-44, 12], [44, 12], [0, 5], [-36, 24], [36, 24], [-46, 33], [46, 33], [0, 22], [-8, 34], [8, 34], [-45, -33], [45, -33], [-8, -20], [8, -20], [-30, -4], [30, -4],
    [-20, -22, 1], [20, -22, 1], [0, -36, 1], [-46, -22, 1], [46, -22, 1]],
  build(W) { buildMall(W); }
};
