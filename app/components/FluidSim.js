"use client";

import { useEffect, useRef } from "react";

/* ─── GLSL ──────────────────────────────────────────── */
const VERT = `#version 300 es
in  vec2 a_pos;
out vec2 v_uv, vL, vR, vT, vB;
uniform vec2 u_tex;
void main(){
  v_uv = a_pos*.5+.5;
  vL = v_uv-vec2(u_tex.x,0.); vR = v_uv+vec2(u_tex.x,0.);
  vT = v_uv+vec2(0.,u_tex.y); vB = v_uv-vec2(0.,u_tex.y);
  gl_Position = vec4(a_pos,0.,1.);
}`;

const ADVECT = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_vel, u_src;
uniform vec2 u_tex;
uniform float dt, diss;
out vec4 o;
void main(){
  vec2 uv = v_uv - dt * texture(u_vel, v_uv).xy;
  o = diss * texture(u_src, uv);
}`;

const DIVERGE = `#version 300 es
precision mediump float;
in vec2 vL,vR,vT,vB;
uniform sampler2D u_vel;
out vec4 o;
void main(){
  o = vec4(.5*(texture(u_vel,vR).x - texture(u_vel,vL).x +
               texture(u_vel,vT).y - texture(u_vel,vB).y), 0.,0.,1.);
}`;

const PRESSURE = `#version 300 es
precision mediump float;
in vec2 v_uv, vL,vR,vT,vB;
uniform sampler2D u_p, u_div;
out vec4 o;
void main(){
  float p = .25*(texture(u_p,vL).x+texture(u_p,vR).x+
                 texture(u_p,vT).x+texture(u_p,vB).x
                 - texture(u_div,v_uv).x);
  o = vec4(p,0.,0.,1.);
}`;

const GRAD = `#version 300 es
precision mediump float;
in vec2 v_uv, vL,vR,vT,vB;
uniform sampler2D u_p, u_vel;
out vec4 o;
void main(){
  vec2 v = texture(u_vel,v_uv).xy
         - vec2(texture(u_p,vR).x-texture(u_p,vL).x,
                texture(u_p,vT).x-texture(u_p,vB).x);
  o = vec4(v,0.,1.);
}`;

const SPLAT = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_tgt;
uniform vec3 color;
uniform vec2 point;
uniform float radius, aspect;
out vec4 o;
void main(){
  vec2 p = v_uv - point; p.x *= aspect;
  o = vec4(texture(u_tgt,v_uv).rgb + exp(-dot(p,p)/radius)*color, 1.);
}`;

