import { useEffect, useRef } from "react";

export function useScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("reveal-pending");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    const elements = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right",
    );
    elements.forEach((el) => {
      el.classList.add("reveal-pending");
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
      elements.forEach((el) => el.classList.remove("reveal-pending"));
    };
  }, []);
}

export function useActiveSection(sectionIds: string[]) {
  const activeRef = useRef<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            activeRef.current = entry.target.id;
            document.querySelectorAll(".nav-link").forEach((link) => {
              link.classList.remove("active");
              if (link.getAttribute("data-section") === entry.target.id) {
                link.classList.add("active");
              }
            });
          }
        });
      },
      { threshold: 0.3 },
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  return activeRef;
}
