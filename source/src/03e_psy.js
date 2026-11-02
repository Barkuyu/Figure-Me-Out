/* ================= 地圖 5：超能槍戰（迷宮式窄走道；面積為熱血高校 1.2 倍，障礙物 1.2 倍） ================= */
const PSY_ENV = { sunCol: [.86, .88, 1.0], sky: [.22, .18, .40], gnd: [.52, .52, .68], fog: [.07, .05, .16], fogR: [40, 170], interior: [999, 999, 1000, 1000], intK: .7, intH: 7 };
const PSY = { P: 2.8, C: 34, R: 27, TW: .4, WH: 3.2 };
function buildPsy(W) {
  const B = (...a) => W.box(...a), rr = rng(20261103), { P, C, R, TW, WH } = PSY, X0 = -C * P / 2, Z0 = -R * P / 2;
  // vw[i][j]：x = X0+i*P 上、第 j 列的垂直牆；hw[i][j]：z = Z0+j*P 上、第 i 欄的水平牆（i∈[0,C)、j∈[0,R)）
  const vw = Array.from({ length: C + 1 }, () => new Uint8Array(R)), hw = Array.from({ length: C }, () => new Uint8Array(R + 1));
  const connected = () => { const seen = new Uint8Array(C * R), st = [0]; seen[0] = 1; let n = 1; while (st.length) { const c = st.pop(), i = c % C, j = (c / C) | 0; const go = (ni, nj, blocked) => { if (blocked || ni < 0 || nj < 0 || ni >= C || nj >= R) return; const k = nj * C + ni; if (!seen[k]) { seen[k] = 1; n++; st.push(k); } }; go(i + 1, j, vw[i + 1][j]); go(i - 1, j, vw[i][j]); go(i, j + 1, hw[i][j + 1]); go(i, j - 1, hw[i][j]); } return n === C * R; };
  const edges = (o, line, a, L) => { const out = []; for (let k = 0; k < L; k++) out.push(o ? [hw, a + k, line] : [vw, line, a + k]); return out; };
  const apply = (es, v) => { for (const [arr, i, j] of es) arr[i][j] = v; };
  const tryRun = (o, line, a, L) => { // o=1 水平線（沿 x），o=0 垂直線
    const maxA = o ? C : R; if (a < 0 || a + L > maxA) return false; const es = edges(o, line, a, L); if (es.every(e => e[0][e[1]][e[2]])) return false;
    const prev = es.map(e => e[0][e[1]][e[2]]); apply(es, 1); if (connected()) return true; es.forEach((e, k) => { e[0][e[1]][e[2]] = prev[k]; }); return false;
  };
  const inner = (C - 1) * R + C * (R - 1); let walls = 0; const cnt = () => { let n = 0; for (let i = 1; i < C; i++) for (let j = 0; j < R; j++) n += vw[i][j]; for (let i = 0; i < C; i++) for (let j = 1; j < R; j++) n += hw[i][j]; return n; };
  for (let t = 0; t < 9000 && (walls = cnt()) < inner * .46; t++) { const o = rr() < .5 ? 1 : 0, L = 2 + ((rr() * 7) | 0), line = 1 + ((rr() * ((o ? R : C) - 1)) | 0), a = (rr() * ((o ? C : R) - L + 1)) | 0; tryRun(o, line, a, L); }
  // 消除 2×2 開放廣場：走道必須維持窄道
  for (let pass = 0; pass < 3; pass++) for (let i = 0; i < C - 1; i++) for (let j = 0; j < R - 1; j++) {
    if (vw[i + 1][j] || vw[i + 1][j + 1] || hw[i][j + 1] || hw[i + 1][j + 1]) continue;
    const opts = [[1, j + 1, i, 1], [1, j + 1, i + 1, 1], [0, i + 1, j, 1], [0, i + 1, j + 1, 1]].sort(() => rr() - .5); for (const q of opts) if (tryRun(q[0], q[1], q[2], q[3])) break;
  }
  // 合併成長牆
  const segs = []; // [x0,z0,x1,z1,low]
  for (let j = 1; j < R; j++) { let i = 0; while (i < C) { if (!hw[i][j]) { i++; continue; } let k = i; while (k < C && hw[k][j]) k++; segs.push([X0 + i * P, Z0 + j * P, X0 + k * P, Z0 + j * P, k - i >= 2 && rr() < .14]); i = k; } }
  for (let i = 1; i < C; i++) { let j = 0; while (j < R) { if (!vw[i][j]) { j++; continue; } let k = j; while (k < R && vw[i][k]) k++; segs.push([X0 + i * P, Z0 + j * P, X0 + i * P, Z0 + k * P, k - j >= 2 && rr() < .14]); j = k; } }
  const reg = x => x < -C * P / 4 ? 'R' : x < 0 ? 'G' : x < C * P / 4 ? 'Y' : 'B', fl = { R: 'arenaR', G: 'arenaG', Y: 'arenaY', B: 'arenaB' }, glow = { R: 'glowR', G: 'glowG', Y: 'glowY', B: 'glowB' };
  // ---- 地面：四個色區（紅／綠／黃／藍） ----
  W.quadTop('arenaF', -160, -130, 160, 130, 0);
  const q4 = C * P / 4; [['R', X0, -q4], ['G', -q4, 0], ['Y', 0, q4], ['B', q4, -X0]].forEach(([k, a, b]) => W.quadTop(fl[k], a, Z0, b, -Z0, .012));
  // ---- 外牆 ----
  for (const [cx, cz, w, d] of [[0, Z0 - TW / 2, C * P + 2 * TW, TW + .2], [0, -Z0 + TW / 2, C * P + 2 * TW, TW + .2], [X0 - TW / 2, 0, TW + .2, R * P], [-X0 + TW / 2, 0, TW + .2, R * P]]) B('arenaW', cx, cz, w, d, 4.2, 0, { colH: 9 });
  // ---- 迷宮牆（黑色牆身＋同色區的發光端柱） ----
  let nWall = 0;
  for (const [x0, z0, x1, z1, low] of segs) {
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = Math.abs(x1 - x0) + (x1 === x0 ? TW : TW), d = Math.abs(z1 - z0) + (z1 === z0 ? TW : TW), h = low ? 1.25 : WH;
    B('arenaW', cx, cz, w, d, h, 0); nWall++;
    const gk = glow[reg(cx)]; for (const [px, pz] of [[x0, z0], [x1, z1]]) B(gk, px, pz, .5, .5, h + .25, 0, { collide: false });
    if (!low) B(gk, cx, cz, x1 === x0 ? TW + .04 : Math.abs(x1 - x0) * .98, z1 === z0 ? TW + .04 : Math.abs(z1 - z0) * .98, .08, h, { collide: false }); // 牆頂發光條
  }
  // ---- 走道內的掩體（箱子／立柱）：目標總障礙物約為熱血高校（251）的 1.2 倍 ≈ 301 ----
  const target = (typeof window !== 'undefined' && window.__noCrates) ? 0 : 301, cells = []; for (let j = 0; j < R; j++) for (let i = 0; i < C; i++) cells.push([i, j]); cells.sort(() => rr() - .5);
  const reserved = c => c[0] <= 3 || c[0] >= C - 4; // 兩端出生區保持暢通
  let crates = 0, used = new Set(); const cm = ['cYel', 'cOrg', 'cTeal', 'cPur', 'cPnk'];
  for (const c of cells) {
    if (W.boxes.filter(q => !q.nc).length >= target) break; if (reserved(c)) continue; const [i, j] = c;
    const zs = vw[i][j] && vw[i + 1][j] && !hw[i][j] && !hw[i][j + 1], xs = hw[i][j] && hw[i][j + 1] && !vw[i][j] && !vw[i + 1][j]; // 只放在直走道（轉角、岔路不放，避免堵死）
    if (!zs && !xs) continue; if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dz]) => used.has((i + dx) + ',' + (j + dz)))) continue; used.add(i + ',' + j);
    const cx = X0 + (i + .5) * P, cz = Z0 + (j + .5) * P, tall = rr() < .35, off = (rr() < .5 ? -1 : 1) * .5, h = tall ? 2.0 + rr() * .6 : 1.1, m = cm[(rr() * cm.length) | 0];
    if (zs) B(m, cx + off, cz, 1.0, 1.0, h); else B(m, cx, cz + off, 1.0, 1.0, h); crates++;
  }
  W.psyInfo = { walls: nWall, crates };
}
MAPS.psy = {
  id: 'psy', skyKind: 'neon', navCs: 1.4, orbit: { c: [0, 0], r: 36, h: 60, ly: 1.2 }, preview: [0, 0], name: '超能槍戰', sub: '迷宮窄走道 · 1.2 倍面積', desc: '霓虹迷宮：走道只有兩人寬，紅、綠、黃、藍四個色區交錯。雙方迎面撞上就得開戰，低牆可探頭窺看、箱子與立柱可閃躲遮蔽，是節奏最快的近距離對決。',
  bounds: { x0: -47.6, x1: 47.6, z0: -37.8, z1: 37.8 }, flagPos: [[-43.4, 0], [43.4, 0]], zoneRed: [-47, -11, -39, 11], zoneBlue: [39, -11, 47, 11], faceRed: [-30, 0], faceBlue: [30, 0],
  interior: [999, 999, 1000, 1000], env: PSY_ENV, night: false, noShadow: true,
  pickSpots: [[-30, -22], [30, 22], [-30, 22], [30, -22], [-14, -8], [14, 8], [-14, 8], [14, -8], [0, -26], [0, 26], [-40, 14], [40, -14], [-40, -14], [40, 14], [-6, 0], [6, 0], [-22, 0], [22, 0], [0, 14], [0, -14]],
  build(W) { buildPsy(W); }
};
