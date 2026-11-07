import { ImageResponse } from "next/og";
import { logoPaths, site } from "@/lib/site";

export const alt = `${site.name}: ${site.tagline} Invoicing for freelancers and small studios.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const muted = "#a1a1aa"; // zinc-400
const border = "#27272a"; // zinc-800
const surface = "#18181b"; // zinc-900

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "22px 26px",
        borderRadius: 16,
        border: `1px solid ${border}`,
        background: surface,
        width: 300,
      }}
    >
      <span style={{ fontSize: 20, color: muted }}>{label}</span>
      <span style={{ fontSize: 36, color: tone ?? "#fafafa", letterSpacing: -1 }}>{value}</span>
    </div>
  );
}

/** The social card: logo, tagline and three figures as the app shows them. */
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
          padding: 72,
          background: site.colors.background,
          backgroundImage: `radial-gradient(ellipse 70% 60% at 85% 0%, rgba(16,185,129,0.22), transparent 70%)`,
          color: "#fafafa",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <path d={logoPaths.sheet} fill={site.colors.accent} />
            <path d={logoPaths.fold} fill={site.colors.fold} />
            <path d={logoPaths.letter} fill={site.colors.background} />
          </svg>
          <span style={{ fontSize: 44, letterSpacing: -1 }}>{site.name}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <span style={{ fontSize: 84, letterSpacing: -3, lineHeight: 1 }}>{site.tagline}</span>
          <span style={{ fontSize: 32, color: muted }}>Invoicing for freelancers and small studios.</span>
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          <Stat label="Collected" value="$18,240" tone={site.colors.accent} />
          <Stat label="Outstanding" value="$6,415" />
          <Stat label="Overdue" value="$1,280" tone="#f87171" />
        </div>
      </div>
    ),
    size,
  );
}
