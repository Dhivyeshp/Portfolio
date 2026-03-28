"use client";
import { useRef, useEffect } from "react";

// ─── WebGL2 Shaders ───────────────────────────────────────────────────────────
// Sphere impostor: each particle is a billboard quad that ray-traces a sphere
// in the fragment shader for correct normals, depth, and AO.
const VERT = `#version 300 es
in vec2 aQ;       // [-1,1] quad corner (per-vertex)
in vec3 aC;       // particle center in world space (per-instance)
in float aS;      // particle speed (per-instance)

uniform mat4 uV;  // view matrix
uniform mat4 uP;  // projection matrix
uniform float uR; // world-space sphere radius

out vec3 vVC;     // center in view space
out vec2 vQ;
out float vS;

void main() {
  vec4 vc = uV * vec4(aC, 1.0);
  vVC = vc.xyz;
  vQ  = aQ;
  vS  = aS;
  // Screen-space billboard: expand by projected radius
  float sc = uR * uP[1][1] / max(-vc.z, 0.001);
  vec4 cp  = uP * vc;
  gl_Position = cp + vec4(aQ * sc * cp.w, 0.0, 0.0);
}`;

const FRAG = `#version 300 es
precision highp float;

in vec3 vVC;
in vec2 vQ;
in float vS;

uniform mat4 uP;
uniform float uR;

out vec4 fragColor;

void main() {
  float r2 = dot(vQ, vQ);
  if (r2 > 1.0) discard;

  float z  = sqrt(1.0 - r2);
  vec3  n  = vec3(vQ, z);  // surface normal in view space

  // Depth-correct the fragment to the actual sphere surface
  vec4 cp  = uP * vec4(vVC + n * uR, 1.0);
  gl_FragDepth = cp.z / cp.w * 0.5 + 0.5;

  // Lighting
  vec3  L    = normalize(vec3(0.6, 1.5, 1.0));
  float diff = max(dot(n, L), 0.0);
  float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 72.0);

  // Spherical ambient occlusion volume: silhouette darkening + top brightening
  float ao = 0.28 + 0.72 * (z * 0.65 + 0.35 * (0.5 + 0.5 * n.y));

  // Speed-based colour: deep blue (slow) -> cyan-white (fast)
  float t    = clamp(vS * 0.55, 0.0, 1.0);
  vec3  slow = vec3(0.04, 0.14, 0.62);
  vec3  fast = vec3(0.22, 0.82, 1.00);
  vec3  base = mix(slow, fast, t);

  vec3 col = base * (0.14 + 0.86 * diff * ao) + vec3(0.95) * spec * 0.58;
  fragColor = vec4(col, 0.91);
}`;

// ─── Matrix helpers ───────────────────────────────────────────────────────────
function perspective(fov, aspect, near, far) {
  const f = 1.0 / Math.tan(fov * 0.5);
  const r = 1.0 / (near - far);
  return new Float32Array([
    f / aspect, 0,  0,                   0,
    0,          f,  0,                   0,
    0,          0,  (near + far) * r,   -1,
    0,          0,  2 * near * far * r,  0,
  ]);
}
function sub(a, b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
function cross(a, b) { return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
function dot(a, b) { return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
function norm(a) { const l = Math.sqrt(dot(a,a)); return [a[0]/l, a[1]/l, a[2]/l]; }
function lookAt(eye, at, up) {
  const z = norm(sub(eye, at));
  const x = norm(cross(up, z));
  const y = cross(z, x);
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x,eye), -dot(y,eye), -dot(z,eye), 1,
  ]);
}

// ─── PIC/FLIP Simulation ──────────────────────────────────────────────────────
// 3-D staggered MAC grid (NX×NY×NZ cells).
// Particles store position + velocity; each step:
//   mark → P2G → save grid → gravity → boundaries → pressure projection
//   → boundaries → G2P (FLIP blend) → advect
const NX = 16, NY = 16, NZ = 16;
const H  = 1.0 / NX;
const NP = 2000;
const FLIP_RATIO = 0.95;

