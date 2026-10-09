import { ImageResponse } from "next/og";

export const alt = "Artex Production — Go Beyond Your Space";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        color: "#f8fafc",
        background:
          "radial-gradient(circle at 88% 14%, rgba(34,211,238,.18), transparent 28%), linear-gradient(135deg, #071115, #10262e)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 74,
            height: 74,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 18,
            background: "#e0b557",
            color: "#102027",
            fontSize: 42,
            fontWeight: 800,
          }}
        >
          A
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: ".16em" }}>
          ARTEX PRODUCTION
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ color: "#e0b557", fontSize: 22, letterSpacing: ".18em" }}>
          EXHIBITIONS · EVENTS · RETAIL
        </div>
        <div
          style={{
            maxWidth: 930,
            fontSize: 82,
            lineHeight: 1,
            fontWeight: 800,
          }}
        >
          Go beyond your space.
        </div>
        <div style={{ color: "#a9bbc3", fontSize: 28 }}>
          Design and production built for memorable brand experiences.
        </div>
      </div>
    </div>,
    size,
  );
}
