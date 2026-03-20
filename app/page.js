"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const BrainViz = dynamic(() => import("./components/BrainViz"), {
  ssr: false,
  loading: () => null,
});

const FluidSim = dynamic(() => import("./components/FluidSim"), {
  ssr: false,
  loading: () => null,
});

const DallasHalftone = dynamic(() => import("./components/DallasHalftone"), {
  ssr: false,
  loading: () => null,
});
import SproutOverlay from "./components/SproutOverlay";


/* ── Data ──────────────────────────────────────────── */

const navLinks = [
  { label: "Work",    href: "#work" },
  { label: "Contact", href: "#contact" },
];

const stats = [
  { value: "14+",    label: "products shipped" },
  { value: "300+",   label: "beta users" },
  { value: "1,500+", label: "students mentored" },
];

const experience = [
  {
    company: "Fannie Mae",
    role: "Incoming Software Engineering Intern",
    date: "Jun 2026 — Aug 2026",
    location: "Dallas, TX",
    points: [],
  },
  {
    company: "NRVE",
    role: "Software Engineering Intern",
    date: "Jun 2025 — Aug 2025",
    location: "Dallas, TX",
    points: [
      "Built a personalized education app using React Native, Firebase, and Python, serving 300+ beta users.",
      "Designed and implemented cloud infrastructure using AWS SageMaker, AWS Lambda, and Azure Web Apps, reducing provisioning time by 30% while maintaining scalability.",
      "Established CI/CD pipelines using GitHub Actions with automated unit and integration testing, improving release efficiency across multiple Agile sprint cycles.",
      "Containerized backend services using Docker and deployed on Kubernetes, enabling scalable model inference and zero-downtime deployments across environments.",
    ],
  },
  {
    company: "Association for Computing Machinery – Outreach",
    role: "Software Development Lead",
    date: "May 2025 — Present",
    location: "Dallas, TX",
    points: [
      "Architected workflow-driven systems using React, TypeScript, Firebase, and Spring Boot.",
      "Designed JSON-based data schemas to power dynamic UI forms and application state management.",
      "Led Agile (Scrum) ceremonies including backlog grooming, sprint planning, and daily stand-ups using Jira.",
    ],
  },
  {
    company: "University of Texas at Dallas",
    role: "Machine Learning Research Assistant – Reliability & Design Automation Lab",
    date: "Dec 2024 — May 2025",
    location: "Dallas, TX",
    paper: "/assets/research_paper.pdf",
    points: [
      "Engineered and deployed three ML pipelines in Python, TensorFlow, PyTorch, and Scikit-learn for battery life prediction with 10,000+ data points.",
      "Built data processing and training components with REST API endpoints, reducing reconfiguration time by 60%.",
      "Improved prediction confidence by 20% using conformal prediction and synthetic data generation.",
    ],
  },
  {
    company: "Mark Cuban Foundation",
    role: "Technical Ambassador & AI Program Lead",
    date: "Oct 2022 — Nov 2023",
    location: "Dallas, TX",
    points: [
      "Built and deployed an AI-powered computer vision web app using Python, Flask, and Azure services, scaling to 1,500+ users.",
      "Led hands-on machine learning sessions for 1,500+ students, improving engagement by 20%.",
      "Led data-driven outreach using Python-based analysis and SQL reporting to streamline student workflows.",
    ],
  },
];

const philosophy = [
  { number: "01", title: "Define the use case",   body: "Start with the product problem, user context, and a clear outcome worth building for." },
  { number: "02", title: "Shape the interaction", body: "Turn the idea into flows, interface structure, and prototypes that can be tested early." },
  { number: "03", title: "Build the system",      body: "Engineer reliable frontends, services, and infrastructure that support real-world use." },
  { number: "04", title: "Refine the details",    body: "Polish motion, performance, and interface edges so the product feels intentional." },
];