class FlipSim {
  constructor() {
    const nu = (NX+1)*NY*NZ, nv = NX*(NY+1)*NZ, nw = NX*NY*(NZ+1), nc = NX*NY*NZ;
    this.u  = new Float32Array(nu); this.u0 = new Float32Array(nu); this.wu = new Float32Array(nu);
    this.v  = new Float32Array(nv); this.v0 = new Float32Array(nv); this.wv = new Float32Array(nv);
    this.w  = new Float32Array(nw); this.w0 = new Float32Array(nw); this.ww = new Float32Array(nw);
    this.p    = new Float32Array(nc);
    this.type = new Uint8Array(nc);  // 0=air 1=fluid 2=solid

    this.px  = new Float32Array(NP); this.py  = new Float32Array(NP); this.pz  = new Float32Array(NP);
    this.pvx = new Float32Array(NP); this.pvy = new Float32Array(NP); this.pvz = new Float32Array(NP);

    // Solid boundary cells (walls and floor/ceiling)
    for (let k = 0; k < NZ; k++)
      for (let j = 0; j < NY; j++)
        for (let i = 0; i < NX; i++)
          if (i===0||i===NX-1||j===0||j===NY-1||k===0||k===NZ-1)
            this.type[this.ci(i,j,k)] = 2;

    // Particles filling lower ~55 % of the domain
    for (let p = 0; p < NP; p++) {
      this.px[p]  = 0.1 + Math.random() * 0.8;
      this.py[p]  = 0.04 + Math.random() * 0.52;
      this.pz[p]  = 0.1 + Math.random() * 0.8;
      this.pvx[p] = (Math.random() - 0.5) * 0.4;
      this.pvz[p] = (Math.random() - 0.5) * 0.4;
    }
  }

  // Index helpers: staggered MAC grid
  ci(i,j,k) { return i + j*NX      + k*NX*NY;      }  // cell
  ui(i,j,k) { return i + j*(NX+1)  + k*(NX+1)*NY;  }  // u-face (x+½)
  vi(i,j,k) { return i + j*NX      + k*NX*(NY+1);  }  // v-face (y+½)
  wi(i,j,k) { return i + j*NX      + k*NX*NY;      }  // w-face (z+½), same formula; w array is NX*NY*(NZ+1)

  // Trilinear scatter: distribute particle quantity to surrounding grid nodes
  scatter(arr, warr, gx, gy, gz, val, maxi, maxj, maxk, idxFn) {
    const i0 = Math.floor(gx), j0 = Math.floor(gy), k0 = Math.floor(gz);
    const fx = gx-i0, fy = gy-j0, fz = gz-k0;
    for (let di = 0; di <= 1; di++) for (let dj = 0; dj <= 1; dj++) for (let dk = 0; dk <= 1; dk++) {
      const ii=i0+di, jj=j0+dj, kk=k0+dk;
      if (ii<0||ii>=maxi||jj<0||jj>=maxj||kk<0||kk>=maxk) continue;
      const wt = (di?fx:1-fx)*(dj?fy:1-fy)*(dk?fz:1-fz);
      const idx = idxFn(ii,jj,kk);
      arr[idx]  += wt * val;
      warr[idx] += wt;
    }
  }

  // Trilinear gather: sample grid at a point
  gather(arr, gx, gy, gz, maxi, maxj, maxk, idxFn) {
    const i0 = Math.max(0, Math.min(maxi-2, Math.floor(gx)));
    const j0 = Math.max(0, Math.min(maxj-2, Math.floor(gy)));
    const k0 = Math.max(0, Math.min(maxk-2, Math.floor(gz)));
    const fx = gx-i0, fy = gy-j0, fz = gz-k0;
    let val = 0;
    for (let di=0;di<=1;di++) for(let dj=0;dj<=1;dj++) for(let dk=0;dk<=1;dk++)
      val += (di?fx:1-fx)*(dj?fy:1-fy)*(dk?fz:1-fz) * arr[idxFn(i0+di,j0+dj,k0+dk)];
    return val;
  }

  // P2G: particle velocities → grid
  p2g() {
    this.u.fill(0); this.wu.fill(0);
    this.v.fill(0); this.wv.fill(0);
    this.w.fill(0); this.ww.fill(0);
    for (let p = 0; p < NP; p++) {
      const gx = this.px[p]/H, gy = this.py[p]/H, gz = this.pz[p]/H;
      this.scatter(this.u,this.wu, gx-.5,gy,   gz,   this.pvx[p], NX+1,NY,  NZ,   (i,j,k)=>this.ui(i,j,k));
      this.scatter(this.v,this.wv, gx,   gy-.5, gz,   this.pvy[p], NX,  NY+1,NZ,   (i,j,k)=>this.vi(i,j,k));
      this.scatter(this.w,this.ww, gx,   gy,   gz-.5, this.pvz[p], NX,  NY,  NZ+1, (i,j,k)=>this.wi(i,j,k));
    }
    for (let i=0;i<this.u.length;i++) if(this.wu[i]>0) this.u[i]/=this.wu[i];
    for (let i=0;i<this.v.length;i++) if(this.wv[i]>0) this.v[i]/=this.wv[i];
    for (let i=0;i<this.w.length;i++) if(this.ww[i]>0) this.w[i]/=this.ww[i];
  }

