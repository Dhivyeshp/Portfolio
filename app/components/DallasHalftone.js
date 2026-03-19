"use client";
import { useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────
   Dallas skyline halftone — matrix cascade style.

   The Dallas skyline height profile drives dot DENSITY per
   x-column. Multiple streams per column cascade at different
   speeds. Each variant exposes a different slice + direction,
   so every section looks genuinely different.
───────────────────────────────────────────────────────── */

// Piecewise-linear Dallas skyline profile (x: 0→1, y: 0→1 height)
const SKYLINE = [
  [0.00, 0.09], [0.04, 0.14], [0.08, 0.20], [0.12, 0.24],
  [0.15, 0.32], [0.18, 0.35],
  // Reunion Tower pole + ball
  [0.195, 0.35], [0.200, 0.57], [0.204, 0.62],
  [0.212, 0.66], [0.220, 0.66], [0.228, 0.62],
  [0.232, 0.57], [0.236, 0.35],
  [0.26, 0.35], [0.30, 0.40], [0.35, 0.46],
  [0.40, 0.50], [0.43, 0.54],
  // Renaissance Tower stepped crown
  [0.465, 0.60], [0.475, 0.65], [0.485, 0.70],
  [0.493, 0.65], [0.500, 0.60],
  // Bank of America Plaza — tallest + spire
  [0.502, 0.82], [0.507, 0.82], [0.509, 0.94],
  [0.511, 1.00], [0.513, 0.94], [0.515, 0.82],
  [0.520, 0.82], [0.548, 0.70],
  // AT&T flat-top
  [0.570, 0.58], [0.600, 0.64], [0.622, 0.64], [0.640, 0.58],
  // Comerica dome
  [0.655, 0.62], [0.664, 0.66], [0.688, 0.58],
  [0.71, 0.54], [0.74, 0.48], [0.78, 0.42],
  [0.83, 0.36], [0.88, 0.30], [0.93, 0.23], [1.00, 0.17],
];

function skylineAt(x) {
  const s = SKYLINE;
  if (x <= s[0][0]) return s[0][1];
  if (x >= s[s.length - 1][0]) return s[s.length - 1][1];
  for (let i = 0; i < s.length - 1; i++) {
    if (x >= s[i][0] && x <= s[i + 1][0]) {
      const t = (x - s[i][0]) / (s[i + 1][0] - s[i][0]);
      return s[i][1] * (1 - t) + s[i + 1][1] * t;
    }
  }
  return 0.1;
}

function hash(a, b) {
  const v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return v - Math.floor(v);
}

/*
  Variant config:
    xOff    – which portion of the skyline to show (shifts the x lookup)
    xScale  – how much of the skyline to compress/stretch into canvas width
    dir     – stream direction: +1 = down, -1 = up
    speed   – base cascade speed
    streams – streams per column (more = denser, busier)
    jitter  – random positional jitter (breaks grid feel)
    heroBot – only show in bottom portion (hero mode)
*/
const VARIANTS = {
  hero:   { xOff: 0.0,  xScale:  1.0,  dir: -1, speed: 0.18, streams: 1, jitter: 8,  bandMul: 1.0, heroBot: true  },
  reunion:{ xOff: 0.10, xScale:  0.55, dir:  1, speed: 0.28, streams: 1, jitter: 12, bandMul: 1.0, heroBot: false },
  bofa:   { xOff: 0.0,  xScale:  1.0,  dir:  1, speed: 0.03, streams: 3, jitter: 1,  bandMul: 0.4, heroBot: false },
  right:  { xOff: 0.55, xScale:  0.60, dir:  1, speed: 0.15, streams: 1, jitter: 16, bandMul: 1.0, heroBot: false },
  mirror: { xOff: 0.0,  xScale: -1.0,  dir: -1, speed: 0.12, streams: 1, jitter: 10, bandMul: 1.0, heroBot: false },
  atandt: { xOff: 0.50, xScale:  0.70, dir:  1, speed: 0.35, streams: 2, jitter: 6,  bandMul: 1.0, heroBot: false },
};

export default function DallasHalftone({ variant = "bofa" }) {
  const ref      = useRef(null);
  const stateRef = useRef({ scrollY: 0, raf: null });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || typeof window === "undefined") return;

    const cfg = VARIANTS[variant] ?? VARIANTS.bofa;
    const dpr = Math.min(window.devicePixelRatio, 2);

    let W = 0, H = 0;
    const SPACING = Math.round(15 * dpr);
    const MAX_R   = SPACING * 0.30;
    const EDGE    = SPACING * 3.5;

    const resize = () => {
      W = canvas.offsetWidth  * dpr;
      H = canvas.offsetHeight * dpr;
      canvas.width  = W;
      canvas.height = H;
    };

    const draw = (ts) => {
      stateRef.current.raf = requestAnimationFrame(draw);
      if (!W || !H) return;

      const t      = ts / 1000;
      const scroll = stateRef.current.scrollY;
      const heroStart = H * 0.58;
      const ctx    = canvas.getContext("2d");
      ctx.clearRect(0, 0, W, H);

      const cols = Math.ceil(W / SPACING) + 2;
      const rows = Math.ceil(H / SPACING) + 2;

      for (let col = 0; col < cols; col++) {
        // Map column x → skyline x with xOff and xScale
        const rawX  = col / cols;
        const skyX  = cfg.xOff + rawX * (cfg.xScale > 0 ? cfg.xScale : -cfg.xScale * (1 - rawX * 2));
        const normX = ((skyX % 1) + 1) % 1;
        const bldH  = skylineAt(normX);          // 0–1

        // Skip columns where building is very short
        if (bldH < 0.11) continue;

        // Each column has `cfg.streams` independent cascade streams
        for (let s = 0; s < cfg.streams; s++) {
          const colSeed  = hash(col * 7 + s, 33);
          const colSpeed = cfg.speed * (0.6 + colSeed * 0.8);
          const phase    = hash(col + s * 31, 9);   // per-stream phase offset
          const bandW    = (0.04 + bldH * 0.09) * cfg.bandMul;

          for (let row = 0; row < rows; row++) {
            // Jitter breaks the grid feel
            const jx = (hash(col, row) - 0.5) * cfg.jitter * dpr;
            const jy = (hash(col + 100, row) - 0.5) * cfg.jitter * dpr;

            const gx = col * SPACING + SPACING / 2 + jx;
            const gy = row * SPACING + SPACING / 2 + jy
                       - (scroll * 0.03 * cfg.dir);   // parallax

            if (gx < 0 || gx > W || gy < -SPACING || gy > H + SPACING) continue;

            // Cascade position: stream moves through column over time
            const yNorm   = (row / rows + phase + t * colSpeed * cfg.dir + 1) % 1;
            // Dot is "on" if it's inside the active band for this stream
            const bandPos = (hash(col + s, row) + phase) % 1;
            const dist    = Math.abs(((yNorm - bandPos + 1.5) % 1) - 0.5);
            if (dist > bandW / 2) continue;

            // Size: building height drives max size, proximity to band center sharpens it
            const proximity = 1 - dist / (bandW / 2);
            const r = MAX_R * bldH * (0.25 + 0.75 * proximity);
            if (r < 0.5) continue;

            // Edge alpha
            const ex = Math.min(gx / EDGE, (W - gx) / EDGE, 1);
            let ey;
            if (cfg.heroBot) {
              ey = gy < heroStart
                ? 0
                : Math.min((gy - heroStart) / (H * 0.32), (H - gy) / EDGE, 1);
            } else {
              ey = Math.min(gy / EDGE, (H - gy) / EDGE, 1);
            }

            const alpha = Math.min(ex, ey);
            if (alpha < 0.01) continue;

            ctx.beginPath();
            ctx.arc(gx, gy, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200,200,200,${alpha.toFixed(3)})`;
            ctx.fill();
          }
        }
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onScroll = () => { stateRef.current.scrollY = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    stateRef.current.raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(stateRef.current.raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [variant]);

  return <canvas ref={ref} style={{ display: "block", width: "100%", height: "100%" }} />;
}
