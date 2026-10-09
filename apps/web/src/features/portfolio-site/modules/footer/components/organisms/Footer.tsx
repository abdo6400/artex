import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Lang } from "../../../../shared/types/i18n";
import {
  useSiteCopy,
  useSiteSettings,
} from "../../../../shared/constants/translations";
import { SocialIcon } from "../../../../shared/components/atoms/SocialIcon";

interface FooterProps {
  lang: Lang;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const copy = useSiteCopy(lang);
  const settings = useSiteSettings();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      {/* Back to top */}
      <button
        onClick={scrollTop}
        className={`back-to-top ${showTop ? "visible" : ""}`}
        aria-label="Back to top"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>

      <footer
        className="site-footer"
        style={{
          padding: "48px 24px 32px",
          background: "#071318",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* Top row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 24,
              marginBottom: 32,
              paddingBottom: 32,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Logo & tagline */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Image
                width={116}
                height={44}
                src={settings.logoUrl}
                unoptimized={!settings.logoUrl.startsWith("/")}
                alt="Artex Production Logo"
                className="logo-img"
                style={{ height: 44, width: "auto" }}
              />
              <div>
                <div
                  className="footer-brand"
                  dir="ltr"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.3rem",
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    color: "#f8fafc",
                  }}
                >
                  ARTEX<span style={{ color: "#d4a84b" }}>.</span>
                </div>
                <div
                  style={{
                    fontSize: "0.6rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#94a3b8",
                    marginTop: 2,
                  }}
                >
                  {lang === "ar" ? "آرتكس برودكشن" : "PRODUCTION"}
                </div>
              </div>
            </div>

            {/* Tagline */}
            <div
              style={{
                fontSize: "0.75rem",
                color: "#d4a84b",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontFamily: "var(--font-display)",
              }}
            >
              {copy.footer.tagline}
            </div>

            {/* Social links */}
            <div className="footer-social-links">
              {settings.socialLinks
                .filter((social) => social.url)
                .map((social, index) => {
                  const isExternal = /^https?:\/\//i.test(social.url);
                  const label = lang === "ar" ? social.labelAr : social.labelEn;
                  return (
                    <a
                      key={`${social.type}-${social.url}-${index}`}
                      className="footer-social"
                      href={social.url}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noreferrer" : undefined}
                      data-social={social.type}
                      aria-label={label}
                      title={label}
                    >
                      <SocialIcon type={social.type} />
                    </a>
                  );
                })}
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "0.72rem",
                color: "#94a3b8",
                letterSpacing: "0.05em",
              }}
            >
              {copy.footer.rights.replace(
                /20\d{2}/,
                String(new Date().getFullYear()),
              )}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
