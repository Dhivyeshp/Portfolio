"use client";
import { useEffect, useState } from "react";

const clients = ["OpTic Gaming", "FaZe Clan", "Atlanta FaZe", "Miami Dolphins"];

export default function SproutPage({ open, onClose }) {
  const [phase, setPhase] = useState("idle"); // idle | entering | open | exiting

  useEffect(() => {
    if (open && phase === "idle") {
      document.body.classList.add("sprout-open");
      setPhase("entering");
      setTimeout(() => setPhase("open"), 850);
    }
    if (!open && phase === "open") {
      setPhase("exiting");
      setTimeout(() => {
        setPhase("idle");
        document.body.classList.remove("sprout-open");
      }, 850);
    }
  }, [open]);

  // Safety cleanup if component unmounts while open
  useEffect(() => {
    return () => document.body.classList.remove("sprout-open");
  }, []);

  // Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && phase === "open") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, onClose]);

  if (phase === "idle") return null;

  return (
    <>
      {/* Mask overlay — only present during transitions, key forces remount */}
      {(phase === "entering" || phase === "exiting") && (
        <div
          key={phase}
          className={`sprout-overlay ${phase === "exiting" ? "sprout-overlay-out" : "sprout-overlay-in"}`}
        />
      )}

      {/* Solid content page — no mask, always visible when open */}
      {phase === "open" && (
        <div className="sprout-page">
          <button className="sprout-close" onClick={onClose}>✕</button>
          <div className="sprout-inner">
            <p className="sprout-label">Studio</p>
            <h1 className="sprout-title">Sprout Designs</h1>
            <div className="sprout-clients">
              {clients.map((c) => (
                <span key={c} className="sprout-client">{c}</span>
              ))}
            </div>
            <p className="sprout-copy">
              Design and engineering studio building digital experiences, branding systems,
              and motion for esports and sports organizations. Work spans web, 3D, and
              campaign assets used at scale.
            </p>
            <ul className="sprout-bullets">
              <li>Delivered high-performance visual systems across multiple teams and campaigns</li>
              <li>Built and managed a creative and development pipeline end-to-end</li>
              <li>Blended design, motion, and engineering into production-ready outputs</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