const projects = [
  {
    code: "RCE-001", year: "2025",
    title: "R.A.C.E.", category: "Telemetry + AI Tooling",
    summary: "Race-engineering software that turns telemetry, radio context, and strategy rules into a fast decision surface for live sessions.",
    stack: ["React", "Kafka", "Apache Spark", "AWS", "Gemini API", "ElevenLabs", "DigitalOcean Kubernetes"],
    github: "https://github.com/sahisagiraju/hacktx25",
    image: "/images/race1.png", accent: "rgba(232, 168, 94, 0.35)",
  },
  {
    code: "VRT-002", year: "2024",
    title: "Vertera", category: "Analytics Platform",
    summary: "A business analytics product built around customizable dashboards, forecasting, and clear reporting for small teams.",
    stack: ["React", "Node.js", "MongoDB", "D3.js"],
    image: "/images/vertera1.png", accent: "rgba(130, 230, 170, 0.35)",
  },
  {
    code: "SSP-003", year: "2025",
    title: "SeatSwap", category: "Travel Experience Concept",
    summary: "A flight seat-swapping experience designed for real-time availability, request flows, and quick passenger coordination.",
    stack: ["React", "TypeScript", "Express", "AWS"],
    github: "https://github.com/SooryaS2/TamuHackApp",
    image: "/images/seatswap1.png", accent: "rgba(100, 180, 255, 0.35)",
  },
  {
    code: "ASL-004", year: "2025",
    title: "ASL Translator", category: "Computer Vision · Edge AI",
    summary: "Real-time ASL-to-speech translator using MediaPipe landmarks and a custom gesture model deployed on Raspberry Pi via TensorFlow Lite, achieving 92% accuracy on the ASL alphabet.",
    stack: ["Python", "TensorFlow Lite", "MediaPipe", "OpenCV", "Raspberry Pi"],
    github: "https://github.com/Dhivyeshp/ASL-TFLite-Translator",
    accent: "rgba(190, 160, 230, 0.35)",
  },
  {
    code: "FIN-005", year: "2025",
    title: "FinSights", category: "RAG · Fintech",
    summary: "Cross-platform React Native app with a RAG pipeline using LangChain, FAISS vector search, and Sentence-Transformer embeddings for querying financial documents.",
    stack: ["React Native", "FastAPI", "LangChain", "FAISS", "Sentence Transformers"],
    github: "https://github.com/AdityaDixCodes/Hack-AI-2025",
    accent: "rgba(94, 200, 170, 0.35)",
  },
  {
    code: "HAI-006", year: "2026",
    title: "HackAI Website", category: "Hackathon · Web",
    summary: "Marketing site for HackAI, a student-run AI hackathon at UTD. Teams go from idea to demo in 24 hours through workshops, mentorship, and hands-on building.",
    stack: ["Next.js", "TypeScript", "Framer Motion"],
    github: "https://github.com/Dhivyeshp/hackai-2026",
    accent: "rgba(160, 190, 230, 0.35)",
  },
  {
    code: "MCR-007", year: "2025",
    title: "MonteCore", category: "Quantitative Trading Platform",
    summary: "Full-stack quant platform that backtests moving average strategies on historical equity data, evaluates risk-adjusted performance, and runs progressive Monte Carlo simulations to model uncertainty.",
    stack: ["Next.js", "TypeScript", "FastAPI", "Python", "NumPy", "Pandas", "yfinance", "Recharts"],
    github: "https://github.com/Dhivyeshp/MonteCore",
    accent: "rgba(232, 180, 100, 0.35)",
  },
];

