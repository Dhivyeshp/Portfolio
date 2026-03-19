"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function makeRng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >> 17; s ^= s << 5; return (s >>> 0) / 0xffffffff; };
}

const NODES = [
  // AI / ML — top-left
  { id: "ai",         main: true,  label: "AI / ML Systems",   pos: [-1.55, 1.30,  0.10] },
  { id: "asl",        main: false, label: "ASL Translator",     pos: [-2.55, 1.95,  0.00] },
  { id: "monte",      main: false, label: "Monte Carlo",        pos: [-0.85, 2.20,  0.10] },
  { id: "finsights",  main: false, label: "FinSights RAG",      pos: [-2.35, 0.65,  0.20] },
  { id: "mediapipe",  main: false, label: "MediaPipe",          pos: [-3.20, 1.30,  0.00] },
  { id: "langchain",  main: false, label: "LangChain",          pos: [-1.20, 2.60, -0.10] },
  // Embedded — far left, middle
  { id: "embedded",   main: true,  label: "Embedded & HW",     pos: [-2.65, -0.15,  0.20] },
  { id: "raspi",      main: false, label: "Raspberry Pi",       pos: [-3.40,  0.60,  0.10] },
  { id: "msp432",     main: false, label: "MSP432",             pos: [-3.55, -0.55,  0.00] },
  { id: "circuits",   main: false, label: "Circuit Design",     pos: [-2.15, -1.05,  0.20] },
  { id: "sensors",    main: false, label: "Sensors / ADC",      pos: [-3.10, -1.15,  0.10] },
  // Cloud — top-right center
  { id: "cloud",      main: true,  label: "Cloud & Backend",   pos: [ 0.45,  1.50, -0.10] },
  { id: "nrve",       main: false, label: "NRVE (AWS)",         pos: [ 1.40,  2.15,  0.00] },
  { id: "terraform",  main: false, label: "Terraform",          pos: [-0.10,  2.40, -0.10] },
  { id: "lambda",     main: false, label: "AWS Lambda",         pos: [ 1.60,  1.25,  0.10] },
  { id: "cicd",       main: false, label: "CI / CD",            pos: [ 0.80,  2.60, -0.10] },
  // Web — right
  { id: "web",        main: true,  label: "Full-Stack / Web",  pos: [ 2.20,  0.40,  0.10] },
  { id: "portfolio",  main: false, label: "This Portfolio",     pos: [ 2.95,  1.15,  0.00] },
  { id: "nextjs",     main: false, label: "Next.js / React",    pos: [ 2.90, -0.10,  0.10] },
  { id: "arviewer",   main: false, label: "AR Viewer",          pos: [ 2.35, -0.75,  0.00] },
  { id: "hacksite",   main: false, label: "HackUTD Site",       pos: [ 1.55, -0.45,  0.10] },
  // Projects — bottom center/right
  { id: "projects",   main: true,  label: "Projects",          pos: [ 0.35, -1.15,  0.00] },
  { id: "race",       main: false, label: "R.A.C.E.",           pos: [ 1.25, -1.70,  0.10] },
  { id: "vertera",    main: false, label: "Vertera",            pos: [ 0.30, -2.10,  0.00] },
  { id: "seatswap",   main: false, label: "SeatSwap",           pos: [-0.65, -1.85,  0.10] },
  { id: "agenteco",   main: false, label: "Agent Ecosystem",    pos: [ 1.15, -0.72,  0.00] },
  // Leadership — top center
  { id: "leadership", main: true,  label: "Leadership",        pos: [-0.40,  1.95, -0.10] },
  { id: "hackutd",    main: false, label: "HackUTD",            pos: [-0.85,  2.70,  0.00] },
  { id: "acm",        main: false, label: "ACM Dev Lead",       pos: [ 0.30,  2.55, -0.10] },
  { id: "mcf",        main: false, label: "Mark Cuban Fdn",     pos: [-0.15,  1.25,  0.10] },
];

