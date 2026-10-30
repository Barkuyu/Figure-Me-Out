/* ================= 遊戲邏輯 ================= */
const STEP = .45, RAD = .22, GRAV = 22, EYE = 1.62;
const isDM = () => G.mode === 'dm' || G.mode === 'hunt';
const VIS_OUTFITS = OUTFITS.map((o, i) => o.hidden ? -1 : i).filter(i => i >= 0);
const NAMES = ['Honda', '小明', '阿杰', 'Mia', 'Ken', 'Luna', 'Jay', 'Yuki', '小美', 'Leo', '阿宏', 'Nina', 'Ray', '小雨', 'Zoe', 'Max', '阿德', 'Coco', 'Tom', 'Eli'];
/* 新增模式只要在這裡加一筆；demo:false 代表電腦無法示範（需真人操作），示範選單會自動排除並提示 */
const MODES = {
  dm: { name: '個人死鬥', sub: '人人為敵', desc: '所有人互相淘汰，最先達到 15 次淘汰者獲勝', time: 300, limit: 15, short: '人人為敵，先淘汰 15 人者獲勝' },
  tdm: { name: '團隊死鬥', sub: '紅 vs 藍', desc: '紅藍兩隊對戰，隊伍先累積 30 次淘汰者獲勝', time: 360, limit: 30, short: '紅藍對戰，隊伍先累積 30 次淘汰者獲勝' },
  hunt: { name: '激鬥追捕', sub: '追殺電腦角色', desc: '玩家頭上沒有號碼，只能追殺電腦角色，連殺積分更高；時間到積分最高或最先 100 分者獲勝', time: 300, limit: 100, demo: false, short: '只追殺電腦、連殺加分，100 分或時間到積分最高者勝' },
  arena: { name: '擂台逃殺', sub: '🔒 敬請期待', soon: true, desc: '敬請期待，玩法即將公開', time: 300, limit: 1, demo: false, short: '敬請期待，玩法即將公開' },
  ctf: { name: '奪旗', sub: '搶旗帶回基地', desc: '搶走敵方旗幟帶回己方基地得分，先得 3 分獲勝', time: 480, limit: 3, short: '搶走敵方旗幟帶回己方基地，先得 3 分獲勝' }
};
const ITEMS = { cam: { ico: '📷', name: '相機' }, quake: { ico: '🌋', name: '地牛控制器' }, scope: { ico: '🔍', name: '偵查鏡' }, fake: { ico: '🎫', name: '假號碼牌' }, spring: { ico: '⛲', name: '神仙泉水' } };
const DIFF = [{ base: 1.9, type: 1.5, name: '輕鬆', desc: '電腦讀碼慢、出手遲鈍，適合新手練習' }, { base: 1.25, type: 1.0, name: '普通', desc: '電腦速度與反應適中，標準對戰' }, { base: .85, type: .7, name: '困難', desc: '電腦讀碼快、輸入迅速，考驗反應力' }, { base: 1.25, type: 1.0, name: '干擾者', troll: true, desc: '機器人不殺人，只四處亂跑丟道具搗亂' }];

const G = {
  state: 'menu', mode: 'dm', time: 0, tleft: 300, limit: 15, actors: [], player: null, scores: [0, 0], grenades: [], smokes: [], lures: [], pickups: [], flags: [], fx: [], feed: [],
  typed: '', lock: 0, slots: [null, null], itemCd: 0, bino: false, binK: 0, energy: 1, stam: 1, stamDelay: 0, flashT: 0, flashMax: 1, photoReq: false, fp: { k: 0, throwT: 0, camT: 0 },
  camY: 1.6, camBob: 0, fov: 1.3, threat: null, endInfo: null, step: 0, preview: null, shake: 0, endT: 0, winner: ''
};
let _id = 0;
const FWD = (yaw) => [-Math.sin(yaw), -Math.cos(yaw)];

/* ---------- 角色 ---------- */
function freeActors(list) { for (const a of list || []) { R.freeTex(a.plateTex); R.freeTex(a.nameTex); a.plateTex = null; a.nameTex = null; } }
function newActor(name, outfit, isPlayer) {
  const a = {
    id: _id++, name, isPlayer, outfit, av: createAvatar(outfit), team: -1, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, yaw: 0, pitch: 0, alive: false, onGround: true, number: '0000', kills: 0, deaths: 0,
    animT: Math.random() * 6, sp: 0, fall: 0, deadT: 0, respawnT: 0, protect: 0, blind: 0, fx: 0, fz: -1, gy: 0, carry: null, armUp: 0,
    read: {}, typing: null, tgt: null, tgtT: 0, path: [], pi: 0, goal: null, goalT: 0, scanAcc: 0, scanInt: .15, stuckT: 0, lx: 0, lz: 0, item: null, cd: 3 + Math.random() * 5, lure: null, role: 0, strafe: 1, strafeT: 0, repT: 0,
    remote: false, peer: '', slots: null, rsC: 0, net: null, lastSeq: 0, missT: 0, speed: (4.0 + Math.random() * .7) * 1.3, smart: false, mode: 'roam', modeT: 0, evadeCd: 0, threatT: 0, reader: null, ambushFace: null, lastKillT: -99, range: 36, scaleBase: 1, killedBy: null, nameTex: null, lo: 0, lean: 0, skCd: 0, shieldT: 0, say: null
  };
  makePlate(a); return a;
}
function assignNumber(a) {
  const mix = !G.codeLen, L = G.codeLen || randi(3, 6); let n; do { n = String(randi(Math.pow(10, L - 1), Math.pow(10, L) - 1)); } while (G.actors.some(o => o !== a && (o.number === n || (mix && (o.number.startsWith(n) || n.startsWith(o.number))))));
  a.number = n; drawPlate(a);
}
function spawnActor(a, fixed) {
  const avoid = G.actors.filter(o => o !== a && o.alive);
  const p = fixed || World.pickSpawn(isDM() ? -1 : a.team, avoid) || [0, 0];
  a.x = p[0] + (fixed ? 0 : rand(-.4, .4)); a.z = p[1] + (fixed ? 0 : rand(-.4, .4)); a.y = (fixed ? fixed[3] : p[2]) ? World.mezz.h : 0; a.vx = a.vy = a.vz = 0; a.alive = true; a.fake = null; a.fakeT = 0; a.dashT = 0; a.dashReady = false; a.fall = 0; a.protect = 1.8; a.blind = 0; a.carry = null; a.read = {}; a.typing = null; a.tgt = null; a.path = []; a.goal = null; a.lure = null; a.deadT = 0;
  const c = a.team === 0 ? World.cur.faceRed : a.team === 1 ? World.cur.faceBlue : [0, 0]; a.yaw = fixed ? fixed[2] : Math.atan2(-(c[0] - a.x), -(c[1] - a.z)) + rand(-.4, .4); a.pitch = 0; a.sp = 0; a.redT = 0;
  if (a.remote) { a.rsC = (a.rsC || 0) + 1; a.net = null; }
  if (G.mode === 'hunt' && !G.multi && (a.isPlayer || a.remote)) { a.number = ''; a.fake = null; drawPlate(a); } else assignNumber(a);
  if (!a.isPlayer && !a.remote) {
    a.slots = [null, null]; a.mode = 'roam'; a.threatT = 0; a.reader = null;
  }
}
/* 開場：所有人平均散布在地圖各處（最遠點取樣），且每人的視野內看不到任何其他角色 */
function spawnAll() {
  const A = G.actors, n = A.length, cells = World.walkCells, pts = [pick(cells)], MH = World.mezz ? World.mezz.h : 0, ey = p => 1.62 + (p[2] ? MH : 0), dxz = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) + ((p[2] | 0) !== (q[2] | 0) ? 4 : 0);
  while (pts.length < n) {
    let best = null, bd = -1;
    for (let k = 0; k < 90; k++) { const c = pick(cells); let md = 1e9; for (const q of pts) md = Math.min(md, dxz(c, q)); md += Math.random() * 5; if (md > bd) { bd = md; best = c; } }
    pts.push(best);
  }
  pts.sort(() => Math.random() - .5);
  const ang = [], vis = []; for (let i = 0; i < n; i++) { ang.push(new Array(n).fill(0)); vis.push(new Array(n).fill(false)); }
  const calc = i => { for (let j = 0; j < n; j++) { if (j === i) continue; const a = pts[i], b = pts[j], v = los(a[0], ey(a), a[1], b[0], ey(b) + .03, b[1]); vis[i][j] = vis[j][i] = v; ang[i][j] = Math.atan2(-(b[0] - a[0]), -(b[1] - a[1])); ang[j][i] = Math.atan2(-(a[0] - b[0]), -(a[1] - b[1])); } };
  for (let i = 0; i < n; i++) calc(i);
  const yawFor = i => {
    const st = Math.random() * TAU; let by = st, bc = 1e9, bo = false; const p = pts[i];
    for (let k = 0; k < 72; k++) {
      const yaw = st + k * TAU / 72; let seen = 0;
      for (let j = 0; j < n; j++) if (j !== i && vis[i][j] && Math.abs(angDiff(yaw, ang[i][j])) < 1.1) seen++;
      if (seen > bc) continue;
      const open = seen === 0 && los(p[0], ey(p), p[1], p[0] - Math.sin(yaw) * 9, ey(p), p[1] - Math.cos(yaw) * 9);
      if (seen < bc || (open && !bo)) { bc = seen; by = yaw; bo = open; if (seen === 0 && open) break; }
    }
    return [by, bc];
  };
  for (let pass = 0; pass < 40; pass++) {
    let bad = 0;
    for (let i = 0; i < n; i++) {
      const r = yawFor(i); if (r[1] === 0) continue; bad++;
      let best = null, bd = -1;
      for (let k = 0; k < 60; k++) { const c = pick(cells); let md = 1e9; for (let j = 0; j < n; j++) if (j !== i) md = Math.min(md, dxz(c, pts[j])); md += Math.random() * 3 + (Math.abs(c[0]) / World.bounds.x1 + Math.abs(c[1]) / World.bounds.z1) * 5; if (md > bd) { bd = md; best = c; } }
      pts[i] = best; calc(i);
    }
    if (!bad) break;
  }
  for (let i = 0; i < n; i++) spawnActor(A[i], [pts[i][0], pts[i][1], yawFor(i)[0], pts[i][2] | 0]);
}
/* ---------- 角色技能 ---------- */
const SKILL_OF = ['rev', 'shield', 'scr', null, 'cloak', null, 'ink', 'eagle', null, 'lydia', 'mind', null, null, null, null, 'steal', 'dack', 'nox'];
const PASSIVE_IDX = [3, 5, 8, 11, 12, 13];
const isOut = (a, i) => skOn() && a.av && (a.av.outfitIdx === i || a.passIdx === i); // 對應 OUTFITS：蘇蘇／艾迪／艾伯特／蘇米(被動)／艾瑞克／麥克(被動)
const skOn = () => G.skillsOn !== false;
const isSumi = a => isOut(a, 3);
const jumpMul = a => isSumi(a) ? 1.285 : 1; // 高度 1.65 倍 → 初速 √1.65 倍
const speedMul = a => isOut(a, 5) ? 2.5 : isOut(a, 13) ? .7 : 1;
const SKILLS = { steal: { name: '命運拷貝', cd: 1, ico: '🔮' }, dack: { name: '生化操作', cd: 15, ico: '🧪' }, nox: { name: '夜間戰術', cd: 30, ico: '🌑' }, ink: { name: '烏賊戲法', cd: 25, ico: '🦑' }, eagle: { name: '靶靶命中', cd: 20, ico: '🎯' }, lydia: { name: '幻影蹤跡', cd: 20, ico: '🐱' }, mind: { name: '心靈控制', cd: 20, ico: '🌀' }, cloak: { name: '幻影易容', cd: 25, ico: '🎭' }, rev: { name: '顛倒乾坤', cd: 20, ico: '🔄' }, shield: { name: '銅牆鐵壁', cd: 15, ico: '🛡️' }, scr: { name: '紫電干擾', cd: 25, ico: '⚡' } };
const DACK_T = 21; // 濃霧：1 秒戴鏡 + 20 秒噴發
const immune = a => isOut(a, 11) && (a.cleanW || 0) > 0 && a.alive; // 蕾西亞淨化窗口：無效化一切攻擊與技能
const SCR_FLASH = 0, SCR_TOTAL = 5.0; // 預警閃光 3 秒（4 次短閃 + 1.8 秒長閃）+ 錯亂 5 秒
const skillOf = a => SKILL_OF[a.av.outfitIdx] ? SKILLS[SKILL_OF[a.av.outfitIdx]] : null;
const revActive = a => G.sk && G.sk.rev.t > 0 && G.sk.rev.by !== a && a.clrRev !== G.sk.rev.id;
const inkActive = a => G.sk && G.sk.ink.t > 0 && G.sk.ink.by !== a && a.clrInk !== G.sk.ink.id;
const scrPhase2 = a => G.sk && G.sk.scr.t >= SCR_FLASH && G.sk.scr.by !== a && a.clrScr !== G.sk.scr.id;
function skReset() { G.sk = { night: { e: 0, by: null }, quake: { t: 0, by: null }, rev: { t: 0, by: null, id: 0 }, scr: { t: -1, by: null, id: 0 }, ink: { t: 0, by: null, id: 0 }, eagle: { t: 0, by: null } }; G.skId = 0; for (const a of G.actors) { a.skCd = 0; a.shieldT = 0; a.say = null; a.cloak = false; a.invis = false; a.dackE = -1; a.armed = false; a.stolen = null; a.passIdx = -1; a.rayJ = false; a.ctrlT = 0; a.cleanT = 2; a.cleanW = 0; a.binAt = -99; a.clrRev = a.clrScr = a.clrInk = -1; } }
function cleanse(a, quiet) { a.blind = 0; a.ctrlT = 0; a.redT = 0; a.clrRev = G.sk.rev.id; a.clrScr = G.sk.scr.id; a.clrInk = G.sk.ink.id; if (quiet) { if (a.isPlayer) { G.flashT = 0; G.freezeT = 0; G.lock = 0; } return; } a.cleanFx = .7; if (a.isPlayer) { G.flashT = 0; G.freezeT = 0; G.lock = 0; UI.cleanse(); } }
function ericHit(p, code) { // 艾瑞克的偽裝號碼被輸入：立即冷卻；若輸入者輸的是自己頭上的號碼則淘汰（不計擊殺／積分）
  const e = G.actors.find(o => o.alive && o !== p && o.fake === code && o.fakeOf); if (!e) return false;
  uncloak(e, true); if (p.number !== code || p.protect > 0 || immune(p)) return false;
  p.streak = 0; const m = p.name + ' 中了艾瑞克的陷阱，輸入了自己的號碼！'; UI.msg(m, p.isPlayer ? 'bad' : 'item'); netMsg(m, 'item'); eliminate(p, p); return true;
}
function skMsg(a, t) { const m = a.name + ' ' + t; UI.msg(m, 'item'); netMsg(m, 'item'); }
function puffFx(a) { for (let i = 0; i < 6; i++) G.fx.push({ k: 'puff', x: a.x + rand(-.4, .4), y: a.y + rand(.6, 1.5), z: a.z + rand(-.4, .4), t: 0, d: .3 + rand(0, .5) }); }
function uncloak(a, smoke) { if (!a.fake) return; if (a.fakeOf && a.av && a.av.outfitIdx === 4 && a.alive) a.skCd = Math.max(a.skCd || 0, SKILLS.cloak.cd); a.fake = null; a.fakeT = 0; a.fakeOf = null; drawPlate(a); if (smoke) puffFx(a); }
function castSkill(a) {
  if (!skOn() || !a || !a.alive || G.state !== 'playing' || G.countdown > 0) return false;
  const base = SKILL_OF[a.av.outfitIdx]; if (!base) return false;
  if (base === 'steal') {
    if (a.stolen) { const k = a.stolen; a.stolen = null; return runSkill(a, k, false); }
    if (a.armed) return false; a.armed = true; skMsg(a, '發動【命運拷貝】！等待竊取下一個擊殺對象的技能'); (a.kp || (a.kp = {})).R = G.time + .5; if (a.isPlayer) Sfx.skill(); return true;
  }
  if ((a.skCd || 0) > 0) return false;
  return runSkill(a, base, true);
}
function runSkill(a, k, useCd) {
  if (k === 'cloak' && a.fake) return false; if (useCd) a.skCd = (k === 'cloak' ? 0 : SKILLS[k].cd) + (k === 'dack' ? DACK_T : k === 'nox' ? 31.5 : 0);
  if (k === 'rev') { G.sk.rev = { t: 7, by: a, id: ++G.skId }; skMsg(a, '發動【顛倒乾坤】！其他人的移動方向反轉 7 秒'); }
  else if (k === 'scr') { G.sk.scr = { t: 0, by: a, id: ++G.skId }; skMsg(a, '發動【紫電干擾】！其他人的數字鍵錯亂 5 秒'); }
  else if (k === 'ink') { G.sk.ink = { t: 3, by: a, id: ++G.skId }; for (const o of G.actors) if (o !== a && o.alive && !o.isPlayer && !o.remote && !immune(o)) { o.blind = Math.max(o.blind, 3); o.typing = null; } skMsg(a, '發動【烏賊戲法】！其他人的視野被墨汁遮住'); }
  else if (k === 'eagle') { G.sk.eagle = { t: 7, by: a }; skMsg(a, '發動【靶靶命中】！所有號碼牌轉向放大'); }
  else if (k === 'lydia') { puffFx(a); a.cloak = true; a.cloakE = 0; if (a.isPlayer) UI.msg('隱身 5 秒（擊殺可延長，輸錯號碼會現形）', 'item'); }
  else if (k === 'mind') { let n = 0; for (const o of G.actors) { if (o === a || !o.alive) continue; if (Math.hypot(o.x - a.x, o.z - a.z) <= 5 && !immune(o)) { o.ctrlT = 2.5; o.ctrlBy = a; o.typing = null; n++; } } skMsg(a, '發動【心靈控制】！' + (n ? n + ' 人被控制' : '範圍內無人')); }
  else if (k === 'cloak') {
    puffFx(a); let best = null, bd = 1e9; const fx = FWD(a.yaw);
    for (const o of G.actors) { if (o === a || !o.alive || o.fake) continue; const dx = o.x - a.x, dz = o.z - a.z, d = Math.hypot(dx, dz) || 1, front = (dx * fx[0] + dz * fx[1]) / d; const sc = d + (front > .3 && los(a.x, a.y + 1.6, a.z, o.x, o.y + 1.65, o.z) ? 0 : 40); if (sc < bd) { bd = sc; best = o; } }
    if (best) { a.fake = best.number; a.fakeT = 20; a.fakeOf = best; drawPlate(a); if (a.isPlayer) UI.msg('已偽裝成 ' + best.name + ' 的號碼', 'item'); } else a.skCd = 3;
  }
  else if (k === 'dack') { a.dackE = 0; skMsg(a, '發動【生化操作】！戴上透視鏡，濃霧即將噴發'); }
  else if (k === 'nox') { G.sk.night = { e: 0, by: a }; skMsg(a, '發動【夜間戰術】！黑雲籠罩全場'); }
  else { a.shieldT = 6; if (a.isPlayer) UI.msg('護盾展開！6 秒內擋下一次攻擊', 'item'); }
  (a.kp || (a.kp = {})).R = G.time + .5; if (a.isPlayer || a === G.view) Sfx.skill(); return true;
}
function castSkillPlayer() { const p = G.player; if (!p || G.demo || G.state !== 'playing') return; if (G.netClient) { if ((p.skCd || 0) <= 0 && p.alive) { netAct(['s']); p.skCd = 0.01; } return; } castSkill(p); UI.dirty = true; }
function skTick(dt) {
  if (G.sk.ink.t > 0) G.sk.ink.t -= dt; if (G.sk.eagle.t > 0) G.sk.eagle.t -= dt; if (G.sk.quake.t > 0) G.sk.quake.t -= dt;
  if (G.sk.night.by) { G.sk.night.e += dt; if (G.sk.night.e >= 31.5 || !G.sk.night.by.alive) G.sk.night.by = null; }
  { let lead = null, mx = 1; if (G.mode === 'dm') { for (const a of G.actors) { if (a.kills > mx) { mx = a.kills; lead = a; } else if (a.kills === mx && lead) lead = null; } } G.bountyId = lead && lead.kills >= 2 ? lead : null; }
  if (G.mode === 'hunt') { const hs = G.actors.filter(a => a.isPlayer || a.remote).sort((x, y) => (y.score || 0) - (x.score || 0)); hs.forEach((a, i) => { a.boost = hs.length >= 2 && (i + 1) > hs.length / 2; }); }
  for (const a of G.actors) {
    if (a.boost && a.skCd > 0) a.skCd = Math.max(0, a.skCd - dt);
    if (a.dackE >= 0) { a.dackE += dt; if (a.dackE > DACK_T || !a.alive) a.dackE = -1; }
    a.ctrlT = Math.max(0, (a.ctrlT || 0) - dt); a.cleanFx = Math.max(0, (a.cleanFx || 0) - dt);
    if (isOut(a, 11) && a.alive) { a.cleanT = (a.cleanT ?? 2) - dt; if (a.cleanT <= 0) { a.cleanT = 2; a.cleanW = .5; cleanse(a); } else if ((a.cleanW || 0) > 0) { a.cleanW -= dt; cleanse(a, true); } } else a.cleanW = 0;
    const og = a.remote ? (a.y - groundAt(a.x, a.z, a.y + .1) < .06) : a.onGround;
    { const vy = a.remote ? (a.y - (a._py ?? a.y)) / Math.max(dt, .001) : a.vy; a._py = a.y; if (a._og && !og) { a.rayJ = vy > 2.2; a.airT = 0; } if (a.rayJ) { if (og && a.airT > .06) a.rayJ = false; else a.airT = (a.airT || 0) + dt; } a._og = og; }
    if (a.cloak) { a.cloakE += dt; if (a.cloakE >= 5 || !a.alive) a.cloak = false; }
    const ray = isOut(a, 8) && a.rayJ, ly = a.cloak && !(a.cloakE >= 1.5 && (a.cloakE % 1.5) < .1);
    a.invis = a.alive && (ray || ly);
  }
  for (const a of G.actors) { if (a.fake) { a.fakeT -= dt; if (a.fakeT <= 0 || !a.alive || (a.fakeOf && (!a.fakeOf.alive || a.fakeOf.number !== a.fake))) uncloak(a, a.alive && !!a.fakeOf); } a.skCd = Math.max(0, (a.skCd || 0) - dt); a.shieldT = Math.max(0, (a.shieldT || 0) - dt); if (a.say) { a.say.t -= dt; if (a.say.t <= 0) a.say = null; } }
  if (G.sk.rev.t > 0) G.sk.rev.t -= dt; if (G.sk.scr.t >= 0) { G.sk.scr.t += dt; if (G.sk.scr.t >= SCR_TOTAL) G.sk.scr.t = -1; }
}
function blockHit(att, t) {
  t.shieldT = 0; t.say = { txt: pick(['哼，沒那麼容易！', '擋住囉～換新號碼！', '想讀我？再練練吧！', '嘿嘿，這就換掉！']), t: 1.5 };
  assignNumber(t); t.protect = Math.max(t.protect, .4); t.read = {};
  for (const o of G.actors) { if (o.read) o.read[t.id] = 0; if (o.typing && o.typing.target === t) o.typing = null; }
  const m = t.name + ' 的護盾擋下了 ' + att.name + ' 的攻擊！'; UI.msg(m, att.isPlayer ? 'bad' : 'item'); netMsg(m, 'item'); if (att.isPlayer) Sfx.wrong();
}
function botSkill(b, dt) {
  if (!skOn()) return; if (!b.alive || G.countdown > 0 || G.state !== 'playing') return; const k = SKILL_OF[b.av.outfitIdx]; if (k !== 'steal' && (b.skCd || 0) > 0) return;
  if (!k) return; if (k === 'steal') { if (b.stolen) { if (Math.random() < dt * .06) castSkill(b); } else if (!b.armed && Math.random() < dt * .2) castSkill(b); return; } if (k === 'shield') { if (b.threatT > 0 && Math.random() < dt * 2.5) castSkill(b); } else if (Math.random() < dt * .035) castSkill(b);
}
const STREAK_PTS = [3, 5, 7, 10, 15], STREAK_TXT = ['', '二連殺', '三連殺', '四連殺', '五連殺'];
function enemyOf(a, o) { return o !== a && o.alive && (isDM() || o.team !== a.team); }

