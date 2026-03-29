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

const PX_PER_SEC = 40; // pixels per second — lower = slower

export default function LogoMarquee() {
  const trackRef = useRef(null);
  const xRef     = useRef(0);
  const rafRef   = useRef(null);
  const lastRef  = useRef(null);
  const pauseRef = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Half the track is the "real" set — loop when we've scrolled that far
    const getHalfW = () => track.scrollWidth / 2;

    const tick = (now) => {
      if (lastRef.current == null) lastRef.current = now;
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;

      if (!pauseRef.current) {
        xRef.current += PX_PER_SEC * dt;
        const half = getHalfW();
        if (xRef.current >= half) xRef.current -= half;
        track.style.transform = `translateX(${-xRef.current}px)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
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
