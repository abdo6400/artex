import React, { useState } from "react";
import Image from "next/image";
import { Lang } from "../../../../shared/types/i18n";
import {
  useSiteCopy,
  useSiteSettings,
} from "../../../../shared/constants/translations";
import { useScrollHeader } from "../../hooks/useScrollHeader";
import { useActiveSection } from "../../../../shared/hooks/useScrollReveal";

interface NavbarProps {
  lang: Lang;
  onToggleLang: () => void;
  onNavigate: (id: string) => void;
}

const NAV_SECTIONS = [
  "home",
  "about",
  "services",
  "portfolio",
  "values",
  "contact",
] as const;

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  onNavigate,
}) => {
  const scrolled = useScrollHeader(60);
  const [menuOpen, setMenuOpen] = useState(false);
  const copy = useSiteCopy(lang);
  const settings = useSiteSettings();

  useActiveSection([...NAV_SECTIONS]);

  const handleScrollTo = (id: string) => {
    onNavigate(id);
    setMenuOpen(false);
  };

  return (
    <nav
      className="site-nav"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? "rgba(7,19,24,0.94)" : "rgba(7,19,24,0.8)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(212,168,75,0.18)",
        transition: "all 0.3s ease",
      }}
    >
      <div
        className="site-nav-shell"
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 72,
        }}
      >
        {/* Logo */}
        <button
          onClick={() => handleScrollTo("hero")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Image
            width={100}
            height={38}
            src={settings.logoUrl}
            unoptimized={!settings.logoUrl.startsWith("/")}
            alt="Artex Production Logo"
            className="logo-img"
            style={{ height: 38, width: "auto" }}
          />
          <div style={{ textAlign: lang === "ar" ? "right" : "left" }}>
            <div
              dir="ltr"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.3rem",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#f8fafc",
                lineHeight: 1,
              }}
            >
              ARTEX<span style={{ color: "#d4a84b" }}>.</span>
            </div>
            <div
              style={{
                fontSize: "0.58rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "#94a3b8",
                marginTop: 2,
                fontFamily:
                  lang === "ar" ? "var(--font-arabic)" : "var(--font-sans)",
              }}
            >
              {lang === "ar" ? "آرتكس برودكشن" : "PRODUCTION"}
            </div>
          </div>
        </button>

        {/* Desktop Nav */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 32 }}
          className="hidden-mobile"
        >
          {NAV_SECTIONS.map((k) => (
            <button
              key={k}
              onClick={() => handleScrollTo(k)}
              data-section={k}
              className="nav-link"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#e2e8f0",
                fontSize: "0.82rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: "inherit",
                padding: "4px 0",
              }}
            >
              {copy.nav[k as keyof typeof copy.nav]}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={onToggleLang}
            className="lang-pill"
            style={{
              background: "rgba(212,168,75,0.12)",
              border: "1px solid rgba(212,168,75,0.35)",
              color: "#e8c166",
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: "0.78rem",
              letterSpacing: "0.08em",
              fontFamily:
                lang === "ar" ? "var(--font-sans)" : "var(--font-arabic)",
              borderRadius: 2,
              transition: "all 0.2s",
            }}
          >
            {copy.nav.lang}
          </button>
          <button
            onClick={() => handleScrollTo("contact")}
            className="btn-primary hidden-mobile"
            style={{
              padding: "8px 20px",
              border: "none",
              cursor: "pointer",
              fontSize: "0.78rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              borderRadius: 2,
              fontFamily: "inherit",
              position: "relative",
              zIndex: 1,
            }}
          >
            <span style={{ position: "relative", zIndex: 1 }}>
              {copy.nav.cta}
            </span>
          </button>
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen((m) => !m)}
            className="show-mobile"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#f8fafc",
              padding: 4,
              display: "none",
            }}
            aria-label="Toggle menu"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {menuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        style={{
          background: "rgba(7,19,24,0.98)",
          borderTop: menuOpen ? "1px solid rgba(212,168,75,0.2)" : "none",
          padding: menuOpen ? "16px 24px 24px" : "0 24px",
          maxHeight: menuOpen ? "400px" : "0",
          overflow: "hidden",
          transition: "max-height 0.35s ease, padding 0.35s ease",
        }}
      >
        {NAV_SECTIONS.map((k) => (
          <button
            key={k}
            onClick={() => handleScrollTo(k)}
            style={{
              display: "block",
              width: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#e2e8f0",
              fontSize: "0.9rem",
              padding: "12px 0",
              textAlign: lang === "ar" ? "right" : "left",
              fontFamily: "inherit",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {copy.nav[k as keyof typeof copy.nav]}
          </button>
        ))}
        <button
          onClick={() => handleScrollTo("contact")}
          className="btn-primary"
          style={{
            marginTop: 16,
            padding: "10px 24px",
            border: "none",
            cursor: "pointer",
            fontSize: "0.85rem",
            borderRadius: 2,
            fontFamily: "inherit",
            position: "relative",
            zIndex: 1,
            width: "100%",
          }}
        >
          <span style={{ position: "relative", zIndex: 1 }}>
            {copy.nav.cta}
          </span>
        </button>
      </div>
    </nav>
  );
};