/* ---------- 物理 ---------- */
function collideH(a) {
  const B = World.boxes, r = RAD;
  for (let i = 0; i < B.length; i++) {
    const b = B[i];
    if (b.nc || a.y + STEP >= b.y1 || a.y + 1.7 <= b.y0) continue;
    if (a.x + r <= b.x0 || a.x - r >= b.x1 || a.z + r <= b.z0 || a.z - r >= b.z1) continue;
    const cx = clamp(a.x, b.x0, b.x1), cz = clamp(a.z, b.z0, b.z1), dx = a.x - cx, dz = a.z - cz, d2 = dx * dx + dz * dz;
    if (dx === 0 && dz === 0) {
      const l = a.x - b.x0, rr = b.x1 - a.x, t = a.z - b.z0, bt = b.z1 - a.z, m = Math.min(l, rr, t, bt);
      if (m === l) a.x = b.x0 - r; else if (m === rr) a.x = b.x1 + r; else if (m === t) a.z = b.z0 - r; else a.z = b.z1 + r;
    } else if (d2 < r * r) { const d = Math.sqrt(d2), p = (r - d) / d; a.x += dx * p; a.z += dz * p; }
  }
}
function groundAt(x, z, y, rr) {
  let g = 0; const B = World.boxes, r = rr === undefined ? RAD * .75 : rr;
  for (let i = 0; i < B.length; i++) { const b = B[i]; if (b.nc || b.y1 > y + STEP + 1e-4 || b.y1 <= g) continue; if (x + r > b.x0 && x - r < b.x1 && z + r > b.z0 && z - r < b.z1) g = b.y1; }
  const RP = World.ramps;
  for (let i = 0; i < RP.length; i++) { const q = RP[i]; if (x + r > q.x0 && x - r < q.x1 && z + r > q.z0 && z - r < q.z1) { const h = q.h(clamp(x, q.x0, q.x1), clamp(z, q.z0, q.z1)); if (h <= y + STEP + 1e-4 && h > g) g = h; } }
  return g;
}
function moveActor(a, dt) {
  const dx = a.vx * dt, dz = a.vz * dt, n = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dz)) / .1));
  for (let i = 0; i < n; i++) {
    a.x += dx / n; collideH(a); a.z += dz / n; collideH(a);
    const g0 = groundAt(a.x, a.z, a.y); if (g0 > a.y && g0 - a.y <= STEP + .001) a.y = g0;
  }
  a.vy -= GRAV * dt; a.y += a.vy * dt;
  const g = groundAt(a.x, a.z, a.y); a.gy = g;
  if (a.y <= g + .001) { a.y = g; a.vy = 0; a.onGround = true; } else a.onGround = false;
  if (a.onGround && World.ramps.length) { const rp = World.rampAt(a.x, a.z, a.y, .12); if (rp && rp.belt) { a.x += rp.dir[0] * rp.belt * dt; a.z += rp.dir[1] * rp.belt * dt; collideH(a); } }
}
/* ---------- 視線 ---------- */
function los(ax, ay, az, bx, by, bz) {
  const dx = bx - ax, dy = by - ay, dz = bz - az, B = World.boxes;
  for (let i = 0; i < B.length; i++) {
    const b = B[i]; if (!b.see) continue;
    let t0 = 0, t1 = 1;
    if (Math.abs(dx) < 1e-9) { if (ax < b.x0 || ax > b.x1) continue; } else { let p = (b.x0 - ax) / dx, q = (b.x1 - ax) / dx; if (p > q) { const t = p; p = q; q = t; } if (p > t0) t0 = p; if (q < t1) t1 = q; if (t0 > t1) continue; }
    if (Math.abs(dy) < 1e-9) { if (ay < b.y0 || ay > b.y1) continue; } else { let p = (b.y0 - ay) / dy, q = (b.y1 - ay) / dy; if (p > q) { const t = p; p = q; q = t; } if (p > t0) t0 = p; if (q < t1) t1 = q; if (t0 > t1) continue; }
    if (Math.abs(dz) < 1e-9) { if (az < b.z0 || az > b.z1) continue; } else { let p = (b.z0 - az) / dz, q = (b.z1 - az) / dz; if (p > q) { const t = p; p = q; q = t; } if (p > t0) t0 = p; if (q < t1) t1 = q; if (t0 > t1) continue; }
    return false;
  }
  for (const s of G.smokes) {
    if (s.r < .6) continue;
    const sx = s.x, sy = s.y + 1.4, sz = s.z, l2 = dx * dx + dy * dy + dz * dz || 1;
    let t = ((sx - ax) * dx + (sy - ay) * dy + (sz - az) * dz) / l2; t = clamp(t, 0, 1);
    const cx = ax + dx * t - sx, cy = ay + dy * t - sy, cz = az + dz * t - sz, rr = s.r * .82;
    if (cx * cx + cy * cy + cz * cz < rr * rr) return false;
  }
  return true;
}