const capabilities = [
  // Core languages
  { label: "Python",           size: 38, opacity: 1.00, weight: 600 },
  { label: "TypeScript",       size: 36, opacity: 0.97, weight: 600 },
  { label: "JavaScript",       size: 34, opacity: 0.94, weight: 600 },
  { label: "Java",             size: 28, opacity: 0.88, weight: 500 },
  { label: "C++",              size: 24, opacity: 0.82, weight: 500 },
  { label: "SQL",              size: 22, opacity: 0.78, weight: 500 },
  { label: "Kotlin",           size: 19, opacity: 0.70, weight: 400 },
  { label: "Golang",           size: 18, opacity: 0.67, weight: 400 },
  { label: "HTML",             size: 17, opacity: 0.64, weight: 400 },
  { label: "CSS",              size: 16, opacity: 0.61, weight: 400 },
  { label: "R",                size: 15, opacity: 0.56, weight: 400 },
  // Frameworks & libraries
  { label: "React",            size: 40, opacity: 1.00, weight: 600 },
  { label: "Next.js",          size: 37, opacity: 0.96, weight: 600 },
  { label: "Node.js",          size: 30, opacity: 0.90, weight: 500 },
  { label: "React Native",     size: 25, opacity: 0.84, weight: 500 },
  { label: "Flutter",          size: 23, opacity: 0.80, weight: 500 },
  { label: "Django",           size: 21, opacity: 0.75, weight: 400 },
  { label: "FastAPI",          size: 20, opacity: 0.72, weight: 400 },
  { label: "GraphQL",          size: 20, opacity: 0.70, weight: 400 },
  { label: "Spring Boot",      size: 19, opacity: 0.67, weight: 400 },
  { label: "Angular",          size: 18, opacity: 0.64, weight: 400 },
  { label: "Flask",            size: 17, opacity: 0.61, weight: 400 },
  { label: "Grafana",          size: 16, opacity: 0.58, weight: 400 },
  { label: "D3.js",            size: 15, opacity: 0.55, weight: 400 },
  { label: "Express",          size: 15, opacity: 0.52, weight: 400 },
  { label: "Machine Learning", size: 22, opacity: 0.77, weight: 400 },
  // DevOps & tools
  { label: "AWS",              size: 32, opacity: 0.93, weight: 600 },
  { label: "Docker",           size: 26, opacity: 0.86, weight: 500 },
  { label: "Kubernetes",       size: 24, opacity: 0.83, weight: 500 },
  { label: "Terraform",        size: 22, opacity: 0.79, weight: 500 },
  { label: "GCP",              size: 21, opacity: 0.76, weight: 400 },
  { label: "Azure",            size: 21, opacity: 0.74, weight: 400 },
  { label: "Kafka",            size: 20, opacity: 0.71, weight: 400 },
  { label: "Redis",            size: 19, opacity: 0.68, weight: 400 },
  { label: "PostgreSQL",       size: 19, opacity: 0.66, weight: 400 },
  { label: "MongoDB",          size: 18, opacity: 0.63, weight: 400 },
  { label: "MySQL",            size: 17, opacity: 0.60, weight: 400 },
  { label: "Cassandra",        size: 16, opacity: 0.57, weight: 400 },
  { label: "GitHub Actions",   size: 16, opacity: 0.55, weight: 400 },
  { label: "GitLab",           size: 15, opacity: 0.52, weight: 400 },
  { label: "Jenkins",          size: 15, opacity: 0.50, weight: 400 },
  { label: "OpenShift",        size: 14, opacity: 0.47, weight: 400 },
  { label: "Salesforce",       size: 14, opacity: 0.45, weight: 400 },
  { label: "Postman",          size: 14, opacity: 0.43, weight: 400 },
];

const socialLinks = [
  { label: "GitHub",   href: "https://github.com/Dhivyeshp" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/dhivyeshprithiviraj/" },
  { label: "Resume",   href: "/assets/Dhivyesh_Resume_SWE.pdf" },
];

/* ── Hooks ─────────────────────────────────────────── */

const SECTION_IDS = ["experience", "philosophy", "work", "contact"];

function useNavLetterHover() {
  useEffect(() => {
    const links = Array.from(document.querySelectorAll(".nav-link"));
    const handlers = links.map((link) => {
      const letters = Array.from(link.querySelectorAll(".nav-letter"));
      const onEnter = () => {
        letters.forEach((el, i) => {
          el.classList.remove("wave");
          void el.offsetWidth; // force reflow to restart animation
          setTimeout(() => el.classList.add("wave"), i * 35);
        });
      };
      link.addEventListener("mouseenter", onEnter);
      return { link, onEnter };
    });
    return () => handlers.forEach(({ link, onEnter }) => link.removeEventListener("mouseenter", onEnter));
  }, []);
}

function useCursor() {
  useEffect(() => {
    const dot = document.createElement("div");
    Object.assign(dot.style, {
      position:      "fixed",
      width:         "10px",
      height:        "10px",
      borderRadius:  "50%",
      border:        "1px solid rgba(255,255,255,0.55)",
      pointerEvents: "none",
      zIndex:        "99999",
      opacity:       "0",
      transition:    "opacity 0.3s ease, width 0.25s ease, height 0.25s ease, border-color 0.25s ease",
      willChange:    "transform",
      top:           "0",
      left:          "0",
    });
    document.body.appendChild(dot);

    let mx = 0, my = 0, cx = 0, cy = 0, raf;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.opacity = "1";
    };
    const onLeave  = () => { dot.style.opacity = "0"; };
    const onEnter  = () => { dot.style.opacity = "1"; };

    // Scale up on interactive elements
    const onOver = (e) => {
      if (e.target.closest("a, button, [role=button]")) {
        dot.style.width       = "22px";
        dot.style.height      = "22px";
        dot.style.borderColor = "rgba(255,255,255,0.25)";
      } else {
        dot.style.width       = "10px";
        dot.style.height      = "10px";
        dot.style.borderColor = "rgba(255,255,255,0.55)";
      }
    };

    window.addEventListener("mousemove",  onMove,  { passive: true });
    window.addEventListener("mouseover",  onOver,  { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      cx += (mx - cx) * 0.12;
      cy += (my - cy) * 0.12;
      dot.style.transform = `translate(${cx - 5}px, ${cy - 5}px)`;
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      dot.parentNode?.removeChild(dot);
    };
  }, []);
}

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}


