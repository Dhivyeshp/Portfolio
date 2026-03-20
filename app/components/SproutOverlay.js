"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const FluidSim = dynamic(() => import("./FluidSim"), { ssr: false, loading: () => null });

/* ── Work data ─────────────────────────────────────────── */
const CLIENTS = ["OpTic Gaming", "FaZe Clan", "Atlanta FaZe", "Miami Dolphins"];

const WORKS = [
  {
    id: 1,
    category: "Product Design / Visual Exploration",
    title: "Footwear Finesse",
    subtitle: "A study in style, form, and everyday comfort",
    description:
      "An immersive design exploration focused on modern footwear aesthetics and usability. This project highlights a curated range of styles—from classic leather loafers to contemporary high-top sneakers—each selected to represent a balance between craftsmanship and function.",
    tags: ["Footwear", "Product Design", "Fashion", "Visual Design"],
    image: "/images/postercollection.png",
  },
  {
    id: 2,
    category: "UI/UX Design",
    title: "UI Design Showcase",
    subtitle: "Interface systems built around clarity and intent",
    description:
      "A curated collection of interface designs exploring different approaches to digital interaction. Includes dashboards, mobile screens, and experimental layouts, each built with a strong focus on usability and visual hierarchy.",
    tags: ["UI/UX", "Product Design", "Dashboards", "Mobile", "Interaction Design"],
    image: "/images/uidesignshowcase.webp",
  },
  {
    id: 3,
    category: "Sports Design / Branding",
    title: "Miami Dolphins — Raheem Mostert",
    subtitle: "Athlete spotlight and visual storytelling",
    description:
      "A design package centered around NFL running back Raheem Mostert, translating his explosive playstyle into dynamic compositions. Combines motion-driven graphics with bold typography to explore how athlete identity can be elevated through brand-aligned visuals.",
    tags: ["Sports Design", "Branding", "NFL", "Motion Aesthetic", "Visual Identity"],
    image: null,
  },
  {
    id: 4,
    category: "Esports Branding",
    title: "NYXL Rebrand & Team Assets",
    subtitle: "Competitive identity across Valorant and Overwatch",
    description:
      "Led the rebranding and visual asset development for NYXL's competitive teams across Valorant and Overwatch. Deliverables included match graphics, social content, and brand systems designed for consistency across multiple titles and platforms.",
    tags: ["Esports", "Branding", "NYXL", "Valorant", "Overwatch", "Social Graphics"],
    image: "/images/nyxl.png",
  },
  {
    id: 5,
    category: "Esports / Campaign Design",
    title: "Atlanta FaZe — CDL Major 2022",
    subtitle: "Dual-style visual system for competitive storytelling",
    description:
      "Developed a visual design system for Atlanta FaZe during CDL Major 2022, exploring grunge/urban and clean/minimal directions. Bold, recognizable visuals tailored for high-impact competitive content while remaining cohesive with the FaZe brand.",
    tags: ["Esports", "FaZe Clan", "CDL", "Campaign Design", "Visual Systems"],
    image: "/images/atlantafaze.png",
  },
];

/* ── Canvas transition helpers ─────────────────────────── */
const ENTER_MS = 1500;
const EXIT_MS  = 950;
const NUM_RAYS = 24;

function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
function easeIn(t)  { return t * t * t; }

