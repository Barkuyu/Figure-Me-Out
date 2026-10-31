/* ================= UI / 輸入 / 主迴圈 ================= */
const UI = {
  dirty: true, els: {}, paused: false, locked: false, noLock: false, dragLook: false, msgT: 0, photoT: 0, flashW: 0, killF: 0, lastFeed: '', lastTimer: '', lastTyped: null,
  init() {
    const ids = ['hud', 'scR', 'scB', 'timer', 'modeName', 'killfeed', 'msg', 'typed', 'stamFill', 'binFill', 'slotF', 'slotG', 'warn', 'warnArrow', 'warnBox', 'warnFill', 'warnTxt', 'carry', 'photo', 'photoCv', 'photoCap', 'fps', 'flash', 'deadv', 'deadMsg', 'bino', 'end', 'pause', 'pauseTxt', 'menu', 'panel', 'flagR', 'flagB', 'rotate', 'hints', 'binwrap', 'stamwrap', 'demoTag', 'countdown'];
    ids.forEach(i => this.els[i] = $(i));
  },
  msg(t, k) { const e = this.els.msg; e.textContent = t; e.className = 'show ' + (k || ''); this.msgT = 2.2; },
  flashWhite(a) { this.flashW = Math.max(this.flashW, a); },
  streak(n, pts) { if (n < 2) { this.msg('+' + pts + ' 分', 'good'); return; } const t = STREAK_TXT[Math.min(n, 5) - 1], el = $('streak'); el.innerHTML = t + '<small>+' + pts + ' 分</small>'; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); Sfx.kill(); },
  killFlash() { this.killF = .25; },
  shake() { const e = this.els.typed; e.classList.remove('shake'); void e.offsetWidth; e.classList.add('shake'); },
  onDeath(k) {
    const e = this.els.deadMsg; e.innerHTML = `你被 <span style="color:#ffd36b">${k.name}</span> 淘汰了<small>他讀到了你額頭上的 ${G.player.number}</small>`; e.classList.remove('hidden'); this.els.deadv.style.opacity = 1;
  },
  onRespawn() { this.els.deadMsg.classList.add('hidden'); this.els.deadv.style.opacity = 0; this.dirty = true; },
  hideEnd() { this.els.end.classList.add('hidden', 'flipin'); const f = $('fin'); if (f) f.classList.add('hidden'); this.endTok = (this.endTok || 0) + 1; },
  /* 結算流程：全場暫停 → 勝利(金光)/落敗(灰暗) 過場 3 秒 → 翻牌顯示結算表 */
  onEnd() {
    const p = G.player, tok = this.endTok = (this.endTok || 0) + 1; let res = null;
    if (G.sk) { G.sk.rev.t = 0; G.sk.scr.t = -1; G.sk.rel.t = -1; } this.endScramble(); this._ph2 = false; this._pf = false; $('numL').classList.remove('purple'); $('numR').classList.remove('purple'); $('pflash').classList.remove('on');
    if (document.exitPointerLock) try { document.exitPointerLock(); } catch (e) { }
    if (p && !G.demo) { if (G.mode === 'arena') res = 'lose'; else if (isDM()) res = G.winner === p.name ? 'win' : 'lose'; else res = G.winner === -1 ? 'draw' : (G.winner === p.team ? 'win' : 'lose'); }
    if (!res) { this.showEnd(false); return; }
    const f = $('fin'); f.className = res === 'win' ? 'win' : 'lose'; f.innerHTML = '<div class="finBg"></div><div class="finRays"></div><div class="finTxt">' + (res === 'win' ? 'Victory' : res === 'draw' ? 'Draw' : 'Defeat') + '</div>';
    if (res === 'win') { for (let k = 0; k < 18; k++) { const i = document.createElement('i'); i.textContent = '✦'; i.style.left = (Math.random() * 96) + '%'; i.style.top = (Math.random() * 90) + '%'; i.style.fontSize = (14 + Math.random() * 26) + 'px'; i.style.animationDelay = (.2 + Math.random() * 1.6) + 's'; f.appendChild(i); } Sfx.victory(); } else Sfx.defeat();
    const wait = res === 'win' ? 4300 : 4900;
    setTimeout(() => {
      if (tok !== this.endTok || G.state !== 'ended') return; f.classList.add('flipout');
      setTimeout(() => { if (tok !== this.endTok || G.state !== 'ended') return; f.classList.add('hidden'); f.classList.remove('flipout'); this.showEnd(true); }, 380);
    }, wait);
  },
  showEnd(flip) {
    const hunt = G.mode === 'hunt', arena = G.mode === 'arena', sorted = (hunt || arena ? G.actors.filter(a => a.isPlayer || a.remote) : G.actors).slice().sort((a, b) => hunt ? (b.score || 0) - (a.score || 0) : b.kills - a.kills || a.deaths - b.deaths), p = G.player || {};
    let title = '', col = '#fff';
    if (arena) { title = `💀 全員陣亡　最終抵達 Stage ${(G.arena && G.arena.stage) || 1}`; col = '#ffd24a'; }
    else if (isDM()) { title = G.winner === p.name ? '🏆 你贏了！' : `${G.winner} 獲勝`; }
    else { const w = G.winner; if (w === -1) title = '平手'; else { title = (w === p.team ? '🏆 你的隊伍獲勝！' : '對手隊伍獲勝'); col = w === 0 ? '#ff7a7a' : '#7aa5ff'; } }
    let rows = sorted.map((a, i) => `<tr class="${a.isPlayer ? 'me' : ''}"><td class="n">${i + 1}</td><td><span class="dot" style="background:${a.team === 0 ? '#d93a3a' : a.team === 1 ? '#3a6fd9' : '#999'}"></span>${a.name}</td><td class="n">${a.kills}</td><td class="n">${hunt ? (a.score || 0) : a.deaths}</td></tr>`).join('');
    const sc = isDM() || arena ? '' : `<div style="font-size:20px;margin-bottom:6px"><span style="color:#ff7a7a">紅 ${G.scores[0]}</span>　-　<span style="color:#7aa5ff">${G.scores[1]} 藍</span></div>`;
    this.els.end.innerHTML = `<h2 style="color:${col}">${title}</h2>${sc}<table><tr><th class="n">#</th><th>玩家</th><th class="n">淘汰</th><th class="n">${hunt ? '積分' : '被淘汰'}</th></tr>${rows}</table><div class="btnrow"><button class="btn" id="btnAgain">再來一場</button><button class="btn alt" id="btnMenu">回主選單</button></div>`;
    this.els.end.classList.remove('hidden', 'flipin'); if (flip) { void this.els.end.offsetWidth; this.els.end.classList.add('flipin'); }
    $('btnAgain').onclick = () => { const d = G.demo; this.hideEnd(); if (G.mode === 'kof' && !d) { go(() => { resetToMenuUI(); startPickFlow(); }); } else beginGame(d); };
    $('btnMenu').onclick = () => { this.hideEnd(); toMenu(); };
    if (NET.mode) { if (NET.mode === 'host') NET.phase = 'end'; $('btnAgain').textContent = '回到大廳'; $('btnAgain').onclick = () => { this.hideEnd(); if (NET.mode === 'host') hostToLobby(); else clientToLobby(false); }; $('btnMenu').textContent = '離開房間'; }
    if (document.exitPointerLock) try { document.exitPointerLock(); } catch (e) { }
  },
  capturePhoto() {
    const cvs = R.gl.canvas, cw = cvs.width, ch = cvs.height, sw = cw * (G.binK > .5 ? .8 : .42), sh = sw * .75, sx = (cw - sw) / 2, sy = (ch - sh) / 2 - ch * .02;
    const pc = this.els.photoCv, g = pc.getContext('2d'); try { g.drawImage(cvs, sx, sy, sw, sh, 0, 0, pc.width, pc.height); } catch (e) { }
    // 簡單的拍立得色調
    g.fillStyle = 'rgba(255,240,210,.06)'; g.fillRect(0, 0, pc.width, pc.height);
    this.els.photo.classList.remove('hidden', 'fade'); this.photoT = 2.2; this.dirty = true;
  },
  cleanse() { const c = $('cleanse'); c.classList.remove('on'); void c.offsetWidth; c.classList.add('on'); },
  slotHTML(el, s) {
    const ico = el.querySelector('.ico'), n = el.querySelector('small');
    if (!s) { ico.textContent = ''; n.textContent = ''; el.classList.remove('has', 'felix'); return; }
    ico.textContent = ITEMS[s.type].ico; n.textContent = s.n > 1 ? s.n : ''; el.classList.add('has'); el.classList.toggle('felix', s.type === 'cam' && !!G.player && isOut(G.player, 28));
  },
  /* 英雄技能鍵：圓形倒數環 + 秒數；艾伯特技能的預警閃光與按鍵錯亂 */
  setEv(key, rem, ico) { const e = this.ev || (this.ev = {}); if (!e[key]) e[key] = { seq: (this.evSeq = (this.evSeq || 0) + 1) }; e[key].rem = rem; e[key].ico = ico || '⏱'; },
  clrEv(key) { if (this.ev) delete this.ev[key]; },
  renderPills() { // 右上角倒數時鐘：事件倒數在前、技能倒數在後；第一個白底，其餘依序換底色
    const L = Object.values(this.ev || {}).sort((a, b) => a.seq - b.seq).filter(x => x.rem > .02).map(x => [x.ico, x.rem]).concat(G.state === 'playing' && !document.getElementById('hud').classList.contains('hidden') ? (this.skPills || []) : []);
    const key = L.map(x => x[0] + Math.ceil(x[1])).join('|'); if (key === this._pk) return; this._pk = key;
    const COL = ['#ffffff', '#ffe27a', '#9fe3ff', '#ffb3c8', '#c3f5a6', '#e0c3ff'];
    $('sktm').innerHTML = L.map((x, i) => `<span style="--pbg:${COL[i % COL.length]}"><i class="clk"></i><i class="ti">${x[0]}</i><b>${Math.ceil(x[1])}</b></span>`).join('');
  },
  modeHUD(dt, p) {
    const A = G.arena, ar = G.mode === 'arena' && !!A && !G.demo, bn = $('arBanner'), bg = $('arBig');
    const intro = ar && A.ph === 0 && G.countdown <= 0; bn.classList.toggle('hidden', !intro);
    if (intro) this.setEv('ar', A.t, '🏟️'); else this.clrEv('ar');
    let key = ''; if (ar) { if (A.ph === 1) key = 's' + A.stage; else if (A.ph === 3) key = 'c' + A.stage; }
    if (key !== this._arK) { this._arK = key; if (!key) bg.classList.add('hidden'); else { bg.className = key[0] === 's' ? 'stage' : 'clear'; bg.innerHTML = key[0] === 's' ? 'Stage ' + A.stage : 'Clear！！' + [[-6, 10], [105, -4], [30, 95], [80, 88], [-10, 70], [50, -22]].map((q, i) => `<i style="left:${q[0]}%;top:${q[1]}%;animation-delay:${i * .15}s;font-size:${22 + i * 4}px">✦</i>`).join(''); } }
    if (ar && p && !p.alive && p.respawnT > 0 && p.respawnT < 1e8 && G.state === 'playing') this.setEv('rs', p.respawnT, '💀'); else this.clrEv('rs');
    const kof = G.mode === 'kof' && G.actors.length >= 2, kb = $('kofbar'); kb.classList.toggle('hidden', !kof);
    if (kof) {
      const me = G.player || G.actors[0], ot = G.actors.find(a => a !== me), key2 = [me, ot].map(a => (a.kroster || []).join() + '/' + (a.kleft || []).join() + '/' + a.kcur + (a.alive ? 1 : 0)).join('#');
      if (key2 !== this._kk) { this._kk = key2; const side = (a, cls) => `<div class="ks ${cls}"><em>${a === me ? '你' : a.name}</em>` + (a.kroster || []).map(i => `<i class="ki${(a.kleft || []).includes(i) ? '' : ' used'}${a.alive && a.kcur === i ? ' cur' : ''}" style="background-image:url(${outfitIcon(i)})"></i>`).join('') + '</div>'; kb.innerHTML = side(me, '') + side(ot, 'r'); }
      if (p && !p.alive && p.kw > 0 && p.kleft && p.kleft.length && !CS.o && G.state === 'playing') {
        try { if (document.exitPointerLock) document.exitPointerLock(); } catch (e) { }
        openPick({ need: 1, allowed: p.kleft.slice(), secs: Math.max(1, p.kw), evIco: '⏳', title: `選擇下一位出戰英雄（剩 ${p.kleft.length} 位）`, okText: '確認出戰', back: null, kofChoose: true, noPrev: true, onDone: list => { if (G.netClient) netAct(['kp', list[0]]); else kofPick(G.player, list[0]); } });
      }
    }
    if (CS.o && CS.o.kofChoose && (!p || p.alive || G.state !== 'playing' || G.mode !== 'kof')) closePick();
  },
  skTimers(p) {
    const K = G.sk, L = [], add = (ico, r) => { if (r > .05) L.push([ico, r]); }, cd = p.skCd || 0, c = G.netClient;
    if (K) {
      if (K.rev.by === p && K.rev.t > 0) add('🔄', K.rev.t);
      if (K.scr.by === p && K.scr.t >= 0) add('⚡', SCR_TOTAL - K.scr.t);
      if (K.ink.by === p && K.ink.t > 0) add('🦑', K.ink.t);
      if (K.eagle.by === p && K.eagle.t > 0) add('🎯', K.eagle.t);
      if (K.night.by === p) add('🌑', Math.min(30, 31.5 - K.night.e));
      if (K.rel && K.rel.by === p && K.rel.t >= 0) add('🔀', REL_WARN + REL_DUR - K.rel.t);
    }
    add('🛡️', p.shieldT || 0);
    if (p.fake && p.fakeOf) add('🎭', p.fakeT); else if (c && p.fakeT > 0) add('🎭', p.fakeT);
    add('🌫️', p.dackE >= 0 ? DACK_T - p.dackE : (c && SKILL_OF[p.av.outfitIdx] === 'dack' && cd > 15 ? cd - 15 : 0));
    if (p.cloak) add('🐱', 5 - p.cloakE); else if (c && SKILL_OF[p.av.outfitIdx] === 'lydia' && cd > 15) add('🐱', cd - 15);
    add('🐵', p.wkT || 0);
    if (p.chant) add('🔮', p.chant.t);
    if (K) { add('🕊️', K.ban.t); add('🎞️', K.neg.t); if (K.gis.by === p) add('💖', K.gis.t); }
    if (c && SKILL_OF[p.av.outfitIdx] === 'gis' && cd > 45) add('💖', cd - 45);
    this.skPills = L;
  },
  skillHUD(dt, p) {
    { const rl = G.sk && G.sk.rel, rt = rl ? rl.t : -1; if (rt >= 0 && (this._rlp === undefined || this._rlp < 0 || rt < this._rlp)) { Sfx.siren(); if (rl.by !== p) this.msg('⚠ 相對論發動！操作即將左右互換', 'bad'); } this._rlp = rt;
      const r2 = relPhase2(p); if (r2 !== this._rl2) { this._rl2 = r2; this.numLayout(); } }
    { const dl = isOut(p, 20); if (dl !== this._dl) { this._dl = dl; document.body.classList.toggle('doll', dl); } }
    this.skTimers(p);
    { const dr = GKEY_HEROES.includes(p.av.outfitIdx); if (dr !== this._dr) { this._dr = dr; document.body.classList.toggle('derek', dr); $('slotG').style.display = dr ? 'none' : ''; $('slotS').querySelector('em').textContent = dr ? 'G' : 'R'; } }
    const s = $('slotS'), sk = skillOf(p), cd = p.skCd || 0, show = !!sk && G.skillsOn !== false; s.style.display = show ? '' : 'none'; s.classList.toggle('boost', !!p.boost && cd > 0);
    { let f = 0; for (const o of G.actors) if (o !== p && o.alive && o.dackE >= 1) { const d = Math.hypot(o.x - p.x, o.z - p.z); if (d < 12) f = Math.max(f, .8 + .2 * (1 - d / 12)); } const df = $('dfog'); $('dself').style.opacity = (p.dackE >= 1) ? .2 : 0; if (Math.abs((this._df || 0) - f) > .02) { this._df = f; df.style.opacity = f; } }
    $('stamwrap').style.visibility = isOut(p, 12) ? 'hidden' : ''; $('binwrap').style.visibility = isOut(p, 13) ? 'hidden' : '';
    { const ik = $('ink'), on = inkActive(p); if (on !== this._ink) { this._ink = on; ik.classList.toggle('on', on); } if (on && G.sk.ink.t < .5) ik.style.opacity = G.sk.ink.t * 2; else if (on) ik.style.opacity = 1; }
    const dash = isSumi(p) && p.dashReady && !p.onGround, jb = $('bJump'); if (jb) { const tx = dash ? '突進' : '跳躍'; if (jb.textContent !== tx) jb.textContent = tx; }
    if (show) {
    const ico = p.stolen ? SKILLS[p.stolen].ico : p.armed ? '🪄' : sk.ico; if (this._skIco !== ico) { this._skIco = ico; s.querySelector('.ico').textContent = ico; }
    const ace = p.av.outfitIdx === 22, locked = !skOn() || (ace ? !(p.windowT > 0) : cd > 0);
    s.classList.toggle('cd', locked); s.classList.toggle('on', (p.shieldT || 0) > 0 || !!p.stolen || !!p.armed || !!p.chant); s.style.setProperty('--p', (sk.cd ? Math.min(360, cd / sk.cd * 360) : 0).toFixed(1) + 'deg');
    const sec = ace ? (p.windowT > 0 ? String(Math.ceil(p.windowT)) : '') : cd > 0 ? String(Math.ceil(cd)) : ''; if (this._skSec !== sec) { this._skSec = sec; s.querySelector('.cdn').textContent = sec; }
    }
    const sc = G.sk.scr, t = sc.t; let on = false;
    this._pf = on; $('numL').classList.toggle('purple', on); $('numR').classList.toggle('purple', on); $('pflash').classList.toggle('on', on);
    const ph2 = scrPhase2(p); if (ph2 && !this._ph2) { this._ph2 = true; this.startScramble(); } if (!ph2 && this._ph2) this.endScramble(); this._ph2 = ph2;
  },
  numLayout() { // 手機數字鍵排列：正常／錯亂（艾伯特）／相反（愛因斯坦）
    const all = [...document.querySelectorAll('.np')], norm = [...all].sort((a, b) => ((+a.dataset.k + 9) % 10) - ((+b.dataset.k + 9) % 10));
    const order = this._ph2 ? [...all].sort(() => Math.random() - .5) : this._rl2 ? norm.slice().reverse() : norm;
    if (Device.mobile) order.forEach((b, i) => (i < 5 ? $('numL') : $('numR')).appendChild(b));
    if (!this._ph2) G.keyMap = null;
  },
  startScramble() {
    if (Device.mobile) this.numLayout();
    else { let m; do { m = '0123456789'.split('').sort(() => Math.random() - .5); } while (m.some((v, i) => v === String(i))); G.keyMap = {}; for (let i = 0; i < 10; i++) G.keyMap[String(i)] = m[i]; }
  },
  endScramble() { G.keyMap = null; this._ph2 = false; this.numLayout(); },
  updateHUD(dt) {
    const e = this.els, p = G.player;
    if (!p && G.demo) { this.cdUpdate(dt); this.demoHUD(dt); return; }
    if (!p) return;
    this.cdUpdate(dt);
    // 計分
    if (G.mode === 'hunt') { const others = G.actors.filter(a => a !== p && (a.isPlayer || a.remote)).reduce((m, a) => Math.max(m, a.score || 0), 0); e.scR.textContent = p.score || 0; e.scB.textContent = others; e.scR.className = 'sc red'; e.scB.className = 'sc dm'; }
    else if (G.mode === 'arena') { e.scR.textContent = p.kills; e.scB.textContent = 'S' + ((G.arena && G.arena.stage) || 0); e.scR.className = 'sc red'; e.scB.className = 'sc dm'; }
    else if (G.mode === 'dm' || G.mode === 'kof') { const others = G.actors.filter(a => a !== p).reduce((m, a) => Math.max(m, a.kills), 0); e.scR.textContent = p.kills; e.scB.textContent = others; e.scR.className = 'sc red'; e.scB.className = 'sc dm'; }
    else { e.scR.textContent = G.scores[0]; e.scB.textContent = G.scores[1]; e.scR.className = 'sc red'; e.scB.className = 'sc blue'; }
    const ts = Math.max(0, Math.ceil(G.tleft)), tstr = Math.floor(ts / 60) + ':' + String(ts % 60).padStart(2, '0'); if (G.mode === 'arena' || G.mode === 'kof') { const A = G.arena, t = G.mode === 'kof' ? '🥊 KOF 大賽' : (A && A.stage ? 'Stage ' + A.stage + (A.ph === 2 ? ' ・ 剩 ' + G.actors.filter(a => a.pool && a.alive).length + ' 名' : '') : '擂台準備中'); if (t !== this.lastTimer) { e.timer.textContent = t; this.lastTimer = t; } } else if (tstr !== this.lastTimer) { e.timer.textContent = tstr; this.lastTimer = tstr; }
    if (G.mode === 'ctf') { const f0 = G.flags[0], f1 = G.flags[1]; e.flagR.textContent = f0 && f0.state !== 'home' ? '🚩' : ''; e.flagB.textContent = f1 && f1.state !== 'home' ? '🏴' : ''; } else { e.flagR.textContent = ''; e.flagB.textContent = ''; }
    // 輸入
    if (this.dirty || this.lastTyped !== G.typed) {
      const t = G.codeLen ? G.typed + '_'.repeat(Math.max(0, G.codeLen - G.typed.length)) : (G.typed.length ? G.typed : '＿＿＿') + (G.typed.length && G.typed.length < 6 ? '_' : ''); e.typed.textContent = t; e.typed.className = G.typed.length ? '' : 'empty'; e.photoCap.textContent = t; this.lastTyped = G.typed;
      this.slotHTML(e.slotF, G.slots[0]); this.slotHTML(e.slotG, G.slots[1]);
      this.dirty = false;
    }
    this.skillHUD(dt, p); this.modeHUD(dt, p);
    e.slotF.classList.toggle('cd', G.itemCd > 0); e.slotG.classList.toggle('cd', G.itemCd > 0);
    if (Math.abs(G.stam - (this._st ?? -1)) > .004) { this._st = G.stam; e.stamFill.style.transform = `scaleX(${G.stam.toFixed(3)})`; }
    if (Math.abs(G.energy - (this._en ?? -1)) > .004) { this._en = G.energy; e.binFill.style.transform = `scaleX(${G.energy.toFixed(3)})`; }
    // 訊息
    if (this.msgT > 0) { this.msgT -= dt; if (this.msgT <= 0) e.msg.className = ''; }
    // 擊殺列
    const fk = G.feedVer || 0; if (fk !== this.lastFeed) { this.lastFeed = fk; e.killfeed.innerHTML = G.feed.map(f => `<div class="${f.me ? 'me' : ''}">${esc(f.k)} ➜ <span class="vic">${esc(f.v)}</span>${f.st ? '<b class="stk">（' + STREAK_TXT[f.st - 1] + '）</b>' : ''}</div>`).join(''); }
    // 威脅
    const th = G.threat;
    if (th && p.alive) {
      const b = th.b, hd = Math.atan2(-(b.x - p.x), -(b.z - p.z)), rel = angDiff(p.yaw, hd), r = Math.min(innerWidth, innerHeight) * .17;
      e.warn.classList.remove('hidden'); e.warnBox.classList.remove('hidden');
      e.warnArrow.style.transform = `translate(${(-Math.sin(rel) * r).toFixed(1)}px,${(-Math.cos(rel) * r).toFixed(1)}px) rotate(${(-rel).toFixed(3)}rad)`;
      e.warnFill.style.transform = `scaleX(${clamp(th.p, 0, 1).toFixed(3)})`; e.warnFill.style.transformOrigin = 'left';
      if (th.p > .6 && (G.time * 3 | 0) % 2 === 0 && !this._wb) { this._wb = true; Sfx.warn(); } if ((G.time * 3 | 0) % 2 === 1) this._wb = false;
    } else { e.warn.classList.add('hidden'); e.warnBox.classList.add('hidden'); }
    e.carry.classList.toggle('hidden', !p.carry);
    // 特效
    let fo = 0; if (G.flashT > 0) fo = clamp(G.flashT / Math.max(1, G.flashMax) * 1.6, 0, 1); fo = Math.max(fo, this.flashW); this.flashW = Math.max(0, this.flashW - dt * 2.5);
    e.flash.style.opacity = fo.toFixed(3);
    e.bino.style.display = G.binK > .55 ? 'block' : 'none';
    if (this.photoT > 0) { this.photoT -= dt; if (this.photoT < .6) e.photo.classList.add('fade'); if (this.photoT <= 0) e.photo.classList.add('hidden'); }
    // FPS
    Perf.hud(dt);
  },
  stunFx(sec) { const e = this.els.deadv; e.style.opacity = .75; clearTimeout(this._st); this._st = setTimeout(() => { if (G.player && G.player.alive) e.style.opacity = 0; }, sec * 1000); },
  goText() { this.goT = 1; this._cd = 0; $('cdNum').textContent = '開始！'; $('cdTxt').textContent = '戰鬥開始'; this.els.countdown.classList.remove('hidden'); },
  cdUpdate(dt) {
    { const neg = !!(G.sk && G.sk.neg && G.sk.neg.t > 0); if (neg !== this._neg) { this._neg = neg; $('gl').style.filter = neg ? 'invert(1)' : ''; } }
    const e = this.els.countdown; if (G.kofCd && G.kofT > 0 && !(G.countdown > 0)) { const k = Math.ceil(G.kofT), n = $('cdNum'); if (k !== this._kk2) { this._kk2 = k; n.textContent = k > 1 ? 'Ready…' : 'Go！'; n.style.animation = 'none'; void n.offsetWidth; n.style.animation = ''; $('cdTxt').textContent = '下一位出戰英雄登場'; } e.classList.remove('hidden'); return; } if (this._kk2) { this._kk2 = 0; e.classList.add('hidden'); }
    const c = Math.ceil(G.countdown || 0);
    if (c > 0) { if (c !== this._cd) { this._cd = c; const n = $('cdNum'); n.textContent = G.kofCd ? (c > 1 ? 'Ready…' : 'Go！') : c; n.style.animation = 'none'; void n.offsetWidth; n.style.animation = ''; $('cdTxt').textContent = G.kofCd ? '下一位出戰英雄登場' : '遊戲將在 ' + c + ' 秒後開始・請先觀察四周'; } e.classList.remove('hidden'); }
    else if (this.goT > 0) { this.goT -= dt; if (this.goT <= 0) e.classList.add('hidden'); } else e.classList.add('hidden');
  },
  demoTag() { const v = G.view; if (v) { this.els.demoTag.textContent = '🎬 示範模式・目前視角：' + v.name; this.els.demoTag.classList.remove('hidden'); } },
  keysOverlay(v) {
    const el = $('keysov'); if (!el.firstChild) { const rows = ['1 2 3 4 5 6 7 8 9 0', '_ Q W R _ F G _ _ _', 'Shift:2 A S D _ Space:3']; el.innerHTML = rows.map(r => r.split(' ').map(t => { const [k, w] = t.split(':'); return k === '_' ? '<b class="sp"></b>' : `<b data-k="${k}"${w ? ' class="w' + w + '"' : ''}>${k}</b>`; }).join('')).join(''); this.kb = {}; el.querySelectorAll('b[data-k]').forEach(b => this.kb[b.dataset.k] = b); }
    el.classList.toggle('hidden', !v || !G.demo); if (!v) return;
    const on = {}, sp = Math.hypot(v.vx, v.vz), fw = FWD(v.yaw), rx = Math.cos(v.yaw), rz = -Math.sin(v.yaw);
    if (v.alive && sp > 1) { const d = (v.vx * fw[0] + v.vz * fw[1]) / sp, r = (v.vx * rx + v.vz * rz) / sp; if (d > .3) on.W = 1; if (d < -.3) on.S = 1; if (r > .3) on.D = 1; if (r < -.3) on.A = 1; if (sp > v.speed * 1.2) on.Shift = 1; }
    if (v.alive && !v.onGround) on.Space = 1;
    if (v.alive && v.typing) { const ty = v.typing; if (!ty.t0) ty.t0 = Math.max(ty.t, .2); const L = ty.num.length, i = clamp(Math.floor((1 - ty.t / ty.t0) * L), 0, L - 1); on[ty.num[i]] = 1; }
    if (v.kp) for (const k in v.kp) if (v.kp[k] > G.time) on[k] = 1;
    for (const k in this.kb) this.kb[k].classList.toggle('on', !!on[k]);
  },
  demoHUD(dt) {
    const e = this.els, v = G.view; this.keysOverlay(v);
    if (G.mode === 'dm') { const k = G.actors.map(a => a.kills).sort((a, b) => b - a); e.scR.textContent = k[0] || 0; e.scB.textContent = k[1] || 0; e.scR.className = 'sc dm'; e.scB.className = 'sc dm'; }
    else { e.scR.textContent = G.scores[0]; e.scB.textContent = G.scores[1]; e.scR.className = 'sc red'; e.scB.className = 'sc blue'; }
    const ts = Math.max(0, Math.ceil(G.tleft)), tstr = Math.floor(ts / 60) + ':' + String(ts % 60).padStart(2, '0'); if (tstr !== this.lastTimer) { e.timer.textContent = tstr; this.lastTimer = tstr; }
    if (G.mode === 'ctf') { const f0 = G.flags[0], f1 = G.flags[1]; e.flagR.textContent = f0 && f0.state !== 'home' ? '🚩' : ''; e.flagB.textContent = f1 && f1.state !== 'home' ? '🏴' : ''; } else { e.flagR.textContent = ''; e.flagB.textContent = ''; }
    const fk = G.feedVer || 0; if (fk !== this.lastFeed) { this.lastFeed = fk; e.killfeed.innerHTML = G.feed.map(f => `<div>${esc(f.k)} ➜ <span class="vic">${esc(f.v)}</span>${f.st ? '<b class="stk">（' + STREAK_TXT[f.st - 1] + '）</b>' : ''}</div>`).join(''); }
    if (this.msgT > 0) { this.msgT -= dt; if (this.msgT <= 0) e.msg.className = ''; }
    e.flash.style.opacity = (v && v.blind > 0 ? clamp(v.blind / 2, 0, .9) : 0).toFixed(2); e.bino.style.display = 'none';
    Perf.hud(dt);
  }
};