function lerpColor(a, b, t) {
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
}

// Experience accent colors
const EXP_BASE   = [235, 235, 235];
const EXP_ACCENT = [
  [195, 185, 220], // Fannie Mae — soft lavender
  [168, 212, 188], // NRVE — soft green
  [168, 184, 216], // ACM — soft blue
  [175, 205, 215], // UTD Research — cool teal
  [212, 196, 160], // Mark Cuban — warm amber
];

// Work card accent colors (parallel to projects array)
const WORK_BASE   = [235, 235, 235];
const WORK_ACCENT = [
  [232, 168,  94], // R.A.C.E. — warm amber
  [130, 210, 170], // Vertera — soft green
  [120, 175, 235], // SeatSwap — soft blue
  [190, 160, 230], // ASL Translator — lavender
  [ 94, 200, 170], // FinSights — teal
  [160, 190, 230], // HackAI — periwinkle
  [232, 180, 100], // MonteCore — gold
];

// Philosophy accent colors (subtle warm whites)
const PHIL_BASE   = [183, 183, 183];
const PHIL_ACCENT = [
  [210, 210, 230], // 01
  [200, 220, 210], // 02
  [225, 215, 200], // 03
  [215, 205, 225], // 04
];

function makeLerpHook(selector, getAccentColor, titleSelector, extraEffect) {
  return function useLerpHover() {
    useEffect(() => {
      const items = Array.from(document.querySelectorAll(selector));
      const state = items.map(() => ({ t: 0, target: 0 }));
      let raf;

      const tick = () => {
        raf = requestAnimationFrame(tick);
        items.forEach((el, i) => {
          const s = state[i];
          s.t += (s.target - s.t) * 0.05;
          el.style.setProperty("--hover-t", s.t);
          const title = el.querySelector(titleSelector);
          if (title) title.style.color = lerpColor(getAccentColor(i, "base"), getAccentColor(i, "accent"), s.t);
          if (extraEffect) extraEffect(el, i, s.t);
        });
      };
      tick();

      const handlers = items.map((el, i) => {
        const e = () => { state[i].target = 1; };
        const l = () => { state[i].target = 0; };
        el.addEventListener("mouseenter", e);
        el.addEventListener("mouseleave", l);
        return { el, e, l };
      });

      return () => {
        cancelAnimationFrame(raf);
        handlers.forEach(({ el, e, l }) => {
          el.removeEventListener("mouseenter", e);
          el.removeEventListener("mouseleave", l);
        });
      };
    }, []);
  };
}

const useExpHover  = makeLerpHook(".exp-item",  (i, k) => k === "base" ? EXP_BASE  : (EXP_ACCENT[i]  ?? EXP_BASE),  ".exp-role",
  (el, i, t) => {
    const btn = el.querySelector(".exp-paper-btn");
    if (!btn) return;
    const accent = EXP_ACCENT[i] ?? EXP_BASE;
    btn.style.color        = lerpColor([100, 100, 110], accent, t);
    btn.style.borderColor  = `rgba(${accent[0]},${accent[1]},${accent[2]},${(0.2 + t * 0.6).toFixed(3)})`;
  }
);
const usePhilHover = makeLerpHook(".phil-item", (i, k) => k === "base" ? PHIL_BASE : (PHIL_ACCENT[i] ?? PHIL_BASE), ".phil-body h3");

