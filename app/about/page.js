"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const skills = [
  { name: "Photoshop",       icon: "/images/tools/photoshop.svg" },
  { name: "VS Code",         icon: "/images/tools/vscode.svg" },
  { name: "Figma",           icon: "/images/tools/figma.svg" },
  { name: "Framer",          icon: "/images/tools/framer.svg" },
  { name: "After Effects",   icon: "/images/tools/after-effects.svg" },
  { name: "DaVinci Resolve", icon: "/images/tools/davinci-resolve.svg" },
  { name: "Eclipse IDE",     icon: "/images/tools/eclipse-ide.svg" },
  { name: "Blender",         icon: "/images/tools/blender.svg" },
  { name: "GitHub",          icon: "/images/tools/github.svg" },
  { name: "Next.js",         icon: "/images/tools/nextjs.svg" },
  { name: "Vercel",          icon: "/images/tools/vercel.svg" },
  { name: "Cursor",          icon: "/images/tools/cursor.svg" },
  { name: "Premiere Pro",    icon: "/images/tools/premiere-pro.svg" },
  { name: "Illustrator",     icon: "/images/tools/illustrator.svg" },
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
  song:   "TBH",
  artist: "PARTYNEXTDOOR",
  album:  "Now playing",
  duration: "Loop",
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

export default function AboutPage() {
  return (
    <div className="ap-root">

      {/* ── Nav ── */}
      <nav className="ap-nav">
        <Link href="/" className="ap-back">← Back</Link>
        <span className="ap-brand">Dhivyesh Prithiviraj</span>
      </nav>

      <div className="ap-topline">
        <span>Dhivyesh</span>
        <span>About Page</span>
        <span>Dallas, Texas</span>
      </div>

      {/* ── Bento ── */}
      <div className="ap-bento">

        {/* ── Photo ── */}
        <div className="ap-card ap-card--photo ap-card--sky" style={{ "--ap-delay": "0ms" }}>
          <div className="ap-photo-label">From Dallas, TX.</div>
          <img src="/images/headshot.JPG" alt="Dhivyesh Prithiviraj" className="ap-card-photo" />
          <div className="ap-photo-clock">
            <span className="ap-photo-clock-time"><LiveClock /></span>
            <span className="ap-photo-clock-tz">CST</span>
          </div>
        </div>

        {/* ── Me in brief ── */}
        <div className="ap-card ap-card--brief ap-card--paper" style={{ "--ap-delay": "70ms" }}>
          <div className="ap-brief-top">
            <p className="ap-card-tag">Computer Engineer / Designer</p>
            <div className="ap-brief-swatches">
              <span />
              <span />
            </div>
          </div>
          <h2 className="ap-brief-heading">Dhivyesh brings software, systems, and design into one lane.</h2>
          <p className="ap-brief-body">
            I build products that feel sharp in both function and presentation — from engineering-heavy apps
            to brand systems and interactive experiences that people actually remember.
          </p>
          <p className="ap-brief-body">
            Right now that spans Sprout Designs, HackUTD, and UT Dallas Formula Racing — mixing product thinking,
            implementation, and visual direction across every project I touch.
          </p>
        </div>

        {/* ── Status ── */}
        <div className="ap-card ap-card--status ap-card--paper" style={{ "--ap-delay": "140ms" }}>
          <p className="ap-card-tag">Status</p>
          <div className="ap-status-row">
            <span className="ap-status-dot" />
            <span className="ap-status-text">Open to opportunities</span>
          </div>
          <p className="ap-status-sub">Graduating May 2027</p>
        </div>

        {/* ── Education ── */}
        <div className="ap-card ap-card--edu ap-card--paper" style={{ "--ap-delay": "210ms" }}>
          <p className="ap-card-tag">Education</p>
          <p className="ap-edu-school">UT Dallas</p>
          <p className="ap-edu-degree">B.S. Computer Engineering</p>
          <p className="ap-edu-years">2022 — 2027</p>
        </div>

        {/* ── Now Playing ── */}
        <div className="ap-card ap-card--music ap-card--ink" style={{ "--ap-delay": "280ms" }}>
          <p className="ap-card-tag">Now playing</p>
          <div className="ap-music-inner">
            <div className="ap-music-cover">
              <div className="ap-music-vinyl" />
            </div>
            <div className="ap-music-info">
              <p className="ap-music-artist">{NOW_PLAYING.artist}</p>
              <p className="ap-music-song">{NOW_PLAYING.song}</p>
              <div className="ap-music-bar">
                <div className="ap-music-fill" />
              </div>
              <div className="ap-music-times">
                <span>{NOW_PLAYING.album}</span>
                <span>{NOW_PLAYING.duration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tools I love ── */}
        <div className="ap-card ap-card--tools ap-card--sky" style={{ "--ap-delay": "350ms" }}>
          <div className="ap-tools-head">
            <p className="ap-card-tag">Toolkit</p>
            <p className="ap-tools-caption">Design, code, motion, and systems.</p>
          </div>
          <p className="ap-brief-heading ap-tools-heading">Tools I keep close <sup className="ap-brief-sup">({skills.length})</sup></p>
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
        </div>

        {/* ── Fav things ── */}
        <div className="ap-card ap-card--fav ap-card--paper" style={{ "--ap-delay": "420ms" }}>
          <p className="ap-card-tag">Things I love</p>
          <div className="ap-fav-list">
            {favThings.map((f) => (
              <div className="ap-fav-item" key={f.label}>
                <span className="ap-fav-emoji">{f.emoji}</span>
                <span className="ap-fav-label">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Connect ── */}
        <div className="ap-card ap-card--connect ap-card--sky" style={{ "--ap-delay": "490ms" }}>
          <p className="ap-card-tag">Connect</p>
          <div className="ap-connect-links">
            <a href="https://github.com/dhivyeshp" target="_blank" rel="noreferrer" className="ap-connect-link">GitHub ↗</a>
            <a href="https://linkedin.com/in/dhivyeshp" target="_blank" rel="noreferrer" className="ap-connect-link">LinkedIn ↗</a>
            <a href="mailto:dhivyesh@utdallas.edu" className="ap-connect-link">Email ↗</a>
          </div>
        </div>

      </div>

      {/* ── Footer ── */}
      <div className="ap-footer">
        <Link href="/" className="ap-back">← Back to portfolio</Link>
      </div>
    </div>
  );
}
