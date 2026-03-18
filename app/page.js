"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const navItems = [
  { label: "Projects", href: "#projects" },
  { label: "Expertise", href: "#expertise" },
  { label: "Contact", href: "#contact" }
];

const stats = [
  { value: "14+", label: "products shipped" },
  { value: "300+", label: "beta users supported" },
  { value: "1,500+", label: "students mentored" }
];

const projects = [
  {
    title: "R.A.C.E.",
    category: "Telemetry + AI Tooling",
    year: "2025",
    summary:
      "Race-engineering software that turns telemetry, radio context, and strategy rules into a fast decision surface for live sessions.",
    impact: "Connected live data streams, alert logic, and a clearer race-day interface for faster decisions.",
    stack: ["Next.js", "FastAPI", "Kafka", "Redis"],
    image: "/images/race1.png"
  },
  {
    title: "Vertera",
    category: "Analytics Platform",
    year: "2024",
    summary:
      "A business analytics product built around customizable dashboards, forecasting, and clear reporting for small teams.",
    impact: "Made reporting easier to read and act on with stronger data visualization and product structure.",
    stack: ["React", "Node.js", "MongoDB", "D3.js"],
    image: "/images/vertera1.png"
  },
  {
    title: "SeatSwap",
    category: "Travel Experience Concept",
    year: "2024",
    summary:
      "A flight seat-swapping experience designed for real-time availability, request flows, and quick passenger coordination.",
    impact: "Focused on speed, clarity, and trust in a time-sensitive interaction with many moving states.",
    stack: ["React", "TypeScript", "Express", "AWS"],
    image: "/images/seatswap1.png"
  }
];

const capabilities = [
  "Frontend systems",
  "Interaction design",
  "Backend APIs",
  "Cloud infrastructure",
  "Machine learning",
  "Data pipelines",
  "Mobile development",
  "CI/CD"
];

const experience = [
  {
    logo: "/images/acm.png",
    company: "Association for Computing Machinery",
    role: "Software Development Lead",
    date: "May 2025 - Present",
    points: [
      "Built a full-stack event platform for 200+ students.",
      "Created a matchmaking workflow that reduced team formation time by 65%."
    ]
  },
  {
    logo: "/images/nrve.png",
    company: "NRVE",
    role: "Software Engineering Intern / Project Manager",
    date: "June 2025 - August 2025",
    points: [
      "Shipped a React Native education app used by 300+ beta users.",
      "Designed AWS and Terraform infrastructure to support ML deployment."
    ]
  },
  {
    logo: "/images/mcf.jpg",
    company: "Mark Cuban Foundation",
    role: "Technical Ambassador and AI Program Lead",
    date: "October 2022 - November 2023",
    points: [
      "Built an Azure computer-vision web app for calorie detection.",
      "Mentored more than 1,500 students across nationwide AI programs."
    ]
  }
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com/Dhivyeshp" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/dhivyeshprithiviraj/" },
  { label: "Resume", href: "/assets/Dhivyesh_Resume_SWE.pdf" },
  { label: "Email", href: "mailto:dhivyeshrathi@gmail.com" }
];

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.04
    }
  }
};