function useWorkHover() {
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll(".work-card"));
    const state = cards.map(() => ({ t: 0, tTitle: 0, target: 0 }));
    let raf;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      cards.forEach((el, i) => {
        const s = state[i];
        s.t      += (s.target - s.t)      * 0.14; // fast — bg + github
        s.tTitle += (s.target - s.tTitle) * 0.05; // slow — title, matches exp
        el.style.setProperty("--hover-t", s.t);
        const accent = WORK_ACCENT[i] ?? WORK_BASE;
        const title = el.querySelector(".work-h3");
        if (title) title.style.color = lerpColor(WORK_BASE, accent, s.tTitle);
        const link = el.querySelector(".work-github-link");
        if (link) {
          link.style.color       = lerpColor([100, 100, 110], accent, s.t);
          link.style.borderColor = `rgba(${accent[0]},${accent[1]},${accent[2]},${(0.2 + s.t * 0.6).toFixed(3)})`;
        }
      });
    };
    tick();
    const handlers = cards.map((el, i) => {
      const e = () => { state[i].target = 1; };
      const l = () => { state[i].target = 0; };
      el.addEventListener("mouseenter", e);
      el.addEventListener("mouseleave", l);
      return { el, e, l };
    });
    return () => {
      cancelAnimationFrame(raf);
      handlers.forEach(({ el, e, l }) => { el.removeEventListener("mouseenter", e); el.removeEventListener("mouseleave", l); });
    };
  }, []);
}

const STACK_COLORS = [
  [232, 168,  94], // amber
  [130, 210, 170], // green
  [120, 175, 235], // blue
  [190, 160, 230], // lavender
  [ 94, 200, 170], // teal
  [160, 190, 230], // periwinkle
  [232, 200, 100], // gold
];
const STACK_BASE = [235, 235, 235];

function useStackHover() {
  useEffect(() => {
    const words = Array.from(document.querySelectorAll(".stack-word"));
    const baseOpacity = words.map((el) => parseFloat(el.style.opacity) || 1);
    const scaleT = words.map(() => 0);
    const colorT = words.map(() => 0);
    let hoveredIdx = -1;
    let raf;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      words.forEach((el, i) => {
        const isHovered = i === hoveredIdx;
        const target = isHovered ? 1 : 0;
        scaleT[i] += (target - scaleT[i]) * 0.22;
        colorT[i] += (target - colorT[i]) * 0.30;
        const s = 1 + scaleT[i] * 0.05;
        el.style.transform = `scale(${s.toFixed(4)})`;
        const accent = STACK_COLORS[i % STACK_COLORS.length];
        el.style.color = lerpColor(STACK_BASE, accent, colorT[i]);
      });
    };
    tick();

    const handlers = words.map((el, i) => {
      const e = () => { hoveredIdx = i; };
      const l = () => { if (hoveredIdx === i) hoveredIdx = -1; };
      el.addEventListener("mouseenter", e);
      el.addEventListener("mouseleave", l);
      return { el, e, l };
    });

    return () => {
      cancelAnimationFrame(raf);
      handlers.forEach(({ el, e, l }) => {
        el.removeEventListener("mouseenter", e);
        el.removeEventListener("mouseleave", l);
      });
    };
  }, []);
}

function useActiveSection() {
  const [active, setActive] = useState("");
  useEffect(() => {
    const obs = SECTION_IDS.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const o = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActive(id); },
        { rootMargin: "-20% 0px -70% 0px" }
      );
      o.observe(el);
      return o;
    });
    return () => obs.forEach((o) => o?.disconnect());
  }, []);
  return active;
}

/* ── Variants ───────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

/* ── Page ───────────────────────────────────────────── */

