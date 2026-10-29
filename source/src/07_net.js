/* ================= 多人連線（房主權威 + 即時房間 presence） =================
   原理（同 Act Normal）：
   - 4 位數密碼 = 房間名稱 fmo-XXXX，優先使用 PeerJS（P2P，房主為連線中心），連不上 PeerJS 伺服器時才改用 claude.use('room')。
   - 房主執行完整模擬（機器人、淘汰判定、道具、旗幟、計分），以約 10Hz 把快照放進自己的 presence。
   - 訪客只負責自己的移動（約 15Hz 上傳位置）與「動作」（輸入的號碼、使用道具），房主確認後生效。 */
const NET = {
  mode: null, tr: null, kind: '', code: '', name: '', phase: 'off', ro: [], order: [], curG: null, setup: null, sendT: 0, acts: [], seq: 0, gid: 0,
  lastSnap: null, hostMissT: 0, dismissedG: null, rsMine: -1, feedSeen: -1, msgSeen: -1, msgQ: [], msgSeq: 0, myIdx: -1, killsSeen: -1, joinT: 0, waiting: false, puffs: [], slC: '', lobbyT: 0, thrP: 0
};
const wait = ms => new Promise(r => setTimeout(r, ms));
const SLOTC = { cam: 1, quake: 2, scope: 3, fake: 4, spring: 5 }, SLOTT = [null, 'cam', 'quake', 'scope', 'fake', 'spring'];
const encSl = s => s ? SLOTC[s.type] * 10 + s.n : 0;
const decSl = c => c ? { type: SLOTT[(c / 10) | 0], n: c % 10 } : null;
function cleanName(s) { s = String(s || '').replace(/[\u0000-\u001f\u007f<>&"']/g, '').trim().slice(0, 10); return s || ('玩家' + randi(10, 99)); }
const hostOf = ps => ps.find(p => !p.me && p.st && p.st.r === 'host');
function myPeer() { const m = NET.tr && NET.tr.peers().find(p => p.me); return m ? m.peer : null; }
function loadScript(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej('net'); document.head.appendChild(s); }); }

/* ---------- 傳輸層 ---------- */
function roomTransport(nr) {
  let cb = () => { }; const off = nr.onPeers(() => cb());
  const KEYS = ['r', 'n', 'c', 'ph', 'cfg', 'setup', 'snap', 'st', 'a', 'bye'];
  return {
    kind: 'room',
    setMine(o) { const patch = {}; for (const k of KEYS) patch[k] = o[k] === undefined ? null : o[k]; nr.presence(patch).catch(() => { }); },
    peers() { return nr.peers().filter(p => p.kind === 'viewer').map(p => ({ peer: p.peer, me: p.sameTab, st: p.presence || {} })); },
    onChange(f) { cb = f; },
    leave() { try { off(); } catch (e) { } try { nr.leave().catch(() => { }); } catch (e) { } }
  };
}
async function peerTransport(code, asHost) {
  if (!window.Peer) await loadScript('https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js');
  const id = 'fmo-' + code, states = new Map(), conns = new Map(); let mine = {}, cb = () => { };
  return await new Promise((res, rej) => {
    let done = false; const fail = e => { if (!done) { done = true; try { peer.destroy(); } catch (x) { } rej(e); } };
    const peer = asHost ? new window.Peer(id) : new window.Peer();
    peer.on('error', e => { const t = e && e.type; fail(t === 'unavailable-id' ? 'taken' : t === 'peer-unavailable' ? 'notfound' : 'net'); if (done && t !== 'unavailable-id' && t !== 'peer-unavailable') cb(); });
    let opened = false; setTimeout(() => { if (!opened) fail('net'); }, 9000);
    peer.on('open', myId => {
      opened = true;
      const api = {
        kind: 'peer',
        setMine(o) { mine = o; for (const c of conns.values()) if (c.open) try { c.send(o); } catch (e) { } },
        peers() { return [{ peer: myId, me: true, st: mine }, ...[...states].map(([p, st]) => ({ peer: p, me: false, st }))]; },
        onChange(f) { cb = f; }, leave() { try { peer.destroy(); } catch (e) { } }
      };
      const wire = c => { c.on('open', () => { conns.set(c.peer, c); try { c.send(mine); } catch (e) { } }); c.on('data', d => { if (d && d.full) { fail('full'); return; } states.set(c.peer, d); cb(); }); c.on('close', () => { conns.delete(c.peer); states.delete(c.peer); cb(); }); };
      if (asHost) { peer.on('connection', c => { if (conns.size >= 7) { c.on('open', () => { try { c.send({ full: 1 }); } catch (e) { } setTimeout(() => c.close(), 400); }); return; } wire(c); }); done = true; res(api); }
      else { const c = peer.connect(id, { serialization: 'json' }); wire(c); c.on('open', () => { if (!done) { done = true; res(api); } }); setTimeout(() => fail('notfound'), 9000); }
    });
  });
}
async function makeTransport(code, asHost) {
  try { return await peerTransport(code, asHost); } catch (e) { if (e !== 'net') throw e; } // PeerJS 優先；連不上 PeerJS 伺服器才退回 Claude 即時房間
  let room = null; try { room = window.claude && window.claude.use ? await window.claude.use('room') : null; } catch (e) { room = null; }
  if (room) { let nr; try { nr = await room.join('fmo-' + code); } catch (e) { throw (e && e.code === 'not_permitted') ? 'denied' : 'net'; } return roomTransport(nr); }
  return await peerTransport(code, asHost);
}
const NET_ERR = { taken: '這組密碼已經有人在用了，請換一組。', notfound: '找不到這個房間，請確認密碼，或請房主先建立房間。', full: '這個房間已滿 8 人。', denied: '你沒有權限加入即時房間：請房主在分享選單把這個頁面分享給你，並確認你已登入 Claude。', net: '連線失敗，請確認網路後再試一次。' };

/* ---------- 建立 / 加入 ---------- */
function mpMsg(t) { $('mpMsg').textContent = t || ''; }
function mpBusy(b, t) { $('mpHost').disabled = b; $('mpJoin').disabled = b; if (t) mpMsg(t); }
async function netCreate() {
  const name = cleanName($('mpName').value), code = $('mpCode').value.trim();
  if (!/^\d{4}$/.test(code)) { mpMsg('請輸入 4 位數字密碼。'); return; }
  S.netName = name; saveS(); mpBusy(true, '建立房間中…'); Sfx.init(); Sfx.resume();
  try {
    const tr = await makeTransport(code, true);
    if (tr.kind === 'room') { tr.setMine({ r: 'probe', n: name }); await wait(1600); if (hostOf(tr.peers())) { tr.leave(); throw 'taken'; } }
    Object.assign(NET, { mode: 'host', tr, kind: tr.kind, code, name, phase: 'lobby', ro: [], order: [], curG: null, setup: null, sendT: 0 });
    go(showLobby);
  } catch (e) { mpMsg(NET_ERR[e] || NET_ERR.net); } finally { mpBusy(false); }
}
async function netJoin() {
  const name = cleanName($('mpName').value), code = $('mpCode').value.trim();
  if (!/^\d{4}$/.test(code)) { mpMsg('請輸入 4 位數字密碼。'); return; }
  S.netName = name; saveS(); mpBusy(true, '尋找房間中…'); Sfx.init(); Sfx.resume();
  try {
    const tr = await makeTransport(code, false);
    tr.setMine({ r: 'guest', n: name, c: S.outfit });
    let h = null; for (let i = 0; i < 28 && !(h = hostOf(tr.peers())); i++) await wait(200);
    if (!h) { tr.leave(); throw 'notfound'; }
    Object.assign(NET, { mode: 'client', tr, kind: tr.kind, code, name, phase: 'lobby', curG: null, lastSnap: null, hostMissT: 0, joinT: performance.now(), sendT: 0, waiting: false, dismissedG: null });
    go(showLobby);
  } catch (e) { mpMsg(NET_ERR[e] || NET_ERR.net); } finally { mpBusy(false); }
}
function netLeave() {
  if (NET.tr) { try { NET.tr.setMine({ r: NET.mode === 'host' ? 'host' : 'guest', bye: 1, n: NET.name }); } catch (e) { } const tr = NET.tr; setTimeout(() => { try { tr.leave(); } catch (e) { } }, 250); }
  Object.assign(NET, { mode: null, tr: null, phase: 'off', ro: [], order: [], curG: null, setup: null, acts: [], lastSnap: null, waiting: false });
  G.netClient = false; $('mp').classList.add('hidden');
}
function leaveWithNotice(msg) {
  netLeave(); resetToMenuUI();
  $('errBox').innerHTML = `<div class="err">${msg || '連線已中斷，已返回主選單。'}</div>`; setTimeout(() => { $('errBox').innerHTML = ''; }, 12000);
}

/* ---------- 大廳 UI ---------- */
function openMP() { $('mp').classList.remove('hidden'); $('mpEntry').classList.remove('hidden'); $('mpLobby').classList.add('hidden'); $('mpName').value = S.netName || ''; mpMsg(''); }
function showLobby() { $('mp').classList.remove('hidden'); $('mpEntry').classList.add('hidden'); $('mpLobby').classList.remove('hidden'); renderLobby(); }
function renderLobby() {
  if (!NET.mode || $('mpLobby').classList.contains('hidden')) return;
  const host = NET.mode === 'host'; $('mpLbCode').textContent = NET.code; $('mpKind').textContent = NET.kind === 'room' ? '（Claude 即時房間・備援）' : '（PeerJS 連線）';
  let members = [], cfg = null;
  if (host) { members = [[myPeer(), NET.name, 1, S.outfit], ...NET.ro.map(r => [r[0], r[1], 0, r[2]])]; cfg = { m: S.mode, n: S.count, d: S.diff, b: S.netBots ? 1 : 0, mp: S.map, tm: S.time || 5, sk: S.skills === false ? 0 : 1 }; }
  else { const h = hostOf(NET.tr.peers()); if (h && h.st.cfg) { cfg = h.st.cfg; members = [[h.peer, cleanName(h.st.n), 1, h.st.c | 0], ...(cfg.ro || []).map(r => [r[0], cleanName(r[1]), 0, r[2]])]; } }
  const list = $('mpMembers'); list.textContent = ''; const me = myPeer();
  members.forEach(m => { const d = document.createElement('div'); d.className = 'mem'; const o = OUTFITS[clamp(m[3] | 0, 0, OUTFITS.length - 1)]; d.textContent = (m[2] ? '👑 ' : '') + m[1] + (m[0] === me ? '（你）' : '') + ' ・ ' + o.label; list.appendChild(d); });
  $('mpChar').textContent = '角色：' + OUTFITS[S.outfit].label + '　（點此更換）';
  $('mpHostCtl').classList.toggle('hidden', !host); $('mpStart').classList.toggle('hidden', !host);
  $('mpGuestInfo').textContent = host ? '' : (NET.waiting ? '遊戲進行中，請等待下一場…' : cfg ? `地圖：${MAPS[cfg.mp] ? MAPS[cfg.mp].name : '熱血高校'}　模式：${MODES[cfg.m] ? MODES[cfg.m].name : cfg.m}　號碼：${codeLabel(cfg.cl || 4)}　時間：${cfg.tm || 5} 分　技能：${cfg.sk === 0 ? '關' : '開'}　總人數：${cfg.n}　難度：${DIFF[cfg.d].name}　機器人補位：${cfg.b ? '開' : '關'}　等待房主開始…` : '連線中…');
  if (!host && cfg && MAPS[cfg.mp] && World.id !== cfg.mp) World.load(cfg.mp);
  $('mpCount').textContent = members.length + ' 位真人';
}
function lobbyHint(t) { const h = $('mpHint'); h.textContent = t; clearTimeout(lobbyHint.t); lobbyHint.t = setTimeout(() => { h.textContent = ''; }, 4000); }
function initNetUI() {
  $('btnMP').onclick = () => go(openMP); $('mpBack').onclick = () => go(() => $('mp').classList.add('hidden'));
  $('mpHost').onclick = netCreate; $('mpJoin').onclick = netJoin; $('mpLeave').onclick = () => go(() => { netLeave(); $('mp').classList.add('hidden'); });
  $('mpStart').onclick = hostStart;
  chips('chNMap', Object.entries(MAPS).map(([k, m]) => ({ v: k, l: m.name })), () => S.map, v => { S.map = v; World.load(v); });
  chips('chNTime', [4, 5, 8, 10].map(n => ({ v: n, l: n + ' 分鐘' })), () => S.time, v => S.time = v);
  chips('chNSkill', [{ v: true, l: '是' }, { v: false, l: '否' }], () => S.skills !== false, v => S.skills = v);
  chips('chNMode', Object.entries(MODES).filter(([k, m]) => !m.soon).map(([k, m]) => ({ v: k, l: m.name })), () => S.mode, v => { S.mode = v; huntLock(); });
  chips('chNCode', CODE_OPTS.map(n => ({ v: n, l: codeLabel(n) })), () => S.codeLen, v => S.codeLen = v);
  $('mpChar').onclick = () => go(() => openCharSelect('mp'));
  chips('chNCount', [4, 8, 12, 16, 20].map(n => ({ v: n, l: n + ' 人' })), () => S.count, v => { S.count = v; S.countSet = true; });
  chips('chNDiff', DIFF.map((d, i) => ({ v: i, l: d.name })), () => S.diff, v => { S.diff = v; $('diffDescN').textContent = DIFF[v].desc; $('trollRowN').classList.toggle('hidden', v !== 3); }); $('diffDescN').textContent = DIFF[S.diff].desc; $('trollRowN').classList.toggle('hidden', S.diff !== 3);
  chips('chNTroll', [{ v: 1, l: '輕度' }, { v: 2, l: '中度' }, { v: 3, l: '重度' }], () => S.trollLv, v => { S.trollLv = v; });
  huntLock();
  chips('chNBots', [{ v: true, l: '機器人補滿人數' }, { v: false, l: '僅限真人' }], () => S.netBots, v => S.netBots = v);
}

/* ---------- 房主 ---------- */
function hostStart() {
  const humans = 1 + NET.ro.length;
  if (!S.netBots && humans < 2) { lobbyHint('至少需要 2 位真人，或開啟「機器人補滿人數」。'); return; }
  const roster = [{ peer: myPeer(), name: NET.name, outfit: S.outfit }, ...NET.ro.map(r => ({ peer: r[0], name: r[1], outfit: r[2] }))];
  roster.map = S.map; NET.gid = (Date.now() % 900000) + 1; NET.phase = 'play'; NET.msgQ = []; NET.msgSeq = 0; G.feedSeq = 0;
  go(() => {
  $('mp').classList.add('hidden');
  beginGame(false, roster);
  G.actors[0].peer = myPeer();
  NET.setup = { tm: S.time || 5, sk: G.skillsOn ? 1 : 0, g: NET.gid, m: G.mode, cl: G.codeLen, mp: G.map, ac: G.actors.map(a => [a.name, a.outfit, a.team, a.isPlayer ? 1 : a.remote ? 2 : 0, a.peer || '']) };
  NET.curG = NET.gid; NET.sendT = 0;
  });
}
function hostToLobby() {
  go(() => { stopGameUI(); NET.phase = 'lobby'; NET.setup = null; NET.curG = null; showLobby(); });
}
function netMsg(text, kind) { if (NET.mode !== 'host') return; NET.msgQ.push([++NET.msgSeq, text, kind || '']); if (NET.msgQ.length > 3) NET.msgQ.shift(); }
function hostReadPeers(dt) {
  const ps = NET.tr.peers().filter(p => !p.me && p.st && p.st.r === 'guest' && !p.st.bye);
  if (NET.phase === 'lobby') {
    const ids = new Set(ps.map(p => p.peer)); NET.order = NET.order.filter(id => ids.has(id)); for (const p of ps) if (!NET.order.includes(p.peer)) NET.order.push(p.peer);
    NET.order = NET.order.slice(0, 7);
    NET.ro = NET.order.map(id => { const p = ps.find(x => x.peer === id); return [id, cleanName(p.st.n), clamp(p.st.c | 0, 0, OUTFITS.length - 1)]; });
    return;
  }
  for (const a of G.actors) {
    if (!a.remote) continue; const p = ps.find(x => x.peer === a.peer);
    if (!p) { a.missT = (a.missT || 0) + dt; if (a.missT > 3) { a.remote = false; a.net = null; a.speed = (4 + Math.random() * .7) * 1.3; a.smart = false; } continue; }
    a.missT = 0; const st = p.st.st;
    if (Array.isArray(st) && st.length >= 8 && a.alive && st[7] === a.rsC) a.net = { x: +st[0] / 100 || 0, z: +st[1] / 100 || 0, y: +st[2] / 100 || 0, yaw: +st[3] / 100 || 0, pitch: +st[4] / 100 || 0, lo: clamp(+st[6] / 100 || 0, -.6, .6) };
    if (Array.isArray(p.st.a)) for (const ac of p.st.a) if (Array.isArray(ac) && ac[0] > (a.lastSeq || 0)) { a.lastSeq = ac[0]; hostAct(a, ac); }
  }
}
function hostAct(a, ac) {
  if (!a.alive || G.state !== 'playing') return;
  if (ac[1] === 'k') {
    const t = G.actors.find(x => x.alive && x.number === String(ac[3])); if (t && t !== a && t.alive && t.protect <= 0 && t.number === String(ac[3]) && (isDM() || t.team !== a.team)) eliminate(a, t);
  } else if (ac[1] === 'w') { a.redT = 2; a.streak = 0; a.cloak = false; }
  else if (ac[1] === 's') { castSkill(a); }
  else if (ac[1] === 'u') {
    const i = ac[2] | 0, it = a.slots && a.slots[i]; if (!it) return;
    if (it.type !== 'cam' && it.type !== 'scope') applyItem(a, it.type);
    it.n--; if (it.n <= 0) a.slots[i] = null;
  }
}
function updateRemote(a, dt) {
  if (!a.alive) { updateDead(a, dt); return; }
  a.protect = Math.max(0, a.protect - dt); a.blind = Math.max(0, a.blind - dt); a.redT = Math.max(0, (a.redT || 0) - dt); tryPickup(a);
  const t = a.net; if (!t) return;
  const k = 1 - Math.exp(-dt * 16), ox = a.x, oz = a.z;
  if (Math.hypot(t.x - a.x, t.z - a.z) > 6) { a.x = t.x; a.z = t.z; } else { a.x += (t.x - a.x) * k; a.z += (t.z - a.z) * k; }
  a.lo += ((t.lo || 0) - a.lo) * k; a.y += (t.y - a.y) * k; a.yaw += angDiff(a.yaw, t.yaw) * k; a.pitch = t.pitch; a.gy = groundAt(a.x, a.z, a.y + .1);
  const sp = Math.hypot(a.x - ox, a.z - oz) / Math.max(dt, 1e-3); a.vx = (a.x - ox) / Math.max(dt, 1e-3); a.vz = (a.z - oz) / Math.max(dt, 1e-3); a.sp = clamp(sp / 8.4, 0, 1); a.animT += dt * (5 + a.sp * 9) * (sp > .3 ? 1 : 0);
}
function buildSnap() {
  const A = G.actors, ac = [];
  for (let i = 0; i < A.length; i++) {
    const a = A[i];
    const e = [Math.round(a.x * 20), Math.round(a.z * 20), Math.round(a.y * 20), Math.round(a.yaw * 50), Math.round(a.sp * 10), (a.alive ? 1 : 0) | (a.carry ? 2 : 0) | (a.protect > 0 ? 4 : 0) | (a.redT > 0 ? 8 : 0) | (a.lo > .12 ? 32 : a.lo < -.12 ? 16 : 0) | (a.shieldT > 0 ? 64 : 0) | (a.invis ? 128 : 0) | (a.ctrlT > 0 ? 256 : 0) | (a.dackE >= 1 ? 512 : 0), a.kills, a.deaths, a.fake || a.number];
    if (a.isPlayer || a.remote) {
      const sl = a.isPlayer ? G.slots : (a.slots || [null, null]); let thr = -1, tp = 0;
      if (a.alive) for (let j = 0; j < A.length; j++) { const b = A[j]; if (b === a || !b.alive || !b.read) continue; let q = b.read[a.id] || 0; if (b.typing && b.typing.target === a) q = 1; if (q > tp && q > .12) { tp = q; thr = j; } }
      e.push(a.rsC || 0, a.killedBy ? A.indexOf(a.killedBy) : -1, Math.round((a.isPlayer ? G.flashT : a.blind) * 10), thr, Math.round(tp * 10), a.lastSeq || 0, encSl(sl[0]), encSl(sl[1]), Math.round((a.skCd || 0) * 10), Math.round((a.shieldT || 0) * 10), Math.round((a.ctrlT || 0) * 10), a.ctrlBy ? A.indexOf(a.ctrlBy) : -1, (a.clrRev === G.sk.rev.id ? 1 : 0) | (a.clrScr === G.sk.scr.id ? 2 : 0) | (a.clrInk === G.sk.ink.id ? 4 : 0));
    }
    ac.push(e);
  }
  const snap = {
    cd: Math.ceil(G.countdown * 10), tl: Math.ceil(G.tleft), sc: G.scores, st: G.state === 'ended' ? 1 : 0, w: G.winner, ac,
    gr: G.grenades.slice(0, 6).map(g => [SLOTC[g.type], Math.round(g.x * 10), Math.round(g.y * 10), Math.round(g.z * 10)]),
    sm: G.smokes.slice(0, 4).map(s => [Math.round(s.x * 10), Math.round(s.y * 10), Math.round(s.z * 10), Math.round(s.r * 10), Math.round(s.t * 10)]),
    lu: G.lures.slice(0, 3).map(l => [Math.round(l.x * 10), Math.round(l.z * 10), Math.round(l.t * 10)]),
    fg: G.mode === 'ctf' ? G.flags.map(f => [f.state === 'home' ? 0 : f.state === 'carried' ? 1 : 2, Math.round(f.x * 10), Math.round(f.z * 10), Math.round(f.y * 10), f.carrier ? A.indexOf(f.carrier) : -1]) : [],
    sk: [Math.round(G.sk.rev.t * 10), G.actors.indexOf(G.sk.rev.by), Math.round(G.sk.scr.t * 10), G.actors.indexOf(G.sk.scr.by), Math.round(G.sk.ink.t * 10), G.actors.indexOf(G.sk.ink.by), Math.round(G.sk.eagle.t * 10), G.actors.indexOf(G.sk.eagle.by), Math.round(G.sk.quake.t * 10), G.actors.indexOf(G.sk.quake.by), G.sk.night.by ? Math.round(G.sk.night.e * 10) : -1, G.actors.indexOf(G.sk.night.by)],
    pk: G.pickups.reduce((m, p, i) => m | (p.on ? (1 << i) : 0), 0),
    fd: G.feed.slice(-4).map(f => [f.seq, f.ki, f.vi, f.st || 0]), hs: G.mode === 'hunt' ? G.actors.map(a => a.score || 0) : 0, ms: NET.msgQ.slice()
  };
  return snap;
}
function hostSend() {
  const base = { r: 'host', n: NET.name, c: S.outfit };
  if (NET.phase === 'lobby') { NET.tr.setMine({ ...base, ph: 'lobby', cfg: { m: S.mode, n: S.count, d: S.diff, b: S.netBots ? 1 : 0, cl: S.codeLen, mp: S.map, tm: S.time || 5, sk: S.skills === false ? 0 : 1, ro: NET.ro } }); return; }
  const st = { ...base, ph: NET.phase, setup: NET.setup, snap: buildSnap() };
  try { while (JSON.stringify(st).length > 3900 && st.snap.ms.length) st.snap.ms.shift(); } catch (e) { }
  NET.tr.setMine(st);
}

/* ---------- 訪客 ---------- */
function netAct(act) { act.unshift(++NET.seq); NET.acts.push(act); if (NET.acts.length > 8) NET.acts.shift(); }
function clientSend() {
  const st = { r: 'guest', n: NET.name, c: S.outfit }, p = G.player;
  if (NET.curG && p && G.netClient) { st.st = [Math.round(p.x * 100), Math.round(p.z * 100), Math.round(p.y * 100), Math.round(p.yaw * 100), Math.round(p.pitch * 100), p.alive ? 1 : 0, Math.round(p.lo * 100), NET.rsMine]; st.a = NET.acts; }
  NET.tr.setMine(st);
}
function clientPoll(dt) {
  const h = hostOf(NET.tr.peers());
  if (!h || h.st.bye) { NET.hostMissT += dt; if (h && h.st.bye || NET.hostMissT > (NET.curG ? 3 : 5)) leaveWithNotice('房主已離線，已返回主選單。'); return; }
  NET.hostMissT = 0; const st = h.st;
  if (st.ph === 'lobby') { NET.waiting = false; if (NET.curG) { NET.dismissedG = null; clientToLobby(true); } return; }
  const s = st.setup; if (!s) return;
  if (s.g !== NET.curG) {
    if (s.g === NET.dismissedG) { NET.waiting = true; return; }
    if (NET.starting) return; NET.starting = true; go(() => { NET.starting = false; if (!clientStartGame(s)) NET.waiting = true; }); return;
  }
  if (st.snap && st.snap !== NET.lastSnap && G.netClient) { NET.lastSnap = st.snap; applySnap(st.snap); }
}
function clientStartGame(s) {
  const me = myPeer(), idx = s.ac.findIndex(x => x[4] === me && x[3] === 2); if (idx < 0) return false;
  World.load(MAPS[s.mp] ? s.mp : 'hb'); G.map = World.id;
  G.mode = s.m; G.codeLen = s.cl === 0 ? 0 : (s.cl || 4); G.countdown = 3; G.freezeT = 0; NET.prevCd = 3; G.limit = MODES[s.m].limit; G.tleft = (s.tm || 5) * 60; G.skillsOn = s.sk !== 0; G.scores = [0, 0]; G.grenades = []; G.smokes = []; G.lures = []; G.fx = []; G.feed = []; G.feedVer = 1; G.typed = ''; G.lock = 0; G.time = 0; G.demo = false; G.view = null;
  _id = 0; freeActors(G.actors); G.actors = [];
  s.ac.forEach((x, i) => { const a = newActor(x[0], x[1], i === idx); a.team = x[2]; a.alive = false; a.deadT = 99; a.number = '0000'; a.init = false; a.net = true; drawPlate(a); G.actors.push(a); });
  G.player = G.actors[idx]; G.player.deadT = 0; NET.myIdx = idx; G.netClient = true;
  G.slots = [null, null]; G.bino = false; G.binK = 0; G.energy = 1; G.stam = 1; G.flashT = 0; G.itemCd = 0; G.threat = null;
  G.pickups = World.pickSpots.map(p => ({ x: p[0], z: p[1], y: p[2] ? World.mezz.h : 0, l: p[2] | 0, on: true, t: 0 })); initFlags(); skReset(); G.state = 'playing'; G.fov = 1.2; G.winner = '';
  Object.assign(NET, { curG: s.g, rsMine: -1, killsSeen: -1, feedSeen: -1, msgSeen: -1, acts: [], puffs: [], waiting: false, lastSnap: null, slC: '' });
  beginNetClientUI(); return true;
}
function applySnap(s) {
  const A = G.actors, me = G.player;
  G.tleft = s.tl; G.scores = s.sc;
  if (NET.prevCd > 0 && s.cd === 0) { Sfx.bell(); UI.goText(); } G.countdown = s.cd / 10; NET.prevCd = s.cd;
  for (let i = 0; i < A.length; i++) {
    const e = s.ac[i], a = A[i]; if (!e || !a) continue;
    const alive = !!(e[5] & 1);
    a.kills = e[6]; a.deaths = e[7]; if (a.number !== e[8]) { a.number = e[8]; drawPlate(a); }
    a.carry = (e[5] & 2) ? true : null; a.protect = (e[5] & 4) ? 1 : 0; if (a !== me) { a.dackE = (e[5] & 512) ? 2 : -1; a.invis = !!(e[5] & 128); a.ctrlT = (e[5] & 256) ? .3 : 0; a.shieldT = (e[5] & 64) ? 1 : 0; a.redT = (e[5] & 8) ? .4 : 0; a.lo += (((e[5] & 32) ? .45 : (e[5] & 16) ? -.45 : 0) - a.lo) * .4; }
    if (a !== me) {
      a.tx = e[0] / 20; a.tz = e[1] / 20; a.ty = e[2] / 20; a.tyaw = e[3] / 50;
      if (!a.init || (!a.alive && alive)) { a.x = a.tx; a.z = a.tz; a.y = a.ty; a.yaw = a.tyaw; a.init = true; a.fall = 0; }
      if (a.alive && !alive) a.deadT = 0; if (!alive && !a.init) a.deadT = 99;
      a.alive = alive;
    } else {
      const rs = e[9];
      if (rs !== NET.rsMine) {
        NET.rsMine = rs; me.x = e[0] / 20; me.z = e[1] / 20; me.y = e[2] / 20; me.yaw = e[3] / 50; me.pitch = 0; me.vx = me.vz = me.vy = 0; me.alive = true; me.fall = 0; me.protect = 1.8; me.deadT = 0; G.typed = ''; G.bino = false; G.camY = me.y + EYE; UI.onRespawn(); UI.dirty = true;
      } else if (me.alive && !alive) {
        me.alive = false; me.deadT = 0; me.respawnT = 3.2; const k = A[e[10]]; me.killedBy = k; G.typed = ''; G.bino = false; Sfx.die(); if (k) UI.onDeath(k); UI.dirty = true;
      }
      const fl = e[11] / 10; if (fl > G.flashT + .05) { G.flashT = fl; G.flashMax = Math.max(1, fl); Sfx.bang(.6); }
      me.skCd = (e[17] || 0) / 10; me.shieldT = (e[18] || 0) / 10; me.ctrlT = (e[19] || 0) / 10; me.ctrlBy = A[e[20]] || null; { const m = e[21] || 0; me.clrRev = (m & 1) ? 1 : -1; me.clrScr = (m & 2) ? 1 : -1; me.clrInk = (m & 4) ? 1 : -1; }
      const slc = e[15] + ',' + e[16]; if (slc !== NET.slC) { NET.slC = slc; G.slots = [decSl(e[15]), decSl(e[16])]; UI.dirty = true; }
      NET.acts = NET.acts.filter(x => x[0] > e[14]);
      G.threat = e[12] >= 0 && A[e[12]] && me.alive ? { b: A[e[12]], p: e[13] / 10 } : null;
      if (NET.killsSeen >= 0 && e[6] > NET.killsSeen) { Sfx.kill(); UI.killFlash(); const f = s.fd.slice().reverse().find(x => x[1] === NET.myIdx); const v = f && A[f[2]]; UI.msg('你淘汰了 ' + (v ? v.name + ' (' + v.number + ')' : '一名對手'), 'good'); }
      NET.killsSeen = e[6];
    }
  }
  G.grenades = s.gr.map(g => ({ type: SLOTT[g[0]], x: g[1] / 10, y: g[2] / 10, z: g[3] / 10, spin: G.time * 10 }));
  G.smokes = s.sm.map((m, i) => { const pf = NET.puffs[i] || (NET.puffs[i] = Array.from({ length: 9 }, () => ({ ox: rand(-.6, .6), oy: rand(-.1, .7), oz: rand(-.6, .6), s: rand(1.1, 1.7), ph: rand(0, 6) }))); return { x: m[0] / 10, y: m[1] / 10, z: m[2] / 10, r: m[3] / 10, rMax: 5.4, t: m[4] / 10, life: 16, puffs: pf }; });
  G.lures = s.lu.map(l => ({ x: l[0] / 10, y: 0, z: l[1] / 10, t: l[2] / 10, life: 7, nt: 1 }));
  if (G.mode === 'ctf') G.flags.forEach((f, i) => { const e = s.fg[i]; if (!e) return; f.state = ['home', 'carried', 'dropped'][e[0]]; f.x = e[1] / 10; f.z = e[2] / 10; f.y = e[3] / 10; f.carrier = e[4] >= 0 ? A[e[4]] : null; });
  G.pickups.forEach((p, i) => { p.on = !!(s.pk & (1 << i)); });
  if (s.hs) s.hs.forEach((v, i) => { if (A[i]) A[i].score = v; });
  if (s.sk) { G.sk.rev = { t: s.sk[0] / 10, by: A[s.sk[1]] || null, id: 1 }; G.sk.scr = { t: s.sk[2] / 10, by: A[s.sk[3]] || null, id: 1 }; G.sk.ink = { t: (s.sk[4] || 0) / 10, by: A[s.sk[5]] || null, id: 1 }; G.sk.eagle = { t: (s.sk[6] || 0) / 10, by: A[s.sk[7]] || null }; G.sk.quake = { t: (s.sk[8] || 0) / 10, by: A[s.sk[9]] || null }; G.sk.night = { e: s.sk[10] >= 0 ? s.sk[10] / 10 : 0, by: s.sk[10] >= 0 ? (A[s.sk[11]] || null) : null }; }
  if (NET.feedSeen < 0) NET.feedSeen = s.fd.length ? s.fd[s.fd.length - 1][0] : 0;
  for (const f of s.fd) if (f[0] > NET.feedSeen) { NET.feedSeen = f[0]; const k = A[f[1]], v = A[f[2]]; if (k && v) { G.feed.push({ t: 6, k: k.name, v: v.name, me: k === me || v === me, st: f[3] || 0, seq: f[0] }); if (k === me && f[3] > 1) UI.streak(f[3], STREAK_PTS[Math.min(f[3], 5) - 1]); if (G.feed.length > 5) G.feed.shift(); G.feedVer++; } }
  if (NET.msgSeen < 0) NET.msgSeen = s.ms.length ? s.ms[s.ms.length - 1][0] : 0;
  for (const m of s.ms) if (m[0] > NET.msgSeen) { NET.msgSeen = m[0]; UI.msg(m[1], m[2]); }
  if (s.st === 1 && G.state === 'playing') { G.state = 'ended'; G.winner = s.w; UI.onEnd(); }
}
function updateClientGame(dt) {
  if (G.state === 'ended') { G.time += dt; In.lookX = In.lookY = 0; return; } // 結算：全場暫停
  G.time += dt; if (G.state === 'playing' && G.countdown <= 0) { G.tleft = Math.max(0, G.tleft - dt); const me0 = G.player; if (me0) me0.skCd = Math.max(0, me0.skCd - dt); if (G.sk.rev.t > 0) G.sk.rev.t -= dt; if (G.sk.scr.t >= 0) G.sk.scr.t += dt; if (G.sk.ink.t > 0) G.sk.ink.t -= dt; if (G.sk.eagle.t > 0) G.sk.eagle.t -= dt; if (G.sk.quake.t > 0) G.sk.quake.t -= dt; if (G.sk.night.by) G.sk.night.e += dt; if (me0) { me0.ctrlT = Math.max(0, (me0.ctrlT || 0) - dt); if (isOut(me0, 11)) { me0.cleanT = (me0.cleanT ?? 2.5) - dt; if (me0.cleanT <= 0) { me0.cleanT = 2.5; G.flashT = 0; G.freezeT = 0; G.lock = 0; me0.redT = 0; me0.ctrlT = 0; UI.cleanse(); } } } }
  if (G.countdown > 0) { G.countdown = Math.max(0, G.countdown - dt); In.lookX = In.lookY = 0; } else if (G.player) updatePlayer(dt);
  const k = 1 - Math.exp(-dt * 14);
  for (const a of G.actors) {
    if (a === G.player) continue;
    const ox = a.x, oz = a.z;
    if (a.init) { a.x += (a.tx - a.x) * k; a.z += (a.tz - a.z) * k; a.y += (a.ty - a.y) * k; a.yaw += angDiff(a.yaw, a.tyaw) * k; }
    const sp = Math.hypot(a.x - ox, a.z - oz) / Math.max(dt, 1e-3); a.sp = a.alive ? clamp(sp / 8.4, 0, 1) : 0; a.animT += dt * (5 + a.sp * 9) * (sp > .3 ? 1 : 0);
    a.gy = groundAt(a.x, a.z, a.y + .1);
    if (!a.alive) { a.deadT += dt; a.fall = Math.min(1, a.fall + dt * 3); }
  }
  for (const g of G.grenades) g.spin += dt * 10;
  for (let i = G.feed.length - 1; i >= 0; i--) { G.feed[i].t -= dt; if (G.feed[i].t <= 0) { G.feed.splice(i, 1); G.feedVer++; } }
  for (const a of G.actors) { const f = FWD(a.yaw); a.fx = f[0]; a.fz = f[1]; }
  updateCamera(dt);
}
function clientToLobby(fromHost) {
  go(() => { stopGameUI(); NET.dismissedG = fromHost ? null : NET.curG; NET.curG = null; G.netClient = false; NET.waiting = false; showLobby(); });
}
function netTick(dt) {
  if (!NET.tr || !NET.mode) return;
  if (NET.mode === 'host') hostReadPeers(dt); else clientPoll(dt);
  if (!NET.mode) return;
  NET.lobbyT -= dt; if (NET.lobbyT <= 0) { NET.lobbyT = .5; renderLobby(); }
  NET.sendT -= dt; if (NET.sendT > 0) return;
  if (NET.mode === 'host') { NET.sendT = NET.phase === 'lobby' ? .25 : .1; hostSend(); }
  else { NET.sendT = NET.curG ? .066 : .4; clientSend(); }
}
