/* ================= 地圖系統（熱血高校＝標準面積 86x70m；詭譎學苑；追逃商城） ================= */
const MAPS = {};
const World = {
  boxes: [], bk: {}, defs: {}, meshes: [], ramps: [], links: null, ready: false, I: M4.create(), id: '', cur: null, mezz: null, drawList: [],
  bounds: { x0: -43, x1: 43, z0: -35, z1: 35 },
  nav: null, spawnRed: [], spawnBlue: [], flagPos: [[-30, 26], [34, -19]], pickSpots: [], gymBox: [9.5, -29.5, 39, -8.7], at: null, atRects: {}, ghosts: [], fxLights: [], tick: 0,
  initMats() {
    const aniso = Device.mobile ? 4 : 8; R.setAniso(aniso);
    const T = (g, o) => R.tex(g(), Object.assign({ repeat: true }, o));
    const d = this.defs;
    d.pave = { tex: T(TG.pave), sx: 4, sy: 4, ao: 1, tint: [1, 1, 1, 1] };
    d.tile = { tex: T(TG.tile), sx: 4, sy: 4, ao: 0, spec: .3 };
    d.wall = { tex: T(TG.wall), sx: 8, sy: 8, ao: 1 };
    d.facade = { tex: T(TG.facade), sx: 4, sy: 4.5, ao: 1 };
    d.stone = { tex: T(TG.stone), sx: 2.4, sy: 2.4, ao: 1 };
    d.plank = { tex: T(TG.plank), sx: 2.1, sy: 2.1, ao: 1, spec: .08 };
    d.fence = { tex: T(TG.fence), sx: 1.6, sy: 1.6, ao: 1 };
    d.climb = { tex: T(TG.climb), sx: 3, sy: 3, ao: 1, spec: .1 };
    d.grass = { tex: T(TG.grass), sx: 3, sy: 3, ao: 0 };
    d.gym = { tex: T(TG.gym, { repeat: false }), sx: 1, sy: 1, ao: 0, spec: .35 };
    d.court = { tex: T(TG.court, { repeat: false }), sx: 1, sy: 1, ao: 0, spec: .12 };
    d.roofDark = { sx: 4, sy: 4, tint: [.62, .64, .68, 1], ao: 0 };
    d.ceil = { sx: 4, sy: 4, tint: [.86, .87, .9, 1], ao: 0 };
    d.steel = { sx: 4, sy: 4, tint: [.30, .32, .36, 1], spec: .5 };
    d.whitepaint = { sx: 4, sy: 4, tint: [.92, .92, .9, 1], ao: 1 };
    d.rim = { sx: 4, sy: 4, tint: [.95, .38, .12, 1] };
    d.glass = { sx: 4, sy: 4, tint: [.42, .56, .66, 1], spec: .9 };
    d.light = { sx: 4, sy: 4, tint: [1, .96, .82, 1], unlit: 1 };
    d.mat = { sx: 4, sy: 4, tint: [.18, .38, .74, 1], ao: 1 };
    d.cRed = { sx: 4, sy: 4, tint: [.74, .12, .10, 1], ao: 1, spec: .25 };
    d.cBlue = { sx: 4, sy: 4, tint: [.14, .32, .72, 1], ao: 1, spec: .2 };
    d.cYel = { sx: 4, sy: 4, tint: [.92, .74, .16, 1], ao: 1, spec: .2 };
    d.cGrn = { sx: 4, sy: 4, tint: [.18, .52, .30, 1], ao: 1 };
    d.cPnk = { sx: 4, sy: 4, tint: [.88, .46, .62, 1], ao: 1 };
    d.cBlk = { sx: 4, sy: 4, tint: [.10, .10, .12, 1], ao: 1, spec: .3 };
    d.cTeal = { sx: 4, sy: 4, tint: [.16, .55, .58, 1], ao: 1 };
    d.cOrg = { sx: 4, sy: 4, tint: [.92, .46, .12, 1], ao: 1 };
    d.cPur = { sx: 4, sy: 4, tint: [.42, .22, .60, 1], ao: 1 };
    d.cDarkRed = { sx: 4, sy: 4, tint: [.30, .03, .03, 1], ao: 1, spec: .3 };
    d.esc = { tex: T(TG.esc, { repeat: false }), sx: 1, sy: 1, ao: 0, spec: .3 };
    d.vcol = { sx: 4, sy: 4, tint: [1, 1, 1, 1], ao: 1, spec: .12 };
    d.foliage = { tex: T(TG.leaf), sx: 4, sy: 4, spec: .03 };
    d.bark = { tex: T(TG.bark), sx: 4, sy: 4 };
    d.decal = { sx: 1, sy: 1, tint: [1, 1, 1, 1], blend: 1, noDepth: 1, two: 1 };
    d.glassT = { sx: 4, sy: 4, tint: [.62, .82, .94, .26], blend: 1, noDepth: 1, two: 1, spec: .3 };
    d.neon = { sx: 1, sy: 1, tint: [1, 1, 1, 1], blend: 1, noDepth: 1, two: 1, unlit: 1 };
    for (const k in d) {
      const e = d[k]; e.t0 = (e.tint || [1, 1, 1, 1]).slice();
      e.m = R.mat({ tex: e.tex || null, tint: e.t0.slice(), ao: e.ao || 0, spec: e.spec || 0, unlit: e.unlit || 0, blend: e.blend || 0, noDepth: e.noDepth || 0, two: e.two || 0 });
    }
    this.spriteTex = { ghost: R.tex(TG.ghost(), { nomip: true }) };
  },
  setLook(look) { for (const k in this.defs) { const e = this.defs[k], t = e.m.tint; if (e.unlit || k === 'decal' || k === 'glassT' || k === 'foliage') { if (k === 'foliage') { t[0] = look ? look[0] : 1; t[1] = look ? look[1] : 1; t[2] = look ? look[2] : 1; } continue; } for (let i = 0; i < 3; i++) t[i] = e.t0[i] * (look ? look[i] : 1); } },
  resetBuckets() { for (const k in this.defs) this.bk[k] = { p: [], n: [], u: [], c: [], i: [] }; },
  /* 世界座標 UV 的軸對齊盒子 */
  pushBox(mat, x0, y0, z0, x1, y1, z1) {
    const b = this.bk[mat], sx = this.defs[mat].sx, sy = this.defs[mat].sy;
    const F = [[1, 0, 0, [x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], [-1, 0, 0, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]],
    [0, 1, 0, [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], [0, -1, 0, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]],
    [0, 0, 1, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, -1, [x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]]];
    for (const f of F) {
      if (f[1] === -1 && y0 < .01) continue;
      const o = b.p.length / 3;
      for (let k = 0; k < 4; k++) {
        const p = f[3 + k]; b.p.push(p[0], p[1], p[2]); b.n.push(f[0], f[1], f[2]); b.c.push(1, 1, 1);
        let u, v; if (f[1] !== 0) { u = p[0] / sx; v = p[2] / sx; } else if (f[0] !== 0) { u = p[2] / sx; v = p[1] / sy; } else { u = p[0] / sx; v = p[1] / sy; }
        b.u.push(u, v);
      }
      b.i.push(o, o + 1, o + 2, o, o + 2, o + 3);
    }
  },
  quadTop(mat, x0, z0, x1, z1, y, unit) {
    const b = this.bk[mat], sx = this.defs[mat].sx, o = b.p.length / 3;
    const pts = [[x0, z1], [x1, z1], [x1, z0], [x0, z0]];
    for (const [x, z] of pts) { b.p.push(x, y, z); b.n.push(0, 1, 0); b.c.push(1, 1, 1); if (unit) b.u.push((x - x0) / (x1 - x0), 1 - (z - z0) / (z1 - z0)); else b.u.push(x / sx, z / sx); }
    b.i.push(o, o + 1, o + 2, o, o + 2, o + 3);
  },
  /* mergeGeos 的結果（頂點色）併入某材質桶 */
  addGeo(mat, g) {
    const b = this.bk[mat], o = b.p.length / 3; for (let k = 0; k < g.p.length; k++) b.p.push(g.p[k]); for (let k = 0; k < g.n.length; k++) b.n.push(g.n[k]);
    for (let k = 0; k < g.u.length; k++) b.u.push(g.u[k]); const cn = g.p.length / 3; for (let k = 0; k < cn; k++) { if (g.c) b.c.push(g.c[k * 3], g.c[k * 3 + 1], g.c[k * 3 + 2]); else b.c.push(1, 1, 1); }
    for (let k = 0; k < g.i.length; k++) b.i.push(g.i[k] + o);
  },
  prop(items, mat) { this.addGeo(mat || 'vcol', mergeGeos(items)); },
  /* 貼圖集（招牌、血跡、手印…；每次載入地圖重畫） */
  atlasReset() { const c = cv(2048, 2048); this.at = { c, g: c.getContext('2d'), x: 0, y: 0, rh: 0 }; this.atRects = {}; },
  atlasAdd(key, w, h, fn) {
    if (this.atRects[key]) return this.atRects[key];
    const a = this.at; if (a.x + w > 2048) { a.x = 0; a.y += a.rh; a.rh = 0; } if (a.y + h > 2048) return null;
    const r = { u0: (a.x + 1) / 2048, u1: (a.x + w - 1) / 2048, vt: 1 - (a.y + 1) / 2048, vb: 1 - (a.y + h - 1) / 2048 };
    a.g.save(); a.g.translate(a.x, a.y); a.g.beginPath(); a.g.rect(0, 0, w, h); a.g.clip(); fn(a.g, w, h); a.g.restore(); a.x += w; a.rh = Math.max(a.rh, h); this.atRects[key] = r; return r;
  },
  text(txt, o) { // 招牌 / 牆面字
    o = o || {}; const w = o.w || 256, h = o.h || 64, key = 'T' + txt + '|' + (o.bg || '') + (o.fg || '') + w + h + (o.font || '');
    return this.atlasAdd(key, w, h, (g) => {
      if (o.bg) { g.fillStyle = o.bg; g.fillRect(0, 0, w, h); if (o.border) { g.strokeStyle = o.border; g.lineWidth = 4; g.strokeRect(3, 3, w - 6, h - 6); } }
      g.font = (o.font || '800 ' + Math.floor(h * .62) + 'px') + ' "Noto Sans TC","Microsoft JhengHei",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      if (o.shadow) { g.lineWidth = 6; g.strokeStyle = o.shadow; g.lineJoin = 'round'; g.strokeText(txt, w / 2, h / 2 + 2); }
      g.fillStyle = o.fg || '#fff'; g.fillText(txt, w / 2, h / 2 + 2);
    });
  },
  addQuad(mat, r, p0, p1, p2, p3) {
    if (!r) return; const b = this.bk[mat], o = b.p.length / 3;
    const ax = p1[0] - p0[0], ay = p1[1] - p0[1], az = p1[2] - p0[2], bx = p3[0] - p0[0], by = p3[1] - p0[1], bz = p3[2] - p0[2];
    let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx; const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    const P = [p0, p1, p2, p3], UV = [[r.u0, r.vb], [r.u1, r.vb], [r.u1, r.vt], [r.u0, r.vt]];
    for (let k = 0; k < 4; k++) { b.p.push(P[k][0], P[k][1], P[k][2]); b.n.push(nx, ny, nz); b.c.push(1, 1, 1); b.u.push(UV[k][0], UV[k][1]); }
    b.i.push(o, o + 1, o + 2, o, o + 2, o + 3);
  },
  /* 貼在地上的貼圖（上方朝 -z），ang 為旋轉 */
  gdecal(r, cx, cz, w, d, ang, y, mat) {
    const c = Math.cos(ang || 0), s = Math.sin(ang || 0), q = (lx, lz) => [cx + lx * c - lz * s, y || .03, cz + lx * s + lz * c];
    this.addQuad(mat || 'decal', r, q(-w / 2, d / 2), q(w / 2, d / 2), q(w / 2, -d / 2), q(-w / 2, -d / 2));
  },
  /* 貼在牆上（沿線段 (x0,z0)->(x1,z1)，高度 y0~y1；從線段左手邊看是正面） */
  wdecal(r, x0, z0, x1, z1, y0, y1, mat) { this.addQuad(mat || 'decal', r, [x0, y0, z0], [x1, y0, z1], [x1, y1, z1], [x0, y1, z0]); },
  box(mat, cx, cz, w, d, h, y0, o) {
    y0 = y0 || 0; o = o || {};
    const x0 = cx - w / 2, x1 = cx + w / 2, z0 = cz - d / 2, z1 = cz + d / 2;
    if (o.render !== false) this.pushBox(mat, x0, y0, z0, x1, y0 + h, z1);
    if (o.collide !== false) this.boxes.push({ x0, x1, z0, z1, y0, y1: y0 + (o.colH || h), see: o.see !== false });
  },
  col(cx, cz, w, d, h, y0) { this.boxes.push({ x0: cx - w / 2, x1: cx + w / 2, z0: cz - d / 2, z1: cz + d / 2, y0: y0 || 0, y1: (y0 || 0) + h, see: true }); },
  /* 斜坡（電扶梯、溜滑梯）。ax='z'：沿 z 方向，高度在座標 a 處為 ya、b 處為 yb；belt 為沿 a→b 的輸送速度(m/s) */
  ramp(o) {
    const ax = o.ax, a = o.a, b = o.b, ya = o.ya, yb = o.yb, lo = Math.min(a, b), hi = Math.max(a, b);
    const r = { ax, a, b, ya, yb, belt: o.belt || 0, x0: o.x0, x1: o.x1, z0: o.z0, z1: o.z1 };
    if (ax === 'z') { r.z0 = lo; r.z1 = hi; } else { r.x0 = lo; r.x1 = hi; }
    r.h = (x, z) => { const c = ax === 'z' ? z : x, t = clamp((c - a) / (b - a), 0, 1); return ya + (yb - ya) * t; };
    r.dir = ax === 'z' ? [0, Math.sign(b - a)] : [Math.sign(b - a), 0];
    this.ramps.push(r);
    const run = Math.abs(b - a), rise = yb - ya, L = Math.hypot(run, rise) + .04, phi = Math.atan2(rise, b - a), th = .3, mc = (a + b) / 2, hm = (ya + yb) / 2;
    const w = ax === 'z' ? r.x1 - r.x0 : r.z1 - r.z0, cxm = (r.x0 + r.x1) / 2, czm = (r.z0 + r.z1) / 2;
    const mat = o.mat || 'esc', sh = Math.sin(phi) * th / 2, ch = Math.cos(phi) * th / 2;
    if (ax === 'z') this.addGeo(mat, mergeGeos([{ g: gBox(w, th, L), t: [cxm, hm - ch, mc + sh], r: [-phi, 0, 0], c: o.col || [1, 1, 1] }]));
    else this.addGeo(mat, mergeGeos([{ g: gBox(L, th, w), t: [mc - sh, hm - ch, czm], r: [0, 0, phi], c: o.col || [1, 1, 1] }]));
    // 視線遮擋用的實心坡體（不參與碰撞）+ 兩側扶手牆（參與碰撞）
    const n = Math.max(1, Math.ceil(run / 1.2)), seg = run / n, sgn = Math.sign(b - a), wallH = o.wallH === undefined ? 1.0 : o.wallH, wt = o.wallT || .22;
    for (let i = 0; i < n; i++) {
      const c0 = a + sgn * seg * i, c1 = c0 + sgn * seg, cl = Math.min(c0, c1), ch2 = Math.max(c0, c1), hmax = Math.max(r.h(ax === 'x' ? c0 : 0, ax === 'z' ? c0 : 0), r.h(ax === 'x' ? c1 : 0, ax === 'z' ? c1 : 0));
      if (ax === 'z') {
        this.boxes.push({ x0: r.x0, x1: r.x1, z0: cl, z1: ch2, y0: 0, y1: hmax - .02, see: true, nc: true });
        if (wallH > 0) for (const sx of [r.x0 - wt / 2, r.x1 + wt / 2]) this.box(o.wallMat || 'steel', sx, (cl + ch2) / 2, wt, seg + .02, hmax + wallH, 0, { see: o.wallSee !== false });
      } else {
        this.boxes.push({ x0: cl, x1: ch2, z0: r.z0, z1: r.z1, y0: 0, y1: hmax - .02, see: true, nc: true });
        if (wallH > 0) for (const sz of [r.z0 - wt / 2, r.z1 + wt / 2]) this.box(o.wallMat || 'steel', (cl + ch2) / 2, sz, seg + .02, wt, hmax + wallH, 0, { see: o.wallSee !== false });
      }
    }
    return r;
  },
  /* 階梯：從 (x,z) 往 dir(+x/-x/+z/-z) 逐階上升 */
  stairs(mat, x, z, dir, w, n, rise, run, y0) {
    y0 = y0 || 0;
    for (let i = 0; i < n; i++) {
      const o = (i + .5) * run; let cx = x, cz = z, bw = w, bd = run;
      if (dir === '+x') { cx = x + o; bw = run; bd = w; } else if (dir === '-x') { cx = x - o; bw = run; bd = w; } else if (dir === '+z') { cz = z + o; } else { cz = z - o; }
      this.box(mat, cx, cz, bw, bd, rise * (i + 1), y0);
    }
  },
  rampAt(x, z, y, tol) { for (const r of this.ramps) { if (x > r.x0 - .05 && x < r.x1 + .05 && z > r.z0 - .05 && z < r.z1 + .05 && Math.abs(r.h(x, z) - y) < (tol || .2)) return r; } return null; },
  layerOf(y) { return this.mezz && y > this.mezz.h - 1.5 ? 1 : 0; },
  inMezz(x, z) { const m = this.mezz; return !!m && x > m.x0 && x < m.x1 && z > m.z0 && z < m.z1; },
  /* ---- 載入地圖 ---- */
  load(id) {
    if (this.id === id && this.ready) return; id = MAPS[id] ? id : 'hb';
    this.ready = false; for (const e of this.meshes) R.freeMesh(e.mesh); this.meshes = []; this.boxes = []; this.ramps = []; this.ghosts = []; this.fxLights = []; this.drawList = []; this.eyes = []; this.mist = [];
    if (this.atTex) { R.freeTex(this.atTex); this.atTex = null; }
    const m = MAPS[id]; this.id = id; this.cur = m; this.bounds = m.bounds; this.mezz = m.mezz || null; this.flagPos = m.flagPos; this.gymBox = m.interior;
    this.resetBuckets(); this.atlasReset(); this.setLook(m.look || null);
    Object.assign(R.env, m.env); if (typeof Perf !== 'undefined') R.setShadow(Perf.shadowWanted && !Perf.shadowOff && !m.noShadow);
    m.build(this);
    const ar = this.at; this.atTex = R.tex(ar.c, {}); this.defs.decal.m.tex = this.defs.neon.m.tex = this.atTex; this.defs.decal.m.useTexOnly = true;
    for (const k in this.bk) { const b = this.bk[k]; if (!b.p.length) continue; this.meshes.push({ mesh: R.mkMesh({ p: b.p, n: b.n, u: b.u, c: b.c, i: b.i }), m: this.defs[k].m, k }); }
    this.buildNav(); this.makeSpawns(); this.ready = true;
    if (typeof SPR !== 'undefined' && SPR.mesh) SPR.skyCur = (m.night ? SPR.skyNight : SPR.sky);
  },
  /* 樹木：list=[[x,z,s]]，dead=枯樹；forest 生成圍牆外樹林 */
  trees(o) {
    const chunks = {}, rr = rng(o.seed || 1234);
    const ck = (x, z) => { const k = Math.floor((x + 120) / 45) + '_' + Math.floor((z + 120) / 45); return chunks[k] || (chunks[k] = { fol: [], bark: [] }); };
    let fol = null, bark = null;
    const tree = (x, z, s, collide, dead) => {
      const C = ck(x, z); fol = C.fol; bark = C.bark; const h = 4.4 * s;
      const bc = dead ? [.42, .36, .32] : [.8, .7, .6];
      bark.push({ g: gCyl(.16 * s, .27 * s, h, 9, 3), t: [x, h / 2, z], c: bc, cfn: (px, py) => shade(dead ? [.5, .45, .42] : [.85, .74, .64], .85 + .2 * Math.sin(py * 3 + x)) });
      if (dead) {
        const nb = 5 + (rr() * 3 | 0);
        for (let k = 0; k < nb; k++) {
          const a = rr() * TAU, hy = h * (.55 + rr() * .45), len = (1.2 + rr() * 1.6) * s, tilt = .7 + rr() * .7;
          bark.push({ g: gCyl(.03 * s, .09 * s, len, 6, 1), t: [x + Math.sin(a) * Math.sin(tilt) * len * .5, hy + Math.cos(tilt) * len * .5, z + Math.cos(a) * Math.sin(tilt) * len * .5], r: [Math.sin(tilt) * Math.cos(a), 0, -Math.sin(tilt) * Math.sin(a)], c: bc, cfn: () => [.38, .33, .3] });
        }
      } else {
        const n = 5; for (let k = 0; k < n; k++) {
          const a = rr() * TAU, rad = rr() * 1.6 * s, hy = h + (rr() * 2.2 - .2) * s, r = (1.5 + rr() * 1.1) * s;
          const base = [.30 + rr() * .1, .52 + rr() * .14, .20 + rr() * .06];
          fol.push({ g: gSphere(r, 9, 6), t: [x + Math.cos(a) * rad, hy, z + Math.sin(a) * rad], s: [1, .78, 1], r: [0, rr() * 3, 0], cfn: (px, py, pz) => shade(base, .8 + .5 * clamp((py - (hy - r)) / (2 * r), 0, 1) + (Math.sin(px * 9 + pz * 7) * .05)) });
        }
      }
      if (collide) this.col(x, z, .5 * s, .5 * s, 6);
    };
    const bush = (x, z, s) => { const C = ck(x, z); fol = C.fol; for (let k = 0; k < 3; k++) { const a = rr() * TAU, r = (.45 + rr() * .3) * s; fol.push({ g: gSphere(r, 8, 5), t: [x + Math.cos(a) * .5 * s, .55 * s + .6, z + Math.sin(a) * .5 * s], s: [1, .75, 1], cfn: (px, py) => shade([.25, .46, .2], .75 + .4 * clamp((py - .3) / .8, 0, 1)) }); } };
    for (const [x, z, s] of o.list || []) tree(x, z, s, true, o.dead);
    if (o.forest) {
      const b = this.bounds, hx = (b.x1 - b.x0) / 2, hz = (b.z1 - b.z0) / 2;
      for (let k = 0; k < 44; k++) {
        const side = k % 4, t = rr(), s = 1.5 + rr() * .9; let x, z;
        if (side === 0) { x = -hx - 2 + t * (2 * hx + 4); z = -(hz + 5 + rr() * 8); } else if (side === 1) { x = -hx - 2 + t * (2 * hx + 4); z = hz + 5 + rr() * 8; } else if (side === 2) { x = -(hx + 10 + rr() * 8); z = -hz + t * 2 * hz; } else { x = hx + 10 + rr() * 8; z = -hz + t * 2 * hz; }
        tree(x, z, s, false, o.dead);
      }
    }
    if (!o.dead) for (const [x, z, s] of o.bushes || []) bush(x, z, s);
    for (const key in chunks) {
      const C = chunks[key];
      if (C.fol.length) { const fg = mergeGeos(C.fol); for (let k = 0; k < fg.u.length; k++) fg.u[k] *= 3; this.meshes.push({ mesh: R.mkMesh(fg), m: this.defs.foliage.m, k: 'foliage', cull: true }); }
      if (C.bark.length) { const bg = mergeGeos(C.bark); for (let k = 0; k < bg.u.length; k += 2) { bg.u[k] *= 2; bg.u[k + 1] *= 3; } this.meshes.push({ mesh: R.mkMesh(bg), m: this.defs.bark.m, k: 'bark', cull: true }); }
    }
  },
  draw() { for (const e of this.meshes) { if (e.cull && !R.visible(e.mesh.cx, e.mesh.cy, e.mesh.cz, e.mesh.r)) continue; R.draw(e.mesh, this.I, e.m); } },
  drawShadow() { for (const e of this.meshes) { const k = e.k; if (k === 'pave' || k === 'grass' || k === 'gym' || k === 'court' || k === 'light' || k === 'glass' || k === 'tile' || k === 'decal' || k === 'neon') continue; R.draw(e.mesh, this.I, e.m); } },

  /* ---- 導航網格（支援二樓：layer 0/1，電扶梯為傳送門連結） ---- */
  buildNav() {
    const cs = 2, b = this.bounds, nx = Math.ceil((b.x1 - b.x0) / cs), nz = Math.ceil((b.z1 - b.z0) / cs), nl = this.mezz ? 2 : 1, N = nx * nz, walk = new Uint8Array(nl * N), mz = this.mezz, self = this;
    const blocked = (x, z, r, l) => {
      const base = l ? mz.h : 0;
      for (const q of self.boxes) { if (q.nc || q.y1 < base + .06 || q.y0 > base + 1.6) continue; if (x > q.x0 - r && x < q.x1 + r && z > q.z0 - r && z < q.z1 + r) return true; }
      return false;
    };
    for (let l = 0; l < nl; l++) for (let iz = 0; iz < nz; iz++) for (let ix = 0; ix < nx; ix++) {
      const x = b.x0 + (ix + .5) * cs, z = b.z0 + (iz + .5) * cs;
      if (l === 1 && !(x > mz.x0 + .3 && x < mz.x1 - .3 && z > mz.z0 + .3 && z < mz.z1 - .3)) continue;
      walk[l * N + iz * nx + ix] = blocked(x, z, .38, l) ? 0 : 1;
    }
    this.nav = { cs, nx, nz, nl, N, walk, blocked: (x, z, r, l) => blocked(x, z, r, l || 0), links: {}, via: {} };
    for (const p of (this.cur.portals || [])) { // p: {a:[x,z] 1F 起點, b:[x,z] 2F 終點, viaUp:[[x,z]..]}
      const ca = this.cell(p.a[0], p.a[1]), cb = this.cell(p.b[0], p.b[1]), ia = ca.iz * nx + ca.ix, ib = N + cb.iz * nx + cb.ix;
      walk[ia] = 1; walk[ib] = 1; (this.nav.links[ia] = this.nav.links[ia] || []).push(ib); (this.nav.links[ib] = this.nav.links[ib] || []).push(ia);
      this.nav.via[ia + '_' + ib] = p.via.map(v => v.slice()); this.nav.via[ib + '_' + ia] = p.via.slice().reverse().map(v => v.slice());
    }
    // 相鄰格之間的通行（避免 A* 穿過比格子薄的牆）
    const eE = new Uint8Array(nl * N), eS = new Uint8Array(nl * N);
    const seg = (x0, z0, x1, z1, l) => { for (let k = 1; k < 4; k++) { const t = k / 4; if (blocked(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, .3, l)) return 0; } return 1; };
    for (let l = 0; l < nl; l++) for (let iz = 0; iz < nz; iz++) for (let ix = 0; ix < nx; ix++) {
      const i = l * N + iz * nx + ix; if (!walk[i]) continue; const x = b.x0 + (ix + .5) * cs, z = b.z0 + (iz + .5) * cs;
      if (ix + 1 < nx && walk[i + 1]) eE[i] = seg(x, z, x + cs, z, l); if (iz + 1 < nz && walk[i + nx]) eS[i] = seg(x, z, x, z + cs, l);
    }
    this.nav.eE = eE; this.nav.eS = eS;
  },
  /* 兩個相鄰格（同層）是否可直接通行；dx,dz ∈ {-1,0,1} */
  edgeOK(base, cx, cz, dx, dz) {
    const n = this.nav, nx = n.nx, i = base + cz * nx + cx;
    if (dx === 1 && dz === 0) return n.eE[i] === 1; if (dx === -1 && dz === 0) return n.eE[i - 1] === 1; if (dz === 1 && dx === 0) return n.eS[i] === 1; if (dz === -1 && dx === 0) return n.eS[i - nx] === 1;
    return this.edgeOK(base, cx, cz, dx, 0) && this.edgeOK(base, cx, cz, 0, dz) && this.edgeOK(base, cx + dx, cz, 0, dz) && this.edgeOK(base, cx, cz + dz, dx, 0);
  },
  cell(x, z) { const n = this.nav, b = this.bounds; return { ix: clamp(Math.floor((x - b.x0) / n.cs), 0, n.nx - 1), iz: clamp(Math.floor((z - b.z0) / n.cs), 0, n.nz - 1) }; },
  cpos(ix, iz) { const n = this.nav, b = this.bounds; return [b.x0 + (ix + .5) * n.cs, b.z0 + (iz + .5) * n.cs]; },
  walkable(x, z, l) { const c = this.cell(x, z); return this.nav.walk[(l || 0) * this.nav.N + c.iz * this.nav.nx + c.ix] === 1; },
  nearestWalk(x, z, l) { // 回傳節點索引（含層）；優先選「從目前位置能直接走過去」的最近格，避免挑到牆另一側
    const n = this.nav, c = this.cell(x, z), base = (l || 0) * n.N; l = l || 0;
    if (n.walk[base + c.iz * n.nx + c.ix] && !n.blocked(x, z, .22, l)) return base + c.iz * n.nx + c.ix;
    let best = -1, bd = 1e9, bestAny = -1, bdAny = 1e9, found = 0;
    for (let r = 0; r < 9; r++) {
      for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue; const ix = c.ix + dx, iz = c.iz + dz; if (ix < 0 || iz < 0 || ix >= n.nx || iz >= n.nz) continue;
        const i = base + iz * n.nx + ix; if (!n.walk[i] || (this.mainOnly && !n.main[i])) continue; const p = this.cpos(ix, iz), d = Math.hypot(p[0] - x, p[1] - z);
        if (d < bdAny) { bdAny = d; bestAny = i; }
        if (d < bd && this.segFree(x, z, p[0], p[1], l)) { bd = d; best = i; }
      }
      if (best >= 0 && r >= 1) break; if (best < 0 && bestAny >= 0 && r >= 4) break;
    }
    if (best >= 0) return best; if (bestAny >= 0) return bestAny; return base + c.iz * n.nx + c.ix;
  },
  segFree(x0, z0, x1, z1, l) { const d = Math.hypot(x1 - x0, z1 - z0), st = Math.max(1, Math.ceil(d / .3)); for (let k = 1; k <= st; k++) { const t = k / st; if (this.nav.blocked(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, .2, l)) return false; } return true; },
  lineClear(x0, z0, x1, z1, l) {
    const d = Math.hypot(x1 - x0, z1 - z0), steps = Math.ceil(d / .45);
    for (let k = 1; k < steps; k++) { const t = k / steps, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t; if (!this.walkable(x, z, l)) return false; if (this.nav.blocked(x, z, .3, l)) return false; }
    return true;
  },
  path(sx, sz, gx, gz, sl, gl) {
    const n = this.nav, nx = n.nx, nz = n.nz, N = n.N, T = n.nl * N; sl = sl | 0; gl = gl | 0;
    if (sl && !this.inMezz(sx, sz)) sl = 0; if (gl && !this.inMezz(gx, gz)) gl = 0;
    const si = this.nearestWalk(sx, sz, sl), gi = this.nearestWalk(gx, gz, gl); if (si === gi) return [[gx, gz]];
    const gS = new Float32Array(T).fill(1e9), from = new Int32Array(T).fill(-1), closed = new Uint8Array(T), open = [si];
    const f = new Float32Array(T), hpush = (i) => { open.push(i); let c = open.length - 1; while (c > 0) { const pr = (c - 1) >> 1; if (f[open[pr]] <= f[i]) break; open[c] = open[pr]; c = pr; } open[c] = i; }, hpop = () => { const top = open[0], last = open.pop(); if (open.length) { let c = 0; const n = open.length; for (;;) { let l = c * 2 + 1; if (l >= n) break; if (l + 1 < n && f[open[l + 1]] < f[open[l]]) l++; if (f[open[l]] >= f[last]) break; open[c] = open[l]; c = l; } open[c] = last; } return top; };
    const gcx = (gi % N) % nx, gcz = ((gi % N) / nx) | 0;
    gS[si] = 0; const hh = (i) => { const q = i % N, dx = Math.abs(q % nx - gcx), dz = Math.abs(((q / nx) | 0) - gcz); return Math.max(dx, dz) + .414 * Math.min(dx, dz); };
    f[si] = hh(si); let found = false, guard = 0;
    while (open.length && guard++ < 30000) {
      const cur = hpop(); if (closed[cur]) continue; if (cur === gi) { found = true; break; } closed[cur] = 1;
      const lb = cur >= N ? N : 0, q = cur - lb, cx = q % nx, cz = (q / nx) | 0;
      for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dz) continue; const ix = cx + dx, iz = cz + dz; if (ix < 0 || iz < 0 || ix >= nx || iz >= nz) continue;
        const ni = lb + iz * nx + ix; if (!n.walk[ni] || closed[ni]) continue;
        if (!this.edgeOK(lb, cx, cz, dx, dz)) continue;
        const ng = gS[cur] + (dx && dz ? 1.414 : 1); if (ng < gS[ni]) { gS[ni] = ng; from[ni] = cur; f[ni] = ng + hh(ni); hpush(ni); }
      }
      const lk = n.links[cur]; if (lk) for (const ni of lk) { if (closed[ni]) continue; const ng = gS[cur] + 7; if (ng < gS[ni]) { gS[ni] = ng; from[ni] = cur; f[ni] = ng + hh(ni); hpush(ni); } }
    }
    if (!found) return [[gx, gz]];
    const cells = []; for (let c = gi; c !== -1; c = from[c]) cells.push(c); cells.reverse();
    const pos = c => this.cpos((c % N) % nx, ((c % N) / nx) | 0), lay = c => c >= N ? 1 : 0, out = [];
    const run = (a, b) => { // cells[a..b] 同層：略過第一點，路徑簡化
      const pts = []; for (let k = a; k <= b; k++) pts.push(pos(cells[k])); const l = lay(cells[a]); let i = 0;
      while (i < pts.length - 1) { let j = pts.length - 1; while (j > i + 1 && !this.lineClear(pts[i][0], pts[i][1], pts[j][0], pts[j][1], l)) j--; out.push(pts[j]); i = j; }
    };
    let rs = 0;
    for (let k = 1; k < cells.length; k++) {
      if (lay(cells[k]) !== lay(cells[k - 1])) { run(rs, k - 1); const v = n.via[cells[k - 1] + '_' + cells[k]]; if (v) for (const p of v) out.push(p.slice()); out.push(pos(cells[k])); rs = k; }
    }
    run(rs, cells.length - 1);
    if (out.length && lay(cells[0]) === sl && !this.segFree(sx, sz, out[0][0], out[0][1], sl)) out.unshift(pos(cells[0]));
    if (this.walkable(gx, gz, gl) && !this.nav.blocked(gx, gz, .4, gl)) out.push([gx, gz]);
    return out.length ? out : [pos(cells[cells.length - 1])];
  },
  makeSpawns() {
    const m = this.cur, n = this.nav, N = n.N; this.walkCells = [];
    { // 只保留最大連通區（排除被牆圍住的小空間當出生點／目標點）
      const T = n.nl * N, seen = new Uint8Array(T); let bestC = 0, bestList = null;
      for (let s0 = 0; s0 < T; s0++) {
        if (!n.walk[s0] || seen[s0]) continue; const comp = [s0]; seen[s0] = 1;
        for (let h = 0; h < comp.length; h++) {
          const c = comp[h], lb = c >= N ? N : 0, qq = c - lb, cx = qq % n.nx, cz = (qq / n.nx) | 0;
          for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dz) continue; const ix = cx + dx, iz = cz + dz; if (ix < 0 || iz < 0 || ix >= n.nx || iz >= n.nz) continue; const ni = lb + iz * n.nx + ix; if (!n.walk[ni] || seen[ni] || !this.edgeOK(lb, cx, cz, dx, dz)) continue; seen[ni] = 1; comp.push(ni); }
          const lk = n.links[c]; if (lk) for (const ni of lk) if (!seen[ni]) { seen[ni] = 1; comp.push(ni); }
        }
        if (comp.length > bestC) { bestC = comp.length; bestList = comp; }
      }
      n.main = new Uint8Array(T); for (const i of bestList) n.main[i] = 1;
    }
    for (let l = 0; l < n.nl; l++) for (let iz = 0; iz < n.nz; iz++) for (let ix = 0; ix < n.nx; ix++) if (n.walk[l * N + iz * n.nx + ix] && n.main[l * N + iz * n.nx + ix]) { const p = this.cpos(ix, iz); this.walkCells.push([p[0], p[1], l]); }
    // 傳送門端點的格子固定存在，但連到電扶梯的入口格不當作出生點
    const inR = (x, z, r) => x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3];
    this.spawnRed = this.walkCells.filter(p => !p[2] && inR(p[0], p[1], m.zoneRed)); this.spawnBlue = this.walkCells.filter(p => !p[2] && inR(p[0], p[1], m.zoneBlue));
    this.mainOnly = true; this.pickSpots = m.pickSpots.map(p => { const l = p[2] ? 1 : 0, ix = this.nearestWalk(p[0], p[1], l), q = ix % N, c = this.cpos(q % n.nx, (q / n.nx | 0)); return [c[0], c[1], l]; }); this.mainOnly = false;
    this.centers = { red: m.faceRed, blue: m.faceBlue };
  },
  pickSpawn(team, avoid) {
    const list = team === 0 ? this.spawnRed : team === 1 ? this.spawnBlue : this.walkCells;
    let best = null, bd = -1;
    for (let k = 0; k < 10; k++) {
      const p = pick(list); let md = 1e9; for (const a of avoid) { if (!a.alive) continue; md = Math.min(md, Math.hypot(a.x - p[0], a.z - p[1]) + (Math.abs(a.y - (p[2] ? this.mezz.h : 0)) > 2 ? 6 : 0)); }
      if (md > bd) { bd = md; best = p; }
    }
    return best;
  }
};