const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let fading = false;
/* 0.3 秒漸黑漸顯過場：先在 0.15 秒內變黑，切換畫面，再於 0.15 秒內顯現 */
function go(fn) {
  if (fading) { fn(); return; }
  fading = true; const f = $('fade'); f.style.pointerEvents = 'auto'; f.style.opacity = 1;
  setTimeout(() => { try { fn(); } catch (e) { console.error(e); } f.style.opacity = 0; setTimeout(() => { f.style.pointerEvents = 'none'; fading = false; }, 150); }, 150);
}
/* ---------- 效能：自動解析度、FPS ---------- */
const Perf = {
  pr: 1, min: .6, max: 1.5, hist: [], lastAdj: 0, fps: 0, frames: 0, acc: 0, refreshSamples: [], good: 0, text: '', fpsT: 0, dpr: 1, tier: 'high', worst: 0,
  profile() {
    const mobile = Device.mobile; let tier = S.quality === 'auto' ? (mobile ? (Device.lowEnd ? 'low' : 'mid') : 'high') : S.quality; this.tier = tier;
    const dpr = window.devicePixelRatio || 1; this.dpr = dpr;
    if (tier === 'high') { this.max = Math.min(dpr, 2); this.min = .7; this.start = Math.min(dpr, 1.25); R.setAniso(8); }
    else if (tier === 'mid') { this.max = Math.min(dpr, 1.75); this.min = .55; this.start = Math.min(dpr, 1.1); R.setAniso(4); }
    else { this.max = Math.min(dpr, 1.1); this.min = .5; this.start = Math.min(dpr, .85); R.setAniso(2); }
    this.pr = clamp(this.start, this.min, this.max); this.hist = []; this.good = 0;
    this.shadowWanted = tier === 'high'; if (this.shadowWanted && !R.shadowReady()) { try { R.initShadow(2048); } catch (e) { } } R.setShadow(this.shadowWanted && !this.shadowOff);
  },
  apply() { R.resize(VP.W, VP.H, this.pr); },
  tick(ms, playing) {
    if (ms > 250) return; // 切換分頁
    this.frames++; this.acc += ms; this.fpsT += ms;
    if (this.fpsT >= 500) { this.fps = this.frames * 1000 / this.fpsT; this.frames = 0; this.fpsT = 0; }
    if (!playing) { this.refreshSamples.push(ms); if (this.refreshSamples.length === 90) this.measureRefresh(); return; }
    this.hist.push(ms); if (this.hist.length < 40) return;
    let avg = 0; for (const h of this.hist) avg += h; avg /= this.hist.length; this.hist.length = 0;
    const tgt = 1000 / Math.min(Device.refresh, 90), now = performance.now();
    if (now - this.lastAdj < 1200) return;
    if (avg > tgt * 1.25 && R.shadowOn() && this.pr <= this.start * .86) { this.shadowOff = true; R.setShadow(false); this.lastAdj = now; return; }
    if (avg > tgt * 1.2 && this.pr > this.min + .001) { this.pr = Math.max(this.min, this.pr * (avg > tgt * 1.6 ? .82 : .92)); this.lastAdj = now; this.good = 0; this.apply(); }
    else if (avg < tgt * 1.1 && this.pr < this.max - .001) { this.good++; if (this.good >= 3) { this.pr = Math.min(this.max, this.pr * 1.06); this.good = 0; this.lastAdj = now; this.apply(); } }
    else this.good = 0;
  },
  measureRefresh() {
    const a = this.refreshSamples.slice().sort((x, y) => x - y), med = a[a.length >> 1], hz = 1000 / med; const std = [30, 48, 50, 60, 72, 75, 90, 100, 120, 144, 165, 240];
    let best = 60, bd = 1e9; for (const s of std) if (Math.abs(s - hz) < bd) { bd = Math.abs(s - hz); best = s; } Device.refresh = best;
    this.refreshSamples = [];
  },
  hud(dt) { }
};

