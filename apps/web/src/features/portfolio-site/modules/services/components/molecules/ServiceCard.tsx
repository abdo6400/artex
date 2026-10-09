import React, { useState } from "react";
import { ServiceIcons } from "../../../../shared/components/atoms/Icons";

interface ServiceCardProps {
  index: number;
  title: string;
  desc: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  index,
  title,
  desc,
}) => {
  const [hovered, setHovered] = useState(false);
  const IconComp = ServiceIcons[index % ServiceIcons.length];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="service-card reveal"
      style={{
        padding: "36px 32px",
        background: hovered ? "#ffffff" : "rgba(255,255,255,0.92)",
        border: `1px solid ${hovered ? "rgba(201,149,46,0.5)" : "rgba(201,149,46,0.18)"}`,
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 20px 55px rgba(201,149,46,0.16)"
          : "0 10px 30px rgba(15,23,42,0.04)",
        borderRadius: 18,
        cursor: "default",
        transitionDelay: `${index * 0.08}s`,
      }}
    >
      {/* Gradient border glow on hover */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(135deg, rgba(201,149,46,0.08) 0%, transparent 60%)",
          }}
        />
      )}

      {/* Index number watermark */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 24,
          fontFamily: "var(--font-display)",
          fontSize: "2.5rem",
          fontWeight: 900,
          color: hovered ? "rgba(201,149,46,0.22)" : "rgba(201,149,46,0.1)",
          lineHeight: 1,
          transition: "color 0.3s",
        }}
      >
        0{index + 1}
      </div>

      {/* Hexagon-shaped icon container */}
      <div
        style={{
          width: 52,
          height: 52,
          marginBottom: 20,
          background: hovered
            ? "rgba(201,149,46,0.14)"
            : "rgba(201,149,46,0.08)",
          border: `1px solid ${hovered ? "rgba(201,149,46,0.5)" : "rgba(201,149,46,0.2)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#b8861e",
          transition: "all 0.3s ease",
          boxShadow: hovered ? "0 0 20px rgba(201,149,46,0.2)" : "none",
          clipPath:
            "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
        }}
      >
        {IconComp && <IconComp />}
      </div>

      <h3
        className="font-display"
        style={{
          fontSize: "1.3rem",
          fontWeight: 700,
          color: "#0f172a",
          letterSpacing: "0.02em",
          marginBottom: 12,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: "#475569",
          fontSize: "0.88rem",
          lineHeight: 1.7,
          margin: 0,
        }}
      >
        {desc}
      </p>
    </div>
  );
};