  // Mark which cells contain fluid
  mark() {
    for (let i=0;i<this.type.length;i++) if(this.type[i]!==2) this.type[i]=0;
    for (let p=0;p<NP;p++) {
      const i=Math.floor(this.px[p]/H), j=Math.floor(this.py[p]/H), k=Math.floor(this.pz[p]/H);
      if(i>=0&&i<NX&&j>=0&&j<NY&&k>=0&&k<NZ) {
        const c=this.ci(i,j,k); if(this.type[c]===0) this.type[c]=1;
      }
    }
  }

  // Apply gravity to y-velocity faces adjacent to fluid
  gravity(dt) {
    const g = -9.8 * dt;
    for (let k=0;k<NZ;k++) for (let j=0;j<=NY;j++) for (let i=0;i<NX;i++) {
      const jl=Math.min(j,NY-1), jb=Math.max(j-1,0);
      if(this.type[this.ci(i,jl,k)]===1||this.type[this.ci(i,jb,k)]===1)
        this.v[this.vi(i,j,k)] += g;
    }
  }

  // Zero velocity on solid faces; floor prevents outflow
  boundaries() {
    for(let k=0;k<NZ;k++) for(let j=0;j<NY;j++) {
      this.u[this.ui(0,j,k)]=0; this.u[this.ui(NX,j,k)]=0;
    }
    for(let k=0;k<NZ;k++) for(let i=0;i<NX;i++) {
      this.v[this.vi(i,0,k)]=Math.max(0,this.v[this.vi(i,0,k)]);
      this.v[this.vi(i,NY,k)]=Math.min(0,this.v[this.vi(i,NY,k)]);
    }
    for(let j=0;j<NY;j++) for(let i=0;i<NX;i++) {
      this.w[this.wi(i,j,0)]=0; this.w[this.wi(i,j,NZ)]=0;
    }
  }

  // Pressure projection (Gauss-Seidel) to enforce incompressibility
  project(dt) {
    this.p.fill(0);
    const sc = H / dt;
    for (let iter=0; iter<25; iter++) {
      for (let k=0;k<NZ;k++) for (let j=0;j<NY;j++) for (let i=0;i<NX;i++) {
        if (this.type[this.ci(i,j,k)]!==1) continue;
        const t=this.type;
        const ni =(i<NX-1&&t[this.ci(i+1,j,k)]!==2)?1:0;
        const nim=(i>0   &&t[this.ci(i-1,j,k)]!==2)?1:0;
        const nj =(j<NY-1&&t[this.ci(i,j+1,k)]!==2)?1:0;
        const njm=(j>0   &&t[this.ci(i,j-1,k)]!==2)?1:0;
        const nk =(k<NZ-1&&t[this.ci(i,j,k+1)]!==2)?1:0;
        const nkm=(k>0   &&t[this.ci(i,j,k-1)]!==2)?1:0;
        const den=ni+nim+nj+njm+nk+nkm; if(!den) continue;
        let div=0;
        if(ni ) div+=this.u[this.ui(i+1,j,k)];
        if(nim) div-=this.u[this.ui(i,  j,k)];
        if(nj ) div+=this.v[this.vi(i,j+1,k)];
        if(njm) div-=this.v[this.vi(i,j,  k)];
        if(nk ) div+=this.w[this.wi(i,j,k+1)];
        if(nkm) div-=this.w[this.wi(i,j,k  )];
        let ps=0;
        if(ni ) ps+=this.p[this.ci(i+1,j,k)];
        if(nim) ps+=this.p[this.ci(i-1,j,k)];
        if(nj ) ps+=this.p[this.ci(i,j+1,k)];
        if(njm) ps+=this.p[this.ci(i,j-1,k)];
        if(nk ) ps+=this.p[this.ci(i,j,k+1)];
        if(nkm) ps+=this.p[this.ci(i,j,k-1)];
        this.p[this.ci(i,j,k)] = (ps - div * sc) / den;
      }
    }
    // Subtract pressure gradient from velocity faces
    const is = dt / H;
    for(let k=0;k<NZ;k++) for(let j=0;j<NY;j++) for(let i=1;i<NX;i++) {
      const c0=this.ci(i-1,j,k),c1=this.ci(i,j,k);
      if(this.type[c0]!==2&&this.type[c1]!==2&&(this.type[c0]===1||this.type[c1]===1))
        this.u[this.ui(i,j,k)]-=is*(this.p[c1]-this.p[c0]);
    }
    for(let k=0;k<NZ;k++) for(let j=1;j<NY;j++) for(let i=0;i<NX;i++) {
      const c0=this.ci(i,j-1,k),c1=this.ci(i,j,k);
      if(this.type[c0]!==2&&this.type[c1]!==2&&(this.type[c0]===1||this.type[c1]===1))
        this.v[this.vi(i,j,k)]-=is*(this.p[c1]-this.p[c0]);
    }
    for(let k=1;k<NZ;k++) for(let j=0;j<NY;j++) for(let i=0;i<NX;i++) {
      const c0=this.ci(i,j,k-1),c1=this.ci(i,j,k);
      if(this.type[c0]!==2&&this.type[c1]!==2&&(this.type[c0]===1||this.type[c1]===1))
        this.w[this.wi(i,j,k)]-=is*(this.p[c1]-this.p[c0]);
    }
  }