function h(i) {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

const RAYS = Array.from({ length: NUM_RAYS }, (_, i) => ({
  angle: (i / NUM_RAYS) * Math.PI * 2 + (h(i * 3 + 1) - 0.5) * 0.45,
  delay: h(i * 5 + 2) * 0.40,
  speed: 0.45 + h(i * 7 + 3) * 1.10,
  reach: 0.75 + h(i * 11 + 4) * 0.50,
  front: 1.22 + h(i * 13 + 5) * 0.50,
}));

function enterRayT(ray, globalT) {
  if (globalT <= ray.delay) return 0;
  const local = (globalT - ray.delay) / (1 - ray.delay);
  return Math.min(1, easeOut(Math.min(local * ray.speed, 1)));
}

function paintFrame(ctx, W, H, ox, oy, maxR, rayT) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#040404";
  ctx.fillRect(0, 0, W, H);

  const tips = RAYS.map(ray => {
    const t = rayT(ray);
    const r = maxR * ray.reach * t;
    return { x: ox + r * Math.cos(ray.angle), y: oy + r * Math.sin(ray.angle),
             angle: ray.angle, r, t, front: ray.front };
  });

  if (tips.every(tp => tp.t <= 0.01)) return;

  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle   = "rgba(0,0,0,1)";
  ctx.strokeStyle = "rgba(0,0,0,1)";
  ctx.lineCap     = "round";

  ctx.beginPath();
  ctx.moveTo(ox, oy);
  for (const tp of tips) ctx.lineTo(tp.x, tp.y);
  ctx.closePath();
  ctx.fill();

  for (const tp of tips) {
    if (tp.t < 0.02) continue;
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(tp.x, tp.y); ctx.stroke();
  }

  const frontiers = tips.map(tp => ({
    x: ox + tp.r * tp.front * Math.cos(tp.angle),
    y: oy + tp.r * tp.front * Math.sin(tp.angle),
    active: tp.t > 0.06,
  }));

  ctx.lineWidth = 0.9;
  for (let i = 0; i < NUM_RAYS; i++) {
    if (!frontiers[i].active) continue;
    ctx.beginPath(); ctx.moveTo(tips[i].x, tips[i].y);
    ctx.lineTo(frontiers[i].x, frontiers[i].y); ctx.stroke();
  }

  const gateR = maxR * 0.55;
  ctx.lineWidth = 0.65;
  for (let i = 0; i < NUM_RAYS; i++) {
    if (!frontiers[i].active) continue;
    for (let j = i + 2; j <= i + 7; j++) {
      const k = j % NUM_RAYS;
      if (!frontiers[k].active) continue;
      const dx = frontiers[i].x - frontiers[k].x, dy = frontiers[i].y - frontiers[k].y;
      if (dx * dx + dy * dy > gateR * gateR) continue;
      ctx.beginPath(); ctx.moveTo(frontiers[i].x, frontiers[i].y);
      ctx.lineTo(frontiers[k].x, frontiers[k].y); ctx.stroke();
    }
  }

  for (const { x, y, active } of frontiers) {
    if (!active) continue;
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
  }
  for (const { x, y, t } of tips) {
    if (t < 0.02) continue;
    ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.beginPath(); ctx.arc(ox, oy, 5.5, 0, Math.PI * 2); ctx.fill();

  ctx.globalCompositeOperation = "source-over";
}

/* ── Animation variants ────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08, delayChildren: 0.65 } },
};
const staggerFast = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06, delayChildren: 0.85 } },
};

/* ── Component ─────────────────────────────────────────── */
export default function SproutOverlay({ isSproutOpen, origin, onClose }) {
  const [phase, setPhase] = useState("idle");
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const startRef  = useRef(null);

  const getOrigin = () => ({
    x: typeof origin?.x === "number" ? origin.x : window.innerWidth  / 2,
    y: typeof origin?.y === "number" ? origin.y : window.innerHeight / 2,
  });

  const initCanvas = () => {
    const canvas  = canvasRef.current;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const { x: ox, y: oy } = getOrigin();
    const maxR = Math.hypot(Math.max(ox, canvas.width - ox),
                            Math.max(oy, canvas.height - oy)) * 1.08;
    return { ctx: canvas.getContext("2d"), W: canvas.width, H: canvas.height, ox, oy, maxR };
  };

  // Paint solid black immediately when canvas mounts — prevents white flash
  useLayoutEffect(() => {
    if (phase !== "entering") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#040404";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [phase]); // eslint-disable-line

  useEffect(() => {
    if (phase !== "entering") return;
    const { ctx, W, H, ox, oy, maxR } = initCanvas();
    startRef.current = null;
    const tick = (now) => {
      if (!startRef.current) startRef.current = now;
      const globalT = Math.min((now - startRef.current) / ENTER_MS, 1);
      paintFrame(ctx, W, H, ox, oy, maxR, ray => enterRayT(ray, globalT));
      if (globalT < 1) { rafRef.current = requestAnimationFrame(tick); }
      else { setPhase("open"); }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]); // eslint-disable-line

  useEffect(() => {
    if (phase !== "closing") return;
    const { ctx, W, H, ox, oy, maxR } = initCanvas();
    startRef.current = null;
    const tick = (now) => {
      if (!startRef.current) startRef.current = now;
      const raw   = Math.min((now - startRef.current) / EXIT_MS, 1);
      const scale = 1 - easeIn(raw);
      paintFrame(ctx, W, H, ox, oy, maxR, () => scale);
      if (raw < 1) { rafRef.current = requestAnimationFrame(tick); }
      else { setPhase("idle"); document.body.style.overflow = ""; onClose(); }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]); // eslint-disable-line

  useEffect(() => {
    if (isSproutOpen && phase === "idle") {
      document.body.style.overflow = "hidden";
      setPhase("entering");
    }
  }, [isSproutOpen]); // eslint-disable-line

  const close = () => { if (phase === "open") setPhase("closing"); };

  useEffect(() => {
    if (phase !== "open") return;
    const fn = (e) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [phase]); // eslint-disable-line

  useEffect(() => () => { cancelAnimationFrame(rafRef.current); document.body.style.overflow = ""; }, []);

  if (phase === "idle") return null;

  return (
    <>
      <div className="sprout-page" style={{ pointerEvents: phase === "open" ? "all" : "none" }}>
        <FluidSim />
        <button className="sprout-close" onClick={close} disabled={phase !== "open"}>✕</button>

        <div className="sprout-wrapper" style={{ position: "relative", zIndex: 1 }}>
          {/* ── Header ── */}
          <motion.div
            className="sprout-inner"
            initial="hidden"
            animate={phase === "entering" || phase === "open" ? "show" : "hidden"}
            variants={stagger}
          >
            <motion.p className="sprout-label" variants={fadeUp}>Studio</motion.p>
            <motion.h1 className="sprout-title" variants={fadeUp}>Sprout Designs</motion.h1>
            <motion.div className="sprout-clients" variants={fadeUp}>
              {CLIENTS.map((c) => <span key={c} className="sprout-client">{c}</span>)}
            </motion.div>
            <motion.p className="sprout-copy" variants={fadeUp}>
              Design and engineering studio building digital experiences, branding systems,
              and motion for esports and sports organizations. Work spans web, 3D, and
              campaign assets used at scale.
            </motion.p>
            <motion.ul className="sprout-bullets" variants={fadeUp}>
              <li>Delivered high-performance visual systems across multiple teams and campaigns</li>
              <li>Built and managed a creative and development pipeline end-to-end</li>
              <li>Blended design, motion, and engineering into production-ready outputs</li>
            </motion.ul>
          </motion.div>

          {/* ── Work grid ── */}
          <motion.div
            className="sprout-work"
            initial="hidden"
            animate={phase === "entering" || phase === "open" ? "show" : "hidden"}
            variants={stagger}
          >
            <motion.p className="sprout-label" variants={fadeUp}>Selected Work</motion.p>
            <motion.div className="sprout-work-grid" variants={staggerFast}>
              {WORKS.map((w) => (
                <motion.article key={w.id} className="sprout-card" variants={fadeUp}>
                  <div className="sprout-card-img-wrap">
                    {w.image
                      ? <img src={w.image} alt={w.title} className="sprout-card-img" />
                      : <div className="sprout-card-placeholder"><span>Image coming soon</span></div>
                    }
                  </div>
                  <div className="sprout-card-body">
                    <p className="sprout-card-cat">{w.category}</p>
                    <h2 className="sprout-card-title">{w.title}</h2>
                    <p className="sprout-card-sub">{w.subtitle}</p>
                    <p className="sprout-card-desc">{w.description}</p>
                    <div className="sprout-card-tags">
                      {w.tags.map(t => <span key={t} className="sprout-card-tag">{t}</span>)}
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {phase !== "open" && (
        <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 9002, pointerEvents: "none", display: "block" }} />
      )}
    </>
  );
}