/* ---------- 道具 ---------- */
function throwGrenade(owner, type, dx, dy, dz, spd) {
  const g = { x: owner.x + dx * .5, y: owner.y + 1.5 + dy * .5, z: owner.z + dz * .5, vx: dx * spd + owner.vx * .5, vy: dy * spd + 2.4, vz: dz * spd + owner.vz * .5, type, fuse: type === 'flash' ? 1.5 : type === 'smoke' ? 1.1 : 1.2, owner, spin: 0 };
  G.grenades.push(g); if (owner.isPlayer) Sfx.throwS();
}
function detonate(g) {
  if (g.type === 'flash') {
    Sfx.bang(1); G.fx.push({ k: 'flash', x: g.x, y: g.y + .2, z: g.z, t: 0, d: .5 });
    for (const a of G.actors) {
      if (!a.alive) continue; const eyeY = a.y + 1.6, dx = g.x - a.x, dz = g.z - a.z, dist = Math.hypot(dx, dz, g.y - eyeY);
      if (dist > 30 || !los(g.x, g.y + .2, g.z, a.x, eyeY, a.z)) continue;
      const f = FWD(a.yaw), face = (f[0] * dx + f[1] * dz) / (Math.hypot(dx, dz) || 1), k = face > -.1 ? 1 : .35, dur = clamp(4.6 * (1 - dist / 30) * k + .4, 0, 5);
      if (a.isPlayer) { G.flashT = Math.max(G.flashT, dur); G.flashMax = Math.max(G.flashMax, dur); Sfx.bang(.6); }
      else { a.blind = Math.max(a.blind, dur * .9); a.typing = null; a.read = {}; a.tgt = null; }
    }
  } else if (g.type === 'smoke') {
    Sfx.pop(1); const puffs = []; for (let k = 0; k < 9; k++) puffs.push({ ox: rand(-.6, .6), oy: rand(-.1, .7), oz: rand(-.6, .6), s: rand(1.1, 1.7), ph: rand(0, 6) });
    G.smokes.push({ x: g.x, y: g.y, z: g.z, r: .5, rMax: 5.4, t: 0, life: 16, puffs });
  } else { G.lures.push({ x: g.x, y: g.y, z: g.z, t: 0, life: 7, nt: 0 }); Sfx.pop(.4); }
}
function updateGrenades(dt) {
  const B = World.boxes;
  for (let i = G.grenades.length - 1; i >= 0; i--) {
    const g = G.grenades[i]; g.fuse -= dt; g.spin += dt * 10;
    const inBox = (x, y, z) => { for (let k = 0; k < B.length; k++) { const b = B[k]; if (x > b.x0 - .07 && x < b.x1 + .07 && z > b.z0 - .07 && z < b.z1 + .07 && y > b.y0 && y < b.y1 + .02) return true; } return false; };
    g.vy -= 18 * dt;
    g.x += g.vx * dt; if (inBox(g.x, g.y, g.z)) { g.x -= g.vx * dt; g.vx *= -.4; g.vz *= .8; }
    g.z += g.vz * dt; if (inBox(g.x, g.y, g.z)) { g.z -= g.vz * dt; g.vz *= -.4; g.vx *= .8; }
    g.y += g.vy * dt;
    const gh = groundAt(g.x, g.z, g.y, 0) + .07;
    if (g.y < gh) { g.y = gh; if (Math.abs(g.vy) > 1.8) g.vy = -g.vy * .38; else g.vy = 0; g.vx *= .86; g.vz *= .86; }
    if (g.fuse <= 0) { detonate(g); G.grenades.splice(i, 1); }
  }
  for (let i = G.smokes.length - 1; i >= 0; i--) { const s = G.smokes[i]; s.t += dt; s.r = Math.min(s.rMax, s.r + dt * 6 * (1 - s.r / (s.rMax + .5)) + dt * .5); if (s.t > s.life) G.smokes.splice(i, 1); }
  for (let i = G.lures.length - 1; i >= 0; i--) {
    const l = G.lures[i]; l.t += dt; l.nt -= dt;
    if (l.nt <= 0) {
      l.nt = .7; const p = G.player; if (p) { const d = Math.hypot(p.x - l.x, p.z - l.z); if (d < 45) Sfx.beep(clamp(1 - d / 45, .1, 1)); }
      for (const a of G.actors) if (!a.isPlayer && a.alive && Math.hypot(a.x - l.x, a.z - l.z) < 38 && a.blind <= 0) { a.lure = { x: l.x, z: l.z, t: 4 }; a.read = {}; a.typing = null; a.goal = null; }
    }
    if (l.t > l.life) G.lures.splice(i, 1);
  }
  for (let i = G.fx.length - 1; i >= 0; i--) { G.fx[i].t += dt; if (G.fx[i].t > G.fx[i].d) G.fx.splice(i, 1); }
}
function randomItem() { const r = Math.random(); return r < .3 ? 'cam' : r < .5 ? 'quake' : r < .7 ? 'scope' : r < .85 ? 'fake' : 'spring'; }
function giveItem(i, type) { G.slots[i] = { type, n: type === 'cam' ? 4 : 1 }; }
function grantItem(sl, force) {
  const ty = force || randomItem(), i0 = sl.findIndex(x => x && x.type === ty);
  if (i0 >= 0) { sl[i0].n = Math.min(ty === 'cam' ? 9 : 3, sl[i0].n + (ty === 'cam' ? 3 : 1)); return { i: i0, ty }; }
  const free = !sl[0] ? 0 : !sl[1] ? 1 : -1; if (free < 0) return null; // 道具欄已滿：不更換
  sl[free] = { type: ty, n: ty === 'cam' ? 4 : 1 }; return { i: free, ty };
}
function tryPickup(a) {
  for (const p of G.pickups) {
    if (!p.on) continue; if (Math.abs(p.x - a.x) > 1.5 || Math.abs(p.z - a.z) > 1.5 || Math.abs(p.y - a.y) > 2.2) continue;
    if (a.isPlayer) { if (G.netClient) continue; const r = grantItem(G.slots, isOut(a, 12) && (a.remote ? a.sp > .85 : a.sprinting) ? 'scope' : null); if (!r) continue; Sfx.pick(); UI.msg('獲得 ' + ITEMS[r.ty].name + (G.slots[r.i].n > 1 ? ' ×' + G.slots[r.i].n : ''), 'item'); UI.dirty = true; }
    else if (a.slots) { if (!grantItem(a.slots, isOut(a, 12) && (a.remote ? a.sp > .85 : a.sprinting) ? 'scope' : null)) continue; }
    else continue;
    p.on = false; p.t = 18;
  }
}
/* 道具效果（玩家／電腦／連線訪客共用） */
function applyItem(a, type) {
  if (type === 'quake') { G.sk.quake = { t: 2, by: a }; for (const o of G.actors) if (o !== a && o.alive && !o.isPlayer && !o.remote) o.blind = Math.max(o.blind, .8); const m = a.name + ' 啟動了地牛控制器！'; UI.msg(m, 'item'); netMsg(m, 'item'); }
  else if (type === 'fake') { let n, L = G.codeLen || randi(3, 6); do { n = String(randi(Math.pow(10, L - 1), Math.pow(10, L) - 1)); } while (G.actors.some(o => o.number === n)); a.fake = n; a.fakeT = 7; a.fakeOf = null; drawPlate(a); if (a.isPlayer) UI.msg('號碼已偽裝 7 秒', 'item'); }
  else if (type === 'spring') { a.skCd = 0; if (a.isPlayer) UI.msg('神仙泉水：技能冷卻已刷新！', 'item'); }
}
function useItem(i) {
  const p = G.player; if (!p || !p.alive || G.state !== 'playing' || G.countdown > 0) return;
  const it = G.slots[i]; if (!it || G.itemCd > 0 || G.bino || p.ctrlT > 0) return;
  if (it.type === 'cam') { G.photoReq = true; G.fp.camT = .55; Sfx.shutter(); UI.flashWhite(.35); G.itemCd = 1.0; }
  else if (it.type === 'scope') { if (!G.scopeOn) { G.scopeOn = true; G.itemCd = .3; Sfx.tone(700, .1, 'sine', .1, 200); UI.dirty = true; return; } G.scopeOn = false; G.photoReq = true; G.fp.camT = .55; Sfx.shutter(); UI.flashWhite(.35); G.itemCd = 1.0; }
  else { Sfx.pick(); if (G.netClient) { if (it.type === 'spring') p.skCd = 0; } else applyItem(p, it.type); G.itemCd = .6; }
  if (G.netClient) netAct(['u', i]);
  it.n--; if (it.n <= 0) G.slots[i] = null; UI.dirty = true;
}
function botItems(b, dt, threat) {
  if (!b.slots || b.cd > 0 || b.blind > 0) return; const has = t => b.slots.findIndex(x => x && x.type === t); let i;
  if ((i = has('spring')) >= 0 && b.skCd > 8 && skillOf(b)) { botUse(b, i); applyItem(b, 'spring'); b.cd = 2; return; }
  if ((i = has('fake')) >= 0 && (threat || b.threatT > 0) && !b.fake) { botUse(b, i); applyItem(b, 'fake'); b.cd = 3; return; }
  if ((i = has('quake')) >= 0 && Math.random() < (dt || .05) * .4 && G.actors.some(o => (o.isPlayer || o.remote) && o.alive && Math.hypot(o.x - b.x, o.z - b.z) < 30)) { botUse(b, i); applyItem(b, 'quake'); b.cd = 4; return; }
  if ((i = has('scope')) >= 0 && Math.random() < (dt || .05) * .05) { botUse(b, i); b.cd = 3; }
}
function botUse(b, i) { (b.kp || (b.kp = {}))[i ? 'G' : 'F'] = G.time + .4; const x = b.slots[i]; x.n--; if (x.n <= 0) b.slots[i] = null; }
function botThrowAt(b, type, tx, tz) {
  const dx = tx - b.x, dz = tz - b.z, d = Math.max(1, Math.hypot(dx, dz));
  throwGrenade(b, type, dx / d, .28 + d * .006, dz / d, clamp(d * 1.05 + 5, 9, 20));
}
function botThrow(b, t) {
  const i = b.slots.findIndex(x => x && x.type !== 'cam'); if (i < 0) return;
  const type = b.slots[i].type; botUse(b, i); b.cd = 9 + Math.random() * 6; botThrowAt(b, type, t.x, t.z);
}
/* ---------- 旗幟（奪旗） ---------- */
function initFlags() {
  G.flags = [0, 1].map(t => ({ team: t, hx: World.flagPos[t][0], hz: World.flagPos[t][1], x: World.flagPos[t][0], y: 0, z: World.flagPos[t][1], state: 'home', carrier: null, t: 0 }));
}
function returnFlag(f) { f.state = 'home'; f.carrier = null; f.x = f.hx; f.z = f.hz; f.y = 0; f.t = 0; }
function dropFlag(f, a) { f.carrier = null; f.state = 'dropped'; f.x = a.x; f.z = a.z; f.y = a.y; f.t = 0; if (a) a.carry = null; }
function updateFlags(dt) {
  if (G.mode !== 'ctf') return;
  for (const f of G.flags) {
    if (f.carrier) { f.x = f.carrier.x; f.z = f.carrier.z; f.y = f.carrier.y; if (!f.carrier.alive) dropFlag(f, f.carrier); }
    else if (f.state === 'dropped') { f.t += dt; if (f.t > 25) returnFlag(f); }
    if (!f.carrier) for (const a of G.actors) {
      if (!a.alive || a.carry) continue; if (Math.abs(a.x - f.x) > 1.8 || Math.abs(a.z - f.z) > 1.8) continue;
      if (a.team !== f.team) { f.carrier = a; f.state = 'carried'; a.carry = f; netMsg(a.name + ' 拿走了' + (f.team === 0 ? '紅' : '藍') + '隊旗幟', 'flag'); if (a.isPlayer) { Sfx.flag(); UI.msg('你拿到敵方旗幟！帶回基地！', 'flag'); } else if (G.player && a.team === G.player.team) UI.msg(a.name + ' 拿到敵方旗幟', 'flag'); else if (G.player) UI.msg('敵人拿走了我方旗幟！', 'bad'); break; }
      else if (f.state === 'dropped') { returnFlag(f); netMsg(a.name + ' 奪回了' + (f.team === 0 ? '紅' : '藍') + '隊旗幟', 'flag'); if (a.isPlayer) { UI.msg('你奪回了己方旗幟', 'flag'); Sfx.flag(); } break; }
    }
  }
  for (const a of G.actors) {
    if (!a.alive || !a.carry) continue; const own = G.flags[a.team];
    if (own.state === 'home' && Math.hypot(a.x - own.hx, a.z - own.hz) < 2.4) {
      G.scores[a.team]++; const f = a.carry; returnFlag(f); a.carry = null; a.kills += 0;
      netMsg(a.name + ' 奪旗得分！', 'flag');
      UI.msg((a.isPlayer ? '你' : a.name) + ' 奪旗得分！', a.team === (G.player && G.player.team) ? 'flag' : 'bad'); Sfx.flag(); checkWin();
    }
  }
}

