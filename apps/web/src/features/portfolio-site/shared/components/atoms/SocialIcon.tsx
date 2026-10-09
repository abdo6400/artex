import type { SocialLinkType } from "@artex/contracts";

const marks: Partial<Record<SocialLinkType, string>> = {
  whatsapp: "WA",
  facebook: "f",
  instagram: "IG",
  linkedin: "in",
  youtube: "▶",
  tiktok: "♪",
  x: "X",
  behance: "Bē",
};

export function SocialIcon({ type }: { type: SocialLinkType }) {
  const mark = marks[type];
  if (mark) {
    return (
      <span className="social-icon-mark" aria-hidden="true">
        {mark}
      </span>
    );
  }

  if (type === "email") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17">
        <path
          d="M3 5h18v14H3zM3 6l9 7 9-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (type === "phone") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17">
        <path
          d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4c0 .6-.4 1-1 1A16 16 0 0 1 4 5c0-.6.4-1 1-1z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17">
      <path
        d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.7 1.8M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1.7-1.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}
