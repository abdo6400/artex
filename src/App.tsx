import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import type { Lang } from './shared/types/i18n';
import { Navbar } from './modules/navigation';
import { HeroSection } from './modules/hero';
import { AboutSection } from './modules/about';
import { ServicesSection } from './modules/services';
import { ValuesSection } from './modules/values';
import { PortfolioSection } from './modules/portfolio';
import { ClientsSection } from './modules/clients';
import { ContactSection } from './modules/contact';
import { Footer } from './modules/footer';
import { useScrollReveal } from './shared/hooks/useScrollReveal';

/* ── Single-language page ─────────────────────────── */
function LangPage() {
  const { lang } = useParams<{ lang: string }>();
  const navigate = useNavigate();
  const activeLang: Lang = lang === 'en' ? 'en' : 'ar';

  useScrollReveal();

  // Sync <html> dir attribute with active lang
  useEffect(() => {
    document.documentElement.dir = activeLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = activeLang;
  }, [activeLang]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleLang = () => {
    const next: Lang = activeLang === 'en' ? 'ar' : 'en';
    navigate(`/${next}`);
  };

  return (
    <div style={{ fontFamily: activeLang === 'ar' ? 'var(--font-arabic)' : 'var(--font-sans)' }}>
      <Navbar lang={activeLang} onToggleLang={toggleLang} onNavigate={scrollTo} />
      <HeroSection lang={activeLang} onNavigate={scrollTo} />
      <AboutSection lang={activeLang} />
      <ServicesSection lang={activeLang} />
      <PortfolioSection lang={activeLang} />
      <ValuesSection lang={activeLang} />
      <ClientsSection lang={activeLang} />
      <ContactSection lang={activeLang} />
      <Footer lang={activeLang} />
    </div>
  );
}

/* ── Root with routes ─────────────────────────────── */
export default function App() {
  return (
    <Routes>
      {/* Default: redirect / → /ar */}
      <Route path="/" element={<Navigate to="/ar" replace />} />

      {/* Language routes */}
      <Route path="/:lang" element={<LangPage />} />

      {/* Any other path → /ar */}
      <Route path="*" element={<Navigate to="/ar" replace />} />
    </Routes>
  );
}