/* ---------- 淘汰 / 勝負 ---------- */
function eliminate(k, v) {
  if (k !== v && v.alive && immune(v)) { const m = v.name + ' 的淨化之光無效化了 ' + k.name + ' 的攻擊！'; UI.msg(m, k.isPlayer ? 'bad' : 'item'); netMsg(m, 'item'); if (k.isPlayer) Sfx.wrong(); return; }
  if (k !== v && v.alive && v.shieldT > 0) { blockHit(k, v); return; }
  if (!v.alive || v.protect > 0) return;
  v.alive = false; v.deaths++; v.deadT = 0; v.respawnT = 3.2; v.killedBy = k; v.typing = null; v.lure = null;
  k.lastKillT = G.time; if (k.cloak) k.cloakE = 0; const mul = (k !== v && isOut(k, 13) && G.time - (k.binAt ?? -99) <= 8) ? 2 : 1;
  if (G.sk.night.by === v) G.sk.night.by = null;
  if (skOn() && k !== v && k.armed && k.av && k.av.outfitIdx === 15) { const vi = v.av.outfitIdx, kind = SKILL_OF[vi]; if (kind && kind !== 'steal') { k.stolen = kind; k.armed = false; skMsg(k, '竊取了【' + SKILLS[kind].name + '】！再按一次施放'); } else if (PASSIVE_IDX.includes(vi)) { k.passIdx = vi; k.armed = false; skMsg(k, '竊取了被動技能【' + OUTFITS[vi].skill.name + '】'); } }
  if (k !== v) { assignNumber(k); for (const o of G.actors) { if (o.read) o.read[k.id] = 0; if (o.typing && o.typing.target === k) o.typing = null; } } // 擊殺成功：自己的號碼立即更新
  if (G.mode === 'hunt' && k !== v && (k.isPlayer || k.remote)) { k.streak = (G.time - (k.lastKillT0 ?? -99) <= 10) ? (k.streak || 0) + 1 : 1; k.lastKillT0 = G.time; const pts = STREAK_PTS[Math.min(k.streak, 5) - 1] * mul; k.score = (k.score || 0) + pts; k.lastStreak = k.streak; if (k.isPlayer) UI.streak(k.streak, pts); }
  if (k !== v) { k.kills += mul; if (G.mode === 'tdm' && k.team >= 0) G.scores[k.team] += mul; if (mul > 1 && k.isPlayer) UI.msg('窺探專家：擊殺積分 ×2！', 'good'); }
  for (const f of G.flags) if (f.carrier === v) dropFlag(f, v);
  G.feed.push({ t: 6, k: k.name, v: v.name, me: k.isPlayer || v.isPlayer, kt: k.team, vt: v.team, st: (G.mode === 'hunt' && k.lastStreak > 1 && (k.isPlayer || k.remote)) ? Math.min(k.lastStreak, 5) : 0, seq: (G.feedSeq = (G.feedSeq || 0) + 1), ki: G.actors.indexOf(k), vi: G.actors.indexOf(v) }); if (G.feed.length > 5) G.feed.shift(); G.feedVer = (G.feedVer || 0) + 1;
  for (const o of G.actors) { if (o.read) o.read[v.id] = 0; }
  if (k.isPlayer) { Sfx.kill(); UI.msg('你淘汰了 ' + v.name + ' (' + v.number + ')', 'good'); UI.killFlash(); }
  if (v.isPlayer) { Sfx.die(); G.typed = ''; G.bino = false; UI.onDeath(k); }
  UI.dirty = true; checkWin();
}
function checkWin() {
  if (G.state !== 'playing') return;
  let over = false, win = '';
  if (G.mode === 'hunt') { const hs = G.actors.filter(a => a.isPlayer || a.remote); const best = hs.reduce((m, a) => (a.score || 0) > (m.score || 0) ? a : m, hs[0]); if ((best.score || 0) >= G.limit || G.tleft <= 0) { G.state = 'ended'; G.winner = best.name; G.endT = 0; UI.onEnd(); } return; }
  if (G.mode === 'dm') { const best = G.actors.reduce((m, a) => a.kills > m.kills ? a : m, G.actors[0]); if (best.kills >= G.limit) { over = true; win = best.name; } }
  else { for (const t of [0, 1]) if (G.scores[t] >= G.limit) { over = true; win = t; } }
  if (G.tleft <= 0) { over = true; if (G.mode === 'dm') { win = G.actors.reduce((m, a) => a.kills > m.kills ? a : m, G.actors[0]).name; } else win = G.scores[0] === G.scores[1] ? -1 : (G.scores[0] > G.scores[1] ? 0 : 1); }
  if (over) { G.state = 'ended'; G.winner = win; G.endT = 0; UI.onEnd(); }
}

/* ---------- 玩家 ---------- */
const In = { mx: 0, my: 0, jump: false, sprint: false, lookX: 0, lookY: 0, leanL: false, leanR: false, sprintT: false };
const LEANMAX = .55;
/* 探頭：從眼睛高度沿視線右方位移 d 公尺，是否會撞進牆/物體 */
function leanClear(p, d) {
  const x = p.x + Math.cos(p.yaw) * d, z = p.z - Math.sin(p.yaw) * d, ey = p.y + EYE, B = World.boxes;
  for (let i = 0; i < B.length; i++) { const b = B[i]; if (b.nc || ey + .15 <= b.y0 || ey - .25 >= b.y1) continue; if (x + .14 > b.x0 && x - .14 < b.x1 && z + .14 > b.z0 && z - .14 < b.z1) return false; }
  return true;
}
const headX = o => Math.cos(o.yaw) * (o.lo || 0), headZ = o => -Math.sin(o.yaw) * (o.lo || 0);
function typeDigit(d) {
  if (G.state !== 'playing' || G.countdown > 0 || !G.player || !G.player.alive || G.lock > 0 || G.player.ctrlT > 0) return;
  if (!Device.mobile && scrPhase2(G.player) && G.keyMap) d = G.keyMap[d] || d;
  const mix = !G.codeLen, L = G.codeLen || 6; if (G.typed.length >= L) return; G.typed += d; Sfx.key(); UI.dirty = true;
  if (mix) { if (G.typed.length >= 3 && (G.typed.length >= 6 || G.actors.some(a => a.alive && a !== G.player && a.number === G.typed)) && (S.auto || Device.mobile)) submitNumber(); }
  else if (G.typed.length === L && (S.auto || Device.mobile)) submitNumber();
}
function backspace() { if (G.state !== 'playing' || G.lock > 0) return; if (G.typed.length) { G.typed = G.typed.slice(0, -1); Sfx.del(); UI.dirty = true; } }
function submitNumber() {
  const p = G.player; if (G.state !== 'playing' || G.countdown > 0 || !p || !p.alive || G.lock > 0) return;
  if (G.typed.length < (G.codeLen || 3)) { UI.msg('請輸入完整的 ' + (G.codeLen || 3) + ' 位以上數字', 'bad'); return; }
  const code = G.typed; if (!G.netClient && ericHit(p, code)) { G.typed = ''; UI.dirty = true; return; }
  const t = G.actors.find(a => a.alive && a.number === code && a !== p && a.number !== '');
  if (t && (isDM() || t.team !== p.team)) {
    if (t.protect > 0) { UI.msg('對方有重生保護', 'bad'); G.typed = ''; UI.dirty = true; return; }
    if (G.netClient) { netAct(['k', G.actors.indexOf(t), code]); G.typed = ''; UI.dirty = true; return; }
    G.typed = ''; UI.dirty = true; eliminate(p, t);
  } else if (t) { UI.msg('這是隊友的號碼！', 'bad'); Sfx.wrong(); G.typed = ''; UI.dirty = true; UI.shake(); }
  else { if (G.netClient && code === p.number) netAct(['k', -1, code]); p.streak = 0; p.cloak = false; Sfx.wrong(); UI.msg('號碼錯誤！定身 2 秒', 'bad'); G.lock = 2; G.freezeT = 2; p.redT = 2; if (G.netClient) netAct(['w']); UI.shake(); UI.stunFx(2); setTimeout(() => { G.typed = ''; UI.dirty = true; }, 350); }
}
function updatePlayer(dt) {
  const p = G.player;
  if (Device.mobile) In.sprint = In.sprintT;
  if (In.sprintT && G.stam <= .02) { In.sprintT = false; In.sprint = false; const rb = document.getElementById('bRun'); if (rb) rb.classList.remove('tog'); }
  if (G.scopeOn && (!p.alive || !G.slots.some(s => s && s.type === 'scope'))) G.scopeOn = false;
  if (G.freezeT > 0 || p.ctrlT > 0) In.lookX = In.lookY = 0; // 定身時連視角也不能轉
  p.yaw += In.lookX; p.pitch = clamp(p.pitch + In.lookY, -1.45, 1.45); In.lookX = In.lookY = 0;
  const f = FWD(p.yaw), rx = Math.cos(p.yaw), rz = -Math.sin(p.yaw);
  if (p.alive) {
    let mx = In.mx, my = In.my; if (G.freezeT > 0) { mx = my = 0; G.freezeT -= dt; p.redT = Math.max(0, G.freezeT); }
    if (revActive(p)) { mx = -mx; my = -my; }
    const ml = Math.hypot(mx, my); if (ml > 1) { mx /= ml; my /= ml; }
    const moving = ml > .08;
    let spd = 5.85; const wantSprint = In.sprint && my > .2 && moving;
    G.stamDelay -= dt;
    const bolt = isOut(p, 12); if (wantSprint && (G.stam > .02 || bolt) && !G.bino) { spd = 8.4; if (!bolt) G.stam = Math.max(0, G.stam - dt * .13); G.stamDelay = .9; } else if (G.stamDelay <= 0) G.stam = Math.min(1, G.stam + dt * .2);
    const sprinting = spd > 7; p.sprinting = sprinting; spd *= speedMul(p);
    if (G.bino) spd *= .42; if (p.carry) spd *= .93;
    let wx = (f[0] * my + rx * mx) * spd, wz = (f[1] * my + rz * mx) * spd; if (p.ctrlT > 0 && p.ctrlBy) { const dx = p.x - p.ctrlBy.x, dz = p.z - p.ctrlBy.z, dd = Math.hypot(dx, dz) || 1; wx = dx / dd * spd * .3; wz = dz / dd * spd * .3; }
    const k = Math.min(1, dt * (p.onGround ? 12 : 3));
    p.vx += (wx - p.vx) * k; p.vz += (wz - p.vz) * k;
    const jp = In.jump && !G.jumpHeld && !(G.freezeT > 0); G.jumpHeld = In.jump;
    if (p.onGround) { p.jumps = 0; p.dashReady = false; }
    if (jp) {
      if (p.onGround) { p.vy = 7.1 * jumpMul(p); p.onGround = false; p.jumps = 1; Sfx.tone(420, .08, 'triangle', .08, 260); }
      else if (isSumi(p) && p.jumps >= 2 && p.dashReady) { p.dashReady = false; p.dashT = .2025; const fw = ml > .1 ? [f[0] * my + rx * mx, f[1] * my + rz * mx] : f, fl = Math.hypot(fw[0], fw[1]) || 1; p.dashV = [fw[0] / fl * 24, fw[1] / fl * 24]; Sfx.noise(.2, .18, 2500, 0, true); Sfx.tone(300, .2, 'sawtooth', .06, 500); }
      else if ((p.jumps || 0) < 2) { p.vy = 6.9 * jumpMul(p); p.jumps = 2; p.dashReady = isSumi(p); Sfx.tone(620, .1, 'triangle', .09, 380); }
    }
    if ((p.dashT || 0) > 0) { p.dashT -= dt; p.vx = p.dashV[0]; p.vz = p.dashV[1]; p.vy = Math.max(p.vy, 0); }
    const py = p.y; moveActor(p, dt);
    p.sp = clamp(Math.hypot(p.vx, p.vz) / 8.4, 0, 1); p.animT += dt * (5 + p.sp * 9) * (Math.hypot(p.vx, p.vz) > .3 ? 1 : 0);
    if (p.onGround && Math.hypot(p.vx, p.vz) > 1) { G.step += Math.hypot(p.vx, p.vz) * dt; if (G.step > 2.1) { G.step = 0; Sfx.step(); } }
    G.camBob += Math.hypot(p.vx, p.vz) * dt * (sprinting ? 1.6 : 1.3);
    p.protect = Math.max(0, p.protect - dt);
    // 望遠鏡能量
    if (G.bino) { p.binAt = G.time; if (G.netClient && isOut(p, 13) && G.time - (p._bsent ?? -9) > 1) { p._bsent = G.time; netAct(['b']); } }
    if (G.bino && isOut(p, 13)) G.energy = 1; else if (G.bino) { G.energy -= dt * .22; if (G.energy <= 0) { G.energy = 0; G.bino = false; } } else G.energy = Math.min(1, G.energy + dt * .12);
  } else { p.vx *= .9; p.vz *= .9; p.deadT += dt; p.respawnT -= dt; p.fall = Math.min(1, p.fall + dt * 2.5); }
  { const want = p.alive ? (In.leanL ? -1 : 0) + (In.leanR ? 1 : 0) : 0; let tgt = 0; if (want) { let k = 0; for (let s = 1; s <= 11; s++) { if (!leanClear(p, want * s * .05)) break; k = s * .05; } tgt = want * k; } p.lo += (tgt - p.lo) * Math.min(1, dt * 11); p.lean = want; }
  p.fx = f[0]; p.fz = f[1]; if (!p.alive) { In.leanL = In.leanR = false; }
  G.binK += ((G.bino ? 1 : 0) - G.binK) * Math.min(1, dt * 9);
  G.lock = Math.max(0, G.lock - dt); G.itemCd = Math.max(0, G.itemCd - dt); G.flashT = Math.max(0, G.flashT - dt); if (G.flashT <= 0) G.flashMax = 1;
  G.fp.throwT = Math.max(0, G.fp.throwT - dt); G.fp.camT = Math.max(0, G.fp.camT - dt);
  if (G.netClient) return;
  tryPickup(p);
  // 威脅（誰正在讀你的號碼）
  let best = null, bp = 0;
  if (p.alive) for (const b of G.actors) { if (b === p || !b.alive) continue; let q = b.read[p.id] || 0; if (b.typing && b.typing.target === p) q = 1; if (q > bp && q > .12) { bp = q; best = b; } }
  G.threat = best ? { b: best, p: bp } : null;
}
function updateCamera(dt) {
  const p = G.player, c = R.cam;
  const target = p.y + EYE;
  if (Math.abs(target - G.camY) > .02) G.camY += (target - G.camY) * Math.min(1, dt * 16); else G.camY = target;
  const bob = p.alive && !G.bino ? Math.sin(G.camBob * 2.4) * .028 * Math.min(1, Math.hypot(p.vx, p.vz) / 4) : 0;
  const base = Device.mobile ? 1.19 : 1.28; // 弧度 ≈ 68° / 73°
  const zoom = .15; // 望遠鏡 ≈ 8.6°（倍率為先前的 2 倍）
  const sp = p.sprinting && !G.bino ? .06 : 0;
  const fov = G.scopeOn ? .227 : lerp(base + sp, zoom, G.binK);
  G.fov += (fov - G.fov) * Math.min(1, dt * 14); c.fov = G.fov;
  let sx = 0, sy = 0; if (G.binK > .5) { sx = Math.sin(G.time * 1.7) * .0016 + Math.sin(G.time * 4.1) * .0007; sy = Math.cos(G.time * 1.3) * .0014; }
  c.x = p.x + Math.cos(p.yaw) * p.lo; c.z = p.z - Math.sin(p.yaw) * p.lo; c.y = (p.alive ? G.camY - Math.abs(p.lo) * .12 : Math.max(.35, G.camY - p.deadT * 2.2)) + bob;
  { const q = G.sk && G.sk.quake; if (q && q.t > 0 && q.by !== p) { const ev = .2 + .8 * clamp(q.t / 2, 0, 1); sx += Math.sin(G.time * 38) * .17 * ev; } }
  c.yaw = p.yaw + sx; c.pitch = p.pitch + sy; c.roll = p.alive ? -p.lo * .4 : clamp(p.deadT * 2.2, 0, .35) * (p.id % 2 ? 1 : -1);
  if (!p.alive) c.pitch = lerp(c.pitch, -.45, clamp(p.deadT * 2, 0, 1));
}

