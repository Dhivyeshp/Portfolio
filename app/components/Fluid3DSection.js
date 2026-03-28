"use client";
import dynamic from "next/dynamic";

const Fluid3D = dynamic(() => import("./Fluid3D"), {
  ssr: false,
  loading: () => (
    <div style={{ height: 420, display: "flex", alignItems: "center", justifyContent: "center", color: "#444" }}>
      Loading simulation…
    </div>
  ),
});

export default function Fluid3DSection() {
  return (
    <section
      id="fluid3d"
      style={{
        width: "100%",
        maxWidth: 900,
        margin: "0 auto",
        padding: "64px 24px 80px",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#666", margin: 0 }}>
          Experiment
        </p>
        <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", fontWeight: 600, color: "#e8e8e8", margin: 0, lineHeight: 1.2 }}>
          3-D Fluid Simulation
        </h2>
        <p style={{ fontSize: 14, color: "#555", margin: 0, maxWidth: 560, lineHeight: 1.6 }}>
          Real-time particle-based simulation using WebGL2. The solver is a GPU-friendly PIC/FLIP
          hybrid on a staggered MAC grid with iterative pressure projection. Particles are rendered
          as sphere impostors with spherical ambient occlusion volumes and depth-corrected normals.
          Click and drag to disturb the fluid.
        </p>
      </div>

      {/* Canvas container */}
      <div style={{
        width: "100%",
        background: "#080a0d",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.5)",
      }}>
        <Fluid3D />
      </div>

      {/* Tech tags */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["WebGL2", "PIC/FLIP", "Sphere Impostors", "Spherical AO", "Instanced Rendering"].map(tag => (
          <span key={tag} style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.08em",
            padding: "4px 10px",
            borderRadius: 4,
            background: "rgba(255,255,255,0.05)",
            color: "#666",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}
