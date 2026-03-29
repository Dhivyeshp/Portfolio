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

    // ── Preload all images before animating ──────────
    const preload = IMAGES.map(
      (src) =>
        new Promise((res) => {
          const img = new window.Image();
          img.onload = img.onerror = res;
          img.src = src;
        })
    );

    let tl;

    Promise.all(preload).then(() => {
      // ── Initial states ──────────────────────────────
      gsap.set(imgs,              { clipPath: "inset(0 100% 0 0)", willChange: "clip-path" });
      gsap.set(labelRef.current,  { opacity: 0, y: 8 });
      gsap.set(counterRef.current,{ opacity: 0 });

      tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          gsap.set(overlay, { display: "none", pointerEvents: "none" });
          onComplete?.();
        },
      });

      // ── Phase 1: label + counter appear ────────────
      tl.to(labelRef.current,   { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.05);
      tl.to(counterRef.current, { opacity: 1, duration: 0.25 }, 0.1);

      // ── Phase 2: images clip in left→right ─────────
      imgs.forEach((el, i) => {
        tl.to(el, { clipPath: "inset(0 0% 0 0)", duration: 0.38 }, i === 0 ? 0.15 : "-=0.1");
        tl.add(() => {
          if (counterRef.current)
            counterRef.current.textContent = `0${i + 1} / 0${imgs.length}`;
        }, ">-0.15");
      });

      // ── Phase 3: expand box to fill viewport ───────
      tl.to({}, { duration: 0.08 });

      const vw    = window.innerWidth;
      const vh    = window.innerHeight;
      const bw    = box.offsetWidth;
      const bh    = box.offsetHeight;
      const scale = Math.max(vw / bw, vh / bh) * 1.08;

      tl.to(box, {
        scale,
        borderRadius: 0,
        duration: 0.75,
        ease: "power4.inOut",
        willChange: "transform",
      });

      // ── Phase 4: dark overlay fades ────────────────
      tl.to(bg, { opacity: 0, duration: 0.4, ease: "power2.out" }, "-=0.1");
      tl.to([labelRef.current, counterRef.current], { opacity: 0, duration: 0.2, ease: "power2.out" }, "<");

      // ── Phase 5: card fades ─────────────────────────
      tl.to(box, { opacity: 0, duration: 0.35, ease: "power2.out" }, "+=0.03");
    });

    return () => tl?.kill();
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
