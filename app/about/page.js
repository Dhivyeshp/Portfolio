"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};

const skills = [
  { name: "Figma",         icon: "/images/tools/figma.svg"   },
  { name: "Framer",        icon: "/images/tools/framer.svg"  },
  { name: "VS Code",       icon: "/images/tools/vscode.svg"  },
  { name: "Cursor",        icon: "/images/tools/cursor.svg"  },
  { name: "Next.js",       icon: "/images/tools/nextjs.svg"  },
  { name: "Vercel",        icon: "/images/tools/vercel.svg"  },
  { name: "GitHub",        icon: "/images/tools/github.svg"  },
];

const favThings = [
  { emoji: "🍳", label: "Cooking" },
  { emoji: "🏋️", label: "Working out" },
  { emoji: "🏸", label: "Badminton" },
  { emoji: "🏀", label: "Basketball" },
  { emoji: "🏎️", label: "Formula Racing" },
  { emoji: "🎨", label: "Design" },
];

const NOW_PLAYING = {
  song:   "Lady Brown",
  artist: "Nujabes, Cise Starr",
  album:  "Metaphorical Music",
  duration: "3:19",
  cover:  "/images/album.jpg",  // optional — falls back to gradient
};

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          timeZone: "America/Chicago",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return <>{time}</>;
}

// Animated equalizer bars
function Equalizer() {
  return (
    <div className="ap-eq">
      {[0,1,2,3].map((i) => (
        <div key={i} className="ap-eq-bar" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="ap-root">

      {/* ── Nav ── */}
      <nav className="ap-nav">
        <Link href="/" className="ap-back">← Back</Link>
        <span className="ap-brand">Dhivyesh Prithiviraj</span>
      </nav>

      {/* ── Bento ── */}
      <motion.div
        className="ap-bento"
        variants={stagger}
        initial="hidden"
        animate="show"
      >

        {/* ── Photo ── */}
        <motion.div className="ap-card ap-card--photo" variants={fadeUp}>
          <div className="ap-photo-label">From Dallas, TX.</div>
          <img src="/images/headshot.JPG" alt="Dhivyesh Prithiviraj" className="ap-card-photo" />
          <div className="ap-photo-clock">
            <span className="ap-photo-clock-time"><LiveClock /></span>
            <span className="ap-photo-clock-tz">CST</span>
          </div>
        </motion.div>

        {/* ── Me in brief ── */}
        <motion.div className="ap-card ap-card--brief" variants={fadeUp}>
          <h2 className="ap-brief-heading">
            Me in brief <sup className="ap-brief-sup">(6)</sup>
          </h2>
          <p className="ap-brief-body">
            I'm a Computer Engineering student at UT Dallas who builds things that feel intentional —
            software systems, production apps, and brand experiences for companies people actually know.
          </p>
          <p className="ap-brief-body">
            I run Sprout Designs — branding for OpTic Gaming, FaZe Clan, Atlanta FaZe, and the
            Miami Dolphins. Marketing Lead at HackUTD. UT Dallas Formula Racing.
          </p>
        </motion.div>

        {/* ── Status ── */}
        <motion.div className="ap-card ap-card--status" variants={fadeUp}>
          <p className="ap-card-tag">Status</p>
          <div className="ap-status-row">
            <span className="ap-status-dot" />
            <span className="ap-status-text">Open to opportunities</span>
          </div>
          <p className="ap-status-sub">Graduating May 2026</p>
        </motion.div>

        {/* ── Education ── */}
        <motion.div className="ap-card ap-card--edu" variants={fadeUp}>
          <p className="ap-card-tag">Education</p>
          <p className="ap-edu-school">UT Dallas</p>
          <p className="ap-edu-degree">B.S. Computer Engineering</p>
          <p className="ap-edu-years">2022 — 2026</p>
        </motion.div>

        {/* ── Now Playing ── */}
        <motion.div className="ap-card ap-card--music" variants={fadeUp}>
          <p className="ap-card-tag">Now playing</p>
          <div className="ap-music-inner">
            <div className="ap-music-cover">
              <div className="ap-music-vinyl" />
            </div>
            <div className="ap-music-info">
              <Equalizer />
              <p className="ap-music-artist">{NOW_PLAYING.artist}</p>
              <p className="ap-music-song">{NOW_PLAYING.song}</p>
              <div className="ap-music-bar">
                <div className="ap-music-fill" />
              </div>
              <div className="ap-music-times">
                <span>1:21</span>
                <span>{NOW_PLAYING.duration}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Tools I love ── */}
        <motion.div className="ap-card ap-card--tools" variants={fadeUp}>
          <p className="ap-brief-heading ap-tools-heading">
            Tools I love <sup className="ap-brief-sup">({skills.length})</sup>
          </p>
          <div className="ap-tools-grid">
            {skills.map((t) => (
              <div className="ap-tool-item" key={t.name}>
                <div className="ap-tool-icon">
                  <img src={t.icon} alt={t.name} onError={(e) => { e.target.style.display = "none"; }} />
                  <span className="ap-tool-fallback">{t.name[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Fav things ── */}
        <motion.div className="ap-card ap-card--fav" variants={fadeUp}>
          <p className="ap-card-tag">Things I love</p>
          <div className="ap-fav-list">
            {favThings.map((f) => (
              <div className="ap-fav-item" key={f.label}>
                <span className="ap-fav-emoji">{f.emoji}</span>
                <span className="ap-fav-label">{f.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Connect ── */}
        <motion.div className="ap-card ap-card--connect" variants={fadeUp}>
          <p className="ap-card-tag">Connect</p>
          <div className="ap-connect-links">
            <a href="https://github.com/dhivyeshp" target="_blank" rel="noreferrer" className="ap-connect-link">GitHub ↗</a>
            <a href="https://linkedin.com/in/dhivyeshp" target="_blank" rel="noreferrer" className="ap-connect-link">LinkedIn ↗</a>
            <a href="mailto:dhivyesh@utdallas.edu" className="ap-connect-link">Email ↗</a>
          </div>
        </motion.div>

      </motion.div>

      {/* ── Footer ── */}
      <div className="ap-footer">
        <Link href="/" className="ap-back">← Back to portfolio</Link>
      </div>
    </div>
  );
}
