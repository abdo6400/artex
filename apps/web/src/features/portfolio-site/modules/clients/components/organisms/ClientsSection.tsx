import React from "react";
import { Lang } from "../../../../shared/types/i18n";
import { useSiteCopy } from "../../../../shared/constants/translations";
import { useSiteSettings } from "../../../../shared/constants/translations";

interface ClientsSectionProps {
  lang: Lang;
}

export const ClientsSection: React.FC<ClientsSectionProps> = ({ lang }) => {
  const copy = useSiteCopy(lang);
  const { clientNames } = useSiteSettings();
  const doubled = [...clientNames, ...clientNames];

  return (
    <section
      className="clients-surface"
      style={{
        padding: "64px 0",
        background: "#f8f4ec",
        borderTop: "1px solid rgba(201,149,46,0.12)",
        borderBottom: "1px solid rgba(201,149,46,0.12)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          marginBottom: 40,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="section-label" style={{ marginBottom: 8 }}>
            {copy.clients.label}
          </div>
          <h3
            className="font-display"
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: "#0f172a",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {copy.clients.heading}
          </h3>
        </div>
      </div>

      {/* Row 1 — left to right */}
      <div
        style={{ position: "relative", overflow: "hidden", marginBottom: 16 }}
      >
        <div
          className="animate-marquee"
          style={{ display: "flex", gap: 12, width: "max-content" }}
        >
          {doubled.map((c, i) => (
            <div
              key={`row1-${i}`}
              className="client-chip"
              style={{
                padding: "10px 20px",
                flexShrink: 0,
                background: "#ffffff",
                border: "1px solid rgba(201,149,46,0.22)",
                borderRadius: 100,
                color: "#334155",
                fontSize: "0.82rem",
                fontFamily: "var(--font-display)",
                letterSpacing: "0.1em",
                fontWeight: 600,
                textTransform: "uppercase",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                boxShadow: "0 4px 15px rgba(15,23,42,0.04)",
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 — right to left */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div
          className="animate-marquee-reverse"
          style={{ display: "flex", gap: 12, width: "max-content" }}
        >
          {[...doubled].reverse().map((c, i) => (
            <div
              key={`row2-${i}`}
              className="client-chip"
              style={{
                padding: "10px 20px",
                flexShrink: 0,
                background: "#ffffff",
                border: "1px solid rgba(201,149,46,0.22)",
                borderRadius: 100,
                color: "#334155",
                fontSize: "0.82rem",
                fontFamily: "var(--font-display)",
                letterSpacing: "0.1em",
                fontWeight: 600,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 15px rgba(15,23,42,0.04)",
              }}
            >
              {c}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