/* Display — normalises colour so edges fade to transparent, never dark */
const DISPLAY = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_dye;
uniform float u_alpha_scale, u_alpha_max;
out vec4 o;
void main(){
  vec3 c = texture(u_dye, v_uv).rgb;
  float intensity = max(c.r, max(c.g, c.b));
  // Normalise so the hue is always vivid — edges go transparent, not dark
  vec3 col = intensity > 0.001 ? c / intensity : vec3(0.0);
  float a = smoothstep(0.04, 0.30, intensity);
  a = a * u_alpha_scale;
  a = clamp(a, 0.0, u_alpha_max);
  o = vec4(col, a);
}`;

/* ─── WebGL helpers ─────────────────────────────────── */
function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src); gl.compileShader(s); return s;
}
function prog(gl, vert, frag) {
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER,   vert));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(p); return p;
}
function tex(gl, w, h) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
  return t;
}
function fbo(gl, t) {
  const f = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, f);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
  return f;
}
function ping(gl, w, h) {
  let a = { t: tex(gl,w,h) }, b = { t: tex(gl,w,h) };
  a.f = fbo(gl,a.t); b.f = fbo(gl,b.t);
  return { get read(){ return a; }, get write(){ return b; }, swap(){ [a,b]=[b,a]; } };
}
function bind(gl, unit, t) {
  gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
}
function u(gl, p, n) { return gl.getUniformLocation(p, n); }

/* ─── HSL colour helper ─────────────────────────────── */
function hsl(h, s, l) {
  const q = l < .5 ? l*(1+s) : l+s-l*s, p2 = 2*l-q;
  const f = t => { t=((t%1)+1)%1; return t<1/6?p2+(q-p2)*6*t:t<.5?q:t<2/3?p2+(q-p2)*(2/3-t)*6:p2; };
  return [f(h+1/3), f(h), f(h-1/3)];
}

/* ─── Component ─────────────────────────────────────── */
// glass=true  → white shimmer on dark bg (homepage)
// glass=false → iridescent ink on white bg (Sprout page)
export default function FluidSim({ glass = false }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: false });
    if (!gl) return;
    gl.getExtension("EXT_color_buffer_float");

    /* programs */
    const pAdvect   = prog(gl, VERT, ADVECT);
    const pDiverge  = prog(gl, VERT, DIVERGE);
    const pPressure = prog(gl, VERT, PRESSURE);
    const pGrad     = prog(gl, VERT, GRAD);
    const pSplat    = prog(gl, VERT, SPLAT);
    const pDisplay  = prog(gl, VERT, DISPLAY);

    /* fullscreen quad */
    const quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);

    const bindQuad = (p) => {
      const loc = gl.getAttribLocation(p, "a_pos");
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    };

    /* SIM low for perf (velocity/pressure), DYE mid for visual quality */
    const SIM = 128, DYE = 512;
    const velocity = ping(gl, SIM, SIM);
    const pressure = ping(gl, SIM, SIM);
    const dye      = ping(gl, DYE, DYE);
    const divT = tex(gl, SIM, SIM);
    const divF = fbo(gl, divT);

    const pass = (program, fb, w, h, setU) => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.viewport(0, 0, w, h);
      gl.useProgram(program);
      bindQuad(program);
      setU();
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /* mouse — iridescent hue cycles through blue→purple→pink range */
    let mx=.5, my=.5, pmx=.5, pmy=.5, hue=0, hasMoved=false;

    const splat = (x, y, dvx, dvy, r, g, b) => {
      const asp = canvas.width / canvas.height;
      const R = 0.00035; // thin ink line
      pass(pSplat, velocity.write.f, SIM, SIM, () => {
        bind(gl,0,velocity.read.t); gl.uniform1i(u(gl,pSplat,"u_tgt"),0);
        gl.uniform3f(u(gl,pSplat,"color"), dvx, dvy, 0);
        gl.uniform2f(u(gl,pSplat,"point"), x, y);
        gl.uniform1f(u(gl,pSplat,"radius"), R * 2.5);
        gl.uniform1f(u(gl,pSplat,"aspect"), asp);
      });
      velocity.swap();
      pass(pSplat, dye.write.f, DYE, DYE, () => {
        bind(gl,0,dye.read.t); gl.uniform1i(u(gl,pSplat,"u_tgt"),0);
        gl.uniform3f(u(gl,pSplat,"color"), r, g, b);
        gl.uniform2f(u(gl,pSplat,"point"), x, y);
        gl.uniform1f(u(gl,pSplat,"radius"), R);
        gl.uniform1f(u(gl,pSplat,"aspect"), asp);
      });
      dye.swap();
    };

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pmx = mx; pmy = my;
      mx  = (e.clientX - rect.left) / rect.width;
      my  = 1 - (e.clientY - rect.top) / rect.height;
      hasMoved = true;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const DT = 0.016;
    let raf;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const ts = [1/SIM, 1/SIM];

      if (hasMoved) {
        /* Calmer force — feels fluid not explosive */
        const dvx = (mx - pmx) * 80;
        const dvy = (my - pmy) * 80;
        if (glass) {
          /* Glass: near-white with faint cool tint — shimmer on dark bg */
          hue = (hue + Math.hypot(dvx, dvy) * 0.04) % 1.0;
          const mappedHue = 0.57 + hue * 0.08; // barely shifts, stays icy blue-white
          const [r, g, b] = hsl(mappedHue, 0.10, 0.92);
          splat(mx, my, dvx, dvy, r, g, b);
        } else {
          /* Exp-inspired pastels: soft green(0.39)→teal(0.53)→blue(0.61)→lavender(0.75) */
          hue = (hue + Math.hypot(dvx, dvy) * 0.18) % 1.0;
          const mappedHue = 0.39 + hue * 0.36; // 140°→270° green→lavender
          const [r, g, b] = hsl(mappedHue, 0.55, 0.62);
          splat(mx, my, dvx, dvy, r, g, b);
        }
        hasMoved = false;
      }

      /* velocity advect */
      pass(pAdvect, velocity.write.f, SIM, SIM, () => {
        bind(gl,0,velocity.read.t); bind(gl,1,velocity.read.t);
        gl.uniform1i(u(gl,pAdvect,"u_vel"),0); gl.uniform1i(u(gl,pAdvect,"u_src"),1);
        gl.uniform2fv(u(gl,pAdvect,"u_tex"),ts);
        /* Higher dissipation = velocity fades quicker, less frantic */
        gl.uniform1f(u(gl,pAdvect,"dt"),DT); gl.uniform1f(u(gl,pAdvect,"diss"),.886);
      }); velocity.swap();

      /* divergence */
      pass(pDiverge, divF, SIM, SIM, () => {
        bind(gl,0,velocity.read.t); gl.uniform1i(u(gl,pDiverge,"u_vel"),0);
        gl.uniform2fv(u(gl,pDiverge,"u_tex"),ts);
      });

      /* pressure jacobi */
      for (let i = 0; i < 15; i++) {
        pass(pPressure, pressure.write.f, SIM, SIM, () => {
          bind(gl,0,pressure.read.t); bind(gl,1,divT);
          gl.uniform1i(u(gl,pPressure,"u_p"),0); gl.uniform1i(u(gl,pPressure,"u_div"),1);
          gl.uniform2fv(u(gl,pPressure,"u_tex"),ts);
        }); pressure.swap();
      }

      /* gradient subtract */
      pass(pGrad, velocity.write.f, SIM, SIM, () => {
        bind(gl,0,pressure.read.t); bind(gl,1,velocity.read.t);
        gl.uniform1i(u(gl,pGrad,"u_p"),0); gl.uniform1i(u(gl,pGrad,"u_vel"),1);
        gl.uniform2fv(u(gl,pGrad,"u_tex"),ts);
      }); velocity.swap();

      /* dye advect */
      pass(pAdvect, dye.write.f, DYE, DYE, () => {
        bind(gl,0,velocity.read.t); bind(gl,1,dye.read.t);
        gl.uniform1i(u(gl,pAdvect,"u_vel"),0); gl.uniform1i(u(gl,pAdvect,"u_src"),1);
        gl.uniform2fv(u(gl,pAdvect,"u_tex"),[1/DYE,1/DYE]);
        gl.uniform1f(u(gl,pAdvect,"dt"),DT); gl.uniform1f(u(gl,pAdvect,"diss"),.974);
      }); dye.swap();

      /* render to screen */
      const W = canvas.width, H = canvas.height;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, W, H);
      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(pDisplay);
      bindQuad(pDisplay);
      bind(gl,0,dye.read.t);
      gl.uniform1i(u(gl,pDisplay,"u_dye"),0);
      // glass: bright shimmer on dark — low max alpha; iridescent: vivid ink on white
      gl.uniform1f(u(gl,pDisplay,"u_alpha_scale"), glass ? 0.40 : 0.78);
      gl.uniform1f(u(gl,pDisplay,"u_alpha_max"),   glass ? 0.40 : 0.78);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: glass ? "absolute" : "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}
