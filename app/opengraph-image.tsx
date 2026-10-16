import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name}, ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Deterministic "particle" dots for the background.
const dots = Array.from({ length: 140 }, (_, i) => {
  const a = i * 2.39996;
  const r = Math.sqrt(i / 140) * 250;
  return { x: 860 + Math.cos(a) * r, y: 300 + Math.sin(a) * r, s: 2 + ((i * 7) % 5), lime: i % 9 === 0 };
});

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "radial-gradient(circle at 72% 45%, #1b1f0c 0%, #0a0a0b 55%)",
          color: "#efeee9",
          position: "relative",
        }}
      >
        {dots.map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: d.x,
              top: d.y,
              width: d.s,
              height: d.s,
              borderRadius: 999,
              background: d.lime ? "#d4ff3a" : "rgba(239,238,233,0.75)",
            }}
          />
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, letterSpacing: 3, color: "#8b8b85" }}>
          <div style={{ width: 12, height: 12, borderRadius: 999, background: "#d4ff3a" }} />
          {site.availability.toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 210, fontWeight: 700, letterSpacing: -12, lineHeight: 0.85 }}>
            {site.name.toUpperCase()}
          </div>
          <div style={{ fontSize: 44, marginTop: 24, color: "#d4ff3a" }}>{site.role}</div>
          <div style={{ fontSize: 28, marginTop: 10, color: "#8b8b85", maxWidth: 760 }}>{site.intro}</div>
        </div>
      </div>
    ),
    size,
  );
}
