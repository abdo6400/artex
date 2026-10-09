import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Lang } from "../../../../shared/types/i18n";
import { useSiteCopy } from "../../../../shared/constants/translations";

type ShowreelItem = ReturnType<typeof useSiteCopy>["showreel"]["items"][number];

function youtubeEmbedUrl(value: string) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${url.pathname.slice(1)}?autoplay=1`;
    }
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v") ?? url.pathname.split("/").pop();
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function ShowreelSection({ lang }: { lang: Lang }) {
  const copy = useSiteCopy(lang);
  const [selected, setSelected] = useState<ShowreelItem | null>(null);
  const carouselItems = [...copy.showreel.items, ...copy.showreel.items];

  useEffect(() => {
    if (!selected) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [selected]);

  const embedUrl = selected ? youtubeEmbedUrl(selected.videoUrl) : null;

  return (
    <section id="showreel" className="showreel-section section-surface">
      <div className="section-container showreel-heading">
        <div>
          <div className="section-label">{copy.showreel.label}</div>
          <div className="gold-line" />
          <h2 className="font-display">{copy.showreel.heading}</h2>
        </div>
        <p>{copy.showreel.sub}</p>
      </div>

      <div className="showreel-carousel" aria-label={copy.showreel.heading}>
        <div className="showreel-track">
          {carouselItems.map((item, index) => (
            <article className="showreel-card" key={`${item.title}-${index}`}>
              <Image
                fill
                sizes="(max-width: 700px) 82vw, 480px"
                src={item.thumbnailUrl}
                unoptimized={!item.thumbnailUrl.startsWith("/")}
                alt={item.title}
              />
              <div className="showreel-card-shade" />
              <span className="showreel-card-index">
                {String((index % copy.showreel.items.length) + 1).padStart(
                  2,
                  "0",
                )}
              </span>
              <div className="showreel-card-copy">
                <h3 className="font-display">{item.title}</h3>
                <p>{item.desc}</p>
              </div>
              <button
                type="button"
                className="showreel-play"
                onClick={() => setSelected(item)}
                aria-label={`${copy.showreel.playLabel}: ${item.title}`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="m9 7 8 5-8 5z" />
                </svg>
              </button>
            </article>
          ))}
        </div>
      </div>

      {selected && (
        <div
          className="showreel-modal"
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setSelected(null);
          }}
        >
          <div className="showreel-modal-card">
            <button
              type="button"
              className="showreel-close"
              onClick={() => setSelected(null)}
              aria-label={lang === "ar" ? "إغلاق" : "Close preview"}
            >
              ×
            </button>
            <div className="showreel-player">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title={selected.title}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : selected.videoUrl ? (
                <video
                  src={selected.videoUrl}
                  poster={selected.thumbnailUrl}
                  controls
                  autoPlay
                />
              ) : (
                <Image
                  fill
                  sizes="min(920px, 92vw)"
                  src={selected.thumbnailUrl}
                  unoptimized={!selected.thumbnailUrl.startsWith("/")}
                  alt={selected.title}
                />
              )}
            </div>
            <div className="showreel-modal-copy">
              <span className="section-label">{copy.showreel.label}</span>
              <h3 className="font-display">{selected.title}</h3>
              <p>{selected.desc}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
