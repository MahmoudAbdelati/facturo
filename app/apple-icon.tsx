import { ImageResponse } from "next/og";
import { logoPaths, site } from "@/lib/site";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the logo mark on a solid tile (iOS adds its own rounded mask). */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: site.colors.background,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32">
          <path d={logoPaths.sheet} fill={site.colors.accent} />
          <path d={logoPaths.fold} fill={site.colors.fold} />
          <path d={logoPaths.letter} fill={site.colors.background} />
        </svg>
      </div>
    ),
    size,
  );
}
