/* ================= 輕量 WebGL 渲染器（無外部依賴） ================= */
const R = (() => {
  let gl, canvas, prog, vaoExt, uintExt, anisoExt, anisoMax = 1;
  const U = {};
  const V = M4.create(), P = M4.create(), VP = M4.create(), PF = M4.create(), VPF = M4.create();
  const cam = { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, roll: 0, fov: 1.2, asp: 1, near: .08, far: 700 };
  const planes = new Float32Array(24);
  let lastTex = null, lastMesh = null, depthW = true, blendOn = false, cullOn = true;
  const api = { cam, V, VP, lost: false, stats: { calls: 0, tris: 0 } };
  const SUN = [0.42, 0.78, 0.34];
  { const l = Math.hypot(...SUN); SUN[0] /= l; SUN[1] /= l; SUN[2] /= l; }
  api.sun = SUN;
  api.env = { sunCol: [.78, .72, .60], sky: [.50, .57, .68], gnd: [.34, .31, .27], fog: [.80, .87, .93], fogR: [70, 280], interior: [11, -34, 45, -10], intK: .72 };

  const VS = `attribute vec3 aP;attribute vec3 aN;attribute vec2 aT;attribute vec3 aC;
uniform mat4 uVP;uniform mat4 uM;
varying vec3 vN;varying vec2 vT;varying vec3 vC;varying vec3 vW;
void main(){vec4 w=uM*vec4(aP,1.0);vW=w.xyz;vN=(uM*vec4(aN,0.0)).xyz;vT=aT;vC=aC;gl_Position=uVP*w;}`;
  const FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
varying vec3 vN;varying vec2 vT;varying vec3 vC;varying vec3 vW;
uniform sampler2D uTex;uniform float uUseTex;uniform vec4 uTint;uniform vec3 uEmis;uniform float uSpec;uniform float uUnlit;uniform float uAO;uniform float uFogOn;uniform float uAlphaTest;
uniform sampler2D uSM;uniform mat4 uLS;uniform float uShOn;
uniform vec3 uCam;uniform vec3 uSun;uniform vec3 uSunCol;uniform vec3 uSky;uniform vec3 uGnd;uniform vec3 uFogCol;uniform vec2 uFogR;uniform vec4 uInt;uniform float uIntK;uniform float uIntH;
float shadowF(vec3 w,vec3 n){
  vec4 p=uLS*vec4(w+n*0.07,1.0);vec3 s=p.xyz*0.5+0.5;
  if(s.x<0.0||s.x>1.0||s.y<0.0||s.y>1.0||s.z>=1.0)return 1.0;
  float b=0.0016,sum=0.0,o=0.0007;
  vec3 c;float d;
  c=texture2D(uSM,s.xy).rgb;d=dot(c,vec3(1.0,1.0/255.0,1.0/65025.0));sum+=(s.z-b<=d)?1.0:0.0;
  c=texture2D(uSM,s.xy+vec2(o,o)).rgb;d=dot(c,vec3(1.0,1.0/255.0,1.0/65025.0));sum+=(s.z-b<=d)?1.0:0.0;
  c=texture2D(uSM,s.xy+vec2(-o,o)).rgb;d=dot(c,vec3(1.0,1.0/255.0,1.0/65025.0));sum+=(s.z-b<=d)?1.0:0.0;
  c=texture2D(uSM,s.xy+vec2(o,-o)).rgb;d=dot(c,vec3(1.0,1.0/255.0,1.0/65025.0));sum+=(s.z-b<=d)?1.0:0.0;
  c=texture2D(uSM,s.xy+vec2(-o,-o)).rgb;d=dot(c,vec3(1.0,1.0/255.0,1.0/65025.0));sum+=(s.z-b<=d)?1.0:0.0;
  vec2 e=abs(s.xy*2.0-1.0);float fade=smoothstep(0.78,1.0,max(e.x,e.y));
  return mix(sum/5.0,1.0,fade);
}
void main(){
  vec4 t=vec4(1.0);
  if(uUseTex>0.5)t=texture2D(uTex,vT);
  if(uAlphaTest>0.5&&t.a<0.5)discard;
  vec3 base=t.rgb*vC*uTint.rgb;
  vec3 col;
  if(uUnlit>0.5){col=base+uEmis;}
  else{
    vec3 n=normalize(vN);
    if(!gl_FrontFacing)n=-n;
    vec3 amb=mix(uGnd,uSky,n.y*0.5+0.5);
    float nd=max(dot(n,uSun),0.0);
    float inside=step(uInt.x,vW.x)*step(vW.x,uInt.z)*step(uInt.y,vW.z)*step(vW.z,uInt.w)*step(vW.y,uIntH);
    float ao=mix(1.0-0.34*uAO,1.0,smoothstep(0.0,1.7,vW.y));
    float sh=1.0;if(uShOn>0.5&&nd>0.0)sh=shadowF(vW,n);
    col=base*(amb*mix(1.0,uIntK,inside)+uSunCol*nd*sh*mix(1.0,0.12,inside*(1.0-uShOn)))*ao;
    vec3 vd=normalize(uCam-vW);vec3 h=normalize(vd+uSun);
    col+=uSunCol*pow(max(dot(n,h),0.0),26.0)*uSpec*(1.0-inside)*sh;
    col+=uEmis;
  }
  if(uFogOn>0.5){float f=clamp((length(vW-uCam)-uFogR.x)/(uFogR.y-uFogR.x),0.0,1.0);col=mix(col,uFogCol,f*f*(3.0-2.0*f)*0.92);}
  if(uUnlit<0.5){vec3 x=col*0.84;col=clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0);}
  gl_FragColor=vec4(col,t.a*uTint.a);
}`;

  const VSS = `attribute vec3 aP;uniform mat4 uLP;uniform mat4 uM;void main(){gl_Position=uLP*uM*vec4(aP,1.0);}`;
  const FSS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
void main(){float d=gl_FragCoord.z;vec3 e=vec3(1.0,255.0,65025.0)*d;e=fract(e);e-=e.yzz*vec3(1.0/255.0,1.0/255.0,0.0);gl_FragColor=vec4(e,1.0);}`;
  let progS = null; const US = {}; const sm = { ok: false, size: 2048, radius: 50, tex: null, fbo: null, rb: null, LS: new Float32Array(16), on: false };
  let shadowPass = false;
  function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }

  api.init = function (cv, aa) {
    canvas = cv;
    const attrs = { antialias: !!aa, alpha: false, depth: true, stencil: false, powerPreference: 'high-performance', preserveDrawingBuffer: false };
    try { attrs.desynchronized = true; gl = canvas.getContext('webgl', attrs); } catch (e) { }
    if (!gl) { delete attrs.desynchronized; gl = canvas.getContext('webgl', attrs) || canvas.getContext('experimental-webgl', attrs); }
    if (!gl) throw new Error('此裝置不支援 WebGL');
    prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.bindAttribLocation(prog, 0, 'aP'); gl.bindAttribLocation(prog, 1, 'aN'); gl.bindAttribLocation(prog, 2, 'aT'); gl.bindAttribLocation(prog, 3, 'aC');
    gl.linkProgram(prog); if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    ['uVP', 'uM', 'uTex', 'uUseTex', 'uTint', 'uEmis', 'uSpec', 'uUnlit', 'uAO', 'uFogOn', 'uAlphaTest', 'uSM', 'uLS', 'uShOn', 'uCam', 'uSun', 'uSunCol', 'uSky', 'uGnd', 'uFogCol', 'uFogR', 'uInt', 'uIntK', 'uIntH'].forEach(n => U[n] = gl.getUniformLocation(prog, n));
    progS = gl.createProgram(); gl.attachShader(progS, sh(gl.VERTEX_SHADER, VSS)); gl.attachShader(progS, sh(gl.FRAGMENT_SHADER, FSS)); gl.bindAttribLocation(progS, 0, 'aP'); gl.linkProgram(progS);
    if (gl.getProgramParameter(progS, gl.LINK_STATUS)) { US.uLP = gl.getUniformLocation(progS, 'uLP'); US.uM = gl.getUniformLocation(progS, 'uM'); } else progS = null;
    gl.useProgram(prog);
    vaoExt = gl.getExtension('OES_vertex_array_object'); uintExt = gl.getExtension('OES_element_index_uint');
    anisoExt = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
    if (anisoExt) anisoMax = gl.getParameter(anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK); gl.depthFunc(gl.LEQUAL);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.disable(gl.DITHER);
    gl.uniform1i(U.uTex, 0); gl.uniform1i(U.uSM, 1);
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); api.lost = true; if (window.onGLLost) window.onGLLost(); });
    api.gl = gl; api.info = { renderer: (function () { try { const d = gl.getExtension('WEBGL_debug_renderer_info'); return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'WebGL'; } catch (e) { return 'WebGL'; } })() };
    return gl;
  };
  api.setAniso = n => { api.aniso = n; };
  api.resize = function (cssW, cssH, pr) {
    const w = Math.max(2, Math.floor(cssW * pr)), h = Math.max(2, Math.floor(cssH * pr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    gl.viewport(0, 0, w, h); cam.asp = w / h; api.w = w; api.h = h;
  };
  api.tex = function (c, o) {
    o = o || {}; const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    const pot = (c.width & (c.width - 1)) === 0 && (c.height & (c.height - 1)) === 0;
    if (pot && !o.nomip) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
    else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    const wrap = (o.repeat && pot) ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    if (anisoExt && !o.nomip) gl.texParameterf(gl.TEXTURE_2D, anisoExt.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(anisoMax, o.aniso || api.aniso || 4));
    lastTex = null; return { t, src: c, pot };
  };
  api.freeTex = function (tx) { if (tx && tx.t) { gl.deleteTexture(tx.t); tx.t = null; } };
  api.updateTex = function (tx) {
    gl.bindTexture(gl.TEXTURE_2D, tx.t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tx.src); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    if (tx.pot) gl.generateMipmap(gl.TEXTURE_2D); lastTex = null;
  };
  api.mkMesh = function (g) {
    const n = g.p.length / 3, d = new Float32Array(n * 11);
    let minx = 1e9, miny = 1e9, minz = 1e9, maxx = -1e9, maxy = -1e9, maxz = -1e9;
    for (let k = 0; k < n; k++) {
      const x = g.p[k * 3], y = g.p[k * 3 + 1], z = g.p[k * 3 + 2], o = k * 11;
      d[o] = x; d[o + 1] = y; d[o + 2] = z; d[o + 3] = g.n[k * 3]; d[o + 4] = g.n[k * 3 + 1]; d[o + 5] = g.n[k * 3 + 2]; d[o + 6] = g.u[k * 2]; d[o + 7] = g.u[k * 2 + 1];
      if (g.c) { d[o + 8] = g.c[k * 3]; d[o + 9] = g.c[k * 3 + 1]; d[o + 10] = g.c[k * 3 + 2]; } else { d[o + 8] = d[o + 9] = d[o + 10] = 1; }
      if (x < minx) minx = x; if (y < miny) miny = y; if (z < minz) minz = z; if (x > maxx) maxx = x; if (y > maxy) maxy = y; if (z > maxz) maxz = z;
    }
    const big = n > 65000; if (big && !uintExt) throw new Error('mesh too large');
    const idx = big ? new Uint32Array(g.i) : new Uint16Array(g.i);
    const m = { vbo: gl.createBuffer(), ibo: gl.createBuffer(), count: idx.length, type: big ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, vao: null };
    gl.bindBuffer(gl.ARRAY_BUFFER, m.vbo); gl.bufferData(gl.ARRAY_BUFFER, d, gl.STATIC_DRAW);
    if (vaoExt) {
      m.vao = vaoExt.createVertexArrayOES(); vaoExt.bindVertexArrayOES(m.vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, m.vbo); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.ibo); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
      setAttrs(); vaoExt.bindVertexArrayOES(null);
    } else { gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.ibo); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW); }
    m.cx = (minx + maxx) / 2; m.cy = (miny + maxy) / 2; m.cz = (minz + maxz) / 2; m.r = Math.hypot(maxx - minx, maxy - miny, maxz - minz) / 2;
    m.tris = idx.length / 3; lastMesh = null; return m;
  };
  function setAttrs() {
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 44, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 44, 12);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 44, 24);
    gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 44, 32);
  }
  api.freeMesh = function (m) { if (!m) return; if (m.vbo) gl.deleteBuffer(m.vbo); if (m.ibo) gl.deleteBuffer(m.ibo); if (m.vao && vaoExt) vaoExt.deleteVertexArrayOES(m.vao); m.vbo = m.ibo = m.vao = null; lastMesh = null; };
  api.mat = function (o) { return Object.assign({ tex: null, tint: [1, 1, 1, 1], emis: [0, 0, 0], spec: 0, unlit: 0, ao: 0, fog: 1, alphaTest: 0, blend: 0, noDepth: 0, two: 0 }, o || {}); };

  function frustum(m) {
    // Gribb-Hartmann (column-major)
    const p = planes; let o = 0;
    const row = (a, s) => [m[3] + s * m[a], m[7] + s * m[a + 4], m[11] + s * m[a + 8], m[15] + s * m[a + 12]];
    for (const [a, s] of [[0, 1], [0, -1], [1, 1], [1, -1], [2, 1], [2, -1]]) {
      const r = row(a, s), l = Math.hypot(r[0], r[1], r[2]) || 1; p[o++] = r[0] / l; p[o++] = r[1] / l; p[o++] = r[2] / l; p[o++] = r[3] / l;
    }
  }
  api.visible = function (x, y, z, r) { for (let i = 0; i < 24; i += 4) if (planes[i] * x + planes[i + 1] * y + planes[i + 2] * z + planes[i + 3] < -r) return false; return true; };

  api.begin = function () {
    M4.camWorld(api._cw || (api._cw = M4.create()), cam.x, cam.y, cam.z, cam.yaw, cam.pitch, cam.roll);
    M4.rigidInv(V, api._cw);
    M4.persp(P, cam.fov, cam.asp, cam.near, cam.far); M4.mul(VP, P, V); frustum(VP);
    const e = api.env;
    gl.useProgram(prog);
    gl.uniformMatrix4fv(U.uVP, false, VP);
    gl.uniform1f(U.uShOn, sm.on ? 1 : 0); gl.uniformMatrix4fv(U.uLS, false, sm.LS);
    if (sm.on) { gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, sm.tex); gl.activeTexture(gl.TEXTURE0); }
    gl.uniform3f(U.uCam, cam.x, cam.y, cam.z); gl.uniform3fv(U.uSun, SUN); gl.uniform3fv(U.uSunCol, e.sunCol); gl.uniform3fv(U.uSky, e.sky); gl.uniform3fv(U.uGnd, e.gnd);
    gl.uniform3fv(U.uFogCol, e.fog); gl.uniform2fv(U.uFogR, e.fogR); gl.uniform4fv(U.uInt, e.interior); gl.uniform1f(U.uIntK, e.intK); gl.uniform1f(U.uIntH, e.intH || 7.4);
    gl.depthMask(true); depthW = true; gl.disable(gl.SCISSOR_TEST); gl.clearColor(e.fog[0], e.fog[1], e.fog[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    api.stats.calls = 0; api.stats.tris = 0; setDepthW(true); setBlend(false); setCull(true); lastTex = null; lastMesh = null;
  };
  // 第一人稱手部：獨立投影、清除深度
  api.beginFP = function (fov) {
    gl.depthMask(true); depthW = true; gl.clear(gl.DEPTH_BUFFER_BIT);
    M4.persp(PF, fov, cam.asp, .02, 20); M4.mul(VPF, PF, V); gl.uniformMatrix4fv(U.uVP, false, VPF);
  };
  api.endFP = function () { gl.uniformMatrix4fv(U.uVP, false, VP); };
  function setDepthW(v) { if (depthW !== v) { depthW = v; gl.depthMask(v); } }
  function setBlend(v) { if (blendOn !== v) { blendOn = v; if (v) gl.enable(gl.BLEND); else gl.disable(gl.BLEND); } }
  function setCull(v) { if (cullOn !== v) { cullOn = v; if (v) gl.enable(gl.CULL_FACE); else gl.disable(gl.CULL_FACE); } }
  api.draw = function (mesh, M, m) {
    if (shadowPass) {
      if (lastMesh !== mesh) { if (vaoExt) vaoExt.bindVertexArrayOES(mesh.vao); else { gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ibo); setAttrs(); } lastMesh = mesh; }
      gl.uniformMatrix4fv(US.uM, false, M); gl.drawElements(gl.TRIANGLES, mesh.count, mesh.type, 0); api.stats.tris += mesh.count / 3; return;
    }
    if (lastMesh !== mesh) {
      if (vaoExt) vaoExt.bindVertexArrayOES(mesh.vao);
      else { gl.bindBuffer(gl.ARRAY_BUFFER, mesh.vbo); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.ibo); setAttrs(); }
      lastMesh = mesh;
    }
    gl.uniformMatrix4fv(U.uM, false, M);
    if (m.tex) { gl.uniform1f(U.uUseTex, 1); if (lastTex !== m.tex) { gl.bindTexture(gl.TEXTURE_2D, m.tex.t); lastTex = m.tex; } } else gl.uniform1f(U.uUseTex, 0);
    const t = m.tint; gl.uniform4f(U.uTint, t[0], t[1], t[2], t[3]); gl.uniform3fv(U.uEmis, m.emis);
    gl.uniform1f(U.uSpec, m.spec); gl.uniform1f(U.uUnlit, m.unlit); gl.uniform1f(U.uAO, m.ao); gl.uniform1f(U.uFogOn, m.fog); gl.uniform1f(U.uAlphaTest, m.alphaTest);
    setBlend(!!m.blend); setDepthW(!m.noDepth); setCull(!m.two);
    gl.drawElements(gl.TRIANGLES, mesh.count, mesh.type, 0);
    api.stats.calls++; api.stats.tris += mesh.count / 3;
  };
  api.initShadow = function (size) {
    if (!progS) return false; sm.size = size;
    sm.tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, sm.tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    sm.rb = gl.createRenderbuffer(); gl.bindRenderbuffer(gl.RENDERBUFFER, sm.rb); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size, size);
    sm.fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, sm.fbo); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sm.tex, 0); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, sm.rb);
    sm.ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE; gl.bindFramebuffer(gl.FRAMEBUFFER, null); lastTex = null; return sm.ok;
  };
  api.shadowReady = () => sm.ok; api.setShadow = v => { sm.on = !!v && sm.ok; }; api.shadowOn = () => sm.on;
  api.beginShadow = function (cx, cy, cz) {
    const f = [-SUN[0], -SUN[1], -SUN[2]]; let rx = f[1] * 0 - f[2] * 1, ry = f[2] * 0 - f[0] * 0, rz = f[0] * 1 - f[1] * 0; // f x up(0,1,0)
    rx = -f[2]; ry = 0; rz = f[0]; const rl = Math.hypot(rx, rz); rx /= rl; rz /= rl;
    const ux = ry * f[2] - rz * f[1], uy = rz * f[0] - rx * f[2], uz = rx * f[1] - ry * f[0]; // right x f
    const r = sm.radius, texel = 2 * r / sm.size;
    let lx = rx * cx + ry * cy + rz * cz, ly = ux * cx + uy * cy + uz * cz;
    const sx = Math.round(lx / texel) * texel - lx, sy = Math.round(ly / texel) * texel - ly;
    cx += rx * sx + ux * sy; cy += ry * sx + uy * sy; cz += rz * sx + uz * sy;
    const ex = cx - f[0] * 120, ey = cy - f[1] * 120, ez = cz - f[2] * 120; const Vl = M4.create(), Pl = M4.create();
    Vl[0] = rx; Vl[4] = ry; Vl[8] = rz; Vl[12] = -(rx * ex + ry * ey + rz * ez);
    Vl[1] = ux; Vl[5] = uy; Vl[9] = uz; Vl[13] = -(ux * ex + uy * ey + uz * ez);
    Vl[2] = -f[0]; Vl[6] = -f[1]; Vl[10] = -f[2]; Vl[14] = (f[0] * ex + f[1] * ey + f[2] * ez); Vl[3] = Vl[7] = Vl[11] = 0; Vl[15] = 1;
    const n = 1, fa = 260; Pl.fill(0); Pl[0] = 1 / r; Pl[5] = 1 / r; Pl[10] = -2 / (fa - n); Pl[14] = -(fa + n) / (fa - n); Pl[15] = 1;
    M4.mul(sm.LS, Pl, Vl);
    gl.bindFramebuffer(gl.FRAMEBUFFER, sm.fbo); gl.viewport(0, 0, sm.size, sm.size); gl.useProgram(progS); gl.uniformMatrix4fv(US.uLP, false, sm.LS);
    gl.depthMask(true); depthW = true; gl.disable(gl.BLEND); blendOn = false; gl.enable(gl.CULL_FACE); cullOn = true; gl.cullFace(gl.FRONT); gl.clearColor(1, 1, 1, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    shadowPass = true; lastMesh = null; api.shadowPass = true;
  };
  api.endShadow = function () { shadowPass = false; api.shadowPass = false; gl.cullFace(gl.BACK); gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, api.w, api.h); gl.useProgram(prog); lastMesh = null; };
  api.clearColor = function (r, g, b) { gl.clearColor(r, g, b, 1); };
  api.depthOff = function (v) { if (v) gl.disable(gl.DEPTH_TEST); else gl.enable(gl.DEPTH_TEST); };
  api.polyOffset = function (on) { if (on) { gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(-1, -2); } else gl.disable(gl.POLYGON_OFFSET_FILL); };
  api.readPixels = null;
  return api;
})();
