/* ================= 角色（依參考圖：白襯衫牛仔寬褲／黑T黑長褲／紫帽T工裝褲） ================= */
const OUTFITS = [
  { key: 'f', label: '蘇蘇Susu', sub: '', skill: { name: '顛倒乾坤', desc: '揮動魔法，讓其他玩家的移動方向顛倒 5 秒。冷卻 40 秒。' }, H: 1.66, skin: '#efcbb0', hipX: .088, shX: .185, tz: .56, hair: '#4a2f22', hair2: '#8d5c3b', female: true,
    torso: [[.001, -.16], [.205, -.16], [.195, -.08], [.162, .05], [.15, .17], [.152, .28], [.17, .38], [.182, .46], [.172, .51], [.12, .545], [.056, .56], [.05, .595], [.001, .595]] },
  { key: 'm1', label: '艾迪Eddie', sub: '', skill: { name: '銅牆鐵壁', desc: '展開護盾 3 秒，擋下一次輸入攻擊並刷新號碼。冷卻 40 秒。' }, H: 1.78, skin: '#d8a883', hipX: .1, shX: .245, tz: .52, hair: '#0f0f12',
    torso: [[.001, -.09], [.197, -.09], [.2, .0], [.186, .1], [.19, .22], [.224, .36], [.25, .46], [.246, .53], [.176, .57], [.07, .595], [.058, .63], [.001, .63]] },
  { key: 'm2', label: '艾伯特Albert', sub: '', skill: { name: '紫電干擾', desc: '讓其他玩家的數字鍵錯亂 5 秒。冷卻 60 秒。' }, H: 1.76, skin: '#c99a76', hipX: .098, shX: .228, tz: .52, hair: '#0d0d10',
    torso: [[.001, -.10], [.222, -.10], [.227, -.02], [.212, .1], [.217, .22], [.238, .36], [.257, .46], [.252, .53], [.19, .57], [.13, .60], [.118, .645], [.001, .645]] }
];
OUTFITS.push(
  { key: 'sumi', label: '蘇米Sumi', sub: '', skill: { name: '精靈力量', desc: '跳得比常人高 1.65 倍，二段跳後還能向前突進一段距離。' }, H: 1.5, skin: '#dcbb92', hipX: .085, shX: .16, tz: .78, hair: '#c9a878', hair2: '#e7d3ae', female: true, passive: true,
    torso: [[.001, -.12], [.15, -.1], [.19, .0], [.2, .1], [.19, .22], [.17, .34], [.13, .46], [.08, .54], [.001, .56]] },
  { key: 'eric', label: '艾瑞克Eric', sub: '', skill: { name: '幻影易容', desc: '噴出白霧，頭上號碼偽裝成眼前最近的玩家，最長 20 秒。冷卻 45 秒。' }, H: 1.78, skin: '#d2a27c', hipX: .1, shX: .235, tz: .52, hair: '#2d2824', hair2: '#6d6760',
    torso: [[.001, -.1], [.2, -.1], [.205, -.02], [.19, .1], [.195, .22], [.23, .36], [.25, .46], [.245, .53], [.18, .57], [.07, .595], [.056, .63], [.001, .63]] },
  { key: 'mike', label: '麥克Mike', sub: '', skill: { name: '疾風之速', desc: '移動速度是一般角色的 2.5 倍。' }, H: 1.74, skin: '#e2b896', hipX: .1, shX: .235, tz: .54, hair: '#b0702f', hair2: '#d89b52', passive: true,
    torso: [[.001, -.1], [.22, -.1], [.235, -.02], [.225, .1], [.23, .24], [.26, .38], [.275, .47], [.26, .54], [.18, .575], [.075, .6], [.06, .63], [.001, .63]] }
);
OUTFITS.push(
  { key: 'belt', label: '貝雷特Belt', sub: '', skill: { name: '烏賊戲法', desc: '噴出烏賊墨汁，遮住其他玩家畫面中央 5 秒。冷卻 40 秒。' }, H: 1.66, skin: '#f0cdb0', hipX: .095, shX: .19, tz: .54, hair: '#222', hair2: '#444', female: true, gen: { top: '#2c2a58', top2: '#8a5cc9', pants: '#1f1f33', shoe: '#552a2a', hair: '#3a261c', style: 'bob', acc: ['beret'], accC: '#a8222c' },
    torso: [[.001, -.16], [.2, -.16], [.19, -.08], [.16, .05], [.15, .17], [.152, .28], [.17, .38], [.18, .46], [.17, .51], [.12, .545], [.056, .56], [.05, .595], [.001, .595]] },
  { key: 'eagle', label: '鷹眼Eagle', sub: '', skill: { name: '靶靶命中', desc: '所有人的號碼牌放大兩倍並朝向你，持續 7 秒。冷卻 50 秒。' }, H: 1.78, skin: '#c99572', hipX: .095, shX: .235, tz: .54, hair: '#222', hair2: '#444', female: false, gen: { top: '#5a6b3a', top2: '#2e3a1f', pants: '#4a4636', shoe: '#2a2018', hair: '#4a2e1a', style: 'spiky', acc: ['goggles'], accC: '#e0b030' },
    torso: [[.001, -.1], [.2, -.1], [.205, -.02], [.19, .1], [.195, .22], [.23, .36], [.25, .46], [.245, .53], [.18, .57], [.07, .595], [.056, .63], [.001, .63]] },
  { key: 'ray', label: '雷柏爾Ray', sub: '', skill: { name: '敖天術式', desc: '跳躍 0.3 秒後隱身，落地時現形。' }, H: 1.77, skin: '#e6c4a4', hipX: .095, shX: .235, tz: .54, hair: '#222', hair2: '#444', female: false, gen: { top: '#1d1f2e', top2: '#38d0ff', pants: '#2a2c3d', shoe: '#e8eef5', hair: '#dfe6f0', style: 'spiky', acc: [], accC: '#38d0ff' },
    torso: [[.001, -.1], [.2, -.1], [.205, -.02], [.19, .1], [.195, .22], [.23, .36], [.25, .46], [.245, .53], [.18, .57], [.07, .595], [.056, .63], [.001, .63]] },
  { key: 'lydia', label: '貓女Lydia', sub: '', skill: { name: '幻影蹤跡', desc: '噴白煙後隱身 5 秒，每 1.5 秒現形 0.1 秒。冷卻 40 秒。' }, H: 1.64, skin: '#efcbb0', hipX: .095, shX: .19, tz: .54, hair: '#222', hair2: '#444', female: true, gen: { top: '#17151c', top2: '#c93a8a', pants: '#17151c', shoe: '#17151c', hair: '#3b1f5a', style: 'long', acc: ['catears'], accC: '#17151c' },
    torso: [[.001, -.16], [.2, -.16], [.19, -.08], [.16, .05], [.15, .17], [.152, .28], [.17, .38], [.18, .46], [.17, .51], [.12, .545], [.056, .56], [.05, .595], [.001, .595]] },
  { key: 'lin', label: '王心靈Lin', sub: '', skill: { name: '心靈控制', desc: '周圍 2.5 公尺內的人會背對你走開 2.5 秒。冷卻 40 秒。' }, H: 1.68, skin: '#f0d2b6', hipX: .095, shX: .19, tz: .54, hair: '#222', hair2: '#444', female: true, gen: { top: '#f4efe0', top2: '#d9a93a', pants: '#e3dccb', shoe: '#8a6a2a', hair: '#15151a', style: 'long', acc: ['headband'], accC: '#d9a93a' },
    torso: [[.001, -.16], [.2, -.16], [.19, -.08], [.16, .05], [.15, .17], [.152, .28], [.17, .38], [.18, .46], [.17, .51], [.12, .545], [.056, .56], [.05, .595], [.001, .595]] },
  { key: 'lessie', label: '蕾西亞Lessie', sub: '', skill: { name: '淨化之光', desc: '每 2.5 秒綻放光芒，解除自身所有負面狀態。' }, H: 1.65, skin: '#f3d6bd', hipX: .095, shX: .19, tz: .54, hair: '#222', hair2: '#444', female: true, gen: { top: '#8fd6a8', top2: '#fff6c8', pants: '#f2f0e4', shoe: '#c9a050', hair: '#e8cd7a', style: 'ponytail', acc: ['flower'], accC: '#ff8fb0' },
    torso: [[.001, -.16], [.2, -.16], [.19, -.08], [.16, .05], [.15, .17], [.152, .28], [.17, .38], [.18, .46], [.17, .51], [.12, .545], [.056, .56], [.05, .595], [.001, .595]] },
  { key: 'bolt', label: '柏Bolt', sub: '', skill: { name: '長跑高手', desc: '跑步時不消耗體力。' }, H: 1.8, skin: '#b9825a', hipX: .095, shX: .235, tz: .54, hair: '#222', hair2: '#444', female: false, gen: { top: '#ff9d1c', top2: '#fff', pants: '#222831', shoe: '#ffee58', hair: '#15110e', style: 'short', acc: ['headband'], accC: '#e02828' },
    torso: [[.001, -.1], [.2, -.1], [.205, -.02], [.19, .1], [.195, .22], [.23, .36], [.25, .46], [.245, .53], [.18, .57], [.07, .595], [.056, .63], [.001, .63]] },
  { key: 'dylon', label: '迪倫Dylon', sub: '', skill: { name: '窺探專家', desc: '移動速度為 70%，但使用望遠鏡不耗能量。' }, H: 1.74, skin: '#d9aa84', hipX: .095, shX: .235, tz: .54, hair: '#222', hair2: '#444', female: false, gen: { top: '#7a5a3a', top2: '#c9b28a', pants: '#3b3226', shoe: '#2a2018', hair: '#6b4a2a', style: 'short', acc: ['glasses','scarf'], accC: '#a83a2a' },
    torso: [[.001, -.1], [.2, -.1], [.205, -.02], [.19, .1], [.195, .22], [.23, .36], [.25, .46], [.245, .53], [.18, .57], [.07, .595], [.056, .63], [.001, .63]] },
  { key: 'troll', label: '干擾者', hidden: true, sub: '', skill: { name: '', desc: '' }, H: 1.78, skin: '#1c1c1f', hipX: .1, shX: .235, tz: .52, hair: '#111', hair2: '#222', gen: { top: '#16161a', top2: '#d8d8dc', pants: '#16161a', shoe: '#101012', hair: '#111', style: 'mask', acc: ['skullbelt'], accC: '#c9c9cf' },
    torso: [[.001, -.1], [.2, -.1], [.205, -.02], [.19, .1], [.195, .22], [.23, .36], [.25, .46], [.245, .53], [.18, .57], [.07, .595], [.056, .63], [.001, .63]] }
);
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
  } else if (o.key === 'troll') {
    g.fillStyle = '#141417'; g.fillRect(0, 0, W, Hh); dots(g, W, Hh, 3000, ['#202024', '#0c0c0e'], 1, 2, .4);
    g.fillStyle = '#7d7d83'; g.beginPath(); g.moveTo(300, 0); g.quadraticCurveTo(512, 120, 724, 0); g.lineTo(724, 60); g.quadraticCurveTo(512, 190, 300, 60); g.fill();
    g.strokeStyle = '#e9e9ee'; g.lineCap = 'round'; for (let k = 0; k < 5; k++) { const y = 150 + k * 52, w2 = 190 - k * 14; g.lineWidth = 15 - k; g.beginPath(); g.moveTo(512 - w2, y - 22); g.quadraticCurveTo(512, y + 26, 512 + w2, y - 22); g.stroke(); }
    g.lineWidth = 12; g.beginPath(); g.moveTo(512, 120); g.lineTo(512, 400); g.stroke();
    g.fillStyle = '#26262b'; g.fillRect(0, 420, W, 92); g.fillStyle = '#b9b9c2'; g.beginPath(); g.moveTo(452, 430); g.lineTo(572, 430); g.lineTo(560, 500); g.lineTo(512, 512); g.lineTo(464, 500); g.closePath(); g.fill();
  } else if (o.gen) {
    const G2 = o.gen; g.fillStyle = G2.top; g.fillRect(0, 0, W, Hh); folds(G2.top2, 22, .22); dots(g, W, Hh, 3000, [G2.top2, '#00000033'], 1, 2.2, .18);
    g.fillStyle = G2.top2; g.fillRect(0, Hh - 60, W, 60); g.fillRect(0, 0, W, 18);
    g.fillStyle = G2.top2; g.globalAlpha = .9; g.beginPath(); g.moveTo(512 - 70, 0); g.lineTo(512, 120); g.lineTo(512 + 70, 0); g.closePath(); g.fill(); g.globalAlpha = 1;
    g.strokeStyle = G2.top2; g.lineWidth = 8; g.beginPath(); g.moveTo(512, 120); g.lineTo(512, Hh - 60); g.stroke();
  } else if (o.key === 'sumi') {
    g.fillStyle = '#c4a273'; g.fillRect(0, 0, W, Hh); folds('#ad8a5c', 50, .3); folds('#e9d6b3', 30, .35); dots(g, W, Hh, 5000, ['#c9a97c', '#ead9b8', '#bf9f72'], 1, 2.4, .35);
    const cg = g.createRadialGradient(512, 300, 10, 512, 300, 200); cg.addColorStop(0, '#fbf1dc'); cg.addColorStop(1, 'rgba(251,241,220,0)'); g.fillStyle = cg; g.fillRect(250, 80, 524, 430);
    g.strokeStyle = '#17171b'; g.lineWidth = 16; g.beginPath(); g.moveTo(330, 0); g.lineTo(640, 512); g.stroke(); g.strokeStyle = '#c7a26a'; g.lineWidth = 3; g.setLineDash([10, 8]); g.stroke(); g.setLineDash([]);
  } else if (o.key === 'eric') {
    g.fillStyle = '#4f4740'; g.fillRect(0, 0, W, Hh); dots(g, W, Hh, 9000, ['#85796d', '#524a42', '#9a8e80', '#3f3832'], 1, 2.6, .5); folds('#4b433c', 26, .3);
    g.fillStyle = '#0f0f12'; g.beginPath(); g.moveTo(512 - 120, 0); g.lineTo(512 + 120, 0); g.lineTo(512 + 70, 330); g.lineTo(512, 400); g.lineTo(512 - 70, 330); g.closePath(); g.fill();
    g.strokeStyle = '#2b2520'; g.lineWidth = 6; g.beginPath(); g.moveTo(512 - 120, 0); g.lineTo(512 - 36, 400); g.moveTo(512 + 120, 0); g.lineTo(512 + 36, 400); g.stroke();
    g.fillStyle = '#2a2420'; for (const y of [440, 490]) { g.beginPath(); g.arc(512, y, 9, 0, TAU); g.fill(); }
  } else if (o.key === 'mike') {
    g.fillStyle = '#d9cfc0'; g.fillRect(0, 0, W, Hh); folds('#bfb4a3', 40, .35); folds('#f1e9dc', 20, .4); dots(g, W, Hh, 4500, ['#c8bdac', '#a89c89', '#efe6d6'], 1, 2.8, .4);
    g.fillStyle = '#c6baa8'; g.beginPath(); g.moveTo(330, 330); g.lineTo(694, 330); g.lineTo(730, 500); g.lineTo(294, 500); g.closePath(); g.fill(); g.strokeStyle = 'rgba(70,60,50,.5)'; g.lineWidth = 3; g.stroke();
    g.strokeStyle = '#2a2622'; g.lineWidth = 4; for (const dx of [-40, 40]) { g.beginPath(); g.moveTo(512 + dx, 20); g.lineTo(512 + dx, 260); g.stroke(); }
    g.fillStyle = '#2a2622'; g.beginPath(); g.moveTo(620, 130); g.lineTo(640, 190); g.lineTo(600, 190); g.closePath(); g.fill();
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
function paintSumiFace() {
  const W = 1024, Hh = 512, c = cv(W, Hh), g = c.getContext('2d');
  g.fillStyle = '#dcbb92'; g.fillRect(0, 0, W, Hh); dots(g, W, Hh, 4000, ['#cfae84', '#e8cfa6'], 1, 2.2, .35);
  let q = g.createRadialGradient(512, 360, 20, 512, 360, 230); q.addColorStop(0, '#f8ecd6'); q.addColorStop(1, 'rgba(248,236,214,0)'); g.fillStyle = q; g.fillRect(250, 200, 524, 312);
  for (const sgn of [-1, 1]) {
    const ex = 512 + sgn * 92, ey = 250;
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(ex, ey, 54, 62, 0, 0, TAU); g.fill();
    const ir = g.createRadialGradient(ex, ey - 6, 6, ex, ey + 6, 52); ir.addColorStop(0, '#8a5a2e'); ir.addColorStop(.6, '#4a2a14'); ir.addColorStop(1, '#2a160a'); g.fillStyle = ir; g.beginPath(); g.ellipse(ex, ey + 4, 44, 52, 0, 0, TAU); g.fill();
    g.fillStyle = '#080404'; g.beginPath(); g.ellipse(ex, ey + 8, 22, 28, 0, 0, TAU); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(ex - 16, ey - 18, 15, 0, TAU); g.fill(); g.beginPath(); g.arc(ex + 16, ey + 26, 7, 0, TAU); g.fill();
    g.strokeStyle = '#1a0e08'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.ellipse(ex, ey, 55, 63, 0, PI * 1.05, PI * 1.95); g.stroke();
    const b = g.createRadialGradient(512 + sgn * 150, 340, 3, 512 + sgn * 150, 340, 62); b.addColorStop(0, 'rgba(245,120,125,.6)'); b.addColorStop(1, 'rgba(245,120,125,0)'); g.fillStyle = b; g.fillRect(512 + sgn * 150 - 66, 275, 132, 132);
  }
  g.fillStyle = '#4a2a1a'; g.beginPath(); g.ellipse(512, 330, 16, 11, 0, 0, TAU); g.fill();
  g.fillStyle = '#7a2a30'; g.beginPath(); g.moveTo(512 - 36, 372); g.quadraticCurveTo(512, 386, 512 + 36, 372); g.quadraticCurveTo(512 + 26, 424, 512, 424); g.quadraticCurveTo(512 - 26, 424, 512 - 36, 372); g.fill();
  g.fillStyle = '#ee8088'; g.beginPath(); g.ellipse(512, 410, 15, 9, 0, 0, TAU); g.fill();
  g.strokeStyle = '#5a1f24'; g.lineWidth = 4; g.beginPath(); g.moveTo(512, 346); g.lineTo(512, 372); g.stroke();
  return c;
}
function paintTrollFace() {
  const W = 1024, Hh = 512, c = cv(W, Hh), g = c.getContext('2d');
  g.fillStyle = '#121214'; g.fillRect(0, 0, W, Hh);
  g.fillStyle = '#e8e8ec'; g.beginPath(); g.moveTo(512, 170); g.quadraticCurveTo(300, 120, 250, 230); g.quadraticCurveTo(240, 330, 380, 350); g.quadraticCurveTo(470, 330, 512, 300); g.quadraticCurveTo(554, 330, 644, 350); g.quadraticCurveTo(784, 330, 774, 230); g.quadraticCurveTo(724, 120, 512, 170); g.fill();
  g.fillStyle = '#e8a060'; g.beginPath(); g.ellipse(512, 330, 62, 70, 0, 0, TAU); g.fill();
  for (const sgn of [-1, 1]) { const ex = 512 + sgn * 120, ey = 250; g.fillStyle = '#e8a060'; g.beginPath(); g.ellipse(ex, ey, 62, 40, sgn * -.2, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(ex, ey, 36, 24, 0, 0, TAU); g.fill(); g.fillStyle = '#2a1c14'; g.beginPath(); g.arc(ex, ey, 17, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex - 5, ey - 6, 5, 0, TAU); g.fill(); g.strokeStyle = '#1a1210'; g.lineWidth = 7; g.beginPath(); g.moveTo(ex - sgn * 70, ey - 40); g.lineTo(ex + sgn * 40, ey - 62); g.stroke(); }
  g.fillStyle = '#c98048'; g.beginPath(); g.ellipse(512, 400, 30, 14, 0, 0, TAU); g.fill();
  g.fillStyle = '#e9e9ee'; g.beginPath(); g.moveTo(512, 40); g.quadraticCurveTo(440, 70, 400, 110); g.lineTo(512, 90); g.lineTo(624, 110); g.quadraticCurveTo(584, 70, 512, 40); g.fill();
  return c;
}
function paintFace(o) {
  if (o.key === 'sumi') return paintSumiFace();
  if (o.key === 'troll') return paintTrollFace();
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
  if (o.key === 'eric' || (o.gen && o.gen.acc.includes('glasses'))) { g.strokeStyle = '#1a1714'; g.lineWidth = 9; for (const sgn of [-1, 1]) { g.beginPath(); g.ellipse(512 + sgn * 86, 250, 76, 66, 0, 0, TAU); g.stroke(); } g.beginPath(); g.moveTo(512 - 12, 246); g.lineTo(512 + 12, 246); g.stroke(); g.fillStyle = 'rgba(160,200,230,.18)'; for (const sgn of [-1, 1]) { g.beginPath(); g.ellipse(512 + sgn * 86, 250, 72, 62, 0, 0, TAU); g.fill(); } }
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
  } else if (O.key === 'm2') {
    const cap = [.05, .05, .055];
    hairP.push({ g: gSphere(1, 22, 11, 0, TAU, 0, PI / 2), t: [0, hc + hh * .2, -.006], r: [-.12, 0, 0], s: [hw * 1.14, hh * .62, hw * 1.14 * 1.2], c: cap });
    hairP.push({ g: gCyl(1, 1, .012, 18, 1, false, -1.3, 2.6), t: [0, hc + hh * .24, .08], r: [.08, 0, 0], s: [hw * 1.05, 1, .105], c: [.03, .03, .035] });
    const pur = [.25, .13, .4];
    hairP.push({ g: gSphere(1, 26, 14, PI / 2 + .95, TAU - 1.9, 0, 2.35), t: [0, hc - .005, -.02], s: [hw * 1.62, hh * .95, hw * 1.62 * 1.12], cfn: (x, y, z) => shade(pur, .7 + .5 * clamp((y - (hc - .15)) / .3, 0, 1)) });
    hairP.push({ g: gCyl(.14, .205, .13, 20, 1, true), t: [0, shY + .005, -.02], s: [1, 1, .85], c: shade(pur, .9) });
    for (const sg of [-1, 1]) hairP.push({ g: gSphere(.0075, 6, 5), t: [sg * hw * 1.02, hc - .06, -.002], c: [.75, .75, .78] });
  }
  if (O.key === 'sumi') {
    const bg = rgb('#c4a273'), pk = [.93, .62, .64], cr = rgb('#f4e6c9'), dk = [.45, .35, .25];
    hairP.push({ g: gSphere(1, 20, 12, 0, TAU, 0, 1.35), t: [0, hc + .03, -.004], s: [hw * 1.1, hh * .62, hw * 1.1 * 1.18], c: shade(bg, 1.05) });
    for (const sg of [-1, 1]) {
      hairP.push({ g: gSphere(1, 14, 10), t: [sg * hw * 1.7, hc + hh * .5, -.01], r: [0, 0, -sg * 1.0], s: [hw * 1.2, hh * .62, hw * .3], c: shade(bg, .82) });
      hairP.push({ g: gSphere(1, 12, 8), t: [sg * hw * 1.7, hc + hh * .5, .004], r: [0, 0, -sg * 1.0], s: [hw * .85, hh * .46, hw * .24], c: [.96, .72, .72] });
    }
    hairP.push({ g: gCyl(.004, .008, .06, 6, 1), t: [0, hc + hh * .72, .02], r: [.5, 0, .3], c: bg });
    hairP.push({ g: gSphere(1, 8, 6), t: [hw * .62, hc + hh * .5, hw * 1.02], s: [.022, .022, .01], r: [0, 0, .4], c: [1, .85, .2] });
    hairP.push({ g: gBox(.03, .03, .008), t: [hw * .62, hc + hh * .5, hw * 1.04], r: [0, 0, .78], c: [1, .86, .24] });
  } else if (O.key === 'eric') {
    const g1 = rgb('#2d2824');
    hairP.push({ g: gSphere(1, 20, 12, 0, TAU, 0, 1.3), t: [0, hc + .024, -.006], r: [-.12, 0, 0], s: [hw * 1.06, hh * .6, hw * 1.06 * 1.2], cfn: (x, y, z) => mixc(g1, rgb('#7b746c'), clamp((x * x * 400) - .1, 0, .45)) });
    for (const sg of [-1, 1]) hairP.push({ g: gBox(.014, .05, .05), t: [sg * hw * 1.0, hc, 0], c: [.4, .38, .36] });
  } else if (O.key === 'mike') {
    const h1 = rgb('#b0702f'), h2 = rgb('#d89b52'), rr2 = rng(31);
    for (let k = 0; k < 16; k++) { const a = rr2() * TAU, el = rr2() * 1.2, r = hw * (.55 + rr2() * .4); hairP.push({ g: gSphere(.035 + rr2() * .02, 8, 6), t: [Math.sin(a) * Math.cos(el) * r * 1.2, hc + .03 + Math.sin(el) * hh * .52, Math.cos(a) * Math.cos(el) * r * 1.3 - .01], c: mixc(h1, h2, rr2()) }); }
    hairP.push({ g: gSphere(1, 18, 10, 0, TAU, 0, 1.25), t: [0, hc + .026, -.006], s: [hw * 1.04, hh * .6, hw * 1.04 * 1.18], c: h1 });
    for (const sg of [-1, 1]) hairP.push({ g: gSphere(.007, 6, 5), t: [sg * hw * 1.0, hc - .06, 0], c: [.78, .78, .8] });
  }
  if (O.gen) {
    const G2 = O.gen, h1 = rgb(G2.hair), st = G2.style, ac = G2.acc || [], accC = rgb(G2.accC || '#fff'), r3 = rng(O.key.length * 17);
    if (st === 'mask') hairP.push({ g: gSphere(1, 20, 12, 0, TAU, 0, 1.9), t: [0, hc + .005, -.004], s: [hw * 1.06, hh * .98, hw * 1.06 * 1.18], c: [.07, .07, .08] });
    else if (st !== 'bald') hairP.push({ g: gSphere(1, 20, 12, 0, TAU, 0, st === 'bob' ? 1.5 : 1.3), t: [0, hc + .026, -.006], r: [-.2, 0, 0], s: [hw * 1.06, hh * .62, hw * 1.06 * 1.18], c: h1 });
    if (st === 'spiky') for (let k = 0; k < 9; k++) { const a = -1 + k * .25; hairP.push({ g: gCyl(0, .022, .085, 6, 1), t: [Math.sin(a) * hw * .8, hc + hh * .5, hw * 1.0 * Math.cos(a) * 1.05], r: [1.0 + Math.sin(k * 2) * .25, a, 0], c: shade(h1, 1.2) }); }
    if (st === 'long') { hairP.push({ g: gCyl(hw * 1.13, hw * 1.35, .5, 22, 6, true, .26 * PI, 1.48 * PI), t: [0, hc + .03 - .25, -.012], s: [1, 1, 1.12], c: h1 }); }
    if (st === 'bob') hairP.push({ g: gCyl(hw * 1.12, hw * 1.18, .17, 22, 3, true, .2 * PI, 1.6 * PI), t: [0, hc - .05, -.01], s: [1, 1, 1.12], c: h1 });
    if (st === 'ponytail') { hairP.push({ g: gSphere(.05, 8, 6), t: [0, hc + .02, -hw * 1.25], c: h1 }); hairP.push({ g: gCyl(.04, .02, .3, 8, 2), t: [0, hc - .12, -hw * 1.35], r: [-.25, 0, 0], c: shade(h1, 1.1) }); }
    if (ac.includes('beret')) { hairP.push({ g: gCyl(hw * 1.3, hw * 1.15, .035, 20, 1), t: [.02, hc + hh * .48, -.01], r: [0, 0, -.1], c: accC }); hairP.push({ g: gSphere(.012, 6, 5), t: [.02, hc + hh * .52, -.01], c: accC }); }
    if (ac.includes('goggles')) { hairP.push({ g: gCyl(hw * 1.1, hw * 1.1, .018, 20, 1, true), t: [0, hc + hh * .3, -.004], s: [1, 1, 1.18], c: [.15, .15, .17] }); for (const sg of [-1, 1]) hairP.push({ g: gCyl(.025, .025, .012, 10, 1), t: [sg * .035, hc + hh * .34, hw * 1.2], r: [PI / 2 - .15, 0, 0], c: accC }); }
    if (ac.includes('catears')) for (const sg of [-1, 1]) hairP.push({ g: gCyl(0, .035, .08, 4, 1), t: [sg * hw * .7, hc + hh * .62, .0], r: [0, 0, -sg * .25], c: [.1, .09, .12] });
    if (ac.includes('headband')) hairP.push({ g: gCyl(hw * 1.09, hw * 1.09, .022, 22, 1, true), t: [0, hc + hh * .22, -.004], s: [1, 1, 1.18], c: accC });
    if (ac.includes('flower')) { hairP.push({ g: gSphere(.022, 8, 6), t: [hw * .9, hc + hh * .35, hw * .5], c: accC }); hairP.push({ g: gSphere(.01, 6, 5), t: [hw * .9, hc + hh * .35, hw * .5 + .018], c: [1, .9, .3] }); }
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
    } else if (O.key === 'm2') {
      const pu = rgb('#3b1f5e');
      P.push({ g: gCyl(.07, .066, Lu, 12, 3), t: [0, -Lu / 2, 0], cfn: (x, y) => shade(pu, .85 + .2 * Math.sin(y * 30)) });
      P.push({ g: gCyl(.066, .05, Lf * .96, 12, 3), t: [0, fcy + .005, fcz], r: [elbowRot, 0, 0], cfn: (x, y) => shade(pu, .85 + .2 * Math.sin(y * 34)) });
      P.push({ g: gCyl(.048, .046, .05, 12, 1), t: [0, wy + .02, wz - .004], r: [elbowRot, 0, 0], c: [.18, .1, .3] });
      P.push({ g: gSphere(.04, 10, 8), t: [0, wy - .045, wz + .012], s: [1, 1.35, .9], c: skin });
      const lil = [[.66, .55, .85], [.8, .8, .87], [.55, .47, .78]];
      for (let k = 0; k < 7; k++) P.push({ g: gSphere(.025 + (k % 3) * .006, 7, 5), t: [sg * .04 + sg * (k % 2) * .02, -.04 - k * .065, .01 - (k % 2) * .05], s: [.5, 1.4, 1], c: lil[k % 3] });
    }
    if (O.key === 'sumi') {
      const bg = rgb('#c4a273'), cr = [.97, .93, .86];
      P.push({ g: gCyl(.075, .068, Lu * .95, 12, 2), t: [0, -Lu * .47, 0], c: bg }); P.push({ g: gCyl(.07, .062, Lf * .8, 12, 2), t: [0, fcy + .03, fcz], r: [elbowRot, 0, 0], c: bg });
      P.push({ g: gSphere(.062, 10, 8), t: [0, wy - .02, wz + .01], s: [1, 1.1, 1], c: cr });
    } else if (O.key === 'eric') {
      const gj = rgb('#554d46');
      P.push({ g: gCyl(.075, .068, Lu, 12, 3), t: [0, -Lu / 2, 0], cfn: (x, y) => shade(gj, .9 + .1 * Math.sin(y * 30)) }); P.push({ g: gCyl(.066, .056, Lf * .95, 12, 3), t: [0, fcy, fcz], r: [elbowRot, 0, 0], cfn: (x, y) => shade(gj, .92 + .1 * Math.sin(y * 28)) });
      P.push({ g: gCyl(.052, .05, .03, 12, 1), t: [0, wy + .03, wz - .004], r: [elbowRot, 0, 0], c: [.95, .95, .93] }); P.push({ g: gSphere(.04, 10, 8), t: [0, wy - .045, wz + .012], s: [1, 1.35, .9], c: skin });
      if (side === 0) P.push({ g: gCyl(.04, .04, .02, 14, 1, true), t: [0, wy + .008, wz - .003], r: [elbowRot, 0, 0], c: [.75, .75, .78] });
    } else if (O.key === 'mike') {
      const hd = rgb('#d9cfc0');
      P.push({ g: gCyl(.08, .076, Lu, 12, 3), t: [0, -Lu / 2, 0], cfn: (x, y) => shade(hd, .88 + .15 * Math.sin(y * 24)) }); P.push({ g: gCyl(.082, .07, Lf * .92, 12, 3), t: [0, fcy, fcz], r: [elbowRot, 0, 0], cfn: (x, y) => shade(hd, .88 + .15 * Math.sin(y * 22)) });
      P.push({ g: gCyl(.06, .056, .045, 12, 1), t: [0, wy + .02, wz - .004], r: [elbowRot, 0, 0], c: shade(hd, .8) }); P.push({ g: gSphere(.04, 10, 8), t: [0, wy - .045, wz + .012], s: [1, 1.35, .9], c: skin });
    }
    if (O.gen) {
      const G2 = O.gen, tc = rgb(G2.top), t2 = rgb(G2.top2), long = O.key !== 'bolt';
      P.push({ g: gCyl(.07, .066, Lu, 12, 3), t: [0, -Lu / 2, 0], cfn: (x, y) => shade(tc, .92 + .08 * Math.sin(y * 30)) });
      P.push({ g: gCyl(.066, .056, Lf * .95, 12, 3), t: [0, fcy, fcz], r: [elbowRot, 0, 0], c: O.key === 'troll' ? [.08, .08, .09] : (O.key === 'bolt' || O.key === 'lydia' ? skin : tc) });
      P.push({ g: gCyl(.058, .056, .04, 12, 1), t: [0, wy + .03, wz - .004], r: [elbowRot, 0, 0], c: t2 }); P.push({ g: gSphere(.04, 10, 8), t: [0, wy - .045, wz + .012], s: [1, 1.35, .9], c: skin });
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
    } else if (O.key === 'm2') {
      const t = rgb('#17171c'), Lt = .45, Ls = hipY - Lt - .07;
      P.push({ g: gCyl(.118, .112, Lt, 14, 3), t: [0, -Lt / 2, 0], cfn: (x, y) => shade(t, 1.05 + .08 * Math.sin(y * 25)) });
      P.push({ g: gCyl(.112, .128, Ls, 14, 3), t: [0, -Lt - Ls / 2, 0], cfn: (x, y) => shade(t, 1.0 + .08 * Math.sin(y * 22)) });
      P.push({ g: gBox(.075, .19, .14), t: [sg * .115, -.3, .01], c: shade(t, 1.25) }); P.push({ g: gBox(.082, .035, .15), t: [sg * .115, -.215, .01], c: shade(t, .8) });
      P.push({ g: gBox(.012, .15, .03), t: [sg * .158, -.3, .085], c: [.35, .35, .38] }); P.push({ g: gBox(.04, .012, .02), t: [sg * .13, -.265, .085], c: [.4, .4, .42] });
      P.push({ g: gCyl(.128, .13, .02, 14, 1, true), t: [0, -hipY + .075, 0], c: [.1, .1, .12] });
      shoe(P, { sole: .042, soleC: [.93, .93, .96], up: [.23, .14, .38], toe: [.72, .7, .77], heel: [.72, .7, .77] });
    }
    if (O.key === 'sumi') {
      const bg = rgb('#c4a273'), cr = [.97, .93, .86];
      P.push({ g: gCyl(.09, .082, hipY * .95, 12, 2), t: [0, -hipY * .47, 0], c: bg }); P.push({ g: gSphere(1, 12, 8), t: [0, -hipY + .035, .045], s: [.085, .055, .12], c: cr });
    } else if (O.key === 'eric') {
      const t = rgb('#4f4842'), Lt = .45, Ls = hipY - Lt - .07;
      P.push({ g: gCyl(.1, .09, Lt, 14, 3), t: [0, -Lt / 2, 0], cfn: (x, y) => shade(t, 1.05 + .06 * Math.sin(y * 30)) }); P.push({ g: gCyl(.09, .082, Ls, 14, 3), t: [0, -Lt - Ls / 2, 0], c: shade(t, .96) });
      shoe(P, { sole: .03, soleC: [.06, .05, .05], up: [.1, .07, .06] });
    } else if (O.key === 'mike') {
      const t = rgb('#2a2522'), Lt = .45, Ls = hipY - Lt - .075;
      P.push({ g: gCyl(.125, .12, Lt, 14, 3), t: [0, -Lt / 2, 0], cfn: (x, y) => shade(t, 1.0 + .1 * Math.sin(y * 22)) }); P.push({ g: gCyl(.12, .13, Ls, 14, 3), t: [0, -Lt - Ls / 2, 0], c: shade(t, .95) });
      P.push({ g: gBox(.07, .16, .12), t: [sg * .13, -.3, .01], c: shade(t, 1.3) });
      shoe(P, { sole: .045, soleC: [.9, .9, .92], up: [.82, .82, .85], toe: [.55, .55, .6], heel: [.5, .5, .55] });
    }
    if (O.gen) {
      const G2 = O.gen, t = rgb(G2.pants), Lt = .45, Ls = hipY - Lt - .07, sk2 = rgb(G2.shoe);
      P.push({ g: gCyl(.105, .09, Lt, 14, 3), t: [0, -Lt / 2, 0], cfn: (x, y) => shade(t, 1.04 + .05 * Math.sin(y * 28)) }); P.push({ g: gCyl(.09, .082, Ls, 14, 3), t: [0, -Lt - Ls / 2, 0], c: shade(t, .96) });
      shoe(P, { sole: .035, soleC: shade(sk2, .7), up: sk2 });
    }
    legG.push(mergeGeos(P));
  }
  // ---- 軀幹附屬物（尾巴／背包／耳機…，與軀幹同座標）
  const ex = [];
  if (O.key === 'sumi') {
    const tc = rgb('#efe0c4'), tb = rgb('#d6b88c');
    ex.push({ g: gSphere(1, 16, 12), t: [0, hipY + .22, -.2], s: [.14, .3, .16], r: [.5, 0, 0], cfn: (x, y) => mixc(tb, tc, clamp((y - hipY) * 1.6, 0, 1)) });
    ex.push({ g: gBox(.09, .04, .03), t: [-.03, hipY + .12, -.3], r: [0, 0, .5], c: [.06, .06, .08] }); ex.push({ g: gBox(.09, .04, .03), t: [.03, hipY + .12, -.3], r: [0, 0, -.5], c: [.06, .06, .08] }); ex.push({ g: gSphere(.025, 8, 6), t: [0, hipY + .12, -.3], c: [.06, .06, .08] });
    ex.push({ g: gBox(.15, .12, .08), t: [.19, hipY + .08, .02], c: [.08, .08, .1] });
  } else if (O.key === 'mike') {
    ex.push({ g: gBox(.34, .46, .16), t: [0, hipY + .4, -.2], c: [.1, .1, .12] }); ex.push({ g: gBox(.26, .16, .05), t: [0, hipY + .34, -.3], c: [.16, .16, .18] });
    for (const sg of [-1, 1]) ex.push({ g: gBox(.04, .42, .03), t: [sg * .13, hipY + .42, .17], c: [.07, .07, .08] });
    ex.push({ g: gCyl(.15, .15, .035, 16, 1, true), t: [0, shY - .01, -.005], s: [1.12, 1, .95], c: [.78, .78, .82] });
    for (const sg of [-1, 1]) ex.push({ g: gCyl(.045, .045, .04, 12, 1), t: [sg * .15, shY - .03, .02], r: [0, 0, PI / 2], c: [.7, .7, .75] });
  } else if (O.key === 'eric') {
    ex.push({ g: gBox(.05, .03, .02), t: [-.12, hipY + .46, .12], c: [.95, .95, .93] });
  }
  if (O.gen) {
    const ac = O.gen.acc || [], accC = rgb(O.gen.accC || '#fff');
    if (ac.includes('scarf')) ex.push({ g: gCyl(.16, .17, .07, 16, 1, true), t: [0, shY - .0, .0], s: [1.1, 1, 1], c: accC });
    if (ac.includes('skullbelt')) { ex.push({ g: gBox(.4, .08, .22), t: [0, hipY + .06, 0], c: [.14, .14, .16] }); ex.push({ g: gBox(.13, .1, .02), t: [0, hipY + .06, .125], c: [.8, .8, .85] }); }
    if (O.key === 'ray') ex.push({ g: gBox(.26, .02, .02), t: [0, hipY + .3, .21], c: [.22, .82, 1] });
    if (O.key === 'eagle') ex.push({ g: gBox(.05, .04, .02), t: [.12, hipY + .45, .2], c: [.88, .7, .2] });
  }
  const exG = ex.length ? mergeGeos(ex) : null;
  const faceTex = R.tex(paintFace(O), { aniso: 8 }), torsoTex = R.tex(paintTorso(O), { aniso: 8 });
  return {
    O, dim, meshes: { extra: exG ? R.mkMesh(exG) : null, torso: R.mkMesh(tg), head: R.mkMesh(hg), hair: R.mkMesh(hairG), armL: R.mkMesh(armG[0]), armR: R.mkMesh(armG[1]), legL: R.mkMesh(legG[0]), legR: R.mkMesh(legG[1]) },
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
  const txt = a.fake || a.number || '0'.repeat(G.codeLen || 4); let w = g.measureText(txt).width; const sc = Math.min(1, 220 / w); g.save(); g.translate(128, 68); g.scale(sc, 1); g.fillText(txt, 0, 0); g.restore();
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
  placeM(M, U, 0, 0, 0, 0, 0, C.wide, C.torS, C.wide, 0, -d.hipY, 0); R.draw(mt.torso, M, ms.torso); if (mt.extra) R.draw(mt.extra, M, ms.cloth);
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
  if (a.number === '' && !a.fake) return;
  const sc = a.plateScale || 1, k = C.head, eg = G.sk && G.sk.eagle.t > 0 && G.sk.eagle.by;
  if (eg) { const yy = a.y + hipN + chinN + (O.plateY - d.chinY) * k + .12, ps = sc * 2.2; M4.trs(M, a.x, yy, a.z, 0, Math.atan2(eg.x - a.x, eg.z - a.z), 0, .40 * ps * 1.1, .19 * ps * 1.1, 1); R.draw(AV.plateMesh, M, a.plateMat); return; }
  placeM(M, U, 0, chinN + (O.plateY - d.chinY) * k + .04 * (sc - 1), O.plateZ * k, -.14, 0, .40 * sc * 1.1, .19 * sc * 1.1, 1); R.draw(AV.plateMesh, M, a.plateMat);
}
function drawBlob(a, tint) {
  const T = AV.tmp, s = a.blobS || 1.1;
  M4.trs(T, a.x + .12, (a.gy || 0) + .035, a.z + .08, 0, 0, 0, s, 1, s); R.draw(AV.blob, T, AV.blobMat);
}
