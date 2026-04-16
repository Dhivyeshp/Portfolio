"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// Last image MUST be the hero background photo; it stays on screen as the hero reveals.
const IMAGES = [
  "/images/preloader/DSC09828.JPG",
  "/images/preloader/IMG_1129.JPG",
  "/images/preloader/IMG_9323.JPG",
  "/images/halftone.png",
];

export default function Preloader({ onComplete, onHandoff }) {
  const overlayRef = useRef(null);
  const bgRef = useRef(null);
  const boxRef = useRef(null);
  const imgRefs = useRef([]);
  const labelRef = useRef(null);
  const counterRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  const onHandoffRef = useRef(onHandoff);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onHandoffRef.current = onHandoff;
  }, [onComplete, onHandoff]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const bg = bgRef.current;
    const box = boxRef.current;
    const imgs = imgRefs.current;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyOverflowX = document.body.style.overflowX;

    let tl;
    let handedOff = false;
    let started = false;
    let cleanedUp = false;
    let preloadTimer;

    const runHandoff = () => {
      if (handedOff) return;
      handedOff = true;
      onHandoffRef.current?.();
    };

    const restoreOverflow = () => {
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.overflowX = prevBodyOverflowX;
    };

    document.body.style.overflow = "hidden";
    document.body.style.overflowX = "hidden";

    const preload = IMAGES.map(
      (src) =>
        new Promise((resolve) => {
          const img = new window.Image();
          let settled = false;

          const finish = () => {
            if (settled) return;
            settled = true;
            img.onload = null;
            img.onerror = null;
            resolve();
          };

          img.onload = finish;
          img.onerror = finish;
          img.src = src;

          if (img.complete) finish();

          // Never let a slow image keep the loader frozen.
          window.setTimeout(finish, 1800);
        })
    );

    const startTimeline = () => {
      if (started || cleanedUp || !overlay || !bg || !box || imgs.length === 0) return;
      started = true;

      gsap.set(imgs, { clipPath: "inset(0 100% 0 0)", willChange: "clip-path, opacity" });
      gsap.set(labelRef.current, { opacity: 0, y: 8 });
      gsap.set(counterRef.current, { opacity: 0 });
      gsap.set(box, {
        willChange: "transform, opacity",
        force3D: true,
        transformOrigin: "50% 50%",
      });
      gsap.set(bg, { willChange: "opacity" });

      tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          gsap.set(overlay, { display: "none", pointerEvents: "none" });
          restoreOverflow();
          onCompleteRef.current?.();
        },
      });

      tl.to(labelRef.current, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.05);
      tl.to(counterRef.current, { opacity: 1, duration: 0.25 }, 0.1);

      imgs.forEach((el, i) => {
        tl.to(el, { clipPath: "inset(0 0% 0 0)", duration: 0.38 }, i === 0 ? 0.15 : "-=0.1");
        tl.add(() => {
          if (counterRef.current) {
            counterRef.current.textContent = `0${i + 1} / 0${imgs.length}`;
          }
        }, ">-0.15");
      });

      tl.to({}, { duration: 0.08 });

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const bw = box.offsetWidth;
      const bh = box.offsetHeight;
      const scale = Math.max(vw / bw, vh / bh) * 1.08;

      tl.to(box, {
        scale,
        borderRadius: 0,
        duration: 0.66,
        ease: "power4.inOut",
        willChange: "transform",
      });

      tl.add(() => runHandoff(), "-=0.18");
      tl.to(bg, { opacity: 0, duration: 0.4, ease: "power2.out" }, "-=0.1");
      tl.to([labelRef.current, counterRef.current], { opacity: 0, duration: 0.2, ease: "power2.out" }, "<");
      tl.to(box, { opacity: 0, duration: 0.35, ease: "power2.out" }, "+=0.03");
    };

    Promise.allSettled(preload).then(startTimeline);
    preloadTimer = window.setTimeout(startTimeline, 1200);

    return () => {
      cleanedUp = true;
      window.clearTimeout(preloadTimer);
      restoreOverflow();
      runHandoff();
      tl?.kill();
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        overflow: "hidden",
        pointerEvents: "all",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "18px",
      }}
    >
      <div
        ref={bgRef}
        style={{
          position: "absolute",
          inset: 0,
          background: "#040404",
          zIndex: 0,
        }}
      />

      <div
        ref={boxRef}
        style={{
          width: 300,
          height: 400,
          borderRadius: 8,
          overflow: "hidden",
          position: "relative",
          background: "#080808",
          border: "1px solid #1c1c1c",
          zIndex: 1,
          flexShrink: 0,
          contain: "paint",
          backfaceVisibility: "hidden",
        }}
      >
        {IMAGES.map((src, i) => (
          <div
            key={src}
            ref={(el) => {
              imgRefs.current[i] = el;
            }}
            style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}
          >
            <img
              src={src}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center center",
                display: "block",
                backfaceVisibility: "hidden",
                transform: "translateZ(0)",
              }}
            />
            {i === IMAGES.length - 1 && (
              <>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(4,4,4,0.84)",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to bottom, #040404 0%, rgba(4,4,4,0.78) 18%, rgba(4,4,4,0.48) 60%, rgba(4,4,4,0.9) 100%)",
                    pointerEvents: "none",
                  }}
                />
              </>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: 300,
          position: "relative",
          zIndex: 1,
        }}
      >
        <p
          ref={labelRef}
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "10px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#3a3a3a",
          }}
        >
          Dhivyesh Prithiviraj
        </p>
        <p
          ref={counterRef}
          style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "10px",
            letterSpacing: "0.1em",
            color: "#2d2d2d",
          }}
        >
          01 / 04
        </p>
      </div>
    </div>
  );
}