/* ---------- 機器人 AI ---------- */
function scanBot(b, dt) {
  const R2 = b.range * b.range, ex = b.x, ey = b.y + 1.62, ez = b.z, df = DIFF[S.diff], teamMode = !isDM();
  let seen = null, seenD = 1e9;
  for (const o of G.actors) {
    if (o === b || !o.alive || o.invis) continue; if (teamMode && o.team === b.team) continue;
    let p = b.read[o.id] || 0;
    const dx = o.x - b.x, dz = o.z - b.z, d2 = dx * dx + dz * dz;
    if (d2 > R2 || b.blind > 0) { if (p > 0) b.read[o.id] = Math.max(0, p - dt * 1.5); continue; }
    const d = Math.sqrt(d2) || .001, ux = dx / d, uz = dz / d;
    if (b.fx * ux + b.fz * uz < .45 || !los(ex, ey, ez, o.x + headX(o), o.y + 1.65, o.z + headZ(o))) { if (p > 0) b.read[o.id] = Math.max(0, p - dt * 1.2); continue; }
    if (d < seenD) { seenD = d; seen = o; }
    const face = -(o.fx * ux + o.fz * uz);
    if (face > .34 && o.protect <= 0) {
      const need = df.base * o.number.length / 4 * (G.demo ? 1.25 : 1) * b.scaleBase * (.55 + d / 17) * (1 + o.sp * .45) * (G.mode === 'ctf' ? (o.carry ? 2.2 : 1.5) : 1);
      p += dt / need; b.read[o.id] = Math.min(1, p); if (p > .3) { o.threatT = 1.3; o.reader = b; }
      if (p >= 1 && !b.typing) { b.typing = { target: o, num: o.fake || o.number, t: df.type * (.8 + Math.random() * .5) }; b.read[o.id] = 0; }
    } else if (p > 0) b.read[o.id] = Math.max(0, p - dt * 1.0);
  }
  if (seen) { b.tgt = seen; b.tgtT = 2.8; }
}
function pickGoal(b) {
  b.goalT = 3 + Math.random() * 3; b.repT = 0;
  if (b.lure) return [b.lure.x, b.lure.z];
  if (G.mode === 'ctf') {
    const own = G.flags[b.team], en = G.flags[1 - b.team];
    if (b.carry) return [own.hx, own.hz];
    if (own.state === 'carried' && own.carrier) return [own.carrier.x, own.carrier.z];
    if (own.state === 'dropped') return [own.x, own.z];
    if (b.role === 0) { if (en.state === 'carried' && en.carrier && en.carrier.team === b.team) return [own.hx + rand(-8, 8), own.hz + rand(-8, 8)]; return [en.x, en.z]; }
    return [own.hx + rand(-10, 10), own.hz + rand(-10, 10)];
  }
  if (b.smart) {
    if ((!b.slots[0] || !b.slots[1]) && Math.random() < .6) { let bp = null, bd = 38; for (const p of G.pickups) { if (!p.on) continue; const d = Math.hypot(p.x - b.x, p.z - b.z); if (d < bd) { bd = d; bp = p; } } if (bp) return [bp.x, bp.z, bp.l]; }
    let bt = null, bd2 = 56; for (const o of G.actors) { if (!enemyOf(b, o)) continue; const d = Math.hypot(o.x - b.x, o.z - b.z); if (d < bd2) { bd2 = d; bt = o; } }
    if (bt && Math.random() < .85) { const dx = bt.x - b.x, dz = bt.z - b.z, d = Math.hypot(dx, dz) || 1, sg = Math.random() < .5 ? -1 : 1, off = d > 18 ? 8 : 3; return [bt.x - dz / d * sg * off, bt.z + dx / d * sg * off, World.layerOf(bt.y)]; }
  }
  if (b.tgt && b.tgt.alive && Math.random() < .75) return [b.tgt.x, b.tgt.z, World.layerOf(b.tgt.y)];
  { const hs = G.actors.filter(a => (a.isPlayer || a.remote) && a.alive); if (hs.length && Math.random() < .22) { const h = pick(hs); return [h.x + rand(-6, 6), h.z + rand(-6, 6), World.layerOf(h.y)]; } }
  const c = pick(World.walkCells); return [c[0], c[1], c[2]];
}
function coverFor(b, rd) {
  let best = null, bd = 1e9;
  for (let k = 0; k < 16; k++) {
    const c = pick(World.walkCells), db = Math.hypot(c[0] - b.x, c[1] - b.z); if (db < 4 || db > 20 || c[2] !== World.layerOf(b.y)) continue;
    if (Math.hypot(c[0] - rd.x, c[1] - rd.z) < 6) continue; if (los(c[0], 1.62 + (c[2] ? World.mezz.h : 0), c[1], rd.x, rd.y + 1.65, rd.z)) continue;
    if (db < bd) { bd = db; best = c; }
  }
  if (best) return [best[0], best[1], best[2]];
  const dx = b.x - rd.x, dz = b.z - rd.z, d = Math.hypot(dx, dz) || 1, bn = World.bounds; return [clamp(b.x + dx / d * 14, bn.x0 + 2, bn.x1 - 2), clamp(b.z + dz / d * 14, bn.z0 + 2, bn.z1 - 2), World.layerOf(b.y)];
}
function smartDefend(b, rd) { botItems(b, 0, true); }
function smartThink(b, dt) {
  b.modeT -= dt; b.evadeCd = Math.max(0, b.evadeCd - dt);
  const rd = b.reader && b.reader.alive ? b.reader : null;
  if (b.threatT > 0 && rd && b.mode !== 'evade' && b.evadeCd <= 0 && b.blind <= 0) {
    b.mode = 'evade'; b.modeT = 2.4; b.evadeCd = 5; b.goal = coverFor(b, rd); b.path = []; b.pi = 0; b.goalT = 3; b.ambushFace = [rd.x, rd.z]; smartDefend(b, rd);
  }
  if (b.mode === 'evade') { if (b.modeT <= 0 || (b.goal && Math.hypot(b.goal[0] - b.x, b.goal[1] - b.z) < 1.3)) { b.mode = 'ambush'; b.modeT = rand(1, 2.2); b.path = []; } }
  else if (b.mode === 'ambush') { if (b.modeT <= 0) { b.mode = 'peek'; b.modeT = rand(4, 7); const t = rd || b.tgt; if (t) { const dx = t.x - b.x, dz = t.z - b.z, d = Math.hypot(dx, dz) || 1, sg = Math.random() < .5 ? -1 : 1; b.goal = [t.x - dz / d * sg * 7, t.z + dx / d * sg * 7, World.layerOf(t.y)]; } else b.goal = null; b.path = []; b.pi = 0; b.goalT = 5; } }
  else if (b.mode === 'peek') { if (b.modeT <= 0) b.mode = 'roam'; }
  // 進攻：相機記號碼、閃光先手
  if (b.cd <= 0 && b.blind <= 0 && b.tgt && b.tgtT > 1.4 && (b.slots[0] || b.slots[1])) {
    const t = b.tgt, d = Math.hypot(t.x - b.x, t.z - b.z), ux = (t.x - b.x) / (d || 1), uz = (t.z - b.z) / (d || 1), face = -(t.fx * ux + t.fz * uz);
    const ci = b.slots.findIndex(x => x && x.type === 'cam');
    if (ci >= 0 && d > 9 && d < 40 && face > .34 && t.alive && (b.read[t.id] || 0) < .9) {
      botUse(b, ci); b.read[t.id] = Math.min(1, (b.read[t.id] || 0) + .6); b.cd = 3.5;
      if (b.read[t.id] >= 1 && !b.typing) { b.typing = { target: t, num: t.number, t: DIFF[S.diff].type * 1.1 }; b.read[t.id] = 0; }
    }
  }
}
/* ---- 干擾者機器人：不讀碼、不殺人，只在全場亂跑、亂轉頭、丟道具搗亂 ---- */
const trollF = () => [.25, .55, 1][clamp((S.trollLv || 3) - 1, 0, 2)];
function trollGoal(b) {
  if ((!b.slots[0] || !b.slots[1]) && Math.random() < .65) { let bp = null, bd = 1e9; for (const p of G.pickups) { if (!p.on) continue; const d = Math.hypot(p.x - b.x, p.z - b.z) + Math.random() * 12; if (d < bd) { bd = d; bp = p; } } if (bp) return [bp.x, bp.z, bp.l]; }
  let best = null, bs = -1;
  for (let k = 0; k < 14; k++) { const c = pick(World.walkCells); let md = 1e9; for (const o of G.actors) { if (o === b || !o.alive) continue; md = Math.min(md, Math.hypot(o.x - c[0], o.z - c[1])); } const far = Math.hypot(c[0] - b.x, c[1] - b.z), sc = Math.min(md, 14) + Math.min(far, 40) * .5 + Math.random() * 6; if (sc > bs) { bs = sc; best = c; } }
  return [best[0], best[1], best[2]];
}
function updateTroll(b, dt) {
  b.protect = Math.max(0, b.protect - dt); b.blind = Math.max(0, b.blind - dt); b.cd -= dt; b.typing = null; b.read = {}; b.tgt = null; b.threatT = 0;
  tryPickup(b);
  b.goalT -= dt; b.repT -= dt;
  if (!b.goal || b.goalT <= 0 || (b.path.length && b.pi >= b.path.length)) { b.goal = trollGoal(b); b.path = []; b.pi = 0; b.goalT = 5 + Math.random() * 5; }
  if (!b.path.length) { b.path = World.path(b.x, b.z, b.goal[0], b.goal[1], World.layerOf(b.y), b.goal[2] | 0); b.pi = 0; }
  let wx = 0, wz = 0; const spd = b.speed * 1.22 * trollF();
  if (b.pi < b.path.length) { const w = b.path[b.pi], dx = w[0] - b.x, dz = w[1] - b.z, d = Math.hypot(dx, dz); if (d < .9) b.pi++; else { wx = dx / d; wz = dz / d; } }
  for (const o of G.actors) { if (o === b || !o.alive) continue; const dx = b.x - o.x, dz = b.z - o.z, d2 = dx * dx + dz * dz; if (d2 < 36 && d2 > 1e-4) { const d = Math.sqrt(d2), f = (1 - d / 6) * 1.4; wx += dx / d * f; wz += dz / d * f; } } // 不群聚
  const wl = Math.hypot(wx, wz); if (wl > 1) { wx /= wl; wz /= wl; }
  if (revActive(b)) { wx = -wx; wz = -wz; }
  const k = Math.min(1, dt * 9); b.vx += (wx * spd - b.vx) * k; b.vz += (wz * spd - b.vz) * k;
  if (b.onGround && wl > .3 && Math.random() < dt * .35 * trollF()) b.vy = 7.0 * jumpMul(b);
  b.stuckT += dt; if (b.stuckT > 1.2) { if (Math.hypot(b.x - b.lx, b.z - b.lz) < .5 && wl > .2) { b.path = []; b.goal = null; if (b.onGround) b.vy = 6.8; } b.lx = b.x; b.lz = b.z; b.stuckT = 0; }
  moveActor(b, dt);
  const sp = Math.hypot(b.vx, b.vz); b.sp = clamp(sp / 8.4, 0, 1); b.animT += dt * (5 + b.sp * 9) * (sp > .3 ? 1 : 0);
  b.lookT = (b.lookT || 0) - dt; if (b.lookT <= 0) { b.lookOff = rand(-2.2, 2.2); b.lookT = rand(.5, 1.6); }
  const want = (sp > .5 ? Math.atan2(-b.vx, -b.vz) : b.yaw) + (b.lookOff || 0) * (sp > .5 ? .9 : 1);
  b.yaw += clamp(angDiff(b.yaw, want), -6 * dt * trollF(), 6 * dt * trollF()); const f = FWD(b.yaw); b.fx = f[0]; b.fz = f[1];
  // 搗亂：使用道具干擾戰場
  botItems(b, dt, false); if (b.cd <= 0) b.cd = (.6 + Math.random() * 1.2) / Math.max(.2, trollF());
}
function updateBot(b, dt) {
  if ((b.ctrlT || 0) > 0 && b.ctrlBy) { b.typing = null; b.protect = Math.max(0, b.protect - dt); b.cd -= dt; const dx = b.x - b.ctrlBy.x, dz = b.z - b.ctrlBy.z, dd = Math.hypot(dx, dz) || 1, sp0 = b.speed * .3; b.vx += (dx / dd * sp0 - b.vx) * Math.min(1, dt * 9); b.vz += (dz / dd * sp0 - b.vz) * Math.min(1, dt * 9); moveActor(b, dt); b.sp = clamp(Math.hypot(b.vx, b.vz) / 8.4, 0, 1); b.animT += dt * (5 + b.sp * 9); return; }
  if ((DIFF[S.diff].troll || G.mode === 'hunt') && !G.demo) { updateTroll(b, dt); return; }
  botSkill(b, dt); if (!b.smart) botItems(b, dt, false);
  b.threatT = Math.max(0, b.threatT - dt); if (b.smart) smartThink(b, dt);
  b.protect = Math.max(0, b.protect - dt); b.blind = Math.max(0, b.blind - dt); b.cd -= dt; b.tgtT -= dt; if (b.tgtT <= 0) b.tgt = null;
  if (b.lure) { b.lure.t -= dt; if (b.lure.t <= 0) b.lure = null; }
  b.scanAcc += dt; if (b.scanAcc >= b.scanInt) { if (b.blind <= 0 && !b.lure && !G.actors.some(o => o !== b && o.alive && o.dackE >= 1 && Math.hypot(o.x - b.x, o.z - b.z) < 12)) scanBot(b, b.scanAcc); b.scanAcc = 0; b.scanInt = .11 + Math.random() * .06; }
  if (b.typing) {
    b.typing.t -= dt; if (b.blind > 0) b.typing = null;
    else if (b.typing.t <= 0) { const t = G.actors.find(a => a.alive && a.number === b.typing.num); if (scrPhase2(b) && Math.random() < .6) { b.blind = 1.5; b.redT = 2; } else if (ericHit(b, b.typing.num)) { /* 中陷阱 */ } else if (t && t !== b && t.protect <= 0 && (G.mode === 'dm' || t.team !== b.team)) { if (b.typing.target.fake === b.typing.num) uncloak(b.typing.target, true); eliminate(b, t); } b.typing = null; }
  }
  tryPickup(b);
  // 目標 / 路徑
  b.goalT -= dt; b.repT -= dt;
  if (!!b.carry !== !!b.lastCarry) { b.lastCarry = !!b.carry; b.goal = null; b.path = []; }
  if (!b.goal || b.goalT <= 0 || (b.path.length && b.pi >= b.path.length)) { b.goal = pickGoal(b); b.path = []; b.pi = 0; }
  if (b.tgt && b.tgtT > 0 && G.mode !== 'ctf' && b.repT <= 0 && !b.lure && b.mode !== 'evade' && b.mode !== 'ambush' && b.mode !== 'peek') { b.goal = [b.tgt.x, b.tgt.z, World.layerOf(b.tgt.y)]; b.path = []; b.repT = .9; }
  if (!b.path.length) { b.path = World.path(b.x, b.z, b.goal[0], b.goal[1], World.layerOf(b.y), b.goal[2] | 0); b.pi = 0; }
  let wx = 0, wz = 0, spd = b.speed;
  if (b.blind > 0) { b.strafeT -= dt; if (b.strafeT <= 0) { b.strafe = Math.random() < .5 ? -1 : 1; b.strafeT = .6; } const f = FWD(b.yaw); wx = -f[1] * b.strafe * .5; wz = f[0] * b.strafe * .5; spd *= .6; }
  else if (b.pi < b.path.length) {
    const w = b.path[b.pi], dx = w[0] - b.x, dz = w[1] - b.z, d = Math.hypot(dx, dz);
    if (d < .9) { b.pi++; } else { wx = dx / d; wz = dz / d; }
    const reading = b.tgt && b.tgtT > 1.2 && (b.read[b.tgt.id] || 0) > .08;
    if (reading && b.tgt) { const td = Math.hypot(b.tgt.x - b.x, b.tgt.z - b.z); if (td < 13) { spd *= .45; b.strafeT -= dt; if (b.strafeT <= 0) { b.strafe = Math.random() < .5 ? -1 : 1; b.strafeT = .8 + Math.random(); } const ox = wx, oz = wz; wx = ox - oz * b.strafe * .5; wz = oz + ox * b.strafe * .5; } }
    else if (b.tgt && Math.hypot(b.tgt.x - b.x, b.tgt.z - b.z) > 16) spd = b.speed * 1.45;
    if (b.typing) spd *= .4;
    if (b.carry) spd = b.speed * 1.35;
  }
  if (b.mode === 'ambush') { wx = wz = 0; } else if (b.mode === 'evade') spd = b.speed * 1.5;
  if (b.smart && b.onGround && spd > b.speed * 1.2 && Math.random() < dt * .5) b.vy = 7.0 * jumpMul(b);
  // 分離
  for (const o of G.actors) { if (o === b || !o.alive) continue; const dx = b.x - o.x, dz = b.z - o.z, d2 = dx * dx + dz * dz; if (d2 < .8 && d2 > 1e-4) { const d = Math.sqrt(d2); wx += dx / d * .6; wz += dz / d * .6; } }
  const wl = Math.hypot(wx, wz); if (wl > 1) { wx /= wl; wz /= wl; }
  if (revActive(b)) { wx = -wx; wz = -wz; }
  const k = Math.min(1, dt * 9); b.vx += (wx * spd - b.vx) * k; b.vz += (wz * spd - b.vz) * k;
  // 卡住偵測
  b.stuckT += dt; if (b.stuckT > 1.2) { if (Math.hypot(b.x - b.lx, b.z - b.lz) < .5 && wl > .2) { b.path = []; b.goal = null; if (b.onGround) b.vy = 6.8; } b.lx = b.x; b.lz = b.z; b.stuckT = 0; }
  moveActor(b, dt);
  const sp = Math.hypot(b.vx, b.vz); b.sp = clamp(sp / 8.4, 0, 1); b.animT += dt * (5 + b.sp * 9) * (sp > .3 ? 1 : 0);
  // 朝向
  let wantYaw = b.yaw;
  const tgt = b.tgt && b.tgtT > 1.4 ? b.tgt : null;
  if (b.blind > 0) wantYaw = b.yaw + Math.sin(G.time * 3 + b.id) * .5;
  else if (tgt && (b.read[tgt.id] || 0) > .02 || (tgt && Math.hypot(tgt.x - b.x, tgt.z - b.z) < 20)) wantYaw = Math.atan2(-(tgt.x - b.x), -(tgt.z - b.z));
  else if (b.mode === 'ambush' && b.ambushFace) wantYaw = Math.atan2(-(b.ambushFace[0] - b.x), -(b.ambushFace[1] - b.z));
  else if (b.lure) wantYaw = Math.atan2(-(b.lure.x - b.x), -(b.lure.z - b.z));
  else if (sp > .5) wantYaw = Math.atan2(-b.vx, -b.vz) + Math.sin(G.time * .9 + b.id * 1.7) * .55;
  b.yaw += clamp(angDiff(b.yaw, wantYaw), -7 * dt, 7 * dt);
  const f = FWD(b.yaw); b.fx = f[0]; b.fz = f[1];
  // 丟道具
  if (!b.smart && b.slots && b.slots.some(x => x && x.type !== 'cam') && b.cd <= 0 && tgt && b.blind <= 0) { const d = Math.hypot(tgt.x - b.x, tgt.z - b.z); if (d > 9 && d < 28 && Math.random() < dt * .6) botThrow(b, tgt); }
}
function updateDead(a, dt) {
  a.deadT += dt; a.respawnT -= dt; a.fall = Math.min(1, a.fall + dt * 3);
  if (a.respawnT <= 0 && G.state === 'playing') { spawnActor(a); if (a.isPlayer) UI.onRespawn(); }
}