/* ---------- 輸入 ---------- */
const keys = {};
const Input = {
  joy: { id: null, ox: 0, oy: 0 }, look: { id: null, lx: 0, ly: 0 }, binHold: false,
  init() {
    const lookScale = () => (R.cam.fov / 1.28), sensNow = () => (G.bino ? 1.7 : S.sens); // 開望遠鏡時靈敏度 1.70
    window.addEventListener('keydown', e => {
      if (e.repeat && e.code !== 'Backspace') { if (e.code === 'Tab' || e.code === 'Space') e.preventDefault(); return; }
      if (Device.auto && S.input === 'auto' && performance.now() - Device.lastTouch > 3000 && /^(Key|Digit|Arrow|Space|Shift|Tab)/.test(e.code)) { Device.auto = false; Device.update(); }
      if ((UI.paused || UI.menuOpen) && G.state === 'playing') { if (e.code === 'Escape' || e.code === 'KeyP') togglePause(); return; }
      if (G.demo && (G.state === 'playing' || G.state === 'ended')) { if (e.code === 'Escape' || e.code === 'KeyP') togglePause(); e.preventDefault(); return; }
      if (G.state === 'playing' || G.state === 'ended') {
        if (e.code === 'Tab') { e.preventDefault(); return; }
        if (/^Digit[0-9]$/.test(e.code)) { typeDigit(e.code.slice(5)); e.preventDefault(); return; }
        if (/^Numpad[0-9]$/.test(e.code)) { typeDigit(e.code.slice(6)); e.preventDefault(); return; }
        if (e.code === 'Backspace') { backspace(); e.preventDefault(); return; }
        if (e.code === 'Enter' || e.code === 'NumpadEnter') { submitNumber(); e.preventDefault(); return; }
        if (e.code === 'KeyF') { useItem(0); return; }
        if (e.code === 'KeyG') { if (G.player && GKEY_HEROES.includes(G.player.av.outfitIdx)) castSkillPlayer(); else useItem(1); return; }
        if (e.code === 'KeyR') { castSkillPlayer(); return; }
        if (e.code === 'KeyQ') { toggleBino(); return; }
        if (e.code === 'Escape') { if (!this.pointerLocked()) togglePause(); return; }
        if (e.code === 'KeyP') { togglePause(); return; }
        if (e.code === 'KeyM') { S.sound = !S.sound; saveS(); UI.msg(S.sound ? '音效開啟' : '音效關閉'); return; }
      }
      keys[e.code] = true; if (/^(Space|ArrowUp|ArrowDown|Tab)$/.test(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', e => { keys[e.code] = false; });
    window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
    document.addEventListener('pointerdown', e => { const t = e.target.closest && e.target.closest('button,.btn,.chip,.card,.tbtn,.slot'); if (t && !t.classList.contains('np')) { Sfx.init(); Sfx.resume(); Sfx.click(); } }, true);
    const cvs = $('gl');
    document.addEventListener('mousemove', e => {
      if (G.state !== 'playing' && G.state !== 'ended') return; if (UI.paused || UI.menuOpen) return;
      if (this.pointerLocked() || UI.dragLookActive) { const s = .0022 * sensNow() * lookScale(); In.lookX -= e.movementX * s; In.lookY -= e.movementY * s; }
    });
    cvs.addEventListener('mousedown', e => {
      Sfx.init(); Sfx.resume();
      if (G.state !== 'playing' || UI.paused || UI.menuOpen || Device.mobile || G.demo) return;
      if (e.button === 2) { this.binHold = true; if (!G.bino) toggleBino(); e.preventDefault(); return; }
      if (!this.pointerLocked()) { this.lock(); UI.dragLookActive = e.button === 0; }
    });
    window.addEventListener('mouseup', e => { UI.dragLookActive = false; if (e.button === 2 && this.binHold) { this.binHold = false; if (G.bino) toggleBino(); } });
    cvs.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('pointerlockchange', () => {
      const l = this.pointerLocked(); UI.locked = l;
      if (!l && (G.state === 'playing') && !UI.paused && !UI.menuOpen && !UI.noLock && !Device.mobile && UI._wasLocked) { setPause(true); }
      UI._wasLocked = l;
    });
    document.addEventListener('pointerlockerror', () => { UI.noLock = true; UI.msg('瀏覽器不允許鎖定滑鼠：改用「按住左鍵拖曳」轉視角', 'item'); });
    window.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') { Device.lastTouch = performance.now(); if (S.input === 'auto' && !Device.mobile) { Device.auto = true; Device.update(); } } }, true);
    // ---- 觸控 ----
    const layer = $('app'), joyBase = $('joyBase'), joyKnob = $('joyKnob'), joyHint = $('joyHint');
    const TX = t => VP.px(t.clientX, t.clientY), TY = t => VP.py(t.clientX, t.clientY);
    const inCtl = t => t.target.closest && t.target.closest('#tut,.np,.tbtn,.slot,#pauseBtn,.btn,.chip,.card,.panel,.sbox,#settings,#mp,#howPick,#demoPick,#charsel,#layoutEd,#end,#pause');
    layer.addEventListener('touchstart', e => {
      Sfx.init(); Sfx.resume(); if (!Device.mobile || G.state === 'menu' || G.demo || UI.menuOpen || UI.paused) return;
      for (const t of e.changedTouches) {
        if (inCtl(t)) continue; e.preventDefault();
        if (inJoyZone(TX(t), TY(t)) && this.joy.id === null) { this.joy.id = t.identifier; const o = joyOrigin(TX(t), TY(t)); this.joy.ox = o[0]; this.joy.oy = o[1]; this.joy.s = o[2]; joyBase.style.display = 'block'; joyHint.style.opacity = 0; joyBase.style.left = this.joy.ox + 'px'; joyBase.style.top = this.joy.oy + 'px'; joyBase.style.scale = this.joy.s; joyKnob.style.transform = 'translate(0,0)'; }
        else if (this.look.id === null) { this.look.id = t.identifier; this.look.lx = TX(t); this.look.ly = TY(t); }
      }
    }, { passive: false });
    layer.addEventListener('touchmove', e => {
      if (!Device.mobile) return;
      for (const t of e.changedTouches) {
        if (t.identifier === this.joy.id) {
          let dx = TX(t) - this.joy.ox, dy = TY(t) - this.joy.oy; const js = this.joy.s || 1, R0 = 52 * js, l = Math.hypot(dx, dy); if (l > R0) { dx = dx / l * R0; dy = dy / l * R0; }
          joyKnob.style.transform = `translate(${dx / js}px,${dy / js}px)`; In.mx = dx / R0; In.my = -dy / R0;
          this.joy.ox += (TX(t) - this.joy.ox - dx) * .02 * 0; e.preventDefault();
        } else if (t.identifier === this.look.id) {
          const s = .0046 * sensNow() * lookScale(); In.lookX -= (TX(t) - this.look.lx) * s; In.lookY -= (TY(t) - this.look.ly) * s; this.look.lx = TX(t); this.look.ly = TY(t); e.preventDefault();
        }
      }
    }, { passive: false });
    const end = e => {
      for (const t of e.changedTouches) {
        if (t.identifier === this.joy.id) { this.joy.id = null; In.mx = In.my = 0; joyBase.style.display = 'none'; joyHint.style.opacity = .7; }
        if (t.identifier === this.look.id) this.look.id = null;
      }
    };
    layer.addEventListener('touchend', end); layer.addEventListener('touchcancel', end);
    // 按鈕
    const press = (el, down, up) => { let lt = 0; el.addEventListener('touchstart', e => { lt = performance.now(); e.preventDefault(); e.stopPropagation(); Sfx.init(); Sfx.resume(); el.classList.add('act'); down(); if (navigator.vibrate) try { navigator.vibrate(8); } catch (x) { } }, { passive: false }); const u = e => { e.preventDefault(); el.classList.remove('act'); if (up) up(); }; el.addEventListener('touchend', u); el.addEventListener('touchcancel', u); el.addEventListener('mousedown', e => { if (Device.mobile && performance.now() - lt > 900) { e.stopPropagation(); down(); } }); };
    document.addEventListener('touchend', e => { if (!e.touches.length) { In.jump = false; } }, true); document.addEventListener('touchcancel', () => { In.jump = false; }, true);
    document.querySelectorAll('.np').forEach(b => press(b, () => typeDigit(b.dataset.k)));
    press($('bJump'), () => { In.jump = true; }, () => { In.jump = false; });
    { // 望遠鏡（手機）：壓住使用、放開取消；壓住期間滑動＝轉視角
      const bb = $('bBino2'); let bid = null, bx = 0, by = 0;
      const off = () => { bid = null; bb.classList.remove('act'); if (G.bino) { G.bino = false; } };
      bb.addEventListener('touchstart', e => { e.preventDefault(); e.stopPropagation(); Sfx.init(); Sfx.resume(); const t = e.changedTouches[0]; bid = t.identifier; bx = TX(t); by = TY(t); bb.classList.add('act'); if (!G.bino) toggleBino(); }, { passive: false });
      bb.addEventListener('touchmove', e => { for (const t of e.changedTouches) if (t.identifier === bid) { const s = .0046 * sensNow() * lookScale(); In.lookX -= (TX(t) - bx) * s; In.lookY -= (TY(t) - by) * s; bx = TX(t); by = TY(t); } e.preventDefault(); e.stopPropagation(); }, { passive: false });
      for (const ev of ['touchend', 'touchcancel']) bb.addEventListener(ev, e => { e.preventDefault(); e.stopPropagation(); off(); }, { passive: false });
    }
    press($('bBack'), () => backspace());
    { const ss = $('slotS'); press(ss, () => castSkillPlayer()); ss.addEventListener('click', () => { if (!Device.mobile) castSkillPlayer(); }); }
    press($('bRun'), () => { In.sprintT = !In.sprintT; In.sprint = In.sprintT; $('bRun').classList.toggle('tog', In.sprintT); }, () => { });
    for (const [id, i] of [['slotF', 0], ['slotG', 1]]) { const el = $(id); press(el, () => useItem(i)); el.addEventListener('click', () => { if (!Device.mobile) useItem(i); }); }
    press($('pauseBtn'), () => setPause(true));
  },
  pointerLocked() { return document.pointerLockElement === $('gl'); },
  lock() { try { const r = $('gl').requestPointerLock(); if (r && r.catch) r.catch(() => { UI.noLock = true; }); } catch (e) { UI.noLock = true; } },
  poll() {
    if (!Device.mobile) {
      const f = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0), s = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
      In.mx = s; In.my = f; In.jump = !!keys.Space; In.sprint = !!(keys.ShiftLeft || keys.ShiftRight);
    }
  }
};
function toggleBino() {
  const p = G.player; if (!p || !p.alive || G.state !== 'playing') return;
  if (!G.bino && G.energy < .12) { UI.msg('望遠鏡能量不足', 'bad'); return; } G.bino = !G.bino; Sfx.key();
}
function setPause(v) {
  if (G.state !== 'playing') return;
  if (NET.mode) { UI.menuOpen = v; UI.els.pause.classList.toggle('hidden', !v); UI.els.pauseTxt.textContent = '連線對戰無法暫停，遊戲仍在進行'; if (v) { if (document.exitPointerLock) try { document.exitPointerLock(); } catch (e) { } for (const k in keys) keys[k] = false; In.mx = In.my = 0; In.sprint = false; In.jump = false; } return; }
  UI.paused = v; UI.els.pause.classList.toggle('hidden', !v);
  UI.els.pauseTxt.textContent = Device.mobile ? '' : '按「繼續」回到遊戲（會重新鎖定滑鼠）';
  if (v) { if (document.exitPointerLock) try { document.exitPointerLock(); } catch (e) { } for (const k in keys) keys[k] = false; In.mx = In.my = 0; In.sprint = false; In.jump = false; }
}
function togglePause() { setPause(!(UI.paused || UI.menuOpen)); }
function resumeGame() { UI.menuOpen = false; setPause(false); if (!Device.mobile) { Input.lock(); } }

/* ---------- 選單 ---------- */
/* ---------- 遊戲說明（分頁＋圖示） ---------- */
const HOW_TABS = [['go', '🎯 怎麼玩'], ['ctl', '🎮 操作'], ['item', '🎁 道具'], ['chr', '🧑 英雄技能'], ['mode', '🗺️ 模式地圖'], ['spec', '🏟️ 擂台・KOF']];
const hStep = (n, ico, t, d) => `<div class="hstep"><i>${n}</i><div class="hic">${ico}</div><b>${t}</b><span>${d}</span></div>`;
const hCard = (ico, t, d, cls) => `<div class="hcard ${cls || ''}"><div class="hic">${ico}</div><div><b>${t}</b><span>${d}</span></div></div>`;
const hKey = (k, d) => `<div class="hkey"><span class="kc">${k}</span><em>${d}</em></div>`;
function howPanel(id) {
  if (id === 'go') return `<div class="hhero"><svg viewBox="0 0 120 70" class="hplate"><circle cx="60" cy="22" r="14" fill="#e8c7a6" stroke="#5a3a22" stroke-width="2"/><rect x="26" y="34" width="68" height="26" rx="5" fill="#fff6d8" stroke="#c0392b" stroke-width="3"/><text x="60" y="53" text-anchor="middle" font-size="19" font-weight="800" fill="#c0392b" font-family="monospace">48 213</text></svg><p>每個人額頭都有一組<b>數字牌</b>。<br>先讀到、先輸入，對方就<b>淘汰</b>！</p></div>
<div class="hsteps">${hStep(1, '👀', '看', '靠近、對準額頭')}${hStep(2, '🧠', '記', '記下整組數字')}${hStep(3, '⌨️', '輸入', '按數字鍵 → Enter')}${hStep(4, '💥', '淘汰', '對方出局、你得分')}</div>
<div class="hgrid">${hCard('🔴', '被讀到了？', '畫面中央紅箭頭＝有人在讀你。快<b>背對、躲掩體、移動</b>。')}${hCard('❌', '輸錯號碼', '定身 2 秒，視角也鎖住，千萬別亂按。')}${hCard('♻️', '擊殺後', '你的號碼立刻換新，別人讀到的作廢。')}${hCard('🛡️', '重生保護', '剛重生短時間無法被淘汰。')}</div>`;
  if (id === 'ctl') return `<h3>🖥️ 電腦</h3><div class="hkeys">${hKey('W A S D', '移動')}${hKey('Shift', '衝刺')}${hKey('Space', '跳（空中再按＝二段跳）')}${hKey('滑鼠', '轉視角（先點畫面）')}${hKey('0-9', '輸入號碼')}${hKey('Enter', '送出')}${hKey('⌫', '刪除一碼')}${hKey('R', '英雄技能')}${hKey('F / G', '使用道具（Derek 的 G＝衝鋒）')}${hKey('Q／右鍵', '望遠鏡')}${hKey('Esc', '暫停')}</div>
<h3>📱 手機（橫向）</h3><div class="hgrid">${hCard('🕹️', '左半邊拖曳', '搖桿移動')}${hCard('🏃', '右側「跑」鍵', '按住衝刺（耗體力）')}${hCard('👆', '右側空白拖曳', '轉視角')}${hCard('🔢', '左右數字鍵', '輸滿位數自動送出')}${hCard('⬆️', '跳躍鍵', '空中再按＝二段跳')}${hCard('🔭', '望遠鏡', '壓住使用、放開取消，壓住時滑動轉視角')}${hCard('🎒', '道具格', '點按使用')}</div>
<div class="hnote">🔋 衝刺會消耗體力條；望遠鏡有能量條，用完需等待回復。</div>`;
  if (id === 'item') return `<div class="hnote">開局沒有道具，走過地圖上的 <b>？箱</b> 才會取得；兩格已滿時不會更換。</div><div class="hgrid">${Object.entries({ cam: '拍照後照片短暫停留，方便看清號碼', quake: '讓其他人畫面劇烈橫向晃動 2 秒', scope: '約 13° 超遠距放大，再按一次＝拍照', fake: '頭上號碼偽裝成別的數字 7 秒', spring: '立即刷新英雄技能冷卻' }).map(([k, d]) => hCard(ITEMS[k].ico, ITEMS[k].name, d, 'big')).join('')}${hCard('🔭', '望遠鏡（內建）', '遠距離讀碼，有能量限制', 'big')}</div>`;
  if (id === 'chr') { return `<div class="hnote">按 <span class="kc">R</span>（手機：技能鍵）施放，圓環顯示冷卻。可在「遊戲設定」整體關閉技能。 Derek、快克、安琪沒有 G 道具格，其技能改由 <span class="kc">G</span> 鍵施放。</div>${HERO_CLASSES.map(([nm, col, ids]) => `<div class="chd" style="--hc:${col}">${nm}（${ids.length}）</div><div class="hchars">${ids.map(i => { const o = OUTFITS[i]; return `<div class="hch"><img src="${outfitIcon(i)}"><div><b>${o.label}</b><u>${o.skill.name}</u><span>${o.skill.desc}</span></div></div>`; }).join('')}</div>`).join('')}`; }
  if (id === 'spec') return `<h3>🏟️ 擂台逃殺（單人／多人合作）</h3>
<div class="hrule">玩家方對抗一波強過一波的電腦軍團；電腦同屬一國，彼此不會互相攻擊。多人遊玩時，電腦人數會依真人人數成倍增加（場上總人數上限 20 人）。</div>
<div class="hsteps h4">${hStep(1, '⏱️', '3 秒倒數', '進入畫面後先倒數 3 秒')}${hStep(2, '📢', '10 秒準備', '藍底通知＋右上角倒數，剩 3 秒響提示音')}${hStep(3, '🔔', 'Stage 1', '鳴響開賽聲，電腦登場')}${hStep(4, '🏆', 'Clear！！', '全數擊倒後進入下一關')}</div>
<div class="hrule">每一關<b>沒有時間限制</b>。<b>單人</b>：被電腦擊殺即視同全員陣亡，直接結束。<b>多人</b>：倒下的玩家進入復活等待（Stage 1 為 10 秒，之後每關多 2 秒）；只有當場上<b>沒有任何一位真人存活</b>時才算全數殲滅，顯示 Defeat 並進入結算（列出擊殺數與被殺數）。</div>
<table class="htb"><tr><th>關卡</th><th>電腦（單人）</th><th>關卡</th><th>電腦（單人）</th></tr><tr><td>Stage 1</td><td>2 名輕鬆</td><td>Stage 6</td><td>3 名普通</td></tr><tr><td>Stage 2</td><td>3 名輕鬆</td><td>Stage 7</td><td>5 名普通</td></tr><tr><td>Stage 3</td><td>5 名輕鬆</td><td>Stage 8</td><td>7 名普通</td></tr><tr><td>Stage 4</td><td>7 名輕鬆</td><td>Stage 9</td><td>9 名普通</td></tr><tr><td>Stage 5</td><td>1 名普通</td><td>Stage 10</td><td>1 名困難</td></tr></table>
<div class="hnote">Stage 10 之後，每進入下一關就多 1 名困難電腦，直到玩家方被殲滅為止。多人模式依真人人數倍增。</div>
<h3>🥊 KOF 大賽（單人對電腦／2 位玩家）</h3>
<div class="hrule">以<b>車輪戰</b>進行的一對一單挑：雙方各自挑選 5 位出賽英雄（限時 40 秒，逾時由系統補滿），選定後依一般模式的開場倒數開戰。超過 2 位玩家的房間無法進行此模式。</div>
<div class="hsteps h4">${hStep(1, '🧩', '選 5 位', '雙方各 40 秒選出出賽名單')}${hStep(2, '⚔️', '單挑', '場上一對一，先被淘汰者換人')}${hStep(3, '⏳', '10 秒選英雄', '倒下方從剩餘英雄中選下一位')}${hStep(4, '🚦', 'Ready… Go！', '雙方各 1 秒，鳴響開賽聲後繼續')}</div>
<div class="hrule">倒下的玩家有 <b>10 秒</b>挑選下一位出戰英雄，這段時間另一位玩家仍可在地圖上自由行動；選定後雙方畫面顯示「Ready…」與「Go！」再繼續。重新登場的英雄<b>一定生成在對手視野之外</b>，確保公平。最先耗盡 5 位英雄的一方顯示 Defeat，另一方顯示 Victory，隨後進入結算畫面。</div>`;
  return `<h3>🏆 模式</h3><div class="hgrid">${hCard('⚔️', '個人死鬥', '人人為敵，先淘汰 15 人獲勝。領先者號碼變大變亮＝賞金目標。')}${hCard('🔴🔵', '團隊死鬥', '紅藍對戰，隊伍先 30 淘汰獲勝；隊友無法淘汰。')}${hCard('🎯', '激鬥追捕', '只追殺電腦玩家，連殺積分更高；落後者技能冷卻縮短 50%。')}${hCard('🚩', '奪旗', '搶敵方旗帶回基地，先得 3 分。')}</div>
<h3>🗺️ 地圖</h3><div class="hgrid">${hCard('🏫', '熱血高校', '白天校園，標準面積。')}${hCard('🌙', '詭譎學苑', '黑夜版，遠處沒入黑暗，要靠近才看得到。')}${hCard('🛍️', '追逃商城', '1.4 倍大，電扶梯通二樓，可從欄杆跳下。')}</div>
<h3>🤖 對手</h3><div class="hgrid">${hCard('👥', '人數', '含你最多 20 人，不足由電腦補上。')}${hCard('🔢', '號碼位數', '3～5 碼，越多越難記。')}${hCard('😈', '干擾者', '輕／中／重＝靈活度 25%／55%／100%。')}</div>`;
}
function buildHowto() {
  const box = $('howto'); box.innerHTML = '<div class="htabs"></div><div class="hpanel"></div>';
  const tabs = box.firstChild, panel = box.lastChild;
  const show = id => { [...tabs.children].forEach(b => b.classList.toggle('on', b.dataset.id === id)); panel.innerHTML = howPanel(id); panel.scrollTop = 0; };
  HOW_TABS.forEach(([id, t]) => { const b = document.createElement('button'); b.className = 'chip'; b.dataset.id = id; b.textContent = t; b.onclick = () => show(id); tabs.appendChild(b); });
  show('go');
}
function huntLock() {
  if ($('chMode')) [...$('chMode').children].forEach((b, i) => { const m = Object.values(MODES)[i]; if (UI.gDemo && m && m.demo === false) b.classList.add('dis'); else if (!m || !m.soon) b.classList.remove('dis'); });
  const h = S.mode === 'hunt'; if (h) { if (S.count !== 16 && S.count !== 20) S.count = 20; S.diff = 3; S.countSet = true; }
  const CN = [4, 8, 12, 16, 20];
  for (const id of ['chCount', 'chNCount']) { const el = $(id); if (!el) continue; [...el.children].forEach(b => { const v = parseInt(b.textContent); if (isNaN(v)) { b.classList.toggle('dis', h); return; } b.classList.toggle('dis', h && v !== 16 && v !== 20); b.classList.toggle('on', v === S.count); }); }
  if (window.updTroll) window.updTroll(); if ($('diffDesc')) $('diffDesc').textContent = DIFF[S.diff].desc; if ($('diffDescN')) $('diffDescN').textContent = DIFF[S.diff].desc;
  for (const id of ['chDiff', 'chNDiff']) { const el = $(id); if (!el) continue; [...el.children].forEach((b, i) => { if (i >= DIFF.length) { b.classList.toggle('dis', h); return; } b.classList.toggle('dis', h && i !== 3); b.classList.toggle('on', i === S.diff); }); }
  refreshRand();
  const ar = (UI.gDemo ? S.demoMode : S.mode) === 'arena' && !(S.rnd && S.rnd.mode); // 擂台逃殺：時間／技能／人數／難度依固定規則，全部上鎖
  if (ar) S.skills = true;
  for (const id of ['chTime', 'chSkill', 'chCount', 'chDiff', 'chTroll', 'chNTime', 'chNSkill', 'chNCount', 'chNDiff', 'chNTroll']) { const el = $(id); if (!el) continue; [...el.children].forEach(b => b.classList.toggle('dis', ar || (b.classList.contains('dis') && !ar && !/^ch(Time|Skill|NTime|NSkill|Troll|NTroll)$/.test(id)))); if (ar && /Skill/.test(id)) [...el.children].forEach((b, i) => b.classList.toggle('on', i === 0)); }
}
const RAND_IDS = {}; // 容器 id -> 隨機類別
function chips(id, items, get, set, rk) {
  const el = $(id); el.innerHTML = ''; if (rk) { RAND_IDS[id] = rk; items = items.concat([{ v: '__r', l: '🎲 隨機', rnd: 1 }]); const g0 = get, s0 = set; get = () => (S.rnd && S.rnd[rk]) ? '__r' : g0(); set = v => { S.rnd = S.rnd || {}; if (v === '__r') S.rnd[rk] = true; else { S.rnd[rk] = false; s0(v); } }; }
  items.forEach(it => { const b = document.createElement('button'); b.className = 'chip' + (get() === it.v ? ' on' : ''); b.innerHTML = it.l; if (it.dis) b.classList.add('dis', 'soon'); b.onclick = () => { if (it.dis) return; set(it.v); saveS(); [...el.children].forEach((c, i) => c.classList.toggle('on', items[i].v === it.v)); if (it.rnd || (rk && !it.rnd)) huntLock(); }; el.appendChild(b); });
}
function refreshRand() { for (const id in RAND_IDS) { const el = $(id); if (!el) continue; const on = !!(S.rnd && S.rnd[RAND_IDS[id]]), ch = [...el.children]; ch.forEach((c, i) => { if (on) c.classList.toggle('on', i === ch.length - 1); else if (i === ch.length - 1) c.classList.remove('on'); }); } }
function resolveRandoms(demo, humans) { // 開局時把「隨機」類別換成實際值
  const r = S.rnd || {}, vis = Object.entries(MODES).filter(([k, m]) => !m.soon && !(demo && m.demo === false) && !(k === 'kof' && humans > 2)).map(x => x[0]);
  if (r.mode) { const k = pick(vis); if (demo) S.demoMode = k; else S.mode = k; }
  if (r.map) { const k = pick(Object.keys(MAPS)); if (demo) S.demoMap = k; else S.map = k; }
  const arenaFix = (demo ? S.demoMode : S.mode) === 'arena';
  if (!arenaFix) { if (r.time) S.time = pick([4, 5, 8, 10]); if (r.skills) S.skills = Math.random() < .5;
  if (r.diff) S.diff = randi(0, 3); if (r.troll) S.trollLv = randi(1, 3); if (r.count) { S.count = pick([4, 8, 12, 16, 20]); S.countSet = true; } } else S.skills = true;
  const mk = demo ? S.demoMode : S.mode; if (mk === 'hunt') { if (S.count !== 16 && S.count !== 20) S.count = 20; S.diff = 3; S.countSet = true; }
}
function buildMenu() {
  buildHowto(); if (!MAPS[S.map]) S.map = 'hb';
  const mapItems = Object.entries(MAPS).map(([k, m]) => ({ v: k, l: m.name + '<small>' + m.sub + '</small>' })), updMap = () => { $('mapDesc').textContent = MAPS[S.map].desc; };
  chips('chMap', mapItems, () => S.map, v => { S.map = v; updMap(); World.load(v); }, 'map'); updMap();
  const updMode = () => { $('modeDescG').textContent = MODES[S.mode] ? MODES[S.mode].short : ''; };
  chips('chMode', Object.entries(MODES).map(([k, m]) => ({ v: k, dis: !!m.soon, l: m.name + '<small>' + m.sub + '</small>' })), () => S.mode, v => { S.mode = v; updMode(); huntLock(); }, 'mode'); updMode();
  chips('chCode', CODE_OPTS.map(n => ({ v: n, l: codeLabel(n) })), () => S.codeLen, v => S.codeLen = v);
  chips('chCount', [4, 8, 12, 16, 20].map(n => ({ v: n, l: n + ' 人' })), () => S.count, v => { S.count = v; S.countSet = true; }, 'count');
  chips('chTime', [4, 5, 8, 10].map(n => ({ v: n, l: n + ' 分鐘' })), () => S.time, v => S.time = v, 'time');
  const updSk = () => { $('skDesc').textContent = S.skills === false ? '所有英雄的主動、被動技能都停用，純粹比拼眼力與手速。' : '英雄技能全部啟用（含主動技能與被動能力）。'; };
  chips('chSkill', [{ v: true, l: '是' }, { v: false, l: '否' }], () => S.skills !== false, v => { S.skills = v; updSk(); }, 'skills'); updSk();
  const TL = [{ v: 1, l: '輕度', d: '靈活度降為標準的 25%，動作遲緩、很少搗亂。' }, { v: 2, l: '中度', d: '靈活度降為標準的 55%，動作與搗亂頻率適中。' }, { v: 3, l: '重度', d: '維持標準靈活度，全場亂跑、積極搗亂。' }];
  const updTroll = () => { $('trollRow').classList.toggle('hidden', S.diff !== 3); $('trollDesc').textContent = (TL.find(t => t.v === S.trollLv) || TL[2]).d; };
  chips('chTroll', TL.map(t => ({ v: t.v, l: t.l })), () => S.trollLv, v => { S.trollLv = v; updTroll(); }, 'troll'); window.updTroll = updTroll;
  const updDiff = () => { $('diffDesc').textContent = DIFF[S.diff].desc; updTroll(); };
  chips('chDiff', DIFF.map((d, i) => ({ v: i, l: d.name })), () => S.diff, v => { S.diff = v; updDiff(); }, 'diff'); updDiff();
  chips('chInput', [{ v: 'auto', l: '自動偵測' }, { v: 'desktop', l: '🖥️ 電腦' }, { v: 'mobile', l: '📱 手機' }], () => S.input, v => { S.input = v; Device.update(); refreshBadge(); });
  chips('chQual', [{ v: 'auto', l: '自動' }, { v: 'high', l: '高' }, { v: 'mid', l: '中' }, { v: 'low', l: '低（最順）' }], () => S.quality, v => { S.quality = v; Perf.profile(); Perf.apply(); });
  chips('chAuto', [{ v: true, l: '輸入滿位數自動送出' }, { v: false, l: '需按 Enter' }], () => S.auto, v => S.auto = v);
  chips('chSnd', [{ v: true, l: '開' }, { v: false, l: '關' }], () => S.sound, v => S.sound = v);
  const sens = $('sens'); sens.value = S.sens; $('sensV').textContent = (+S.sens).toFixed(2) + '×'; sens.oninput = () => { S.sens = +sens.value; $('sensV').textContent = S.sens.toFixed(2) + '×'; saveS(); };
  refreshBadge();
}
function refreshBadge() { $('devbadge').textContent = Device.label() + ' ／ 預設 ' + (S.countSet ? S.count : defaultCount()) + ' 人'; }
function defaultCount() { return Device.mobile ? 12 : 20; }
window.onDeviceChange = () => { applyLayout(); if (UI.els.menu) { refreshBadge(); updateRotate(); } if (G.state === 'menu' && !S.countSet) { S.count = defaultCount(); buildMenuCounts(); } if (R.gl) { Perf.profile(); Perf.apply(); } };
function buildMenuCounts() { chips('chCount', [4, 8, 12, 16, 20].map(n => ({ v: n, l: n + ' 人' })), () => S.count, v => { S.count = v; S.countSet = true; }, 'count'); }
function setPreview() { G.preview = { x: 0, y: 0, z: 0, yaw: 0, animT: 0, sp: 0, av: createAvatar(S.outfit), team: -1, number: '4827', plateScale: 1 }; makePlate(G.preview); }
function tryLandscape() { try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => { }); } catch (e) { } }
function updateRotate() { VP.update(); if (Device.mobile) tryLandscape(); UI.els.rotate.classList.add('hidden'); }
document.addEventListener('pointerdown', () => { if (Device.mobile) tryLandscape(); }, true);

/* ---------- 進戰場前的圖解操作說明 ---------- */
function tutHTML(mobile) {
  if (!mobile) return `<h2>操作說明</h2><div class="tgrid">
<div class="tcard"><b>🚶 移動</b><span class="kc">W</span><span class="kc">A</span><span class="kc">S</span><span class="kc">D</span> 走路<br><span class="kc">Shift</span> 按住衝刺（耗體力）<br><span class="kc">Space</span> 跳躍，空中再按＝二段跳</div>
<div class="tcard"><b>🖱 視角</b>滑鼠移動＝轉視角（先點一下畫面鎖定）<br>右鍵／<span class="kc">Q</span> 望遠鏡（放大、移動變慢）</div>
<div class="tcard"><b>🔢 輸入號碼</b>看清對手額頭的數字後：<br><span class="kc">0</span>–<span class="kc">9</span> 輸入　<span class="kc">Enter</span> 送出<br><span class="kc">Backspace</span> 刪除（輸入滿位數可自動送出）</div>
<div class="tcard"><b>🎒 道具</b><span class="kc">F</span> 道具 1　<span class="kc">G</span> 道具 2　<span class="kc">R</span> 英雄技能<br>開局沒有道具，撿地圖上的橘色「?」箱取得；欄位滿了就不會更換</div>
<div class="tcard"><b>⚠ 小心</b>紅色箭頭＝有人正在讀你的號碼<br>輸入錯誤會被定身 2 秒（視角也不能轉）<br><span class="kc">Esc</span> 暫停</div></div><div class="tskip">輕觸任意地方以跳過</div>`;
  const P = (l, t, w, cls, txt, st) => `<i class="${cls || ''}" style="left:${l}%;top:${t}%;${w ? 'width:' + w + '%;aspect-ratio:1;' : ''}${st || ''}">${txt}</i>`;
  return `<h2>操作說明</h2><div class="tphone">
${P(23, 19.5, 0, 'col', '1 2 3 4 5')}${P(77, 19.5, 0, 'col', '6 7 8 9 0')}${P(95.6, 34, 0, 'col', '🔙', 'width:8.8%;height:9%;top:33%')}
${P(16.3, 78.4, 12, 'c', '移動')}${P(80.2, 74.3, 6.2, 'c', 'F')}${P(76.6, 92.6, 6.2, 'c', 'G')}${P(69.4, 92.6, 6.2, 'c', 'R')}${P(92.2, 71.4, 6.6, 'c', '🔭')}
${P(85.6, 90.2, 9.1, 'c', '跑')}${P(95.3, 89.9, 9.3, 'c', '跳')}${P(59.6, 8, 3.8, 'c', '⏸')}
<div class="tx" style="left:16.3%;top:62%;width:20%">左側拖曳＝移動</div><div class="tx" style="left:88%;top:60%;width:22%">壓住望遠鏡＝放大，滑動轉視角，放開取消</div>
<div class="tx" style="left:50%;top:48%;width:40%">右側空白處拖曳＝轉視角</div><div class="tx" style="left:50%;top:36%;width:60%">上方數字鍵輸入號碼（滿位數自動送出）</div>
<div class="tx" style="left:46%;top:76%;width:34%;line-height:1.6">F／G＝道具<br>跑＝點一下開關衝刺<br>跳＝跳躍，空中再按＝二段跳</div></div><div class="tskip">輕觸任意地方以跳過</div>`;
}
function showTut(freeze) {
  const t = $('tut'); t.innerHTML = tutHTML(Device.mobile); t.classList.remove('hidden'); G.tut = !!freeze; UI.tutOpen = true; const t0 = performance.now();
  const done = (e) => {
    if (!UI.tutOpen || performance.now() - t0 < 350) return; UI.tutOpen = false; G.tut = false; t.classList.add('hidden'); window.removeEventListener('keydown', kd, true);
    if (e) { e.preventDefault(); e.stopPropagation(); } if (!Device.mobile && !G.demo && freeze) Input.lock();
  };
  const kd = e => done(e); t.onpointerdown = done; window.addEventListener('keydown', kd, true);
}
function hideTut() { const t = $('tut'); if (t) t.classList.add('hidden'); UI.tutOpen = false; G.tut = false; }
function beginGame(demo, roster) {
  demo = demo === true;
  if (!roster && !UI.preResolved) resolveRandoms(demo); UI.preResolved = false;
  Sfx.init(); Sfx.resume(); if (!S.countSet) S.count = defaultCount();
  UI.els.menu.classList.add('hidden'); UI.els.hud.classList.remove('hidden'); document.body.classList.add('playing'); document.body.classList.toggle('demo', demo);
  $('keysov').classList.add('hidden'); UI.hideEnd(); UI.endScramble(); UI._ph2 = false; In.sprintT = false; $('bRun').classList.remove('tog'); UI.els.pause.classList.add('hidden'); UI.paused = false; UI.els.demoTag.classList.add('hidden');
  $('btnResume').textContent = demo ? '繼續示範' : '繼續'; $('btnQuit').textContent = demo ? '退出示範模式' : NET.mode ? '離開房間' : '回主選單'; $('pauseTitle').textContent = demo ? '示範模式已暫停' : '已暫停';
  startMatch(demo, roster); UI.els.modeName.textContent = (demo ? '示範 · ' : '') + MAPS[G.map].name + ' · ' + MODES[G.mode].name + ' · ' + (G.codeLen ? G.codeLen + ' 碼' : '大亂鬥') + ' · ' + DIFF[S.diff].name; UI._cd = 0; UI.goT = 0; UI.lastFeed = -1; UI.dirty = true; UI.onRespawn(); Perf.profile(); Perf.apply(); updateRotate();
  UI.els.hints.style.display = Device.mobile ? 'none' : '';
  if (demo) { UI.msg('示範模式：全員為電腦，視角會自動切換', 'item'); }
  else if (!Device.mobile) { Input.lock(); UI.noLock = false; setTimeout(() => { if (!Input.pointerLocked() && G.state === 'playing' && !G.demo) UI.msg('點一下畫面以鎖定滑鼠（無法鎖定時可按住左鍵拖曳）', 'item'); }, 900); }
  else UI.msg('左側拖曳移動・中間拖曳轉視角・上方數字鍵輸入', 'item');
  UI._wasLocked = false;
  if (!demo) showTut(!NET.mode); else hideTut();
}
function toMenu() { go(() => { netLeave(); resetToMenuUI(); }); }
function stopGameUI() { resetToMenuUI(); UI.els.menu.classList.add('hidden'); }
function resetToMenuUI() {
  $('gl').style.filter = ''; UI._neg = false;
  $('keysov').classList.add('hidden');
  UI.ev = {}; UI._pk = null; closePick(); G.arena = null; G.kofCd = false;
  hideTut(); if (G.sk) { G.sk.night = { e: 0, by: null }; G.sk.ink.t = 0; G.sk.rev.t = 0; G.sk.rel.t = -1; G.sk.quake.t = 0; G.sk.eagle.t = 0; } G.scopeOn = false; applyNightEnv(null); $('dfog').style.opacity = 0; $('dself').style.opacity = 0; $('ink').classList.remove('on'); $('gset').classList.add('hidden');
  G.state = 'menu'; G.demo = false; G.view = null; document.body.classList.remove('playing', 'demo'); UI.els.hud.classList.add('hidden'); UI.els.menu.classList.remove('hidden'); UI.els.pause.classList.add('hidden'); UI.paused = false; UI.hideEnd(); UI.els.bino.style.display = 'none'; UI.els.flash.style.opacity = 0;
  $('settings').classList.add('hidden'); updateRotate(); if (document.exitPointerLock) try { document.exitPointerLock(); } catch (e) { }
  { const ids = Object.keys(MAPS).filter(k => k !== World.id); World.load(pick(ids)); G.orbitSeed = Math.random() * 6.28; }
  G.player = null; freeActors(G.actors); G.actors = []; G.bino = false; G.binK = 0; G.flashT = 0; G.smokes = []; G.grenades = []; G.lures = []; G.fx = [];
}
function beginNetClientUI() {
  UI.els.menu.classList.add('hidden'); $('mp').classList.add('hidden'); UI.els.hud.classList.remove('hidden'); document.body.classList.add('playing'); document.body.classList.remove('demo');
  UI.els.modeName.textContent = '連線 · ' + MODES[G.mode].name; UI.hideEnd(); UI.els.pause.classList.add('hidden'); UI.paused = false; UI.menuOpen = false; UI.els.demoTag.classList.add('hidden');
  $('btnResume').textContent = '繼續'; $('btnQuit').textContent = '離開房間'; $('pauseTitle').textContent = '選單（遊戲持續進行中）';
  UI.lastFeed = -1; UI.dirty = true; UI.onRespawn(); Perf.profile(); Perf.apply(); updateRotate(); UI.els.hints.style.display = Device.mobile ? 'none' : '';
  if (!Device.mobile) { UI.noLock = false; UI.msg('點一下畫面以鎖定滑鼠（無法鎖定時可按住左鍵拖曳）', 'item'); }
  UI._wasLocked = false;
  showTut(false);
}
/* ---------- 英雄選擇 / 示範模式選單 ---------- */
/* ---------- 選英雄（單選／五選／從剩餘英雄選下一位） ---------- */
let _qi = null;
function qIcon() { if (_qi) return _qi; const c = cv(96, 96), g = c.getContext('2d'); g.fillStyle = '#2c2f4a'; g.beginPath(); g.arc(48, 48, 48, 0, TAU); g.fill(); g.font = '900 66px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 6; g.strokeStyle = '#7a4a00'; g.strokeText('?', 48, 53); g.fillStyle = '#ffd24a'; g.fillText('?', 48, 53); return (_qi = c.toDataURL()); }
const CS = { o: null, picks: [], rand: false, end: 0, tm: null };
function csPool() { return CS.o && CS.o.allowed ? CS.o.allowed : VIS_OUTFITS; }
function showCharInfo(i) {
  if (CS.rand && CS.o && CS.o.need === 1) { $('cName').textContent = '隨機'; $('cPass').textContent = '【驚喜】開始前由系統隨機指派一位英雄。'; return; }
  const o = OUTFITS[i === undefined ? S.outfit : i]; $('cName').textContent = o.label; $('cPass').textContent = '【' + o.skill.name + '】' + o.skill.desc;
}
function setPreview(idx) { if (CS.o && CS.o.noPrev) return; if (idx === null) { G.preview = null; return; } G.preview = { x: 0, y: 0, z: 0, yaw: 0, animT: 0, sp: 0, av: createAvatar(idx === undefined ? S.outfit : idx), team: -1, number: '4827', plateScale: 1 }; makePlate(G.preview); }
function csRefresh(last) {
  const o = CS.o; if (!o) return; const multi = o.need > 1;
  [...$('cards').children].forEach(c => { if (c.dataset.r) { c.classList.toggle('on', CS.rand && !multi); return; } const i = +c.dataset.i, k = CS.picks.indexOf(i), on = multi ? k >= 0 : (!CS.rand && CS.picks[0] === i); c.classList.toggle('on', on); const b = c.querySelector('.pk'); if (b) b.textContent = multi && k >= 0 ? k + 1 : ''; });
  $('csHint').textContent = multi ? `已選 ${CS.picks.length} / ${o.need}　（點選順序＝出賽順序，可點已選英雄取消）` : (o.hint || '');
  $('csOk').classList.toggle('dis', multi && CS.picks.length < o.need);
  if (CS.rand && !multi) { setPreview(null); showCharInfo(); } else { const v = last !== undefined ? last : CS.picks[CS.picks.length - 1]; if (v !== undefined) { setPreview(v); showCharInfo(v); } }
}
function openPick(o) {
  CS.o = o; CS.rand = false; $('csTitle').textContent = o.title || '選擇英雄'; $('csOk').textContent = o.okText || '確認'; $('csBack').style.display = o.back ? '' : 'none';
  const pool = o.allowed || VIS_OUTFITS;
  if (o.need === 1) { const pf = S.pref === 'rand' ? 'rand' : (pool.includes(S.outfit) ? S.outfit : pool[0]); CS.rand = pf === 'rand' && !o.allowed; CS.picks = CS.rand ? [] : [pf]; } else CS.picks = [];
  const cards = $('cards'); cards.innerHTML = '';
  const rc = document.createElement('div'); rc.className = 'card'; rc.dataset.r = 1; rc.innerHTML = '<img class="cav" src="' + qIcon() + '">隨機'; rc.onclick = () => { if (o.need === 1) { CS.rand = true; CS.picks = []; csRefresh(); } else { const rest = pool.filter(i => !CS.picks.includes(i)).sort(() => Math.random() - .5); while (CS.picks.length < o.need && rest.length) CS.picks.push(rest.pop()); csRefresh(); } }; cards.appendChild(rc);
  const mk = i => { const ou = OUTFITS[i], c = document.createElement('div'); c.dataset.i = i; c.className = 'card'; c.innerHTML = '<img class="cav" src="' + outfitIcon(i) + '">' + ou.label + '<b class="pk"></b>'; c.onclick = () => { CS.rand = false; if (o.need === 1) CS.picks = [i]; else { const k = CS.picks.indexOf(i); if (k >= 0) CS.picks.splice(k, 1); else if (CS.picks.length < o.need) CS.picks.push(i); } csRefresh(i); }; return c; };
  const placed = new Set();
  for (const [nm, col, ids] of HERO_CLASSES) { const list = ids.filter(i => pool.includes(i)); if (!list.length) continue; const hd = document.createElement('div'); hd.className = 'chd'; hd.style.setProperty('--hc', col); hd.textContent = nm + '（' + list.length + '）'; cards.appendChild(hd); for (const i of list) { placed.add(i); cards.appendChild(mk(i)); } }
  const rest = pool.filter(i => !placed.has(i)); if (rest.length) { const hd = document.createElement('div'); hd.className = 'chd'; hd.textContent = '其他'; cards.appendChild(hd); for (const i of rest) cards.appendChild(mk(i)); }
  UI.els.menu.classList.add('hidden'); $('mp').classList.add('hidden'); $('gset').classList.add('hidden'); $('charsel').classList.remove('hidden'); showWait(false);
  csRefresh(); clearInterval(CS.tm); UI.clrEv('cs');
  if (o.secs) { CS.end = performance.now() + o.secs * 1000; const tick = () => { const rem = (CS.end - performance.now()) / 1000; UI.setEv('cs', rem, o.evIco || '🕒'); if (rem <= 0) csFinish(true); }; tick(); CS.tm = setInterval(tick, 150); }
}
function csFinish(auto) {
  const o = CS.o; if (!o) return; clearInterval(CS.tm); UI.clrEv('cs'); const pool = csPool(); let list, wasRand = false; const ex = CS.rand && !auto;
  if (o.need === 1) { wasRand = CS.rand || auto || CS.picks[0] === undefined; list = [wasRand ? pick(pool) : CS.picks[0]]; }
  else { list = CS.picks.slice(); const rest = pool.filter(i => !list.includes(i)).sort(() => Math.random() - .5); while (list.length < o.need && rest.length) list.push(rest.pop()); }
  $('charsel').classList.add('hidden'); CS.o = null; if (G.state === 'playing' && !G.demo && !Device.mobile) { try { Input.lock(); } catch (e) { } } o.onDone(list, wasRand, ex);
}
function closePick() { clearInterval(CS.tm); UI.clrEv('cs'); CS.o = null; $('charsel').classList.add('hidden'); showWait(false); }
function showWait(on) { $('waitDlg').classList.toggle('hidden', !on); }
/* 單人／房主：設定完成後才選英雄 */
function startPickFlow() {
  resolveRandoms(false); UI.preResolved = true; const kof = S.mode === 'kof';
  openPick({
    need: kof ? 5 : 1, secs: kof ? 40 : 0, evIco: '🧩', title: kof ? '選擇 5 位出賽英雄（車輪戰）' : '選擇英雄', okText: kof ? '確認出賽名單' : '確認，開始遊戲',
    back: () => { closePick(); $('gset').classList.remove('hidden'); UI.preResolved = false; },
    onDone: (list, wasRand, ex) => { if (kof) G.kofPre = { me: list, opp: kofRandRoster() }; else S.pref = ex ? 'rand' : list[0]; S.outfit = list[0]; saveS(); beginGame(false); }
  });
}
function kofRandRoster() { return VIS_OUTFITS.slice().sort(() => Math.random() - .5).slice(0, 5); }
function openGset(demo) {
  UI.gDemo = !!demo; const g = $('gset');
  if (demo) { UI.gSaved = { mode: S.mode, map: S.map }; if (MODES[S.demoMode] && MODES[S.demoMode].demo !== false) S.mode = S.demoMode; else S.mode = 'dm'; if (MAPS[S.demoMap]) S.map = S.demoMap; buildMenu(); }
  $('gTitle').textContent = demo ? '🎬 電腦示範設定' : '🏆 遊戲設定'; $('gSub').textContent = demo ? '全部由電腦對戰，你以觀戰視角隨機切換' : '依序選好三個區塊，再按「進入遊戲」'; $('gGoT').textContent = demo ? '🎬 開始示範' : '🔥 進入遊戲';
  UI.els.menu.classList.add('hidden'); g.classList.remove('hidden'); huntLock();
}
function closeGset(go2) {
  const demo = UI.gDemo; $('gset').classList.add('hidden');
  if (demo) { S.demoMode = S.mode; S.demoMap = S.map; if (UI.gSaved) { S.mode = UI.gSaved.mode; S.map = UI.gSaved.map; } UI.gSaved = null; saveS(); buildMenu(); UI.gDemo = false; }
}
/* ---------- 設定視窗 / 按鍵配置 ---------- */
const LAYOUT_IDS = ['bJump', 'bBino2', 'bBack', 'bRun', 'slotF', 'slotG', 'slotS', 'pauseBtn', 'joyHint', 'numL', 'numR'];
function lay(id) { return S.layout[id] || (S.layout[id] = { x: 0, y: 0, s: 1 }); }
function applyLayout() {
  const on = Device.mobile || document.body.classList.contains('editing');
  for (const id of LAYOUT_IDS) { const el = $(id); if (!el) continue; const l = on ? S.layout[id] : null; if (l) { el.style.translate = l.x + 'px ' + l.y + 'px'; el.style.scale = l.s || 1; } else { el.style.translate = ''; el.style.scale = ''; } }
}
function inJoyZone(x, y) {
  if (x < VP.W * .4 && y > VP.H * .25) return true;
  const l = S.layout.joyHint; if (l && (l.x || l.y)) { const r = VP.rect($('joyHint')); return Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2)) < r.width * .9; }
  return false;
}
function joyOrigin(x, y) {
  const l = S.layout.joyHint, s = l && l.s || 1;
  if (l && (l.x || l.y)) { const r = VP.rect($('joyHint')), cx = r.left + r.width / 2, cy = r.top + r.height / 2; if (Math.hypot(x - cx, y - cy) < r.width * .9) return [cx, cy, s]; }
  return [x, y, s];
}
function openSettings() {
  $('settings').classList.remove('hidden');
  if (G.state === 'playing' && !UI.paused) { setPause(true); UI.setAuto = true; } else UI.setAuto = false;
}
function closeSettings() {
  $('settings').classList.add('hidden');
  if (UI.setAuto) { UI.setAuto = false; setPause(false); if (!G.demo && !Device.mobile) Input.lock(); }
}
const NAMES_UI = { bRun: '跑步鍵', bJump: '跳躍鍵', bBino2: '望遠鏡鍵（壓住使用）', bBack: '退回一個數字鍵', slotF: '道具 F（相機）', slotG: '道具 G', slotS: '英雄技能 R', pauseBtn: '暫停鍵', joyHint: '移動搖桿', numL: '數字鍵 0–4', numR: '數字鍵 5–9' };
let edSel = null, edDrag = null, edPrev = null;
function edSelect(id) {
  edSel = id; LAYOUT_IDS.forEach(k => $(k).classList.toggle('sel', k === id));
  const sl = $('edScale'); sl.disabled = !id; $('edName').textContent = id ? NAMES_UI[id] : '未選取'; sl.value = id ? lay(id).s : 1; $('edVal').textContent = (id ? lay(id).s : 1).toFixed(2) + '×';
}
function openLayoutEditor() {
  edPrev = { hudHidden: UI.els.hud.classList.contains('hidden') };
  document.body.classList.add('editing', 'mobile'); document.body.classList.remove('desktop'); UI.els.hud.classList.remove('hidden'); $('layoutEd').classList.remove('hidden');
  $('slotF').querySelector('.ico').textContent = '📷'; $('slotG').querySelector('.ico').textContent = '💥'; $('slotF').classList.add('has'); $('slotG').classList.add('has');
  applyLayout(); edSelect(null);
}
function closeLayoutEditor() {
  $('layoutEd').classList.add('hidden'); LAYOUT_IDS.forEach(k => $(k).classList.remove('sel'));
  document.body.classList.remove('editing'); if (edPrev && edPrev.hudHidden) UI.els.hud.classList.add('hidden'); Device.update(true); applyLayout(); saveS(); UI.dirty = true;
}
function initLayoutEditor() {
  const ed = $('layoutEd');
  ed.addEventListener('pointerdown', e => {
    if (e.target.closest('#edBar')) return; e.preventDefault(); const x = VP.px(e.clientX, e.clientY), y = VP.py(e.clientX, e.clientY); let hit = null;
    for (const id of LAYOUT_IDS) { const r = VP.rect($(id)); if (r.width && x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 6 && y <= r.bottom + 6) { hit = id; break; } }
    edSelect(hit); if (hit) { edDrag = { x, y, id: hit }; try { ed.setPointerCapture(e.pointerId); } catch (x2) { } }
  });
  ed.addEventListener('pointermove', e => {
    if (!edDrag) return; const l = lay(edDrag.id); const ex = VP.px(e.clientX, e.clientY), ey = VP.py(e.clientX, e.clientY); l.x += ex - edDrag.x; l.y += ey - edDrag.y; edDrag.x = ex; edDrag.y = ey; applyLayout();
    const r = VP.rect($(edDrag.id)); if (r.left < 0) l.x -= r.left; if (r.top < 0) l.y -= r.top; if (r.right > VP.W) l.x -= r.right - VP.W; if (r.bottom > VP.H) l.y -= r.bottom - VP.H; applyLayout();
  });
  const up = () => { if (edDrag) { edDrag = null; saveS(); } }; ed.addEventListener('pointerup', up); ed.addEventListener('pointercancel', up);
  $('edScale').addEventListener('input', () => { if (!edSel) return; lay(edSel).s = +$('edScale').value; $('edVal').textContent = (+$('edScale').value).toFixed(2) + '×'; applyLayout(); });
  $('edScale').addEventListener('change', saveS);
  $('edReset').onclick = () => { S.layout = {}; saveS(); applyLayout(); edSelect(null); };
  $('edDone').onclick = () => go(closeLayoutEditor);
}
/* ---------- 啟動 ---------- */
let lastTs = 0;
function frame(ts) {
  requestAnimationFrame(frame);
  if (R.lost) return;
  const ms = ts - lastTs; lastTs = ts; const dt = Math.min(.05, ms / 1000);
  Perf.tick(ms, G.state === 'playing' && !UI.paused);
  netTick(dt);
  if (G.state === 'debug') return;
  if (G.state === 'menu') { G.time += dt; drawPreview(); return; }
  Input.poll();
  if (!UI.paused) updateGame(dt); else G.time += 0;
  drawWorldFrame();
  if (G.photoReq) { G.photoReq = false; UI.capturePhoto(); }
  UI.updateHUD(dt);
}
function sizeBinoculars() {
  const w = VP.W, h = VP.H, r = Math.min(h * .42, w * .26), cx = w / 2, cy = h / 2, off = r * .62, svg = $('binSvg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  for (const id of ['bmR', 'bmFill']) { const e = $(id); e.setAttribute('width', w); e.setAttribute('height', h); }
  $('bmC1').setAttribute('cx', cx - off); $('bmC1').setAttribute('cy', cy); $('bmC1').setAttribute('r', r); $('bmC2').setAttribute('cx', cx + off); $('bmC2').setAttribute('cy', cy); $('bmC2').setAttribute('r', r);
  $('bmS1').setAttribute('cx', cx - off); $('bmS1').setAttribute('cy', cy); $('bmS1').setAttribute('r', r); $('bmS2').setAttribute('cx', cx + off); $('bmS2').setAttribute('cy', cy); $('bmS2').setAttribute('r', r);
}
function makeInk() {
  let S0 = 1.0, c; for (let it = 0; it < 7; it++) { c = drawInk(S0); const d = c.getContext('2d').getImageData(0, 0, 512, 512).data; let n = 0; for (let q = 3; q < d.length; q += 4) if (d[q] > 128) n++; const fr = n / (512 * 512); if (Math.abs(fr - .35) < .02) break; S0 *= Math.sqrt(.35 / Math.max(fr, .05)); }
  $('ink').style.backgroundImage = 'url(' + c.toDataURL() + ')';
}
function drawInk(S0) {
  const c = cv(512, 512), g = c.getContext('2d'), r = rng(5); g.fillStyle = '#0b0710'; g.beginPath();
  const N = 64; for (let i = 0; i <= N; i++) { const a = i / N * TAU, rr = S0 * (200 + Math.sin(a * 3 + 1) * 40 + Math.sin(a * 7) * 25 + (r() - .5) * 40 + (i % 8 === 0 ? 38 : 0)), x = 256 + Math.cos(a) * rr * 1.2, y = 256 + Math.sin(a) * rr; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.closePath(); g.fill();
  for (let k = 0; k < 40; k++) { const a = r() * TAU, d = S0 * (190 + r() * 60), s = 3 + r() * 14; g.beginPath(); g.arc(256 + Math.cos(a) * d * 1.18, 256 + Math.sin(a) * d, s, 0, TAU); g.fill(); }
  return c;
}
function startIntro() {
  const it = $('intro'), t0 = performance.now(); let fin = false;
  const end = () => { if (fin) return; fin = true; it.style.transition = 'opacity .25s'; it.style.opacity = 0; setTimeout(() => { it.classList.add('done'); $('menu').classList.add('fadein'); setTimeout(() => $('menu').classList.remove('fadein'), 1100); }, 260); };
  void it.offsetWidth; it.classList.add('go'); setTimeout(end, 6000);
  const skip = () => { if (performance.now() - t0 > 1000) end(); }; it.addEventListener('pointerdown', skip); window.addEventListener('keydown', skip);
}
function outfitIcon(i) {
  const O = OUTFITS[i]; if (O._icon) return O._icon;
  const c = cv(96, 96), g = c.getContext('2d'), f = paintFace(O), hc = O.gen ? O.gen.hair : O.hair;
  g.fillStyle = hc; g.beginPath(); g.arc(48, 48, 48, 0, TAU); g.fill();
  g.save(); g.beginPath(); g.arc(48, 52, 40, 0, TAU); g.clip(); g.drawImage(f, 232, 40, 560, 430, 4, 10, 88, 86); g.restore();
  g.fillStyle = hc; g.beginPath(); g.ellipse(48, 22, 38, 17, 0, PI, TAU); g.fill();
  return (O._icon = c.toDataURL());
}
function boot() {
  UI.init(); Device.init(); VP.update(); makeInk();
  try {
    R.init($('gl'), !Device.mobile);
  } catch (e) {
    $('errBox').innerHTML = `<div class="err">⚠ 無法啟動 3D：${e.message}<br>請改用最新版 Chrome / Safari / Edge，並確認已開啟硬體加速。</div>`; $('btnStart').disabled = true; return;
  }
  Perf.profile(); if (!S.countSet) S.count = defaultCount();
  try {
    World.initMats(); initAvatarShared(); initRenderAssets(); World.load(pick(Object.keys(MAPS))); G.orbitSeed = Math.random() * 6.28;
  } catch (e) { console.error(e); $('errBox').innerHTML = `<div class="err">⚠ 載入失敗：${e.message}</div>`; return; }
  buildMenu(); setPreview(); Input.init(); Perf.apply(); sizeBinoculars();
  window.addEventListener('resize', () => { updateRotate(); Perf.apply(); sizeBinoculars(); });
  window.addEventListener('orientationchange', () => setTimeout(() => { updateRotate(); Perf.apply(); sizeBinoculars(); }, 250));
  const fs = () => { try { const el = document.documentElement; if (document.fullscreenElement) document.exitFullscreen(); else if (el.requestFullscreen) { const r = el.requestFullscreen(); if (r && r.catch) r.catch(() => UI.msg('此環境不允許全螢幕', 'bad')); } else UI.msg('此裝置不支援全螢幕', 'bad'); } catch (e) { } };
  $('btnFs').onclick = fs; $('btnFs2').onclick = fs;
  $('btnStart').onclick = () => go(() => openGset(false));
  $('gBack').onclick = () => go(() => { const was = UI.gDemo; closeGset(); UI.els.menu.classList.remove('hidden'); });
  $('gGo').onclick = () => go(() => { if (UI.gDemo) { closeGset(); beginGame(true); } else { $('gset').classList.add('hidden'); startPickFlow(); } }); $('btnDemo').onclick = () => go(() => openGset(true)); $('btnHow').onclick = () => go(() => $('howPick').classList.remove('hidden')); $('howBack').onclick = () => go(() => $('howPick').classList.add('hidden')); $('btnResume').onclick = resumeGame; $('btnQuit').onclick = toMenu;
  $('csBack').onclick = () => go(() => { const o = CS.o; if (o && o.back) o.back(); });
  $('csOk').onclick = () => { if ($('csOk').classList.contains('dis')) return; go(() => csFinish(false)); };
  $('btnSet').onclick = () => go(openSettings); $('btnSet2').onclick = () => go(openSettings); $('btnSetClose').onclick = () => go(closeSettings); $('dbSet').onclick = () => go(openSettings); $('dbPause').onclick = () => setPause(true);
  $('btnLayout').onclick = () => go(openLayoutEditor); $('btnLayoutReset').onclick = () => { S.layout = {}; saveS(); applyLayout(); UI.msg('已重設按鍵配置', 'item'); };
  initLayoutEditor(); applyLayout(); initNetUI(); $('hostLeftOk').onclick = () => $('hostLeft').classList.add('hidden');
  $('pause').addEventListener('click', e => { if (e.target.id === 'pause') resumeGame(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.state === 'playing' && !UI.paused && !NET.mode) setPause(true); });
  window.onGLLost = () => { UI.msg('圖形裝置中斷，請重新整理頁面', 'bad'); };
  updateRotate(); requestAnimationFrame(frame); startIntro();
}
window.__shot = function (x, y, z, yaw, pitch, fov) { G.state = 'debug'; const c = R.cam; c.x = x; c.y = y; c.z = z; c.yaw = yaw; c.pitch = pitch; c.fov = fov || 1.2; c.roll = 0; drawWorldFrame(); };
setInterval(() => { try { UI.renderPills(); } catch (e) { } }, 120);
window.__G = { killByCode, kofPick, CS, openPick, csFinish, relPhase2, ericHit, immune, cleanse, MAPS, castSkillPlayer, castSkill, __spawnAll: spawnAll, __newActor: newActor, __los: los, __move: moveActor, NET, netCreate, netJoin, hostStart, openLayoutEditor, openSettings, applyLayout, mkav: createAvatar, drawAvatar, G, S, R, World, Device, Perf, UI, In, startMatch, beginGame, eliminate, submitNumber, typeDigit, useItem, drawWorldFrame, updateGame };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
