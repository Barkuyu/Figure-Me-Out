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
    if (G.sk) { G.sk.rev.t = 0; G.sk.scr.t = -1; } this.endScramble(); this._ph2 = false; this._pf = false; $('numL').classList.remove('purple'); $('numR').classList.remove('purple'); $('pflash').classList.remove('on');
    if (document.exitPointerLock) try { document.exitPointerLock(); } catch (e) { }
    if (p && !G.demo) { if (isDM()) res = G.winner === p.name ? 'win' : 'lose'; else res = G.winner === -1 ? 'draw' : (G.winner === p.team ? 'win' : 'lose'); }
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
    const hunt = G.mode === 'hunt', sorted = (hunt ? G.actors.filter(a => a.isPlayer || a.remote) : G.actors).slice().sort((a, b) => hunt ? (b.score || 0) - (a.score || 0) : b.kills - a.kills || a.deaths - b.deaths), p = G.player || {};
    let title = '', col = '#fff';
    if (isDM()) { title = G.winner === p.name ? '🏆 你贏了！' : `${G.winner} 獲勝`; }
    else { const w = G.winner; if (w === -1) title = '平手'; else { title = (w === p.team ? '🏆 你的隊伍獲勝！' : '對手隊伍獲勝'); col = w === 0 ? '#ff7a7a' : '#7aa5ff'; } }
    let rows = sorted.map((a, i) => `<tr class="${a.isPlayer ? 'me' : ''}"><td class="n">${i + 1}</td><td><span class="dot" style="background:${a.team === 0 ? '#d93a3a' : a.team === 1 ? '#3a6fd9' : '#999'}"></span>${a.name}</td><td class="n">${a.kills}</td><td class="n">${hunt ? (a.score || 0) : a.deaths}</td></tr>`).join('');
    const sc = isDM() ? '' : `<div style="font-size:20px;margin-bottom:6px"><span style="color:#ff7a7a">紅 ${G.scores[0]}</span>　-　<span style="color:#7aa5ff">${G.scores[1]} 藍</span></div>`;
    this.els.end.innerHTML = `<h2 style="color:${col}">${title}</h2>${sc}<table><tr><th class="n">#</th><th>玩家</th><th class="n">淘汰</th><th class="n">${hunt ? '積分' : '被淘汰'}</th></tr>${rows}</table><div class="btnrow"><button class="btn" id="btnAgain">再來一場</button><button class="btn alt" id="btnMenu">回主選單</button></div>`;
    this.els.end.classList.remove('hidden', 'flipin'); if (flip) { void this.els.end.offsetWidth; this.els.end.classList.add('flipin'); }
    $('btnAgain').onclick = () => { const d = G.demo; this.hideEnd(); beginGame(d); };
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
    if (!s) { ico.textContent = ''; n.textContent = ''; el.classList.remove('has'); return; }
    ico.textContent = ITEMS[s.type].ico; n.textContent = s.n > 1 ? s.n : ''; el.classList.add('has');
  },
  /* 角色技能鍵：圓形倒數環 + 秒數；艾伯特技能的預警閃光與按鍵錯亂 */
  skillHUD(dt, p) {
    const s = $('slotS'), sk = skillOf(p), cd = p.skCd || 0, show = !!sk && skOn(); s.style.display = show ? '' : 'none'; s.classList.toggle('boost', !!p.boost && cd > 0);
    { let f = 0; for (const o of G.actors) if (o !== p && o.alive && o.dackE >= 1) { const d = Math.hypot(o.x - p.x, o.z - p.z); if (d < 12) f = Math.max(f, .8 + .2 * (1 - d / 12)); } const df = $('dfog'); $('dself').style.opacity = (p.dackE >= 1) ? .2 : 0; if (Math.abs((this._df || 0) - f) > .02) { this._df = f; df.style.opacity = f; } }
    $('stamwrap').style.visibility = isOut(p, 12) ? 'hidden' : ''; $('binwrap').style.visibility = isOut(p, 13) ? 'hidden' : '';
    { const ik = $('ink'), on = inkActive(p); if (on !== this._ink) { this._ink = on; ik.classList.toggle('on', on); } if (on && G.sk.ink.t < .5) ik.style.opacity = G.sk.ink.t * 2; else if (on) ik.style.opacity = 1; }
    const dash = isSumi(p) && p.dashReady && !p.onGround, jb = $('bJump'); if (jb) { const tx = dash ? '突進' : '跳躍'; if (jb.textContent !== tx) jb.textContent = tx; }
    if (!show) { this._ph2 = false; return; }
    const ico = p.stolen ? SKILLS[p.stolen].ico : p.armed ? '🪄' : sk.ico; if (this._skIco !== ico) { this._skIco = ico; s.querySelector('.ico').textContent = ico; }
    s.classList.toggle('cd', cd > 0); s.classList.toggle('on', (p.shieldT || 0) > 0 || !!p.stolen || !!p.armed); s.style.setProperty('--p', Math.min(360, cd / sk.cd * 360).toFixed(1) + 'deg');
    const sec = cd > 0 ? String(Math.ceil(cd)) : ''; if (this._skSec !== sec) { this._skSec = sec; s.querySelector('.cdn').textContent = sec; }
    const sc = G.sk.scr, t = sc.t; let on = false;
    this._pf = on; $('numL').classList.toggle('purple', on); $('numR').classList.toggle('purple', on); $('pflash').classList.toggle('on', on);
    const ph2 = scrPhase2(p); if (ph2 && !this._ph2) this.startScramble(); if (!ph2 && this._ph2) this.endScramble(); this._ph2 = ph2;
  },
  startScramble() {
    if (Device.mobile) { const bs = [...document.querySelectorAll('.np')].sort(() => Math.random() - .5), L = $('numL'), R = $('numR'); bs.forEach((b, i) => (i < 5 ? L : R).appendChild(b)); }
    else { let m; do { m = '0123456789'.split('').sort(() => Math.random() - .5); } while (m.some((v, i) => v === String(i))); G.keyMap = {}; for (let i = 0; i < 10; i++) G.keyMap[String(i)] = m[i]; }
  },
  endScramble() { G.keyMap = null; const bs = [...document.querySelectorAll('.np')].sort((a, b) => ((+a.dataset.k + 9) % 10) - ((+b.dataset.k + 9) % 10)); bs.forEach((b, i) => (i < 5 ? $('numL') : $('numR')).appendChild(b)); },
  updateHUD(dt) {
    const e = this.els, p = G.player;
    if (!p && G.demo) { this.cdUpdate(dt); this.demoHUD(dt); return; }
    if (!p) return;
    this.cdUpdate(dt);
    // 計分
    if (G.mode === 'hunt') { const others = G.actors.filter(a => a !== p && (a.isPlayer || a.remote)).reduce((m, a) => Math.max(m, a.score || 0), 0); e.scR.textContent = p.score || 0; e.scB.textContent = others; e.scR.className = 'sc red'; e.scB.className = 'sc dm'; }
    else if (G.mode === 'dm') { const others = G.actors.filter(a => a !== p).reduce((m, a) => Math.max(m, a.kills), 0); e.scR.textContent = p.kills; e.scB.textContent = others; e.scR.className = 'sc red'; e.scB.className = 'sc dm'; }
    else { e.scR.textContent = G.scores[0]; e.scB.textContent = G.scores[1]; e.scR.className = 'sc red'; e.scB.className = 'sc blue'; }
    const ts = Math.max(0, Math.ceil(G.tleft)), tstr = Math.floor(ts / 60) + ':' + String(ts % 60).padStart(2, '0'); if (tstr !== this.lastTimer) { e.timer.textContent = tstr; this.lastTimer = tstr; }
    if (G.mode === 'ctf') { const f0 = G.flags[0], f1 = G.flags[1]; e.flagR.textContent = f0 && f0.state !== 'home' ? '🚩' : ''; e.flagB.textContent = f1 && f1.state !== 'home' ? '🏴' : ''; } else { e.flagR.textContent = ''; e.flagB.textContent = ''; }
    // 輸入
    if (this.dirty || this.lastTyped !== G.typed) {
      const t = G.codeLen ? G.typed + '_'.repeat(Math.max(0, G.codeLen - G.typed.length)) : (G.typed.length ? G.typed : '＿＿＿') + (G.typed.length && G.typed.length < 6 ? '_' : ''); e.typed.textContent = t; e.typed.className = G.typed.length ? '' : 'empty'; e.photoCap.textContent = t; this.lastTyped = G.typed;
      this.slotHTML(e.slotF, G.slots[0]); this.slotHTML(e.slotG, G.slots[1]);
      this.dirty = false;
    }
    this.skillHUD(dt, p);
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
    const e = this.els.countdown, c = Math.ceil(G.countdown || 0);
    if (c > 0) { if (c !== this._cd) { this._cd = c; const n = $('cdNum'); n.textContent = c; n.style.animation = 'none'; void n.offsetWidth; n.style.animation = ''; $('cdTxt').textContent = '遊戲將在 ' + c + ' 秒後開始・請先觀察四周'; } e.classList.remove('hidden'); }
    else if (this.goT > 0) { this.goT -= dt; if (this.goT <= 0) e.classList.add('hidden'); } else e.classList.add('hidden');
  },
  demoTag() { const v = G.view; if (v) { this.els.demoTag.textContent = '🎬 示範模式・目前視角：' + v.name; this.els.demoTag.classList.remove('hidden'); } },
  keysOverlay(v) {
    const el = $('keysov'); if (!el.firstChild) { const rows = ['1 2 3 4 5 6 7 8 9 0', 'Z Q W R _ F G C _ _', 'Shift:2 A S D _ Space:3']; el.innerHTML = rows.map(r => r.split(' ').map(t => { const [k, w] = t.split(':'); return k === '_' ? '<b class="sp"></b>' : `<b data-k="${k}"${w ? ' class="w' + w + '"' : ''}>${k}</b>`; }).join('')).join(''); this.kb = {}; el.querySelectorAll('b[data-k]').forEach(b => this.kb[b.dataset.k] = b); }
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
    const lookScale = () => (R.cam.fov / 1.28);
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
        if (e.code === 'KeyG') { useItem(1); return; }
        if (e.code === 'KeyR') { castSkillPlayer(); return; }
        if (e.code === 'KeyQ') { toggleBino(); return; }
        if (e.code === 'Escape') { if (!this.pointerLocked()) togglePause(); return; }
        if (e.code === 'KeyP') { togglePause(); return; }
        if (e.code === 'KeyM') { S.sound = !S.sound; saveS(); UI.msg(S.sound ? '音效開啟' : '音效關閉'); return; }
      }
      keys[e.code] = true; if (/^(Space|ArrowUp|ArrowDown|Tab)$/.test(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', e => { keys[e.code] = false; });
    window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; In.leanL = In.leanR = false; });
    document.addEventListener('pointerdown', e => { const t = e.target.closest && e.target.closest('button,.btn,.chip,.card,.tbtn,.slot'); if (t && !t.classList.contains('np')) { Sfx.init(); Sfx.resume(); Sfx.click(); } }, true);
    const cvs = $('gl');
    document.addEventListener('mousemove', e => {
      if (G.state !== 'playing' && G.state !== 'ended') return; if (UI.paused || UI.menuOpen) return;
      if (this.pointerLocked() || UI.dragLookActive) { const s = .0022 * S.sens * lookScale(); In.lookX -= e.movementX * s; In.lookY -= e.movementY * s; }
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
          const s = .0046 * S.sens * lookScale(); In.lookX -= (TX(t) - this.look.lx) * s; In.lookY -= (TY(t) - this.look.ly) * s; this.look.lx = TX(t); this.look.ly = TY(t); e.preventDefault();
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
    document.addEventListener('touchend', e => { if (!e.touches.length) { In.leanL = In.leanR = false; In.jump = false; } }, true); document.addEventListener('touchcancel', () => { In.leanL = In.leanR = false; In.jump = false; }, true);
    document.querySelectorAll('.np').forEach(b => press(b, () => typeDigit(b.dataset.k)));
    press($('bJump'), () => { In.jump = true; }, () => { In.jump = false; });
    press($('bBino'), () => toggleBino()); press($('bBino2'), () => toggleBino()); press($('bBack'), () => backspace());
    { const ss = $('slotS'); press(ss, () => castSkillPlayer()); ss.addEventListener('click', () => { if (!Device.mobile) castSkillPlayer(); }); }
    press($('bRun'), () => { In.sprintT = !In.sprintT; In.sprint = In.sprintT; $('bRun').classList.toggle('tog', In.sprintT); }, () => { });
    press($('bLeanL'), () => { In.leanL = true; }, () => { In.leanL = false; }); press($('bLeanR'), () => { In.leanR = true; }, () => { In.leanR = false; });
    for (const [id, i] of [['slotF', 0], ['slotG', 1]]) { const el = $(id); press(el, () => useItem(i)); el.addEventListener('click', () => { if (!Device.mobile) useItem(i); }); }
    press($('pauseBtn'), () => setPause(true));
  },
  pointerLocked() { return document.pointerLockElement === $('gl'); },
  lock() { try { const r = $('gl').requestPointerLock(); if (r && r.catch) r.catch(() => { UI.noLock = true; }); } catch (e) { UI.noLock = true; } },
  poll() {
    if (!Device.mobile) {
      const f = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0), s = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
      In.mx = s; In.my = f; In.jump = !!keys.Space; In.sprint = !!(keys.ShiftLeft || keys.ShiftRight); In.leanL = !!keys.KeyZ; In.leanR = !!keys.KeyC;
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
const MENU_HOWTO = `<p><b>目標：</b>每個人額頭都戴著一組數字牌（3～5 碼，可在主畫面選擇）。<b>看清楚 → 記住 → 輸入 → Enter</b>，對方就被淘汰。你自己的號碼別人也讀得到——背對、躲掩體、丟煙霧彈，別讓人讀完。</p>
<p><b>電腦：</b><kbd>WASD</kbd> 移動　<kbd>Shift</kbd> 衝刺　<kbd>Space</kbd> 跳（空中再按一次＝二段跳）　滑鼠轉視角（先點畫面鎖定）　<kbd>0-9</kbd> 輸入　<kbd>Enter</kbd> 送出　<kbd>Backspace</kbd> 刪除　<kbd>F</kbd>/<kbd>G</kbd> 使用道具　<kbd>Q</kbd> 或右鍵 望遠鏡　<kbd>Esc</kbd> 暫停</p>
<p><b>手機：</b>左半邊拖曳＝搖桿（走路）、右側「跑」鍵按住＝衝刺、跳躍鍵可在空中再按一次二段跳、右側空白處拖曳＝轉視角、左右兩側的數字鍵輸入（輸入滿位數自動送出）、跳躍／望遠鏡／道具格為按鈕。建議橫向持機。</p>
<p><b>道具：</b>開局沒有任何道具，必須靠走過地圖上的 <b>?</b> 箱才能取得；道具欄（兩格）已滿時不會更換，要先用掉一個再撿新的。<br>📷 相機：拍照後照片短暫停留，方便看清號碼。　🌋 地牛控制器：使其他人的畫面劇烈橫向晃動 2 秒並逐漸減弱。　🔍 偵查鏡：約 10° 長距離放大，再按一次道具鍵即拍照。　🎫 假號碼牌：頭上號碼偽裝成別的數字 7 秒。　⛲ 神仙泉水：立即刷新角色技能冷卻。　🔭 望遠鏡（內建）：遠距離讀碼，有能量限制。</p>
<p><b>地圖：</b>熱血高校（白天校園，標準面積）／詭譎學苑（黑夜版，遠處會沒入黑暗、要靠近才看得到對手）／追逃商城（1.4 倍大，兩座電扶梯通往二樓，可從欄杆直接跳下一樓、不會摔傷）。</p>
<p><b>人數：</b>含你在內最多 20 人，不足的人數由電腦補上；手機預設 12 人較順。<b>號碼位數：</b>頭上數字的位數（3～5 碼），位數越多讀得越久、也越難記。</p>
<p><b>角色技能：</b>按 <kbd>R</kbd>（手機為 G 左邊的技能鍵）施放，圓環與秒數顯示冷卻。蘇蘇【顛倒乾坤】反轉其他人移動 5 秒；艾迪【銅牆鐵壁】3 秒內擋下一次輸入攻擊並刷新號碼；艾伯特【紫電干擾】讓其他人的數字鍵錯亂 5 秒。</p>
<p><b>探頭：</b>躲在掩體後可按住 <kbd>Z</kbd>（左）／<kbd>C</kbd>（右）將上半身探出去看（手機為右側 ↖／↗ 鍵）；探出去時你的頭也會露出來，可能被對手讀到。</p>
<p><b>角色技能（新增）：</b>穆法沙【命運拷貝】——發動後竊取下一個擊殺對象的技能，主動技能用完不進冷卻，被動技能可持續使用，並可繼續偷取（偷到不同被動技能才會覆蓋）；戴克【生化操作】——戴上透視鏡後噴發 15 秒濃霧，大幅降低周圍敵人視力，自己不受影響；夜梟【夜間戰術】——黑雲使全場亮度降低 60% 持續 30 秒，自己戴夜視鏡、其他人的號碼發出紅橘黃光；夜梟被淘汰會提前結束。另有貝雷特、鷹眼、雷柏爾、貓女、王心靈、蕾西亞、柏、迪倫等角色，詳見選角畫面。技能可在「遊戲設定」中整體關閉。</p>
<p><b>賞金：</b>個人死鬥中，淘汰數領先者頭上的號碼牌會隨殺人數變得更大、更亮，成為眾人圍剿的目標。<b>逆轉：</b>激鬥追捕中，積分排名落在後半的玩家，主動技能冷卻縮短 50%。<b>干擾者：</b>可選輕度（25%）、中度（55%）、重度（100%）靈活度。</p>
<p><b>模式：</b>個人死鬥（15 淘汰）／團隊死鬥（30 淘汰）／奪旗（3 次）。團隊模式的隊友額頭牌邊框與臂章為同色，無法淘汰。</p>
<p><b>提示：</b>畫面中央的紅色箭頭代表「有人正在讀你的號碼」，進度條滿了就會被淘汰——快移動、轉身或躲到掩體後。輸錯號碼會被鎖定輸入約 1 秒。</p>`;
function huntLock() {
  if ($('chMode')) [...$('chMode').children].forEach((b, i) => { const m = Object.values(MODES)[i]; if (UI.gDemo && m && m.demo === false) b.classList.add('dis'); else if (!m || !m.soon) b.classList.remove('dis'); });
  const h = S.mode === 'hunt'; if (h) { if (S.count !== 16 && S.count !== 20) S.count = 20; S.diff = 3; S.countSet = true; }
  const CN = [4, 8, 12, 16, 20];
  for (const id of ['chCount', 'chNCount']) { const el = $(id); if (!el) continue; [...el.children].forEach(b => { const v = parseInt(b.textContent); b.classList.toggle('dis', h && v !== 16 && v !== 20); b.classList.toggle('on', v === S.count); }); }
  if (window.updTroll) window.updTroll(); if ($('diffDesc')) $('diffDesc').textContent = DIFF[S.diff].desc; if ($('diffDescN')) $('diffDescN').textContent = DIFF[S.diff].desc;
  for (const id of ['chDiff', 'chNDiff']) { const el = $(id); if (!el) continue; [...el.children].forEach((b, i) => { b.classList.toggle('dis', h && i !== 3); b.classList.toggle('on', i === S.diff); }); }
}
function chips(id, items, get, set, fmt) {
  const el = $(id); el.innerHTML = '';
  items.forEach(it => { const b = document.createElement('button'); b.className = 'chip' + (get() === it.v ? ' on' : ''); b.innerHTML = it.l; if (it.dis) b.classList.add('dis', 'soon'); b.onclick = () => { if (it.dis) return; set(it.v); saveS(); [...el.children].forEach((c, i) => c.classList.toggle('on', items[i].v === it.v)); }; el.appendChild(b); });
}
function buildMenu() {
  $('howto').innerHTML = MENU_HOWTO; if (!MAPS[S.map]) S.map = 'hb';
  const mapItems = Object.entries(MAPS).map(([k, m]) => ({ v: k, l: m.name + '<small>' + m.sub + '</small>' })), updMap = () => { $('mapDesc').textContent = MAPS[S.map].desc; };
  chips('chMap', mapItems, () => S.map, v => { S.map = v; updMap(); World.load(v); }); updMap();
  const updMode = () => { $('modeDescG').textContent = MODES[S.mode] ? MODES[S.mode].short : ''; };
  chips('chMode', Object.entries(MODES).map(([k, m]) => ({ v: k, dis: !!m.soon, l: m.name + '<small>' + m.sub + '</small>' })), () => S.mode, v => { S.mode = v; updMode(); huntLock(); }); updMode();
  chips('chCode', CODE_OPTS.map(n => ({ v: n, l: codeLabel(n) })), () => S.codeLen, v => S.codeLen = v);
  chips('chCount', [4, 8, 12, 16, 20].map(n => ({ v: n, l: n + ' 人' })), () => S.count, v => { S.count = v; S.countSet = true; });
  chips('chTime', [4, 5, 8, 10].map(n => ({ v: n, l: n + ' 分鐘' })), () => S.time, v => S.time = v);
  const updSk = () => { $('skDesc').textContent = S.skills === false ? '所有角色的主動、被動技能都停用，純粹比拼眼力與手速。' : '角色技能全部啟用（含主動技能與被動能力）。'; };
  chips('chSkill', [{ v: true, l: '是' }, { v: false, l: '否' }], () => S.skills !== false, v => { S.skills = v; updSk(); }); updSk();
  const TL = [{ v: 1, l: '輕度', d: '靈活度降為標準的 25%，動作遲緩、很少搗亂。' }, { v: 2, l: '中度', d: '靈活度降為標準的 55%，動作與搗亂頻率適中。' }, { v: 3, l: '重度', d: '維持標準靈活度，全場亂跑、積極搗亂。' }];
  const updTroll = () => { $('trollRow').classList.toggle('hidden', S.diff !== 3); $('trollDesc').textContent = (TL.find(t => t.v === S.trollLv) || TL[2]).d; };
  chips('chTroll', TL.map(t => ({ v: t.v, l: t.l })), () => S.trollLv, v => { S.trollLv = v; updTroll(); }); window.updTroll = updTroll;
  const updDiff = () => { $('diffDesc').textContent = DIFF[S.diff].desc; updTroll(); };
  chips('chDiff', DIFF.map((d, i) => ({ v: i, l: d.name })), () => S.diff, v => { S.diff = v; updDiff(); }); updDiff();
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
function buildMenuCounts() { chips('chCount', [4, 8, 12, 16, 20].map(n => ({ v: n, l: n + ' 人' })), () => S.count, v => { S.count = v; S.countSet = true; }); }
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
<div class="tcard"><b>🎒 道具</b><span class="kc">F</span> 道具 1　<span class="kc">G</span> 道具 2　<span class="kc">R</span> 角色技能<br>開局沒有道具，撿地圖上的橘色「?」箱取得；欄位滿了就不會更換</div>
<div class="tcard"><b>👀 探頭</b>躲在掩體後按住 <span class="kc">Z</span>（左）／<span class="kc">C</span>（右）<br>探頭看一眼就縮回，別被讀到號碼</div>
<div class="tcard"><b>⚠ 小心</b>紅色箭頭＝有人正在讀你的號碼<br>輸入錯誤會被定身 2 秒（視角也不能轉）<br><span class="kc">Esc</span> 暫停</div></div><div class="tskip">輕觸任意地方以跳過</div>`;
  const P = (l, t, w, cls, txt, st) => `<i class="${cls || ''}" style="left:${l}%;top:${t}%;${w ? 'width:' + w + '%;aspect-ratio:1;' : ''}${st || ''}">${txt}</i>`;
  return `<h2>操作說明</h2><div class="tphone">
${P(23, 19.5, 0, 'col', '1 2 3 4 5')}${P(77, 19.5, 0, 'col', '6 7 8 9 0')}${P(95.6, 34, 0, 'col', '🔙', 'width:8.8%;height:9%;top:33%')}
${P(16.3, 78.4, 12, 'c', '移動')}${P(11.5, 40.6, 6.6, 'c', '🔭')}${P(80.2, 74.3, 6.2, 'c', 'F')}${P(76.6, 92.6, 6.2, 'c', 'G')}${P(69.4, 92.6, 6.2, 'c', 'R')}${P(95.8, 54, 6.6, 'c', '🔭')}
${P(88.6, 71.4, 6.6, 'c', '↖')}${P(95.8, 71.4, 6.6, 'c', '↗')}${P(85.6, 90.2, 9.1, 'c', '跑')}${P(95.3, 89.9, 9.3, 'c', '跳')}${P(59.6, 8, 3.8, 'c', '⏸')}
<div class="tx" style="left:16.3%;top:62%;width:20%">左側拖曳＝移動</div><div class="tx" style="left:11.5%;top:53%;width:14%">望遠鏡</div>
<div class="tx" style="left:50%;top:48%;width:40%">右側空白處拖曳＝轉視角</div><div class="tx" style="left:50%;top:36%;width:60%">上方數字鍵輸入號碼（滿位數自動送出）</div>
<div class="tx" style="left:46%;top:76%;width:34%;line-height:1.6">F／G＝道具　↖／↗＝探頭（按住）<br>跑＝點一下開關衝刺<br>跳＝跳躍，空中再按＝二段跳</div></div><div class="tskip">輕觸任意地方以跳過</div>`;
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
  Sfx.init(); Sfx.resume(); if (!S.countSet) S.count = defaultCount();
  UI.els.menu.classList.add('hidden'); UI.els.hud.classList.remove('hidden'); document.body.classList.add('playing'); document.body.classList.toggle('demo', demo);
  UI.hideEnd(); UI.endScramble(); UI._ph2 = false; In.sprintT = false; $('bRun').classList.remove('tog'); UI.els.pause.classList.add('hidden'); UI.paused = false; UI.els.demoTag.classList.add('hidden');
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
  hideTut(); if (G.sk) { G.sk.night = { e: 0, by: null }; G.sk.ink.t = 0; G.sk.rev.t = 0; G.sk.quake.t = 0; G.sk.eagle.t = 0; } G.scopeOn = false; applyNightEnv(null); $('dfog').style.opacity = 0; $('dself').style.opacity = 0; $('ink').classList.remove('on'); $('gset').classList.add('hidden');
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
/* ---------- 角色選擇 / 示範模式選單 ---------- */
function showCharInfo() { const o = OUTFITS[S.outfit]; $('cName').textContent = o.label; $('cPass').textContent = '【' + o.skill.name + '】' + o.skill.desc; if (G.preview) G.preview.fake = null; }
function buildCards() {
  const cards = $('cards'); cards.innerHTML = '';
  OUTFITS.forEach((o, i) => { if (o.hidden) return; const c = document.createElement('div'); c.dataset.i = i; c.className = 'card' + (S.outfit === i ? ' on' : ''); c.innerHTML = '<img class="cav" src="' + outfitIcon(i) + '">' + o.label; c.onclick = () => { S.outfit = i; saveS(); [...cards.children].forEach(k => k.classList.toggle('on', +k.dataset.i === i)); setPreview(); showCharInfo(); }; cards.appendChild(c); });
  showCharInfo();
}
function openCharSelect(origin) {
  UI.csOrigin = origin; $('csOk').textContent = origin === 'mp' ? '確認' : '確認，開始遊戲'; buildCards(); setPreview();
  UI.els.menu.classList.add('hidden'); $('mp').classList.add('hidden'); $('charsel').classList.remove('hidden');
}
function closeCharSelect() { $('charsel').classList.add('hidden'); if (UI.csOrigin === 'mp') { $('mp').classList.remove('hidden'); renderLobby(); } else $('gset').classList.remove('hidden'); }
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
const LAYOUT_IDS = ['bJump', 'bBino', 'bBino2', 'bBack', 'bRun', 'bLeanL', 'bLeanR', 'slotF', 'slotG', 'slotS', 'pauseBtn', 'joyHint', 'numL', 'numR'];
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
const NAMES_UI = { bRun: '跑步鍵', bLeanL: '向左探頭鍵', bLeanR: '向右探頭鍵', bJump: '跳躍鍵', bBino: '望遠鏡鍵', bBino2: '望遠鏡鍵 2', bBack: '退回一個數字鍵', slotF: '道具 F（相機）', slotG: '道具 G', slotS: '角色技能 R', pauseBtn: '暫停鍵', joyHint: '移動搖桿', numL: '數字鍵 0–4', numR: '數字鍵 5–9' };
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
  $('gGo').onclick = () => go(() => { if (UI.gDemo) { closeGset(); beginGame(true); } else { $('gset').classList.add('hidden'); openCharSelect('start'); } }); $('btnDemo').onclick = () => go(() => openGset(true)); $('btnHow').onclick = () => go(() => $('howPick').classList.remove('hidden')); $('howBack').onclick = () => go(() => $('howPick').classList.add('hidden')); $('btnResume').onclick = resumeGame; $('btnQuit').onclick = toMenu;
  $('csBack').onclick = () => go(closeCharSelect);
  $('csOk').onclick = () => go(() => { $('charsel').classList.add('hidden'); if (UI.csOrigin === 'mp') { $('mp').classList.remove('hidden'); renderLobby(); } else beginGame(false); });
  $('btnSet').onclick = () => go(openSettings); $('btnSet2').onclick = () => go(openSettings); $('btnSetClose').onclick = () => go(closeSettings); $('dbSet').onclick = () => go(openSettings); $('dbPause').onclick = () => setPause(true);
  $('btnLayout').onclick = () => go(openLayoutEditor); $('btnLayoutReset').onclick = () => { S.layout = {}; saveS(); applyLayout(); UI.msg('已重設按鍵配置', 'item'); };
  initLayoutEditor(); applyLayout(); initNetUI(); $('hostLeftOk').onclick = () => $('hostLeft').classList.add('hidden');
  $('pause').addEventListener('click', e => { if (e.target.id === 'pause') resumeGame(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.state === 'playing' && !UI.paused && !NET.mode) setPause(true); });
  window.onGLLost = () => { UI.msg('圖形裝置中斷，請重新整理頁面', 'bad'); };
  updateRotate(); requestAnimationFrame(frame); startIntro();
}
window.__shot = function (x, y, z, yaw, pitch, fov) { G.state = 'debug'; const c = R.cam; c.x = x; c.y = y; c.z = z; c.yaw = yaw; c.pitch = pitch; c.fov = fov || 1.2; c.roll = 0; drawWorldFrame(); };
window.__G = { MAPS, castSkillPlayer, castSkill, __spawnAll: spawnAll, __newActor: newActor, __los: los, __move: moveActor, NET, netCreate, netJoin, hostStart, openLayoutEditor, openSettings, applyLayout, mkav: createAvatar, drawAvatar, G, S, R, World, Device, Perf, UI, In, startMatch, beginGame, eliminate, submitNumber, typeDigit, useItem, drawWorldFrame, updateGame };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
