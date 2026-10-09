import React from "react";
import { Lang } from "../../../../shared/types/i18n";

interface VisionMissionCardProps {
  label: string;
  text: string;
  lang: Lang;
  icon: "vision" | "mission";
}

const VisionIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const MissionIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

export const VisionMissionCard: React.FC<VisionMissionCardProps> = ({
  label,
  text,
  lang,
  icon,
}) => (
  <div
    className="glass-card"
    style={{
      padding: "28px 32px",
      position: "relative",
      overflow: "hidden",
      borderRadius: 18,
    }}
  >
    {/* Shimmer hover overlay */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background:
          "linear-gradient(105deg, transparent 40%, rgba(212,168,75,0.05) 50%, transparent 60%)",
        backgroundSize: "200% 100%",
      }}
    />

    {/* Gold left border */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: lang === "ar" ? "auto" : 0,
        right: lang === "ar" ? 0 : "auto",
        width: 3,
        height: "100%",
        background: "linear-gradient(to bottom, #d4a84b, #22d3ee)",
      }}
    />

    {/* Icon + Label */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
      }}
    >
      <span style={{ color: "#d4a84b" }}>
        {icon === "vision" ? <VisionIcon /> : <MissionIcon />}
      </span>
      <div className="section-label">{label}</div>
    </div>
    <p
      style={{
        color: "#475569",
        lineHeight: 1.7,
        fontSize: "0.92rem",
        margin: 0,
      }}
    >
      {text}
    </p>
  </div>
);