const EDGES = [
  ["ai","asl"], ["ai","monte"], ["ai","finsights"], ["ai","mediapipe"], ["ai","langchain"],
  ["asl","mediapipe"], ["monte","finsights"],
  ["embedded","raspi"], ["embedded","msp432"], ["embedded","circuits"], ["embedded","sensors"],
  ["cloud","nrve"], ["cloud","terraform"], ["cloud","lambda"], ["cloud","cicd"],
  ["nrve","lambda"], ["nrve","terraform"],
  ["web","portfolio"], ["web","nextjs"], ["web","arviewer"], ["web","hacksite"],
  ["portfolio","nextjs"],
  ["projects","race"], ["projects","vertera"], ["projects","seatswap"], ["projects","agenteco"],
  ["leadership","hackutd"], ["leadership","acm"], ["leadership","mcf"],
  ["ai","cloud"], ["ai","embedded"], ["ai","projects"],
  ["cloud","web"], ["web","projects"],
  ["leadership","web"], ["leadership","ai"],
  ["monte","cloud"], ["finsights","cloud"],
  ["agenteco","ai"], ["nrve","ai"],
  ["raspi","asl"], ["hackutd","hacksite"], ["race","cloud"],
];

const CLUSTER = {
  ai:0,asl:0,monte:0,finsights:0,mediapipe:0,langchain:0,
  embedded:1,raspi:1,msp432:1,circuits:1,sensors:1,
  cloud:2,nrve:2,terraform:2,lambda:2,cicd:2,
  web:3,portfolio:3,nextjs:3,arviewer:3,hacksite:3,
  projects:4,race:4,vertera:4,seatswap:4,agenteco:4,
  leadership:5,hackutd:5,acm:5,mcf:5,
};

const NODE_INFO = {
  ai:        { title:"AI / ML Systems",       body:"Edge deployment, RAG pipelines, model training and feature engineering across multiple shipped products." },
  asl:       { title:"ASL Translator",        body:"Real-time sign language → speech using MediaPipe hand tracking + TensorFlow Lite, deployed on Raspberry Pi.", stack:"Python · MediaPipe · TF Lite · RPi" },
  monte:     { title:"Monte Carlo Engine",    body:"Stochastic simulation engine for trading strategy backtesting and financial risk modeling.", stack:"Python · FastAPI · NumPy" },
  finsights: { title:"FinSights RAG",         body:"Financial data RAG pipeline — ingests reports and answers natural-language queries via LangChain + vector search.", stack:"LangChain · FastAPI · Python" },
  mediapipe: { title:"MediaPipe",             body:"Used for real-time hand landmark detection in the ASL Translator — 21-keypoint hand skeleton at 30fps." },
  langchain: { title:"LangChain",             body:"Orchestration layer for the FinSights RAG pipeline — document retrieval, chunking, and LLM chaining." },
  embedded:  { title:"Embedded & HW",         body:"MSP432, Raspberry Pi, ADC/sensors, real-time C/C++. CE coursework and edge deployment targets." },
  raspi:     { title:"Raspberry Pi",          body:"Edge inference target for the ASL Translator — runs TF Lite model on-device with live camera input." },
  msp432:    { title:"MSP432",                body:"TI microcontroller used in CE labs — ADC, timers, UART, PWM, motor speed control in C." },
  circuits:  { title:"Circuit Design",        body:"Digital logic circuits, PCB schematics, signal analysis and oscilloscope work in embedded systems labs." },
  sensors:   { title:"Sensors / ADC",         body:"DHT11 temperature/humidity, OLED displays, ADC joystick interfacing on embedded hardware." },
  cloud:     { title:"Cloud & Backend",       body:"Production-level AWS infra, Terraform IaC, CI/CD pipelines, and serverless REST APIs across shipped products." },
  nrve:      { title:"NRVE (AWS)",            body:"Shipped a React Native education app to 300+ beta users. Designed AWS + Terraform infra for ML deployment.", stack:"React Native · AWS · Terraform · Python", image:"/images/nrve.png" },
  terraform: { title:"Terraform",             body:"Infrastructure as Code for NRVE — provisioned Lambda, RDS, and S3 resources reproducibly." },
  lambda:    { title:"AWS Lambda",            body:"Serverless compute for NRVE backend APIs and event-driven ML pipeline triggers." },
  cicd:      { title:"CI / CD",               body:"GitHub Actions pipelines for automated testing, linting, and deployment. Used across all projects." },
  web:       { title:"Full-Stack / Web",      body:"Next.js, React, TypeScript. Product-focused engineering with strong UI/UX sensibility." },
  portfolio: { title:"This Portfolio",        body:"Built with Next.js 15, Three.js, and Framer Motion. The network you're looking at right now is live code." },
  nextjs:    { title:"Next.js / React",       body:"Primary frontend stack — App Router, server components, dynamic imports, and performance optimization." },
  arviewer:  { title:"AR Viewer",             body:"Web-based AR product viewer — live camera feed with 3D model overlay for e-commerce UX." },
  hacksite:  { title:"HackUTD Site",          body:"Marketing + registration site for HackUTD serving 1,000+ participants and sponsors like NVIDIA and IBM." },
  projects:  { title:"Projects / Startups",   body:"Shipped telemetry tools, analytics platforms, and travel UX concepts — focus on system design and product thinking." },
  race:      { title:"R.A.C.E.",              body:"Race-engineering software that turns telemetry, radio context, and strategy rules into a fast decision surface for live sessions.", stack:"Next.js · FastAPI · Kafka · Redis", image:"/images/race1.png" },
  vertera:   { title:"Vertera",               body:"Business analytics platform with customizable dashboards, forecasting, and clear reporting for small teams.", stack:"React · Node.js · MongoDB · D3.js", image:"/images/vertera1.png" },
  seatswap:  { title:"SeatSwap",              body:"Flight seat-swapping UX concept — real-time seat availability, request flows, and quick passenger coordination.", stack:"React · TypeScript · Express · AWS", image:"/images/seatswap1.png" },
  agenteco:  { title:"Agent Ecosystem",       body:"Concept: Fiverr-for-AI-agents marketplace. System design for multi-agent orchestration and monetization at scale." },
  leadership:{ title:"Leadership & Impact",   body:"Organized North Texas' largest hackathon, led ACM product development, mentored 1,500+ students nationally." },
  hackutd:   { title:"HackUTD",               body:"Marketing Lead + Tech. Organized 1,000+ hacker event with NVIDIA, IBM, and Goldman Sachs sponsorships.", image:"/images/hackutd.png" },
  acm:       { title:"ACM Dev Lead",          body:"Built a full-stack event platform for 200+ students. Created matchmaking workflow cutting team formation time by 65%.", image:"/images/acm.png" },
  mcf:       { title:"Mark Cuban Foundation", body:"Technical Ambassador + AI Program Lead. Mentored 1,500+ students across nationwide AI Bootcamp programs.", image:"/images/mcf.jpg" },
};

