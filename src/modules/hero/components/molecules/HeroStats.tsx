import React, { useState, useEffect, useRef } from 'react';
import { Lang } from '../../../../shared/types/i18n';

interface HeroStatsProps {
  lang: Lang;
}

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
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
    }, { threshold: 0.5 });

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
  const suffix = num.replace(/[0-9]/g, '');

  return (
    <div ref={ref} style={{ padding: '20px 16px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="font-display" style={{ fontSize: '2rem', fontWeight: 800, color: '#d4a84b', lineHeight: 1 }}>
        {count}{suffix}
      </div>
      <div style={{ fontSize: '0.7rem', color: '#64748b', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>{label}</div>
    </div>
  );
};

export const HeroStats: React.FC<HeroStatsProps> = ({ lang }) => {
  const stats: Array<{ num: string; target: number; label: string }> = [
    { num: '10+', target: 10, label: lang === 'ar' ? 'سنوات خبرة' : 'Years Active' },
    { num: '200+', target: 200, label: lang === 'ar' ? 'مشروع منجز' : 'Projects Done' },
    { num: '50+', target: 50, label: lang === 'ar' ? 'عميل موثوق' : 'Trusted Clients' },
  ];

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0,
      marginTop: 80, maxWidth: 480,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(212,168,75,0.15)',
      backdropFilter: 'blur(8px)',
    }}>
      {stats.map(s => (
        <StatItem key={s.label} num={s.num} label={s.label} target={s.target} />
      ))}
    </div>
  );
};
