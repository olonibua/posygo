import { ImageResponse } from "next/og";

import { BRAND } from "@/lib/brand";

export const alt = `${BRAND.name}: ${BRAND.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80, background: "#f5f1e0", color: "#111111" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 44, fontWeight: 700 }}>
        <div style={{ width: 44, height: 44, borderRadius: 22, background: "#f3b2af" }} />
        {BRAND.name}
      </div>
      <div style={{ display: "flex", fontSize: 76, fontWeight: 600, lineHeight: 1.05, letterSpacing: -3, maxWidth: 980 }}>{BRAND.tagline}</div>
      <div style={{ display: "flex", alignSelf: "flex-start", padding: "14px 26px", borderRadius: 40, background: "#f8e87d", fontSize: 30 }}>Store locally · Pack fast · Track every unit</div>
    </div>,
    size,
  );
}
