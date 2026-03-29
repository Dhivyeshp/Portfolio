"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// Last image MUST be the hero background photo — it stays on screen as the hero reveals
const IMAGES = [
  "/images/preloader/DSC09828.JPG",
  "/images/preloader/IMG_1129.JPG",
  "/images/preloader/IMG_9323.JPG",
  "/images/halftone.png",   // ← expands to fill viewport, becomes hero bg
];

export default function Preloader({ onComplete }) {
  const overlayRef  = useRef(null);
  const bgRef       = useRef(null);   // dark #040404 layer — fades away independently
  const boxRef      = useRef(null);   // card that expands
  const imgRefs     = useRef([]);
  const labelRef    = useRef(null);
  const counterRef  = useRef(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const bg      = bgRef.current;
    const box     = boxRef.current;
    const imgs    = imgRefs.current;

    // ── Initial states ────────────────────────────────
    gsap.set(imgs,              { clipPath: "inset(0 100% 0 0)" });
    gsap.set(labelRef.current,  { opacity: 0, y: 8 });
    gsap.set(counterRef.current,{ opacity: 0 });

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        gsap.set(overlay, { display: "none", pointerEvents: "none" });
        onComplete?.();
      },
    });

    // ── Phase 1: label + counter appear ──────────────
    tl.to(labelRef.current,   { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0.1);
    tl.to(counterRef.current, { opacity: 1, duration: 0.4 }, 0.2);

    // ── Phase 2: images clip in left→right ───────────
    imgs.forEach((el, i) => {
      tl.to(el, { clipPath: "inset(0 0% 0 0)", duration: 0.6 }, i === 0 ? 0.3 : "-=0.22");
      tl.add(() => {
        if (counterRef.current)
          counterRef.current.textContent = `0${i + 1} / 0${imgs.length}`;
      }, ">-0.25");
    });

    // ── Phase 3: expand box to fill viewport ─────────
    tl.to({}, { duration: 0.15 }); // brief hold on headshot

    const vw    = window.innerWidth;
    const vh    = window.innerHeight;
    const bw    = box.offsetWidth;
    const bh    = box.offsetHeight;
    const scale = Math.max(vw / bw, vh / bh) * 1.08;

    tl.to(box, {
      scale,
      borderRadius: 0,
      duration: 1.05,
      ease: "power4.inOut",
    });

    // ── Phase 4: dark overlay fades — image stays visible as "hero" ──
    tl.to(bg, {
      opacity: 0,
      duration: 0.55,
      ease: "power2.out",
    }, "-=0.15");

    tl.to([labelRef.current, counterRef.current], {
      opacity: 0, duration: 0.25, ease: "power2.out",
    }, "<");

    // ── Phase 6: card fades — hero background seamlessly takes over ──
    // onComplete?.() fires from the timeline's own onComplete (after this)
    tl.to(box, {
      opacity: 0,
      duration: 0.45,
      ease: "power2.out",
    }, "+=0.05");

    return () => tl.kill();
  }, []);

  return (
    <div
      ref={overlayRef}
      style={{
        position:      "fixed",
        inset:         0,
        zIndex:        99999,
        overflow:      "hidden",
        pointerEvents: "all",
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        justifyContent:"center",
        gap:           "18px",
      }}
    >
      {/* Dark background — fades out independently */}
      <div
        ref={bgRef}
        style={{
          position: "absolute",
          inset:    0,
          background:"#040404",
          zIndex:   0,
        }}
      />

      {/* Image card — expands to fill screen */}
      <div
        ref={boxRef}
        style={{
          width:        300,
          height:       400,
          borderRadius: 8,
          overflow:     "hidden",
          position:     "relative",
          background:   "#080808",
          border:       "1px solid #1c1c1c",
          zIndex:       1,
          flexShrink:   0,
        }}
      >
        {IMAGES.map((src, i) => (
          <div
            key={src}
            ref={(el) => (imgRefs.current[i] = el)}
            style={{ position: "absolute", inset: 0 }}
          >
            <img
              src={src}
              alt=""
              style={{
                width:      "100%",
                height:     "100%",
                objectFit:  "cover",
                objectPosition: "center center",
                display:    "block",
              }}
            />
          </div>
        ))}
      </div>

      {/* Bottom row — fades out when overlay does */}
      <div
        style={{
          display:         "flex",
          justifyContent:  "space-between",
          width:           300,
          position:        "relative",
          zIndex:          1,
        }}
      >
        <p
          ref={labelRef}
          style={{
            fontFamily:    "var(--font-mono, monospace)",
            fontSize:      "10px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color:         "#3a3a3a",
          }}
        >
          Dhivyesh Prithiviraj
        </p>
        <p
          ref={counterRef}
          style={{
            fontFamily:    "var(--font-mono, monospace)",
            fontSize:      "10px",
            letterSpacing: "0.1em",
            color:         "#2d2d2d",
          }}
        >
          01 / 04
        </p>
      </div>
    </div>
  );
}