const reveal = {
  hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

function SectionIntro({ label, title, body }) {
  return (
    <motion.div className="section-intro" variants={reveal}>
      <span className="eyebrow">{label}</span>
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
    </motion.div>
  );
}

function ProjectCard({ project, onOpen }) {
  return (
    <motion.article className="project-card" variants={reveal}>
      <button type="button" className="project-card-media" onClick={() => onOpen(project.image)}>
        <img src={project.image} alt={project.title} />
      </button>
      <div className="project-card-body">
        <div className="project-kicker-row">
          <span className="eyebrow">{project.category}</span>
          <span className="project-year">{project.year}</span>
        </div>
        <h3>{project.title}</h3>
        <p>{project.summary}</p>
        <div className="tag-row">
          {project.stack.map((item) => (
            <span key={item} className="tag">{item}</span>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

export default function Page() {
  const [preview, setPreview] = useState(null);

  return (
    <>
      <main className="page-shell">
        <motion.header className="site-header" initial="hidden" animate="show" variants={container}>
          <motion.a href="#hero" className="brand-mark" variants={reveal}>
            <span className="brand-dot" />
            <span>
              <strong>Dhivyesh</strong>
              <small>Software engineer</small>
            </span>
          </motion.a>

          <motion.nav className="site-nav" variants={reveal}>
            {navItems.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </motion.nav>

          <motion.a
            className="header-cta"
            href="/assets/Dhivyesh_Resume_SWE.pdf"
            target="_blank"
            rel="noreferrer"
            variants={reveal}
          >
            Resume
          </motion.a>
        </motion.header>

        <section className="hero-panel" id="hero">
          <motion.div className="hero-grid" initial="hidden" animate="show" variants={container}>
            <motion.div className="hero-copy" variants={reveal}>
              <span className="eyebrow">Software engineer based in Dallas</span>
              <h1>
                Building clean,
                <br />
                high-impact digital
                <br />
                products.
              </h1>
              <p className="hero-summary">
                I design and build thoughtful software across product engineering, data systems, and ML-backed
                experiences with a strong focus on clarity, speed, and polish.
              </p>
              <div className="hero-actions">
                <a className="button-primary" href="#projects">
                  View projects
                </a>
                <a className="button-secondary" href="#contact">
                  Get in touch
                </a>
              </div>
            </motion.div>

            <motion.aside className="hero-rail" variants={reveal}>
              <div className="hero-portrait-card">
                <img src="/images/headshot.JPG" alt="Dhivyesh Prithiviraj" />
              </div>
              <div className="hero-note-card">
                <span className="eyebrow">Available for internships</span>
                <p>
                  Open to software engineering roles where product thinking, interface quality, and strong systems work
                  all matter.
                </p>
              </div>
              <div className="hero-stats-card">
                {stats.map((item) => (
                  <div key={item.label} className="stat-row">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.aside>
          </motion.div>
        </section>

        <motion.section
          className="content-panel"
          id="projects"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
          variants={container}
        >
          <SectionIntro
            label="Selected work"
            title="A fuller case-study style section with stronger hierarchy, larger visuals, and clearer project framing."
            body="Each project gets more room to breathe so the page feels closer to a premium portfolio template rather than a compact card grid."
          />

          <div className="project-grid">
            {projects.map((project) => (
              <ProjectCard key={project.title} project={project} onOpen={setPreview} />
            ))}
          </div>
        </motion.section>

        <motion.section
          className="content-panel expertise-panel"
          id="expertise"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
          variants={container}
        >
          <div className="expertise-copy-column">
            <SectionIntro
              label="Expertise"
              title="Product-minded engineering shaped by interaction quality, technical depth, and clean execution."
              body="I like work that connects design taste with reliable engineering, from frontend systems and APIs to infrastructure and ML-powered product features."
            />

            <motion.div className="capability-panel" variants={reveal}>
              {capabilities.map((item) => (
                <span key={item} className="tag soft-tag">
                  {item}
                </span>
              ))}
            </motion.div>
          </div>

          <motion.div className="experience-column" variants={container}>
            {experience.map((item) => (
              <motion.article className="experience-panel" key={item.company} variants={reveal}>
                <div className="experience-header">
                  <img src={item.logo} alt={item.company} className="experience-logo" />
                  <div>
                    <span className="eyebrow">{item.company}</span>
                    <h3>{item.role}</h3>
                    <p>{item.date}</p>
                  </div>
                </div>
                <ul>
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </motion.article>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          className="contact-panel"
          id="contact"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.22 }}
          variants={container}
        >
          <motion.div className="contact-copy" variants={reveal}>
            <span className="eyebrow">Contact</span>
            <h2>Open to internships, product teams, and ambitious software work.</h2>
            <p>
              If you are building something thoughtful and need a developer who cares about both craft and execution,
              let&apos;s talk.
            </p>
          </motion.div>

          <motion.div className="contact-links" variants={reveal}>
            {socialLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target={item.href.startsWith("http") || item.href.endsWith(".pdf") ? "_blank" : undefined}
                rel="noreferrer"
              >
                {item.label}
              </a>
            ))}
          </motion.div>
        </motion.section>
      </main>

      <AnimatePresence>
        {preview ? (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreview(null)}
          >
            <motion.div
              className="lightbox-dialog"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.99 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              onClick={(event) => event.stopPropagation()}
            >
              <button type="button" className="lightbox-close" onClick={() => setPreview(null)}>
                Close preview
              </button>
              <img src={preview} alt="Project preview" />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
