import React, { useState, useEffect, useRef } from "react";
import { Lang } from "../../../../shared/types/i18n";
import { useSiteSettings } from "../../../../shared/constants/translations";

interface HeroStatsProps {
  lang: Lang;
}

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !started.current) {
          started.current = true;
          const steps = 40;
          const increment = target / steps;
          let current = 0;
          const interval = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(interval);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

interface StatItemProps {
  num: string;
  label: string;
  target: number;
}

const StatItem: React.FC<StatItemProps> = ({ num, label, target }) => {
  const { count, ref } = useCountUp(target);
  const suffix = num.replace(/[0-9]/g, "");

  return (
    <div
      ref={ref}
      className="hero-stat"
      style={{
        padding: "20px 16px",
        textAlign: "center",
        borderRight: "1px solid rgba(212,168,75,0.18)",
      }}
    >
      <div
        className="font-display"
        style={{
          fontSize: "2rem",
          fontWeight: 800,
          color: "#d4a84b",
          lineHeight: 1,
        }}
      >
        {count}
        {suffix}
      </div>
      <div
        style={{
          fontSize: "0.7rem",
          color: "#94a3b8",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const HeroStats: React.FC<HeroStatsProps> = ({ lang }) => {
  const settings = useSiteSettings();
  const stats = settings.statistics.map((stat) => ({
    target: stat.target,
    num: String(stat.target) + stat.suffix,
    label: lang === "ar" ? stat.labelAr : stat.labelEn,
  }));

  return (
    <div
      className="hero-stats"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
        gap: 0,
        marginTop: 80,
        maxWidth: 480,
        background: "rgba(13,28,34,0.8)",
        border: "1px solid rgba(212,168,75,0.3)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.4)",
      }}
    >
      {stats.map((s) => (
        <StatItem
          key={`${s.label}-${s.target}`}
          num={s.num}
          label={s.label}
          target={s.target}
        />
      ))}
    </div>
  );
};