/* ---------- 主更新 ---------- */
function updateGame(dt) {
  if (G.tut) return; // 操作說明顯示中：先不開始
  if (G.netClient) { updateClientGame(dt); return; }
  G.time += dt;
  if (G.countdown > 0 && G.state === 'playing') {
    const c0 = Math.ceil(G.countdown); G.countdown -= dt;
    if (G.countdown <= 0) { G.countdown = 0; Sfx.bell(); UI.goText(); } else if (Math.ceil(G.countdown) !== c0) Sfx.tick();
    for (const a of G.actors) { const f = FWD(a.yaw); a.fx = f[0]; a.fz = f[1]; }
    In.lookX = In.lookY = 0; if (G.player) updateCamera(dt); else if (G.demo) updateDemoCam(dt); return;
  }
  if (G.state === 'playing') {
    G.tleft -= dt; if (G.tleft <= 0) { G.tleft = 0; checkWin(); }
    skTick(dt);
    for (const a of G.actors) {
      if (a.isPlayer) { updatePlayer(dt); if (!a.alive && a.respawnT <= 0) { spawnActor(a); UI.onRespawn(); } continue; }
      if (a.remote) { updateRemote(a, dt); continue; }
      if (a.alive) updateBot(a, dt); else updateDead(a, dt);
    }
    for (const p of G.pickups) { if (!p.on) { p.t -= dt; if (p.t <= 0) p.on = true; } }
    updateGrenades(dt); updateFlags(dt);
    for (let i = G.feed.length - 1; i >= 0; i--) { G.feed[i].t -= dt; if (G.feed[i].t <= 0) { G.feed.splice(i, 1); G.feedVer = (G.feedVer || 0) + 1; } }
  } else if (G.state === 'ended') {
    G.endT += dt; // 結算：全場動作暫停
  }
  if (G.state !== 'ended') for (const a of G.actors) { const f = FWD(a.yaw); a.fx = f[0]; a.fz = f[1]; }
  if (G.state === 'ended') { In.lookX = In.lookY = 0; if (G.player) updateCamera(0); return; }
  if (G.player) updateCamera(dt); else if (G.demo) updateDemoCam(dt);
}

function actScore(a) {
  if (!a.alive) return 0; let s = .3;
  if (a.typing) s += 3; if (a.threatT > 0) s += 3; if (a.mode === 'evade' || a.mode === 'peek') s += 1.5; if (a.tgt && a.tgtT > 1) s += 1.5;
  for (const k in a.read) if (a.read[k] > .2) { s += 2; break; }
  if (G.time - a.lastKillT < 5) s += 2; return s;
}
function pickViewer(exclude, prefer) {
  if (prefer && prefer.alive && Math.random() < .6) return prefer;
  const c = G.actors.filter(a => a.alive && a !== exclude); if (!c.length) return null;
  let tot = 0; const w = c.map(a => { const x = Math.pow(actScore(a) + Math.random() * .6, 1.6); tot += x; return x; });
  let r = Math.random() * tot; for (let i = 0; i < c.length; i++) { r -= w[i]; if (r <= 0) return c[i]; } return c[c.length - 1];
}
function updateDemoCam(dt) {
  const c = R.cam; let v = G.view; G.viewT -= dt; G.viewHold = (G.viewHold || 0) - dt;
  if (v && v.alive) { if (actScore(v) < 1.2) G.viewQuiet = (G.viewQuiet || 0) + dt; else G.viewQuiet = 0; }
  let sw = false;
  if (G.state === 'playing') {
    if (!v || (!v.alive && v.deadT > 1.2) || G.viewT <= 0) sw = true;
    else if ((G.viewQuiet || 0) > 3 && G.viewHold <= 0 && G.actors.some(a => a !== v && actScore(a) >= 4)) sw = true;
  }
  if (sw) { const n = pickViewer(v, v && !v.alive ? v.killedBy : null); if (n) { v = G.view = n; G.viewT = rand(9, 14); G.viewHold = 3.5; G.viewQuiet = 0; G.camYaw = v.yaw; G.camY = v.y + EYE; if (UI.demoTag) UI.demoTag(); } }
  if (!v) return;
  G.camY += (v.y + EYE - G.camY) * Math.min(1, dt * 12); G.camYaw += angDiff(G.camYaw, v.yaw) * Math.min(1, dt * 9);
  const bob = v.alive ? Math.sin(v.animT * 2) * .03 * v.sp : 0;
  c.x = v.x; c.z = v.z; c.y = (v.alive ? G.camY : Math.max(.35, G.camY - v.deadT * 2.2)) + bob; c.yaw = G.camYaw; c.pitch = v.alive ? -.02 : -.4; c.roll = v.alive ? 0 : clamp(v.deadT * 2.2, 0, .35) * (v.id % 2 ? 1 : -1);
  const f = Device.mobile ? 1.19 : 1.28; G.fov += (f - G.fov) * Math.min(1, dt * 10); c.fov = G.fov; G.binK = 0;
}
function startMatch(demo, roster) {
  const mapId = roster ? (roster.map || S.map) : (demo ? (S.demoMap || S.map) : S.map); World.load(MAPS[mapId] ? mapId : 'hb'); G.map = World.id;
  const mk = (demo && S.demoMode && MODES[S.demoMode]) ? S.demoMode : S.mode, m = MODES[mk]; G.mode = mk; G.codeLen = S.codeLen === 'rand' ? pick([3, 4, 5, 6]) : S.codeLen === 'mix' ? 0 : (S.codeLen | 0) || 4; G.countdown = 3; G.freezeT = 0; G.skillsOn = S.skills !== false; G.tleft = (S.time || 5) * 60; G.limit = m.limit; G.scores = [0, 0]; G.grenades = []; G.smokes = []; G.lures = []; G.fx = []; G.feed = []; G.typed = ''; G.lock = 0; G.time = 0;
  freeActors(G.actors); G.actors = []; _id = 0; G.slots = [null, null]; G.scopeOn = false; G.bino = false; G.binK = 0; G.energy = 1; G.stam = 1; G.flashT = 0; G.itemCd = 0; G.threat = null;
  G.netClient = false; G.multi = !!roster; const hum = roster ? roster.length : 1;
  const n = roster ? (S.netBots ? clamp(Math.max(S.count, hum), hum, 20) : hum) : clamp(S.count, 4, 20);
  G.demo = !!demo; G.view = null; G.player = null; let pl = null;
  if (!demo) { pl = newActor(roster ? NET.name : '你', S.outfit, true); G.player = pl; G.actors.push(pl); }
  if (roster) for (const r of roster.slice(1)) { const a = newActor(r.name, r.outfit, false); a.remote = true; a.peer = r.peer; a.slots = [null, null]; a.speed = 0; G.actors.push(a); }
  const names = NAMES.slice().sort(() => Math.random() - .5);
  for (let i = demo ? 0 : G.actors.length; i < n; i++) { const b = newActor(names[(demo ? i : i - hum)], pick(VIS_OUTFITS), false); b.role = i % 4 === 0 ? 1 : 0; b.smart = !!demo; if (demo) b.speed *= 1.08; b.scaleBase = .85 + Math.random() * .4; b.range = Math.random() < .15 ? 58 : 34; if (b.range > 50) b.scaleBase *= 1.3; G.actors.push(b); }
  G.actors.forEach((a, i) => { a.team = isDM() ? -1 : (i % 2); });
  if ((DIFF[S.diff].troll || G.mode === 'hunt') && !demo) for (const a of G.actors) if (!a.isPlayer && !a.remote) a.av = createAvatar(OUTFITS.findIndex(o => o.key === 'troll'));
  G.actors.forEach(a => { a.score = 0; a.streak = 0; a.lastKillT0 = -99; a.lastStreak = 0; drawPlate(a); });
  for (const a of G.actors) if (!a.isPlayer && !a.remote && speedMul(a) !== 1) a.speed *= speedMul(a);
  skReset(); spawnAll();
  G.pickups = World.pickSpots.map(p => ({ x: p[0], z: p[1], y: p[2] ? World.mezz.h : 0, l: p[2] | 0, on: true, t: 0 }));
  initFlags(); G.state = 'playing'; G.fov = 1.2;
  if (demo) { G.view = pick(G.actors); G.viewT = rand(10, 16); G.camY = G.view.y + EYE; G.camYaw = G.view.yaw; R.cam.yaw = G.view.yaw; UI.demoTag && UI.demoTag(); }
  else { G.camY = pl.y + EYE; R.cam.yaw = pl.yaw; }
}

