"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const BrainViz = dynamic(() => import("./components/BrainViz"), {
  ssr: false,
  loading: () => null,
});

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
    company: "Association for Computing Machinery",
    role: "Software Development Lead",
    date: "May 2025 — Present",
    points: [
      "Built a full-stack event platform for 200+ students.",
      "Created a matchmaking workflow that reduced team formation time by 65%.",
    ],
  },
  {
    company: "NRVE",
    role: "Software Engineering Intern / Project Manager",
    date: "Jun 2025 — Aug 2025",
    points: [
      "Shipped a React Native education app used by 300+ beta users.",
      "Designed AWS and Terraform infrastructure to support ML deployment.",
    ],
  },
  {
    company: "Mark Cuban Foundation",
    role: "Technical Ambassador and AI Program Lead",
    date: "Oct 2022 — Nov 2023",
    points: [
      "Built an Azure computer-vision web app for calorie detection.",
      "Mentored more than 1,500 students across nationwide AI programs.",
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
    code: "RCE-001", year: "2025", num: "01",
    title: "R.A.C.E.", category: "Telemetry + AI Tooling",
    summary: "Race-engineering software that turns telemetry, radio context, and strategy rules into a fast decision surface for live sessions.",
    stack: ["Next.js", "FastAPI", "Kafka", "Redis"],
    image: "/images/race1.png", accent: "rgba(232, 168, 94, 0.35)",
  },
  {
    code: "VRT-002", year: "2024", num: "02",
    title: "Vertera", category: "Analytics Platform",
    summary: "A business analytics product built around customizable dashboards, forecasting, and clear reporting for small teams.",
    stack: ["React", "Node.js", "MongoDB", "D3.js"],
    image: "/images/vertera1.png", accent: "rgba(130, 230, 170, 0.35)",
  },
  {
    code: "SSP-003", year: "2024", num: "03",
    title: "SeatSwap", category: "Travel Experience Concept",
    summary: "A flight seat-swapping experience designed for real-time availability, request flows, and quick passenger coordination.",
    stack: ["React", "TypeScript", "Express", "AWS"],
    image: "/images/seatswap1.png", accent: "rgba(100, 180, 255, 0.35)",
  },
];

const capabilities = [
  { label: "React",            size: 40, opacity: 1.0,  weight: 600 },
  { label: "Next.js",          size: 37, opacity: 0.95, weight: 600 },
  { label: "TypeScript",       size: 33, opacity: 0.9,  weight: 500 },
  { label: "Python",           size: 30, opacity: 0.85, weight: 500 },
  { label: "AWS",              size: 27, opacity: 0.80, weight: 500 },
  { label: "Node.js",          size: 24, opacity: 0.75, weight: 500 },
  { label: "Machine Learning", size: 22, opacity: 0.70, weight: 400 },
  { label: "FastAPI",          size: 21, opacity: 0.68, weight: 400 },
  { label: "React Native",     size: 20, opacity: 0.65, weight: 400 },
  { label: "Kafka",            size: 19, opacity: 0.60, weight: 400 },
  { label: "MongoDB",          size: 18, opacity: 0.57, weight: 400 },
  { label: "D3.js",            size: 18, opacity: 0.54, weight: 400 },
  { label: "Redis",            size: 17, opacity: 0.52, weight: 400 },
  { label: "Terraform",        size: 16, opacity: 0.49, weight: 400 },
  { label: "Azure",            size: 15, opacity: 0.46, weight: 400 },
  { label: "Docker",           size: 15, opacity: 0.44, weight: 400 },
  { label: "Express",          size: 14, opacity: 0.42, weight: 400 },
  { label: "CI/CD",            size: 14, opacity: 0.40, weight: 400 },
];

const socialLinks = [
  { label: "GitHub",   href: "https://github.com/Dhivyeshp" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/dhivyeshprithiviraj/" },
  { label: "Resume",   href: "/assets/Dhivyesh_Resume_SWE.pdf" },
];

/* ── Hooks ─────────────────────────────────────────── */

const SECTION_IDS = ["experience", "philosophy", "work", "contact"];

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
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
  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
  show:   { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};

/* ── Page ───────────────────────────────────────────── */

export default function Page() {
  const active   = useActiveSection();
  const scrolled = useScrolled();
  const [preview, setPreview] = useState(null);

  return (
    <>
      {/* ── Nav (transparent over hero) ── */}
      <nav className={`site-nav${scrolled ? " scrolled" : ""}`}>
        <span className="nav-brand">Dhivyesh</span>
        <div className="nav-links">
          <span className="nav-avail">Available for internships</span>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className={`nav-link${active === l.href.slice(1) ? " active" : ""}`}>
              {l.label}
            </a>
          ))}
        </div>
      </nav>

      {/* ── Full-screen hero with 3D background ── */}
      <section className="hero">
        {/* 3D canvas fills entire hero */}
        <div className="hero-canvas">
          <BrainViz />
        </div>

        {/* Text overlaid at bottom */}
        <motion.div
          className="hero-content"
          initial="hidden"
          animate="show"
          variants={stagger}
        >
          <motion.p className="hero-label" variants={fadeUp}>
            Software engineer — Dallas, TX
          </motion.p>
          <motion.h1 className="hero-h1" variants={fadeUp}>
            Building clean,<br />high-impact<br />digital products.
          </motion.h1>
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
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <span>scroll</span>
          <div className="scroll-line" />
        </motion.div>
      </section>

      {/* ── Scrollable content ── */}
      <div className="page">

        <motion.section
          id="experience"
          className="section"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.08 }}
          variants={stagger}
        >
          <motion.p className="section-label" variants={fadeUp}>Experience</motion.p>
          <div className="exp-list">
            {experience.map((item) => (
              <motion.div className="exp-item" key={item.company} variants={fadeUp}>
                <div className="exp-top">
                  <div>
                    <p className="exp-company">{item.company}</p>
                    <h3 className="exp-role">{item.role}</h3>
                  </div>
                  <span className="exp-date">{item.date}</span>
                </div>
                <ul className="exp-bullets">
                  {item.points.map((pt) => <li key={pt}>{pt}</li>)}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="philosophy"
          className="section"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.08 }}
          variants={stagger}
        >
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
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.04 }}
          variants={stagger}
        >
          <motion.p className="section-label" variants={fadeUp}>Work</motion.p>
          <div className="work-list">
            {projects.map((p) => (
              <motion.div className="work-item" key={p.code} variants={fadeUp} style={{ "--accent": p.accent }}>
                <span className="work-bg-num">{p.num}</span>
                <div className="work-meta">
                  <span className="work-code">[{p.code}]</span>
                  <span className="work-year">{p.year}</span>
                </div>
                <h3 className="work-h3">{p.title}</h3>
                <p className="work-category">{p.category}</p>
                <button type="button" className="work-img-btn" onClick={() => setPreview(p.image)}>
                  <img src={p.image} alt={p.title} />
                </button>
                <p className="work-desc">{p.summary}</p>
                <div className="work-stack">
                  {p.stack.map((t) => <span className="work-stack-item" key={t}>{t}</span>)}
                </div>
                <div className="work-accent-line" />
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="section"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.08 }}
          variants={stagger}
        >
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
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
        >
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
    </>
  );
}