export default function Page() {
  const active   = useActiveSection();
  const scrolled = useScrolled();
  useCursor();
  useNavLetterHover();
  useExpHover();
  usePhilHover();
  useWorkHover();
  useStackHover();
  const [preview, setPreview] = useState(null);
  const [sproutOpen, setSproutOpen] = useState(false);
  const [sproutOrigin, setSproutOrigin] = useState(null);

  return (
    <>
      {/* ── Nav (transparent over hero) ── */}
      <motion.nav
        className={`site-nav${scrolled ? " scrolled" : ""}`}
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.0, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="nav-brand">Dhivyesh</span>
        <div className="nav-links">
          <span className="nav-avail">Available for internships</span>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className={`nav-link${active === l.href.slice(1) ? " active" : ""}`}>
              {l.label.split("").map((ch, i) => (
                <span key={i} className="nav-letter" style={{ "--i": i }}>{ch}</span>
              ))}
            </a>
          ))}
        </div>
      </motion.nav>


      {/* ── Full-screen hero with 3D background ── */}
      <section className="hero" style={{ position: "relative" }}>
        {/* Glass fluid sim — white shimmer, behind everything */}
        <FluidSim glass />
        {/* 3D canvas fills entire hero */}
        <motion.div
          className="hero-canvas"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.8, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <BrainViz onSproutClick={(pos) => { setSproutOrigin(pos); setSproutOpen(true); }} />
        </motion.div>
        <motion.div className="ht" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.2, duration: 3, ease: [0.22,1,0.36,1] }}>
          <DallasHalftone variant="hero" />
        </motion.div>


        {/* Text overlaid at bottom */}
        <motion.div
          className="hero-content"
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          <motion.p className="hero-label" variants={fadeUp}>
            Computer Engineering @ UT Dallas
          </motion.p>
          <motion.h1 className="hero-h1" variants={fadeUp}>
            Hey, I'm Dhivyesh<br />Prithiviraj.
          </motion.h1>
          <motion.p className="hero-sub" variants={fadeUp}>
            Always building, always iterating.
          </motion.p>
          <motion.div className="hero-stats" variants={fadeUp}>
            {stats.map((s) => (
              <div className="hero-stat" key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className="scroll-cue"
          initial={{ opacity: 0 }}
          animate={{ opacity: scrolled ? 0 : 1 }}
          transition={{ delay: scrolled ? 0 : 2, duration: 0.6 }}
        >
          <span>scroll</span>
          <div className="scroll-line" />
        </motion.div>
      </section>

      {/* ── Scrollable content ── */}
      <div className="page">

        {/* ── About ── */}
        <motion.section
          className="about-section"
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.3 }}
          variants={stagger}
        >
          <motion.div className="about-text" variants={fadeUp}>
            <p className="section-label">About</p>
            <p className="about-body">
              I got into programming in high school building chatbots and automation tools, and that curiosity quickly turned into a drive to build software people actually use. At UT Dallas, I've expanded into full stack, machine learning, and cloud engineering, building production systems like a React Native app serving 300+ users at NRVE and ACM's event platform that onboarded hundreds.
            </p>
            <p className="about-body">
              I've also worked on physics informed ML models in the Reliability and Design Automation Lab and apply my CE background through Formula Racing, contributing to powertrain and system design. Outside the classroom, I'm a Marketing Lead for HackUTD and run Sprout Designs, where I've built digital experiences and branding for clients like OpTic Gaming, FaZe Clan, and the Miami Dolphins.
            </p>
            <p className="about-body">
              Across everything I build, from ASL to speech to AI systems, I focus on creating fast, scalable solutions that actually matter.
            </p>
          </motion.div>
          <motion.div className="about-photo-wrap" variants={fadeUp}>
            <img src="/images/headshot.JPG" alt="Dhivyesh Prithiviraj" className="about-photo" />
          </motion.div>
        </motion.section>

        <motion.section
          id="experience"
          className="section exp-section"
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.2 }}
          variants={stagger}
        >
          <motion.div className="ht" initial={{ opacity: 0 }} whileInView={{ opacity: 0.01 }} viewport={{ once: false }} transition={{ duration: 2.5, ease: [0.22,1,0.36,0.5] }}>
            <DallasHalftone variant="reunion" />
          </motion.div>
          <motion.p className="section-label" variants={fadeUp}>Experience</motion.p>
          <div className="exp-list">
            {experience.map((item) => (
              <motion.div className="exp-item" key={item.company} variants={fadeUp}>
                <div className="exp-top">
                  <div>
                    <p className="exp-company">{item.company}{item.location && <span className="exp-location"> · {item.location}</span>}</p>
                    <h3 className="exp-role">{item.role}</h3>
                  </div>
                  <div className="exp-top-right">
                    <span className="exp-date">{item.date}</span>
                    {item.paper && (
                      <a href={item.paper} target="_blank" rel="noopener noreferrer" className="exp-paper-btn">View Paper ↗</a>
                    )}
                  </div>
                </div>
                {item.points.length > 0 && (
                  <ul className="exp-bullets">
                    {item.points.map((pt) => <li key={pt}>{pt}</li>)}
                  </ul>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="philosophy"
          className="section"
          style={{ position: "relative", overflow: "visible" }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.2 }}
          variants={stagger}
        >
          <motion.div className="ht" initial={{ opacity: 0 }} whileInView={{ opacity: 0.032 }} viewport={{ once: false }} transition={{ duration: 2.5, ease: [0.22,1,0.36,1] }}>
            <DallasHalftone variant="bofa" />
          </motion.div>
          <motion.p className="section-label" variants={fadeUp}>Philosophy</motion.p>
          <div className="phil-list">
            {philosophy.map((item) => (
              <motion.div className="phil-item" key={item.number} variants={fadeUp}>
                <span className="phil-num">{item.number}</span>
                <div className="phil-body">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="work"
          className="section"
          style={{ position: "relative", overflow: "visible" }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.15 }}
          variants={stagger}
        >
          <motion.div className="ht" initial={{ opacity: 0 }} whileInView={{ opacity: 0.02 }} viewport={{ once: false }} transition={{ duration: 2.5, ease: [0.22,1,0.36,1] }}>
            <DallasHalftone variant="atandt" />
          </motion.div>
          <motion.p className="section-label" variants={fadeUp}>Work</motion.p>
          <div className="work-grid">
            {projects.map((p) => (
              <motion.div className="work-card" key={p.code} variants={fadeUp} style={{ "--accent": p.accent }}>
                <div className="work-card-body">
                  <div className="work-meta">
                    <span className="work-code">[{p.code}]</span>
                    <span className="work-year">{p.year}</span>
                  </div>
                  <h3 className="work-h3">{p.title}</h3>
                  <p className="work-category">{p.category}</p>
                  <p className="work-desc">{p.summary}</p>
                  <div className="work-stack">
                    {p.stack.map((t) => <span className="work-stack-item" key={t}>{t}</span>)}
                  </div>
                  {p.github && (
                    <a href={p.github} target="_blank" rel="noopener noreferrer" className="work-github-link">GitHub ↗</a>
                  )}
                </div>
                <div className="work-accent-line" />
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="section"
          style={{ position: "relative", overflow: "visible" }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.15 }}
          variants={stagger}
        >
          <motion.div className="ht" initial={{ opacity: 0.1 }} whileInView={{ opacity: 0.01 }} viewport={{ once: false }} transition={{ duration: 2.5, ease: [0.22,1,0.36,0.5] }}>
            <DallasHalftone variant="right" />
          </motion.div>
          <motion.p className="section-label" variants={fadeUp}>Stack</motion.p>
          <motion.div className="stack-cloud" variants={fadeUp}>
            {capabilities.map((c) => (
              <span key={c.label} className="stack-word" style={{ fontSize: `${c.size}px`, opacity: c.opacity, fontWeight: c.weight }}>
                {c.label}
              </span>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          id="contact"
          className="contact-section"
          style={{ position: "relative", overflow: "visible" }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.2 }}
          variants={stagger}
        >
          <motion.div className="ht" initial={{ opacity: 0.1 }} whileInView={{ opacity: 0.07 }} viewport={{ once: false }} transition={{ duration: 2.5, ease: [0.22,1,0.36,1] }}>
            <DallasHalftone variant="mirror" />
          </motion.div>
          <motion.p className="section-label" variants={fadeUp}>Contact</motion.p>
          <motion.p className="contact-copy" variants={fadeUp}>
            Open to internships, product teams, and ambitious software work. If you are building
            something thoughtful and need a developer who cares about both craft and execution,
            let&apos;s talk.
          </motion.p>
          <motion.a className="contact-email" href="mailto:dhivyeshrathi@gmail.com" variants={fadeUp}>
            dhivyeshrathi@gmail.com
          </motion.a>
          <motion.div className="contact-links" variants={fadeUp}>
            {socialLinks.map((l) => (
              <a key={l.href} href={l.href} className="slide-link" target="_blank" rel="noreferrer">
                <span>{l.label}</span>
                <span>{l.label}</span>
              </a>
            ))}
          </motion.div>
        </motion.section>

        <footer className="site-footer">
          <span>Dhivyesh Prithiviraj — {new Date().getFullYear()}</span>
          <span>Dallas, TX</span>
        </footer>

      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {preview ? (
          <motion.div className="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreview(null)}>
            <motion.div
              className="lightbox-dialog"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <button type="button" className="lightbox-close" onClick={() => setPreview(null)}>Close ✕</button>
              <img src={preview} alt="Project preview" />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <SproutOverlay isSproutOpen={sproutOpen} origin={sproutOrigin} onClose={() => setSproutOpen(false)} />
    </>
  );
}