/* ================= 繪製 ================= */
const CLOUDS = (() => { const r = rng(99), a = []; for (let i = 0; i < 12; i++) a.push({ a: r() * TAU, r: 330 + r() * 120, h: 110 + r() * 90, w: 140 + r() * 120 }); return a; })();
const SPR = { mesh: null, mat: null, puff: null, glow: null, tmp: M4.create(), sky: null, skyM: M4.create(), crate: null, crateMat: null, flagPole: null, flagCloth: null, flagMat: [], gren: null, grenMat: {}, ring: null, ringMat: [], hand: null, camMesh: null, camMat: null, nameCache: {}, fpArm: {}, fpHand: null, fpMat: {}, tmp2: M4.create(), cw: M4.create() };
function initRenderAssets() {
  SPR.mesh = R.mkMesh(mergeGeos([{ g: gPlane(1, 1) }]));
  SPR.puff = R.tex(TG.puff(), { nomip: true }); SPR.glow = R.tex(TG.glow(), { nomip: true });
  SPR.mat = R.mat({ unlit: 1, blend: 1, noDepth: 1, fog: 1 });
  const sky = mergeGeos([{ g: gSphere(1, 20, 12), cfn: (x, y) => { const t = y; if (t < 0) return mixc([.78, .83, .82], [.84, .9, .94], clamp(1 + t * 5, 0, 1)); return mixc(mixc([.84, .9, .95], [.52, .72, .93], clamp(t * 3, 0, 1)), [.30, .52, .86], clamp((t - .35) * 1.4, 0, 1)); } }]);
  SPR.sky = R.mkMesh(sky); SPR.skyMat = R.mat({ unlit: 1, fog: 0, two: 1, noDepth: 1 }); SPR.skyCur = SPR.sky;
  SPR.skyNight = R.mkMesh(mergeGeos([{ g: gSphere(1, 24, 14) }])); SPR.skyNightMat = R.mat({ tex: R.tex(TG.skyNight(), { nomip: true }), unlit: 1, fog: 0, two: 1, noDepth: 1 });
  SPR.crate = R.mkMesh(mergeGeos([{ g: gBox(.4, .4, .4) }])); SPR.crateMat = R.mat({ tex: R.tex(TG.crate(), {}), spec: .2 });
  SPR.flagPole = R.mkMesh(mergeGeos([{ g: gCyl(.04, .05, 3.6, 8, 1), t: [0, 1.8, 0], c: [.85, .85, .88] }, { g: gSphere(.07, 8, 6), t: [0, 3.65, 0], c: [.9, .8, .3] }]));
  SPR.flagCloth = R.mkMesh(mergeGeos([{ g: gBox(1.2, .75, .03), t: [.62, 3.15, 0] }]));
  SPR.flagMat = [R.mat({ tint: [.85, .15, .15, 1], spec: .1 }), R.mat({ tint: [.15, .35, .9, 1], spec: .1 })];
  SPR.ring = R.mkMesh(mergeGeos([{ g: gCyl(2.2, 2.2, .02, 28, 1, true), t: [0, .03, 0] }]));
  SPR.ringMat = [R.mat({ tint: [.9, .2, .2, .35], unlit: 1, blend: 1, noDepth: 1, two: 1 }), R.mat({ tint: [.2, .4, .95, .35], unlit: 1, blend: 1, noDepth: 1, two: 1 })];
  SPR.gren = R.mkMesh(mergeGeos([{ g: gCyl(.045, .045, .17, 10, 1), c: [1, 1, 1] }, { g: gCyl(.02, .02, .04, 8, 1), t: [0, .105, 0], c: [.7, .7, .7] }]));
  SPR.grenMat = { flash: R.mat({ tint: [.85, .85, .9, 1], spec: .6 }), smoke: R.mat({ tint: [.3, .55, .35, 1], spec: .4 }), lure: R.mat({ tint: [.9, .3, .25, 1], spec: .4 }) };
  SPR.camMesh = R.mkMesh(mergeGeos([{ g: gBox(.17, .1, .07), c: [.12, .12, .14] }, { g: gCyl(.032, .036, .05, 12, 1), t: [0, 0, .06], r: [PI / 2, 0, 0], c: [.05, .05, .06] }, { g: gBox(.05, .015, .03), t: [.05, .06, 0], c: [.7, .7, .72] }, { g: gBox(.17, .035, .071), t: [0, .03, 0], c: [.62, .62, .65] }]));
  SPR.camMat = R.mat({ spec: .4 });
  SPR.fpHand = R.mkMesh(mergeGeos([{ g: gSphere(.04, 10, 8), s: [1, .75, 1.3], t: [0, 0, 0], c: [1, 1, 1] }]));
  SPR.fpArm = R.mkMesh(mergeGeos([{ g: gCyl(.042, .056, .5, 10, 1), t: [0, 0, .25], r: [PI / 2, 0, 0], c: [1, 1, 1] }]));
}
function drawSprite(tex, x, y, z, w, h, col, alpha, noDepthTest) {
  const cw = R._cw, M = SPR.tmp;
  M[0] = cw[0] * w; M[1] = cw[1] * w; M[2] = cw[2] * w; M[3] = 0; M[4] = cw[4] * h; M[5] = cw[5] * h; M[6] = cw[6] * h; M[7] = 0; M[8] = cw[8]; M[9] = cw[9]; M[10] = cw[10]; M[11] = 0; M[12] = x; M[13] = y; M[14] = z; M[15] = 1;
  const m = SPR.mat; m.tex = tex; m.tint[0] = col[0]; m.tint[1] = col[1]; m.tint[2] = col[2]; m.tint[3] = alpha; R.draw(SPR.mesh, M, m);
}
function nameTexFor(a) {
  if (a.nameTex) return a.nameTex;
  const c = cv(256, 64), g = c.getContext('2d'); g.font = '700 34px "Noto Sans TC","Microsoft JhengHei",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 6; g.strokeStyle = 'rgba(0,0,0,.75)'; g.strokeText(a.name, 128, 34); g.fillStyle = '#fff'; g.fillText(a.name, 128, 34);
  a.nameTex = R.tex(c, { nomip: true }); return a.nameTex;
}
let _dz = null;
function dizzyTex() { if (_dz) return _dz; const c = cv(256, 128), g = c.getContext('2d'); g.font = '900 70px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#ffd21a'; g.strokeStyle = '#7a4a00'; g.lineWidth = 6; for (const [x, y] of [[50, 70], [128, 40], [206, 70]]) { g.strokeText('★', x, y); g.fillText('★', x, y); } g.font = '900 38px Arial'; g.strokeText('✦', 128, 100); g.fillText('✦', 128, 100); return (_dz = R.tex(c, { nomip: true })); }
const _sayC = {};
function sayTex(txt) {
  if (_sayC[txt]) return _sayC[txt]; const c = cv(512, 134), g = c.getContext('2d');
  g.fillStyle = '#fff'; g.strokeStyle = '#2a2018'; g.lineWidth = 6; g.beginPath(); g.roundRect ? g.roundRect(6, 6, 500, 96, 26) : g.rect(6, 6, 500, 96); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(226, 100); g.lineTo(256, 130); g.lineTo(286, 100); g.closePath(); g.fillStyle = '#fff'; g.fill(); g.stroke(); g.fillRect(232, 96, 48, 8);
  g.fillStyle = '#2a2018'; g.font = '700 46px "Noto Sans TC","Microsoft JhengHei",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 256, 56);
  return (_sayC[txt] = R.tex(c, { nomip: true }));
}
function drawSkyDome(c) { const n = World.cur && World.cur.night; M4.trs(SPR.skyM, c.x, c.y, c.z, 0, 0, 0, 520, 520, 520); R.draw(n ? SPR.skyNight : SPR.sky, SPR.skyM, n ? SPR.skyNightMat : SPR.skyMat); }
function drawSkyFx(c, t) {
  const m = World.cur; if (!m || m.indoor) return;
  if (m.night) { drawSprite(SPR.glow, c.x + R.sun[0] * 480, c.y + R.sun[1] * 480, c.z + R.sun[2] * 480, 210, 210, [.5, .58, .9], .45); drawSprite(SPR.glow, c.x + R.sun[0] * 480, c.y + R.sun[1] * 480, c.z + R.sun[2] * 480, 62, 62, [.92, .96, 1], 1); return; }
  drawSprite(SPR.glow, c.x + R.sun[0] * 480, c.y + R.sun[1] * 480, c.z + R.sun[2] * 480, 120, 120, [1, .96, .8], .9);
  for (let k = 0; k < CLOUDS.length; k++) { const q = CLOUDS[k]; drawSprite(SPR.puff, c.x + Math.cos(q.a + t * .004) * q.r, q.h, c.z + Math.sin(q.a + t * .004) * q.r, q.w, q.w * .34, [1, 1, 1], .8); }
}
function horrorFx(list, c, t) {
  const W = World, d2 = (x, z) => (x - c.x) ** 2 + (z - c.z) ** 2;
  for (const g of W.ghosts) { const gx = g.x + Math.sin(t * .35 + g.ph) * 1.6, gz = g.z + Math.cos(t * .3 + g.ph * 1.3) * 1.6, d = d2(gx, gz); if (d > 5600) continue; list.push({ x: gx, y: g.y + 1.15 + Math.sin(t * .9 + g.ph) * .18, z: gz, w: 1.15, h: 2.3, a: .8 + .2 * Math.sin(t * 2 + g.ph), k: 6, d }); }
  for (const l of W.fxLights) { const d = d2(l.x, l.z); if (d > 4900) continue; const fl = .78 + .22 * Math.sin(t * (7 + l.ph) + l.ph * 3) * Math.sin(t * 2.3 + l.ph); list.push({ x: l.x, y: l.y, z: l.z, w: 2.8, a: .85 * fl, k: 7, d, col: l.c }); }
  for (const e of W.eyes || []) { if (Math.sin(t * .6 + e[0] * 3) > .7) continue; const d = d2(e[0], e[2]); if (d > 3600) continue; list.push({ x: e[0], y: e[1], z: e[2], w: 1, a: .95, k: 8, d }); }
  for (const m of W.mist || []) { const x = m.x + Math.sin(t * .1 + m.ph) * 3, z = m.z + Math.cos(t * .08 + m.ph) * 3, d = d2(x, z); if (d > 4900) continue; list.push({ x, y: .55, z, w: m.s * 1.3, h: m.s * .38, a: .15, k: 9, d }); }
}
function applyNightEnv(viewer) {
  const b = World.baseEnv; if (!b) return; const nt = (G.sk && G.sk.night) || { by: null, e: 0 }; let k = 1, tint = [1, 1, 1], nv = false;
  if (nt.by && nt.e >= 1.5) {
    if (viewer !== nt.by) { k = lerp(1, .4, clamp((nt.e - 1.5) / .8, 0, 1)); } else if (nt.e >= 2.5) { nv = true; k = .3; tint = [.35, 1, .4]; }
    const rem = 31.5 - nt.e; if (rem < .5) k = lerp(1, k, clamp(rem / .5, 0, 1));
  }
  G.plateK = (nt.by && viewer !== nt.by && nt.e >= 1.5) ? Math.max(.3, k * .9) : 1;
  const key = k + '|' + tint.join() + '|' + World.id;
  if (key !== applyNightEnv.key) { for (const kk of ['sunCol', 'sky', 'gnd', 'fog']) R.env[kk] = b[kk].map((v, i) => v * k * tint[i]); for (const m of [SPR.skyMat, SPR.skyNightMat]) for (let q = 0; q < 3; q++) m.tint[q] = k * tint[q]; applyNightEnv.key = key; }
  if (nv !== applyNightEnv.nv) { applyNightEnv.nv = nv; document.getElementById('nvov').classList.toggle('on', nv); }
}
function drawWorldFrame() {
  const c = R.cam, pl = G.player || (G.demo ? G.view : null); applyNightEnv(pl);
  if (R.shadowOn()) {
    const fw = [-Math.sin(c.yaw), -Math.cos(c.yaw)]; R.beginShadow(c.x + fw[0] * 16, 0, c.z + fw[1] * 16); World.drawShadow();
    for (const a of G.actors) { if (a === pl || a.invis || (!a.alive && a.deadT > 3)) continue; if (Math.abs(a.x - c.x) > 80 || Math.abs(a.z - c.z) > 80) continue; drawAvatar(a); }
    R.endShadow();
  }
  R.begin();
  // 天空（不寫深度，最先畫）
  drawSkyDome(c);
  World.draw();
  // 掉落物
  const t = G.time;
  for (const p of G.pickups) { if (!p.on) continue; if (!R.visible(p.x, p.y + .9, p.z, .8)) continue; M4.trs(SPR.tmp2, p.x, p.y + .75 + Math.sin(t * 2 + p.x) * .08, p.z, .3, t * 1.4, 0, 1, 1, 1); R.draw(SPR.crate, SPR.tmp2, SPR.crateMat); }
  for (const g of G.grenades) { M4.trs(SPR.tmp2, g.x, g.y, g.z, g.spin, g.spin * .6, 0, 1, 1, 1); R.draw(SPR.gren, SPR.tmp2, SPR.grenMat[g.type] || SPR.grenMat.flash); }
  if (G.mode === 'ctf') for (const f of G.flags) {
    if (!f.carrier) { M4.trs(SPR.tmp2, f.hx, 0, f.hz, 0, 0, 0, 1, 1, 1); R.draw(SPR.ring, SPR.tmp2, SPR.ringMat[f.team]); }
    const sway = Math.sin(t * 3 + f.team) * .15; let x = f.x, y = f.y, z = f.z, sc = 1;
    if (f.carrier) { const a = f.carrier, ff = FWD(a.yaw); x = a.x - ff[0] * .3; z = a.z - ff[1] * .3; y = a.y + .2; sc = .5; if (a === pl) continue; }
    M4.trs(SPR.tmp2, x, y, z, 0, sway, 0, sc, sc, sc); R.draw(SPR.flagPole, SPR.tmp2, SPR.grenMat.flash);
    R.draw(SPR.flagCloth, SPR.tmp2, SPR.flagMat[f.team]);
  }
  // 角色
  const ps = Device.mobile ? 1.32 : 1.0;
  for (const a of G.actors) {
    if (a === pl || a.invis) continue; if (!a.alive && a.deadT > 3) continue;
    if (!R.visible(a.x, a.y + .9, a.z, 1.4)) continue;
    a.plateScale = ps; drawAvatar(a);
  }
  // 影子
  R.polyOffset(true);
  for (const a of G.actors) { if (a.invis || (!a.alive && a.deadT > 2.5)) continue; if (!R.visible(a.x, a.y, a.z, 1.2)) continue; a.blobS = a.alive ? 1.25 : 1.6; drawBlob(a); }
  R.polyOffset(false);
  // 透明：雲、煙、特效、名字
  drawSkyFx(c, t);
  const list = [];
  for (const s of G.smokes) {
    const fade = s.t > s.life - 3 ? (s.life - s.t) / 3 : 1, grow = Math.min(1, s.t * 2.2);
    for (const p of s.puffs) { const ox = s.x + p.ox * s.r * .9, oy = s.y + 1.2 + p.oy * s.r * .6, oz = s.z + p.oz * s.r * .9; list.push({ x: ox, y: oy, z: oz, w: s.r * 1.5 * p.s, a: .34 * fade * grow, k: 0, d: (ox - c.x) ** 2 + (oy - c.y) ** 2 + (oz - c.z) ** 2 }); }
  }
  for (const a of G.actors) { if (!(a.redT > 0) || a === pl || !a.alive) continue; list.push({ x: a.x, y: a.y + 1.0, z: a.z, w: 2.8, a: .5 + .25 * Math.sin(G.time * 14), k: 5, d: (a.x - c.x) ** 2 + (a.z - c.z) ** 2 }); }
  for (const l of G.lures) { const on = Math.sin(l.t * 14) > 0; list.push({ x: l.x, y: l.y + .2, z: l.z, w: on ? .7 : .3, a: 1, k: 2, d: (l.x - c.x) ** 2 + (l.z - c.z) ** 2 }); }
  if (World.cur.night) horrorFx(list, c, t);
  for (const a of G.actors) {
    if (!a.alive || a === pl) continue; const dd2 = (a.x - c.x) ** 2 + (a.z - c.z) ** 2;
    if (a.dackE >= 1) for (let q = 0; q < 12; q++) { const an = t * .8 + q * .9, rr = 1.0 + (q % 4) * .4; list.push({ x: a.x + Math.cos(an) * rr, y: a.y + .4 + (q % 5) * .4, z: a.z + Math.sin(an) * rr, w: 3.2, a: .76, k: 0, d: dd2 }); }
    if (applyNightEnv.nv && !a.invis) { const cc = [[1, .2, .1], [1, .55, .12], [1, .9, .25]][a.id % 3]; list.push({ x: a.x, y: a.y + 1.2, z: a.z, w: 1.9, a: .9, k: 15, col: cc, d: dd2 }); }
    if (G.bountyId === a && !a.invis) list.push({ x: a.x, y: a.y + 1.2, z: a.z, w: 1.6 + Math.min(a.kills, 10) * .22, a: .35 + Math.min(a.kills, 10) * .05, k: 15, col: [1, .82, .2], d: dd2 });
  }
  for (const a of G.actors) { if (a.alive && a.ctrlT > 0) list.push({ x: a.x, y: a.y + 1.95, z: a.z, w: .9, a: 1, k: 13, d: (a.x - c.x) ** 2 + (a.z - c.z) ** 2 }); if (a.alive && a.cleanFx > 0 && !a.invis) { const q = 1 - a.cleanFx / .7; list.push({ x: a.x, y: a.y + .9, z: a.z, w: 1 + q * 3.2, a: .8 * (1 - q), k: 14, d: (a.x - c.x) ** 2 + (a.z - c.z) ** 2 }); } }
  for (const a of G.actors) { if (!a.alive || a === pl) continue; const dd = (a.x - c.x) ** 2 + (a.z - c.z) ** 2; if (a.shieldT > 0) list.push({ x: a.x, y: a.y + .75, z: a.z, w: 2.3, a: .5 + .2 * Math.sin(G.time * 8), k: 12, d: dd }); if (a.say) list.push({ x: a.x, y: a.y + 1.95, z: a.z, w: 2.0, a: clamp(a.say.t / .25, 0, 1), k: 11, a_: a, d: dd }); }
  for (const f of G.fx) if (f.k === 'puff') { const q = f.t / f.d; list.push({ x: f.x, y: f.y + q * .5, z: f.z, w: 1.2 + q * 1.8, a: .8 * (1 - q), k: 0, d: (f.x - c.x) ** 2 + (f.z - c.z) ** 2 }); }
  for (const f of G.fx) if (f.k === 'flash') { const q = f.t / f.d; list.push({ x: f.x, y: f.y, z: f.z, w: 5 + q * 8, a: 1 - q, k: 3, d: (f.x - c.x) ** 2 + (f.z - c.z) ** 2 }); }
  if (!isDM() && pl) for (const a of G.actors) { if (a === pl || a.invis || !a.alive || a.team !== pl.team) continue; const d2 = (a.x - c.x) ** 2 + (a.z - c.z) ** 2; if (d2 > 3600) continue; list.push({ x: a.x, y: a.y + 1.8, z: a.z, w: 1.5, a: 1, k: 1, a_: a, d: d2 }); }
  list.sort((p, q) => q.d - p.d);
  for (const s of list) {
    if (s.k === 0) drawSprite(SPR.puff, s.x, s.y, s.z, s.w, s.w, [1, 1, 1], s.a);
    else if (s.k === 1) { const w = 1.5; drawSprite(nameTexFor(s.a_), s.x, s.y, s.z, w, w * .25, pl.team === 0 ? [1, .8, .8] : [.8, .88, 1], .95); }
    else if (s.k === 5) drawSprite(SPR.glow, s.x, s.y, s.z, s.w, s.w * 1.25, [1, .08, .08], s.a);
    else if (s.k === 2) drawSprite(SPR.glow, s.x, s.y, s.z, s.w, s.w, [1, .3, .2], s.a);
    else if (s.k === 11) drawSprite(sayTex(s.a_.say.txt), s.x, s.y, s.z, s.w, s.w * .26, [1, 1, 1], s.a);
    else if (s.k === 15) drawSprite(SPR.glow, s.x, s.y, s.z, s.w, s.w * .6, s.col, s.a);
    else if (s.k === 13) drawSprite(dizzyTex(), s.x, s.y + Math.sin(G.time * 6) * .05, s.z, s.w * 1.4, s.w * .7, [1, 1, 1], 1);
    else if (s.k === 14) { drawSprite(SPR.glow, s.x, s.y, s.z, s.w, s.w, [.5, 1, .7], s.a); drawSprite(SPR.glow, s.x, s.y + .3, s.z, s.w * .5, s.w * .5, [1, 1, .8], s.a); }
    else if (s.k === 12) drawSprite(SPR.glow, s.x, s.y, s.z, s.w, s.w * 1.3, [.4, .75, 1], s.a);
    else if (s.k === 6) drawSprite(World.spriteTex.ghost, s.x, s.y, s.z, s.w, s.h, [.86, .95, 1], s.a);
    else if (s.k === 7) drawSprite(SPR.glow, s.x, s.y, s.z, s.w, s.w, s.col, s.a);
    else if (s.k === 8) { drawSprite(SPR.glow, s.x - .09, s.y, s.z, .22, .16, [1, .05, .04], s.a); drawSprite(SPR.glow, s.x + .09, s.y, s.z, .22, .16, [1, .05, .04], s.a); }
    else if (s.k === 9) drawSprite(SPR.puff, s.x, s.y, s.z, s.w, s.h, [.55, .64, .8], s.a);
    else drawSprite(SPR.glow, s.x, s.y, s.z, s.w, s.w, [1, 1, 1], s.a);
  }
  // 第一人稱手
  if (pl && pl.alive && !G.demo && G.state !== 'menu' && G.binK < .5) drawFP();
}
function drawFP() {
  const pl = G.player, O = pl.av.outfit, fp = G.fp, t = G.time, cw = R._cw;
  R.beginFP(1.0);
  const sleeve = O.O.key === 'f' ? [.94, .92, .88] : O.O.key === 'm1' ? O.skin : [.25, .13, .4];
  const skin = O.skin;
  const mat = (c) => { SPR.fpMat[c.join()] = SPR.fpMat[c.join()] || R.mat({ tint: [c[0], c[1], c[2], 1], spec: .08 }); return SPR.fpMat[c.join()]; };
  const mA = mat(sleeve), mH = mat(skin);
  const sway = Math.sin(G.camBob * 2.4) * .01 * Math.min(1, Math.hypot(pl.vx, pl.vz) / 4);
  const camU = fp.camT > 0 ? Math.sin(clamp(fp.camT / .55, 0, 1) * PI) : 0, thr = fp.throwT > 0 ? fp.throwT / .4 : 0, run = pl.sprinting ? .08 : 0;
  const hold = G.slots.some(s => s && s.type === 'cam') ? 0 : 0;
  const place = (x, y, z, rx, ry, rz, mesh, m) => { const L = SPR.tmp2; M4.trs(L, x, y, z, rx, ry, rz, 1, 1, 1); M4.mul(L, cw, L); R.draw(mesh, L, m); };
  // 右手 / 左手：閒置時收在畫面下緣，使用道具時抬起
  const use = Math.max(camU, Math.min(1, thr * 1.4)), rest = 1 - use;
  const rp = [.24 - camU * .15, -.27 - rest * .2 + camU * .12 + sway - run, -.55 - thr * .12], lp = [-.24 + camU * .15, -.27 - rest * .2 + camU * .12 - sway - run, -.55];
  place(rp[0], rp[1], rp[2], .38 - camU * .25 + thr * .8, -.12, 0, SPR.fpArm, mA); place(rp[0], rp[1], rp[2], 0, 0, 0, SPR.fpHand, mH);
  place(lp[0], lp[1], lp[2], .38 - camU * .25, .12, 0, SPR.fpArm, mA); place(lp[0], lp[1], lp[2], 0, 0, 0, SPR.fpHand, mH);
  if (camU > .02) place(0, -.15 + camU * .05, -.55, 0, 0, 0, SPR.camMesh, SPR.camMat);
  if (thr > 0.02) place(rp[0], rp[1] + .03, rp[2] - .03, thr * 2, 0, 0, SPR.gren, SPR.grenMat.flash);
  R.endFP();
}
function drawOrbit() {
  const m = World.cur, o = m.orbit || { c: [0, 0], r: 28, h: 11, ly: 1.5 }, c = R.cam, a = G.time * .13 + (G.orbitSeed || 0);
  c.x = o.c[0] + Math.cos(a) * o.r; c.z = o.c[1] + Math.sin(a) * o.r; c.y = o.h + Math.sin(G.time * .3) * .6;
  const dx = o.c[0] - c.x, dz = o.c[1] - c.z, dist = Math.hypot(dx, dz);
  c.yaw = Math.atan2(-dx, -dz); c.pitch = Math.atan2(o.ly - c.y, dist); c.fov = 1.05; c.roll = 0;
  R.begin(); drawSkyDome(c); World.draw(); const t = G.time; drawSkyFx(c, t);
  const list = []; if (m.night) horrorFx(list, c, t); list.sort((p, q) => q.d - p.d);
  for (const s of list) { if (s.k === 6) drawSprite(World.spriteTex.ghost, s.x, s.y, s.z, s.w, s.h, [.86, .95, 1], s.a); else if (s.k === 7) drawSprite(SPR.glow, s.x, s.y, s.z, s.w, s.w, s.col, s.a); else if (s.k === 9) drawSprite(SPR.puff, s.x, s.y, s.z, s.w, s.h, [.55, .64, .8], s.a); }
}
function drawPreview() {
  if (document.getElementById('charsel').classList.contains('hidden')) { drawOrbit(); return; }
  // 選單：旋轉的角色 + 環繞鏡頭
  const a = G.preview; if (!a) return; const c = R.cam, t = G.time * .35, pv = World.cur.preview || [4, 15], cx = pv[0], cz = pv[1];
  a.x = cx; a.z = cz; a.y = 0; a.sp = 0; a.team = -1; a.plateScale = 1.0;
  const ang = .3 + Math.sin(G.time * .45) * .55, dist = 3.5;
  a.yaw = Math.atan2(Math.sin(ang + .2), -Math.cos(ang + .2)) + Math.sin(G.time * .9) * .3; // 角色始終朝向鏡頭附近，臉一直看得到
  c.x = cx - Math.sin(ang + .2) * dist; c.z = cz + Math.cos(ang + .2) * dist; c.y = 1.05; c.fov = .9; { const th = Math.tan(.45), asp = c.asp || 1.8; c.yaw = Math.atan2(-(cx - c.x), -(cz - c.z)) + Math.atan(.64 * th * asp); c.pitch = -.06 + Math.atan(.1 * th); } c.roll = 0;
  R.begin(); drawSkyDome(c); World.draw();
  a.plateScale = 1; drawAvatar(a); R.polyOffset(true); a.blobS = 1.3; drawBlob(a); R.polyOffset(false);
  drawSkyFx(c, G.time);
}