export default function BrainViz() {
  const mountRef = useRef(null);
  const mouse    = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = mountRef.current;
    if (!el || typeof window === "undefined") return;

    const W = el.clientWidth  || window.innerWidth;
    const H = el.clientHeight || window.innerHeight;
    const rng = makeRng(7331);
    const DPR = Math.min(window.devicePixelRatio, 2);

    /* ── Renderer ── */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.z = 7.0;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    /* ── Left-to-right fade overlay ── */
    const fadeOverlay = document.createElement("div");
    Object.assign(fadeOverlay.style, {
      position:      "absolute",
      inset:         "0",
      background:    "linear-gradient(to right, rgba(4,4,4,1) 0%, rgba(4,4,4,0.85) 25%, rgba(4,4,4,0.15) 52%, transparent 72%), linear-gradient(to top, rgba(4,4,4,1) 0%, rgba(4,4,4,0.6) 22%, transparent 45%)",
      pointerEvents: "none",
      zIndex:        "1",
    });
    el.appendChild(fadeOverlay);

    /* ── Core group — shifted right + up to stay above gradient ── */
    const coreGroup = new THREE.Group();
    coreGroup.position.x = 1.6;
    coreGroup.position.y = 0.5;
    scene.add(coreGroup);

    /* ── Modal ── */
    const modal = document.createElement("div");
    Object.assign(modal.style, {
      position:"fixed", inset:"0", zIndex:"200",
      display:"flex", alignItems:"center", justifyContent:"center",
      background:"rgba(4,4,4,0.82)", backdropFilter:"blur(12px)",
      opacity:"0", pointerEvents:"none",
      transition:"opacity 0.22s ease",
      fontFamily:"var(--font-sans, sans-serif)",
    });

    const card = document.createElement("div");
    Object.assign(card.style, {
      background:"#0d0d14", border:"1px solid rgba(255,255,255,0.09)",
      borderRadius:"12px", padding:"32px", maxWidth:"460px", width:"90%",
      maxHeight:"80vh", overflowY:"auto",
      transform:"translateY(12px)", transition:"transform 0.22s ease",
    });

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    Object.assign(closeBtn.style, {
      position:"absolute", top:"16px", right:"20px",
      background:"none", border:"none", color:"rgba(255,255,255,0.4)",
      fontSize:"18px", cursor:"pointer", padding:"4px 8px",
    });

    modal.style.position = "fixed";
    modal.appendChild(card);
    document.body.appendChild(modal);

    let modalOpen = false;

    function openModal(nodeId) {
      const info = NODE_INFO[nodeId];
      if (!info) return;
      card.innerHTML = "";
      card.appendChild(closeBtn);

      const title = document.createElement("h2");
      title.textContent = info.title;
      Object.assign(title.style, { fontSize:"20px", fontWeight:"600", marginBottom:"12px", color:"rgba(235,235,235,0.95)", paddingRight:"32px" });
      card.appendChild(title);

      if (info.image) {
        const img = document.createElement("img");
        img.src = info.image;
        img.alt = info.title;
        Object.assign(img.style, { width:"100%", borderRadius:"8px", marginBottom:"16px", display:"block" });
        card.appendChild(img);
      }

      const body = document.createElement("p");
      body.textContent = info.body;
      Object.assign(body.style, { fontSize:"13px", color:"rgba(170,175,200,0.82)", lineHeight:"1.7", marginBottom: info.stack ? "14px" : "0" });
      card.appendChild(body);

      if (info.stack) {
        const stack = document.createElement("div");
        stack.textContent = info.stack;
        Object.assign(stack.style, { fontSize:"11px", fontFamily:"var(--font-mono, monospace)", color:"rgba(120,130,160,0.7)", letterSpacing:"0.04em" });
        card.appendChild(stack);
      }

      modal.style.opacity = "1";
      modal.style.pointerEvents = "auto";
      card.style.transform = "translateY(0)";
      modalOpen = true;
    }

    function closeModal() {
      modal.style.opacity = "0";
      modal.style.pointerEvents = "none";
      card.style.transform = "translateY(12px)";
      modalOpen = false;
    }

    closeBtn.onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
    const onKey = (e) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", onKey);

    /* ── Cleanup buckets ── */
    const spritesToDispose = [];
    const geosToDispose    = [];

    /* ── Crisp text sprite ── */
    function makeSprite(label, isMain) {
      const lw = isMain ? 210 : 148, lh = isMain ? 38 : 26;
      const cv = document.createElement("canvas");
      cv.width  = lw * DPR;
      cv.height = lh * DPR;
      const ctx = cv.getContext("2d");
      ctx.scale(DPR, DPR);

      const dotR = isMain ? 5 : 3;
      const cy   = lh / 2;

      ctx.beginPath();
      ctx.arc(dotR + 4, cy, dotR, 0, Math.PI * 2);
      ctx.fillStyle = isMain ? "rgba(160,160,180,0.60)" : "rgba(90,90,110,0.45)";
      ctx.fill();

      // Match hero-label style: Geist Mono, uppercase, letter-spacing
      if (ctx.letterSpacing !== undefined) ctx.letterSpacing = isMain ? "0.09em" : "0.07em";
      ctx.font      = `400 ${isMain ? 11 : 9}px "Geist Mono","Fira Code",Consolas,monospace`;
      ctx.fillStyle = isMain ? "rgba(130,132,145,0.58)" : "rgba(80,83,98,0.44)";
      ctx.textBaseline = "middle";
      ctx.fillText(label.toUpperCase(), (dotR + 4) * 2 + 3, cy);

      const tex = new THREE.CanvasTexture(cv);
      tex.minFilter = THREE.LinearFilter;
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
      const spr = new THREE.Sprite(mat);
      spr.scale.set((lw / lh) * (isMain ? 0.50 : 0.34), isMain ? 0.50 : 0.34, 1);
      spritesToDispose.push({ mat, tex });
      return spr;
    }

    /* ── Nodes ── */
    const nodeMap     = Object.fromEntries(NODES.map((n) => [n.id, n]));
    const hitMeshes   = [];
    const mainDotMats = [];
    const nodeSprites = {}; // nodeId → sprite (for hover color)

    NODES.forEach((n) => {
      const p   = new THREE.Vector3(...n.pos);
      const r   = n.main ? 0.052 : 0.028;
      const geo = new THREE.SphereGeometry(r, 8, 6);
      const col = n.main ? 0x888899 : 0x444455;
      const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: n.main ? 0.70 : 0.40 });
      const dot = new THREE.Mesh(geo, mat);
      dot.position.copy(p);
      coreGroup.add(dot);
      geosToDispose.push({ geo, mat });
      hitMeshes.push({ mesh: dot, nodeId: n.id });
      if (n.main) mainDotMats.push({ mat, idx: NODES.indexOf(n) });

      const spr = makeSprite(n.label, n.main);
      spr.position.set(p.x + 0.07, p.y + (n.main ? 0.088 : 0.062), p.z);
      coreGroup.add(spr);
      nodeSprites[n.id] = spr;
    });

    /* ── Adjacency + BFS for ripple ── */
    const adjacency = {};
    NODES.forEach((n) => { adjacency[n.id] = []; });
    EDGES.forEach(([a, b]) => { adjacency[a].push(b); adjacency[b].push(a); });

    function bfsEdgeDists(startId) {
      const nodeDist = { [startId]: 0 };
      const queue    = [startId];
      const result   = new Map(); // edgeIdx → float distance
      while (queue.length) {
        const curr = queue.shift();
        const d    = nodeDist[curr];
        EDGES.forEach(([a, b], i) => {
          if (a === curr || b === curr) {
            if (!result.has(i)) result.set(i, d + 0.5);
            const nb = a === curr ? b : a;
            if (nodeDist[nb] === undefined) { nodeDist[nb] = d + 1; queue.push(nb); }
          }
        });
      }
      return result;
    }

    let ripple = null; // { startTime, edgeDists, maxDist }

    /* ── Smooth color targets ── */
    const COL_NORMAL = new THREE.Color(0x808090);
    const COL_HOT    = new THREE.Color(0xffffff);
    const COL_DIM    = new THREE.Color(0x2e2e3a);
    const nodeColorTargets = {};
    NODES.forEach((n) => { nodeColorTargets[n.id] = COL_NORMAL.clone(); });
    let edgeHoverBrightness = 0; // 0–1, lerped each frame

    /* ── Edges + signal pulses ── */
    const pulses     = [];
    const edgeLineMats = []; // { mat, baseOpacity, baseColor, cross } — parallel to EDGES
    EDGES.forEach(([a, b], edgeIdx) => {
      const from = nodeMap[a], to = nodeMap[b];
      if (!from || !to) { edgeLineMats.push(null); return; }
      const fp    = new THREE.Vector3(...from.pos);
      const tp    = new THREE.Vector3(...to.pos);
      const cross = CLUSTER[a] !== CLUSTER[b];
      const color   = cross ? 0x2a3a55 : 0x3a3a60;
      const opacity = cross ? 0.32 : 0.50;

      const pts = cross
        ? (() => { const m = fp.clone().lerp(tp, 0.5); m.z += 0.22; return new THREE.QuadraticBezierCurve3(fp, m, tp).getPoints(24); })()
        : (() => { const steps = 8; const arr = []; for (let i=0;i<=steps;i++) arr.push(fp.clone().lerp(tp, i/steps)); return arr; })();

      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false });
      coreGroup.add(new THREE.Line(geo, mat));
      geosToDispose.push({ geo, mat });
      edgeLineMats.push({ mat, baseOpacity: opacity, baseColor: new THREE.Color(color), cross });

      // Only animate ~55% of edges
      if (edgeIdx % 2 === 0 || cross) {
        const pg  = new THREE.SphereGeometry(cross ? 0.022 : 0.016, 5, 3);
        const pm  = new THREE.MeshBasicMaterial({ color: cross ? 0x4466aa : 0x5555aa, transparent: true, opacity: 0, depthWrite: false });
        const pms = new THREE.Mesh(pg, pm);
        coreGroup.add(pms);
        geosToDispose.push({ geo: pg, mat: pm });
        pulses.push({ mesh: pms, mat: pm, path: pts, speed: 0.18 + rng() * 0.22, phase: rng() * Math.PI * 2 });
      }
    });

    /* ── Background scatter ── */
    const bgArr = new Float32Array(140 * 3);
    for (let i = 0; i < 140; i++) {
      bgArr[i * 3]     = (rng() - 0.5) * 6.0;
      bgArr[i * 3 + 1] = (rng() - 0.5) * 4.2;
      bgArr[i * 3 + 2] = (rng() - 0.5) * 1.2;
    }
    const bgGeo = new THREE.BufferGeometry();
    bgGeo.setAttribute("position", new THREE.BufferAttribute(bgArr, 3));
    const bgMat = new THREE.PointsMaterial({ color: 0x2a2a40, size: 0.016, transparent: true, opacity: 0.55 });
    coreGroup.add(new THREE.Points(bgGeo, bgMat));
    geosToDispose.push({ geo: bgGeo, mat: bgMat });

    /* ── World-space tendrils ── */
    const tendrilAnims = [];
    for (let i = 0; i < 9; i++) {
      const sx  = (rng() - 0.5) * 4.2 + 1.4;
      const sy  = -1.0 - rng() * 0.4;
      const len = 3.0 + rng() * 2.0;
      const drift = (rng() - 0.5) * 1.0;
      const pts = [];
      for (let s = 0; s <= 20; s++) {
        const tt = s / 20;
        pts.push(new THREE.Vector3(
          sx + drift * tt + Math.sin(tt * Math.PI * 2 + i) * 0.1,
          sy - len * tt, (rng() - 0.5) * 0.2,
        ));
      }
      const geo  = new THREE.BufferGeometry().setFromPoints(pts);
      const rest = new Float32Array(geo.attributes.position.array);
      const mat  = new THREE.LineBasicMaterial({ color: 0x223344, transparent: true, opacity: 0.12 + rng() * 0.07, depthWrite: false });
      scene.add(new THREE.Line(geo, mat));
      geosToDispose.push({ geo, mat });
      tendrilAnims.push({ geo, rest, phase: rng() * Math.PI * 2 });
    }

    /* ── Circuit traces ── */
    function makeCircuit(sx, sy, segs, op = 0.14) {
      const pts = [new THREE.Vector3(sx, sy, 0)];
      for (const [dx, dy] of segs) {
        const l = pts[pts.length - 1];
        pts.push(new THREE.Vector3(l.x + dx, l.y + dy, 0));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: 0x1a3060, transparent: true, opacity: op, depthWrite: false });
      scene.add(new THREE.Line(geo, mat));
      geosToDispose.push({ geo, mat });
      pts.slice(1, -1).forEach((p) => {
        const dg = new THREE.SphereGeometry(0.018, 5, 3);
        const dm = new THREE.MeshBasicMaterial({ color: 0x1e3060, transparent: true, opacity: op + 0.1 });
        const ds = new THREE.Mesh(dg, dm); ds.position.copy(p);
        scene.add(ds); geosToDispose.push({ geo: dg, mat: dm });
      });
    }
    makeCircuit(-1.2,-0.9,[[0,-.5],[-.4,0],[0,-.7],[.3,0],[0,-1.1],[-.4,0],[0,-1.4]]);
    makeCircuit(-0.2,-1.2,[[-.3,0],[0,-.5],[-.5,0],[0,-1.1],[.2,0],[0,-.7]], 0.11);
    makeCircuit( 3.8,-0.9,[[0,-.5],[.4,0],[0,-.7],[-.3,0],[0,-1.1],[.4,0],[0,-1.4]]);
    makeCircuit( 2.8,-1.2,[[.3,0],[0,-.5],[.5,0],[0,-1.1],[-.2,0],[0,-.7]], 0.11);
    makeCircuit( 1.9,-1.0,[[0,-.5],[.4,0],[0,-.4],[.3,0],[0,-1.2],[-.4,0],[0,-.7]], 0.12);

    /* ── Pointer ── */
    const onMouse = (e) => {
      const r = el.getBoundingClientRect();
      mouse.current.x =  ((e.clientX - r.left) / r.width  - 0.5) * 2;
      mouse.current.y = -((e.clientY - r.top)  / r.height - 0.5) * 2;
    };
    const onTouch = (e) => {
      if (!e.touches.length) return;
      const r = el.getBoundingClientRect();
      mouse.current.x =  ((e.touches[0].clientX - r.left) / r.width  - 0.5) * 2;
      mouse.current.y = -((e.touches[0].clientY - r.top)  / r.height - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouse);
    el.addEventListener("touchmove", onTouch, { passive: true });

    /* ── Tooltip ── */
    const tip = document.createElement("div");
    Object.assign(tip.style, {
      position:"absolute", background:"rgba(6,6,14,0.94)",
      border:"1px solid rgba(255,255,255,0.08)", borderRadius:"6px",
      padding:"10px 13px", maxWidth:"200px", pointerEvents:"none",
      opacity:"0", transition:"opacity 0.15s", zIndex:"10",
      fontFamily:"var(--font-mono, monospace)", fontSize:"10px",
      color:"rgba(200,205,225,0.85)", lineHeight:"1.55",
      top:"0", left:"0",
    });
    el.appendChild(tip);

    /* ── Raycaster ── */
    const raycaster = new THREE.Raycaster();
    const mouseVec  = new THREE.Vector2();
    let   hoveredId = null;

    function showTip(nodeId, sx, sy) {
      const info = NODE_INFO[nodeId];
      if (!info) return;
      tip.innerHTML =
        `<div style="font-size:11px;font-weight:600;color:rgba(235,235,235,0.95);margin-bottom:4px">${info.title}</div>` +
        `<div style="color:rgba(150,155,180,0.78);font-size:9.5px">${info.body.slice(0, 90)}…</div>` +
        `<div style="margin-top:5px;font-size:8.5px;color:rgba(100,110,140,0.65)">click to expand</div>`;
      const tx = Math.min(sx + 14, W - 220);
      const ty = Math.min(sy - 8,  H - 130);
      tip.style.transform = `translate(${tx}px,${ty}px)`;
      tip.style.opacity   = "1";
    }
    function hideTip() { tip.style.opacity = "0"; }

    /* ── Click ── */
    const allMeshes = hitMeshes.map((h) => h.mesh);
    const onClick = (e) => {
      if (modalOpen) return;
      const r  = el.getBoundingClientRect();
      const mx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
      const my = -((e.clientY - r.top)  / r.height - 0.5) * 2;
      const cv2 = new THREE.Vector2(mx, my);
      const rc  = new THREE.Raycaster();
      rc.setFromCamera(cv2, camera);
      const hits = rc.intersectObjects(allMeshes, false);
      if (hits.length > 0) {
        const hit = hitMeshes.find((h) => h.mesh === hits[0].object);
        if (hit) openModal(hit.nodeId);
      }
    };
    renderer.domElement.addEventListener("click", onClick);

    /* ── Animation ── */
    let raf;
    let rx = 0, ry = 0;
    const clock = new THREE.Clock();

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      rx += (-mouse.current.y * 0.15 - rx) * 0.04;
      ry += ( mouse.current.x * 0.18 - ry) * 0.04;
      coreGroup.rotation.x = rx;
      coreGroup.rotation.y = ry;

      // Hover detection (skip when modal is open)
      if (!modalOpen) {
        mouseVec.set(mouse.current.x, mouse.current.y);
        raycaster.setFromCamera(mouseVec, camera);
        const hits = raycaster.intersectObjects(allMeshes, false);
        if (hits.length > 0) {
          const hit = hitMeshes.find((h) => h.mesh === hits[0].object);
          if (hit && hit.nodeId !== hoveredId) {
            hoveredId = hit.nodeId;
            const wp = new THREE.Vector3();
            hits[0].object.getWorldPosition(wp);
            const sp = wp.clone().project(camera);
            showTip(hoveredId, (sp.x * 0.5 + 0.5) * W, (-sp.y * 0.5 + 0.5) * H);
            // Set smooth color targets
            Object.keys(nodeColorTargets).forEach((id) => {
              nodeColorTargets[id].copy(id === hoveredId ? COL_HOT : COL_DIM);
            });
            // Start ripple from hovered node
            const edgeDists = bfsEdgeDists(hoveredId);
            const maxDist   = Math.max(...edgeDists.values(), 0);
            ripple = { startTime: t, edgeDists, maxDist };
          }
          renderer.domElement.style.cursor = "pointer";
        } else {
          if (hoveredId) {
            hoveredId = null;
            hideTip();
            Object.keys(nodeColorTargets).forEach((id) => nodeColorTargets[id].copy(COL_NORMAL));
          }
          renderer.domElement.style.cursor = "default";
        }
      }

      // Smooth sprite label colors
      Object.entries(nodeSprites).forEach(([id, spr]) => {
        spr.material.color.lerp(nodeColorTargets[id], 0.07);
      });

      // Edge ambient brightness lerps toward 1 on hover, 0 on leave
      edgeHoverBrightness += ((hoveredId ? 1 : 0) - edgeHoverBrightness) * 0.055;
      edgeLineMats.forEach((entry) => {
        if (!entry) return;
        entry.currentBase = entry.baseOpacity * (1 + edgeHoverBrightness * 0.9);
        entry.mat.opacity = entry.currentBase;
        entry.mat.color.lerp(entry.baseColor, 0.07); // drift colour back to base
      });

      mainDotMats.forEach(({ mat, idx }) => {
        mat.opacity = 0.50 + Math.sin(t * 1.4 + idx * 1.3) * 0.14;
      });

      // Signal pulses travel along edges
      pulses.forEach(({ mesh, mat: pm, path, speed, phase }) => {
        const cycle    = (t * speed + phase) % (Math.PI * 2);
        const progress = cycle / (Math.PI * 2);          // 0→1 per cycle
        const visible  = progress < 0.65;                // active 65% of cycle
        if (visible) {
          const norm = progress / 0.65;
          const i    = Math.min(Math.floor(norm * (path.length - 1)), path.length - 2);
          const frac = norm * (path.length - 1) - i;
          mesh.position.lerpVectors(path[i], path[i + 1], frac);
          pm.opacity = Math.sin(norm * Math.PI) * 0.75; // fade in → out
        } else {
          pm.opacity = 0;
        }
      });

      // Ripple: wave of light cascades along edges from hovered node
      if (ripple) {
        const elapsed   = t - ripple.startTime;
        const waveSpeed = 2.5; // hops/sec
        const flashDur  = 0.55;
        let   allDone   = true;
        ripple.edgeDists.forEach((dist, idx) => {
          const entry = edgeLineMats[idx];
          if (!entry) return;
          const { mat, baseOpacity, baseColor, cross } = entry;
          const since = elapsed - dist / waveSpeed;
          if (since < flashDur) allDone = false;
          if (since >= 0 && since < flashDur) {
            const flash = Math.sin((since / flashDur) * Math.PI);
            mat.opacity = entry.currentBase + flash * (cross ? 0.38 : 0.45);
            mat.color.setRGB(
              baseColor.r + flash * 0.18,
              baseColor.g + flash * 0.32,
              baseColor.b + flash * 0.55,
            );
          }
        });
        if (allDone && elapsed > ripple.maxDist / waveSpeed + 0.8) ripple = null;
      }

      tendrilAnims.forEach(({ geo, rest, phase }) => {
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const prog = i / pos.count;
          pos.setX(i, rest[i * 3] + Math.sin(t * 0.7 + phase + prog * 3.5) * 0.07 * prog);
        }
        pos.needsUpdate = true;
      });

      renderer.render(scene, camera);
    };
    tick();

    /* ── Resize ── */
    const onResize = () => {
      const nw = el.clientWidth, nh = el.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      el.removeEventListener("touchmove", onTouch);
      renderer.domElement.removeEventListener("click", onClick);
      if (tip.parentNode)         tip.parentNode.removeChild(tip);
      if (modal.parentNode)       modal.parentNode.removeChild(modal);
      if (fadeOverlay.parentNode) fadeOverlay.parentNode.removeChild(fadeOverlay);
      renderer.domElement.parentNode?.removeChild(renderer.domElement);
      renderer.dispose();
      spritesToDispose.forEach(({ mat, tex }) => { mat.dispose(); tex.dispose(); });
      geosToDispose.forEach(({ geo, mat }) => { geo.dispose(); mat.dispose(); });
    };
  }, []);

  return <div ref={mountRef} style={{ width:"100%", height:"100%", position:"relative" }} />;
}