  // G2P: update particle velocities using FLIP/PIC blend
  g2p() {
    for (let p=0; p<NP; p++) {
      const gx=this.px[p]/H, gy=this.py[p]/H, gz=this.pz[p]/H;
      const un=this.gather(this.u, gx-.5,gy,   gz,   NX+1,NY,  NZ,   (i,j,k)=>this.ui(i,j,k));
      const vn=this.gather(this.v, gx,   gy-.5, gz,   NX,  NY+1,NZ,   (i,j,k)=>this.vi(i,j,k));
      const wn=this.gather(this.w, gx,   gy,   gz-.5, NX,  NY,  NZ+1, (i,j,k)=>this.wi(i,j,k));
      const uo=this.gather(this.u0,gx-.5,gy,   gz,   NX+1,NY,  NZ,   (i,j,k)=>this.ui(i,j,k));
      const vo=this.gather(this.v0,gx,   gy-.5, gz,   NX,  NY+1,NZ,   (i,j,k)=>this.vi(i,j,k));
      const wo=this.gather(this.w0,gx,   gy,   gz-.5, NX,  NY,  NZ+1, (i,j,k)=>this.wi(i,j,k));
      // FLIP: add grid velocity change to particle; PIC: use grid velocity directly
      this.pvx[p]=FLIP_RATIO*(this.pvx[p]+(un-uo))+(1-FLIP_RATIO)*un;
      this.pvy[p]=FLIP_RATIO*(this.pvy[p]+(vn-vo))+(1-FLIP_RATIO)*vn;
      this.pvz[p]=FLIP_RATIO*(this.pvz[p]+(wn-wo))+(1-FLIP_RATIO)*wn;
    }
  }

  // Advect particles and clamp to domain
  advect(dt) {
    const m = H * 0.5;
    for (let p=0; p<NP; p++) {
      this.px[p]+=this.pvx[p]*dt; this.py[p]+=this.pvy[p]*dt; this.pz[p]+=this.pvz[p]*dt;
      if(this.px[p]<m)   {this.px[p]=m;   this.pvx[p]=Math.abs(this.pvx[p])*0.3;}
      if(this.px[p]>1-m) {this.px[p]=1-m; this.pvx[p]=-Math.abs(this.pvx[p])*0.3;}
      if(this.py[p]<m)   {this.py[p]=m;   this.pvy[p]=Math.abs(this.pvy[p])*0.3;}
      if(this.py[p]>1-m) {this.py[p]=1-m; this.pvy[p]=-Math.abs(this.pvy[p])*0.3;}
      if(this.pz[p]<m)   {this.pz[p]=m;   this.pvz[p]=Math.abs(this.pvz[p])*0.3;}
      if(this.pz[p]>1-m) {this.pz[p]=1-m; this.pvz[p]=-Math.abs(this.pvz[p])*0.3;}
    }
  }

  // Impulse force at world-space point (for mouse interaction)
  addForce(wx, wy, wz, fx, fy, fz, radius) {
    for (let p=0; p<NP; p++) {
      const dx=this.px[p]-wx, dy=this.py[p]-wy, dz=this.pz[p]-wz;
      const d2=dx*dx+dy*dy+dz*dz;
      if (d2<radius*radius) {
        const f=1-Math.sqrt(d2)/radius;
        this.pvx[p]+=fx*f; this.pvy[p]+=fy*f; this.pvz[p]+=fz*f;
      }
    }
  }

  step(dt) {
    this.mark();
    this.p2g();
    this.u0.set(this.u); this.v0.set(this.v); this.w0.set(this.w);
    this.gravity(dt);
    this.boundaries();
    this.project(dt);
    this.boundaries();
    this.g2p();
    this.advect(dt);
  }
}

// ─── WebGL2 Renderer ──────────────────────────────────────────────────────────
function compileShader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    console.error("Shader error:", gl.getShaderInfoLog(s));
  return s;
}

