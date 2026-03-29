"use client";
import { useEffect, useRef } from "react";

const LOGOS = [
  "/images/logos/OpTic_Gaming_logo.png",
  "/images/logos/Atlanta_FaZe_logo.png",
  "/images/logos/nyxl.png",
  "/images/logos/miami dophins.png",
  "/images/logos/Fannie-Mae-Logo.png",
  "/images/logos/nrve.png",
  "/images/logos/hackutd.png",
  "/images/logos/acm utd.webp",
  "/images/logos/Preston-Logo.png",
  "/images/logos/faze.jpg",
];

const PX_PER_SEC = 40; // pixels per second - lower = slower

export default function LogoMarquee() {
  const trackRef = useRef(null);
  const loopWRef = useRef(0);
  const xRef = useRef(0);
  const rafRef = useRef(null);
  const lastRef = useRef(null);
  const pauseRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateLoopW = () => {
      const secondSetFirst = track.children[LOGOS.length];
      loopWRef.current = secondSetFirst instanceof HTMLElement
        ? secondSetFirst.offsetLeft
        : track.scrollWidth / 2;
    };

    updateLoopW();

    const ro = new ResizeObserver(updateLoopW);
    ro.observe(track);

    const images = Array.from(track.querySelectorAll("img"));
    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", updateLoopW);
        img.addEventListener("error", updateLoopW);
      }
    });

    const tick = (now) => {
      if (lastRef.current == null) lastRef.current = now;
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;

      if (!pauseRef.current) {
        const loopW = loopWRef.current;
        if (loopW > 0) {
          xRef.current = (xRef.current + PX_PER_SEC * dt) % loopW;
          track.style.transform = `translate3d(${-xRef.current}px, 0, 0)`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      images.forEach((img) => {
        img.removeEventListener("load", updateLoopW);
        img.removeEventListener("error", updateLoopW);
      });
    };
  }, []);

  return (
    <div
      className="lm-outer"
      onMouseEnter={() => { pauseRef.current = true; }}
      onMouseLeave={() => { pauseRef.current = false; lastRef.current = null; }}
    >
      <div ref={trackRef} className="lm-track">
        {[...LOGOS, ...LOGOS].map((src, i) => (
          <img key={i} src={src} alt="" className="lm-logo" />
        ))}
      </div>
    </div>
  );
}