function initGL(canvas) {
  const gl = canvas.getContext("webgl2", { antialias: true, alpha: true, depth: true });
  if (!gl) return null;

  const vs   = compileShader(gl, gl.VERTEX_SHADER,   VERT);
  const fs   = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
    console.error("Program error:", gl.getProgramInfoLog(prog));

  // Static quad vertices (TRIANGLE_STRIP) for billboard
  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  // Dynamic instance buffer: [cx, cy, cz, speed] × NP
  const instBuf = gl.createBuffer();

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // aQ — per-vertex
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  const aQ = gl.getAttribLocation(prog, "aQ");
  gl.enableVertexAttribArray(aQ);
  gl.vertexAttribPointer(aQ, 2, gl.FLOAT, false, 0, 0);

  // aC, aS — per-instance
  gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
  const aC = gl.getAttribLocation(prog, "aC");
  const aS = gl.getAttribLocation(prog, "aS");
  gl.enableVertexAttribArray(aC);
  gl.vertexAttribPointer(aC, 3, gl.FLOAT, false, 16, 0);
  gl.vertexAttribDivisor(aC, 1);
  gl.enableVertexAttribArray(aS);
  gl.vertexAttribPointer(aS, 1, gl.FLOAT, false, 16, 12);
  gl.vertexAttribDivisor(aS, 1);

  gl.bindVertexArray(null);

  return {
    gl, prog, vao, instBuf,
    uV: gl.getUniformLocation(prog, "uV"),
    uP: gl.getUniformLocation(prog, "uP"),
    uR: gl.getUniformLocation(prog, "uR"),
    instData: new Float32Array(NP * 4),
  };
}

function renderFrame(g, sim, t) {
  const { gl, prog, vao, instBuf, uV, uP, uR, instData } = g;
  const W = gl.canvas.width, H_c = gl.canvas.height;

  gl.viewport(0, 0, W, H_c);
  gl.clearColor(0.04, 0.04, 0.07, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const proj  = perspective(0.85, W / H_c, 0.01, 20);
  const angle = t * 0.00018;
  const eye   = [0.5 + 1.75 * Math.cos(angle), 1.1, 0.5 + 1.75 * Math.sin(angle)];
  const view  = lookAt(eye, [0.5, 0.28, 0.5], [0, 1, 0]);

  // Pack particle data
  for (let p = 0; p < NP; p++) {
    const spd = Math.sqrt(sim.pvx[p]**2 + sim.pvy[p]**2 + sim.pvz[p]**2);
    instData[p*4]   = sim.px[p];
    instData[p*4+1] = sim.py[p];
    instData[p*4+2] = sim.pz[p];
    instData[p*4+3] = spd;
  }

  gl.useProgram(prog);
  gl.uniformMatrix4fv(uV, false, view);
  gl.uniformMatrix4fv(uP, false, proj);
  gl.uniform1f(uR, 0.021);  // world-space sphere radius

  gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
  gl.bufferData(gl.ARRAY_BUFFER, instData, gl.DYNAMIC_DRAW);

  gl.bindVertexArray(vao);
  gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, NP);
  gl.bindVertexArray(null);
}

// ─── React Component ──────────────────────────────────────────────────────────
export default function Fluid3D() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const sim     = new FlipSim();
    const glState = initGL(canvas);

    if (!glState) {
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#666";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("WebGL2 required", canvas.width/2, canvas.height/2);
      return;
    }

    // Mouse / touch interaction
    let mx = 0.5, my = 0.3, mDown = false, prevMx = 0.5, prevMy = 0.3;
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      prevMx = mx; prevMy = my;
      mx = (e.clientX - r.left) / r.width;
      my = 1 - (e.clientY - r.top) / r.height;
    };
    const onDown = () => { mDown = true; };
    const onUp   = () => { mDown = false; };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mouseup",   onUp);

    let raf, last = 0;
    const loop = (t) => {
      const dt = Math.min((t - last) / 1000, 0.033);
      last = t;
      if (dt > 0) {
        if (mDown) {
          const fx = (mx - prevMx) * 8, fy = (my - prevMy) * 8;
          sim.addForce(mx, my, 0.5, fx, fy, 0, 0.18);
        }
        sim.step(dt * 0.5);
        sim.step(dt * 0.5);
      }
      renderFrame(glState, sim, t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame((t) => { last = t; loop(t); });

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mouseup",   onUp);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      width={700}
      height={420}
      style={{ width: "100%", borderRadius: 12, cursor: "crosshair", display: "block" }}
    />
  );
}
