"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCopy } from "@/features/dashboard/i18n/copy";
import { useToast } from "@/features/dashboard/shell/toast";
import { Icon } from "@/features/dashboard/shell/icons";
import { Dropzone } from "@/features/dashboard/media/dropzone";
import { previewUrl } from "@/features/dashboard/media/preview-url";
import type { SiteSectionId } from "./types";
import {
  adminSiteResponseSchema,
  type SiteContent,
  type SocialLinkType,
  defaultSiteTheme,
  type SiteTheme,
} from "@artex/contracts";

const socialTypeOptions: Array<{
  value: SocialLinkType;
  label: string;
}> = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "x", label: "X / Twitter" },
  { value: "behance", label: "Behance" },
  { value: "website", label: "Website" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "other", label: "Other" },
];

const themePresets: Array<{
  id: string;
  nameAr: string;
  nameEn: string;
  theme: SiteTheme;
}> = [
  {
    id: "signature",
    nameAr: "الذهبي الكلاسيكي (الافتراضي)",
    nameEn: "Artex Signature Gold",
    theme: defaultSiteTheme,
  },
  {
    id: "emerald",
    nameAr: "الزمرد الفاخر",
    nameEn: "Emerald Luxury",
    theme: {
      primary: "#10b981",
      brandNavy: "#062e24",
      background: "#f0fdf4",
      accent: "#059669",
      foreground: "#064e3b",
    },
  },
  {
    id: "sapphire",
    nameAr: "الياقوت الأزرق",
    nameEn: "Midnight Sapphire",
    theme: {
      primary: "#3b82f6",
      brandNavy: "#0b132b",
      background: "#f0f5ff",
      accent: "#6366f1",
      foreground: "#1c2541",
    },
  },
  {
    id: "ruby",
    nameAr: "العقيق الملكي",
    nameEn: "Royal Ruby",
    theme: {
      primary: "#e11d48",
      brandNavy: "#1c1917",
      background: "#fff1f2",
      accent: "#be123c",
      foreground: "#292524",
    },
  },
  {
    id: "amber",
    nameAr: "العنبر الدافئ",
    nameEn: "Warm Amber",
    theme: {
      primary: "#d97706",
      brandNavy: "#1c1512",
      background: "#fdfaf6",
      accent: "#b45309",
      foreground: "#261e1b",
    },
  },
  {
    id: "slate",
    nameAr: "الرمادي العصري",
    nameEn: "Modern Slate",
    theme: {
      primary: "#0ea5e9",
      brandNavy: "#0f172a",
      background: "#f8fafc",
      accent: "#38bdf8",
      foreground: "#0f172a",
    },
  },
];

const colorControls: Array<{
  key: keyof SiteTheme;
  labelAr: string;
  labelEn: string;
  descAr: string;
  descEn: string;
}> = [
  {
    key: "primary",
    labelAr: "اللون الرئيسي (Primary)",
    labelEn: "Primary Color",
    descAr: "الأزرار الرئيسية، التدرج اللامع للكلمات، والحدود النشطة",
    descEn: "Buttons, gradient headlines, and active badges",
  },
  {
    key: "brandNavy",
    labelAr: "اللون الداكن (Brand Dark)",
    labelEn: "Brand Dark / Navy",
    descAr: "شريط التنقل (النافبار)، قسم الهيرو، والفوتر",
    descEn: "Navbar, hero background, and footer",
  },
  {
    key: "background",
    labelAr: "خلفية الموقع (Background)",
    labelEn: "Page Background",
    descAr: "الخلفية الفاتحة العامة لكافة صفحات وأقسام الموقع",
    descEn: "Main light background for the public pages",
  },
  {
    key: "accent",
    labelAr: "لون التمييز الثانوي (Accent)",
    labelEn: "Accent Color",
    descAr: "الشارات الصغيرة، التوهج الثانوي، وتفاصيل التدرج",
    descEn: "Pill badges, secondary glow, and accents",
  },
  {
    key: "foreground",
    labelAr: "لون النصوص (Text / Foreground)",
    labelEn: "Text & Headings",
    descAr: "العناوين الرئيسية وكافة نصوص المحتوى",
    descEn: "Headings, titles, and body content",
  },
];

export function SiteEditor({
  activeSection,
}: {
  activeSection: SiteSectionId;
}) {
  const { copy, lang } = useCopy();
  const { notify } = useToast();

  const [content, setContent] = useState<SiteContent | null>(null);
  const [version, setVersion] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // New item inputs
  const [newClientInput, setNewClientInput] = useState("");
  const [newPhoneInput, setNewPhoneInput] = useState("");

  useEffect(() => {
    let active = true;
    async function loadInitial() {
      try {
        const res = await fetch("/api/admin/site");
        const body = await res.json().catch(() => null);
        const parsed = adminSiteResponseSchema.safeParse(body);
        if (!res.ok || !parsed.success) {
          throw new Error(copy.site.loadFailed);
        }
        if (active) {
          setContent(parsed.data.data.content);
          setVersion(parsed.data.data.version);
        }
      } catch (err) {
        if (active) {
          notify(
            err instanceof Error ? err.message : copy.site.loadFailed,
            "error",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadInitial();
    return () => {
      active = false;
    };
  }, [copy.site.loadFailed, notify]);

  function updateContent(updater: (prev: SiteContent) => SiteContent) {
    setContent((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      setHasChanges(true);
      return next;
    });
  }

  function updateShowreelMedia(
    index: number,
    field: "thumbnailUrl" | "videoUrl",
    value: string,
  ) {
    updateContent((prev) => {
      const arItems = [...prev.ar.showreel.items];
      const enItems = [...prev.en.showreel.items];
      arItems[index] = { ...arItems[index]!, [field]: value };
      enItems[index] = { ...enItems[index]!, [field]: value };
      return {
        ...prev,
        ar: {
          ...prev.ar,
          showreel: { ...prev.ar.showreel, items: arItems },
        },
        en: {
          ...prev.en,
          showreel: { ...prev.en.showreel, items: enItems },
        },
      };
    });
  }

  async function handleSave(publish: boolean) {
    if (!content) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content, version, publish }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.title || copy.site.saveFailed);
      }
      const parsed = adminSiteResponseSchema.parse(await res.json());
      setVersion(parsed.data.version);
      setHasChanges(false);
      notify(publish ? copy.site.published : copy.site.draftSaved, "success");
    } catch (err) {
      notify(
        err instanceof Error ? err.message : copy.site.saveFailed,
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="panel loading-panel">
        <Icon name="sparkle" size={28} />
        <p>{copy.common.loading}</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="panel empty-state-box">
        <Icon name="alert" size={32} />
        <p>{copy.site.notSeeded}</p>
      </div>
    );
  }

  return (
    <div className="site-editor-container">
      {/* Sticky Unsaved Notice */}
      {hasChanges && (
        <div className="unsaved-sticky-banner">
          <div className="unsaved-info">
            <span className="pulsing-dot" />
            <strong>{copy.site.unsaved}</strong>
          </div>
          <div className="unsaved-actions">
            <button
              type="button"
              className="btn-secondary"
              disabled={saving}
              onClick={() => handleSave(false)}
            >
              {saving ? copy.common.saving : copy.site.saveDraft}
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={saving}
              onClick={() => handleSave(true)}
            >
              {saving ? copy.common.saving : copy.site.publish}
            </button>
          </div>
        </div>
      )}

      <div className="site-editor-card panel">
        {/* SECTION: HERO */}
        {activeSection === "hero" && (
          <section className="section-form-stack">
            <header className="section-header">
              <h3>{copy.site.sections.hero}</h3>
              <p>العنوان الرئيسي، الشعار، والصورة الترويجية للواجهة.</p>
            </header>

            <div className="grid-2-col">
              {/* Arabic */}
              <div className="lang-field-card" dir="rtl">
                <span className="lang-tag">العربية</span>
                <label>
                  <span>العنوان الرئيسي</span>
                  <input
                    value={content.ar.hero.headline}
                    onChange={(e) =>
                      updateContent((prev) => ({
                        ...prev,
                        ar: {
                          ...prev.ar,
                          hero: { ...prev.ar.hero, headline: e.target.value },
                        },
                      }))
                    }
                  />
                </label>
                <label>
                  <span>الشعار الفرعي (Tagline)</span>
                  <input
                    value={content.ar.hero.tagline}
                    onChange={(e) =>
                      updateContent((prev) => ({
                        ...prev,
                        ar: {
                          ...prev.ar,
                          hero: { ...prev.ar.hero, tagline: e.target.value },
                        },
                      }))
                    }
                  />
                </label>
                <label>
                  <span>الوصف (Subtitle)</span>
                  <textarea
                    rows={3}
                    value={content.ar.hero.sub}
                    onChange={(e) =>
                      updateContent((prev) => ({
                        ...prev,
                        ar: {
                          ...prev.ar,
                          hero: { ...prev.ar.hero, sub: e.target.value },
                        },
                      }))
                    }
                  />
                </label>
                <div className="grid-2-col">
                  <label>
                    <span>زر 1</span>
                    <input
                      value={content.ar.hero.cta1}
                      onChange={(e) =>
                        updateContent((prev) => ({
                          ...prev,
                          ar: {
                            ...prev.ar,
                            hero: { ...prev.ar.hero, cta1: e.target.value },
                          },
                        }))
                      }
                    />
                  </label>
                  <label>
                    <span>زر 2</span>
                    <input
                      value={content.ar.hero.cta2}
                      onChange={(e) =>
                        updateContent((prev) => ({
                          ...prev,
                          ar: {
                            ...prev.ar,
                            hero: { ...prev.ar.hero, cta2: e.target.value },
                          },
                        }))
                      }
                    />
                  </label>
                </div>
              </div>

              {/* English */}
              <div className="lang-field-card" dir="ltr">
                <span className="lang-tag">English</span>
                <label>
                  <span>Headline</span>
                  <input
                    value={content.en.hero.headline}
                    onChange={(e) =>
                      updateContent((prev) => ({
                        ...prev,
                        en: {
                          ...prev.en,
                          hero: { ...prev.en.hero, headline: e.target.value },
                        },
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Tagline</span>
                  <input
                    value={content.en.hero.tagline}
                    onChange={(e) =>
                      updateContent((prev) => ({
                        ...prev,
                        en: {
                          ...prev.en,
                          hero: { ...prev.en.hero, tagline: e.target.value },
                        },
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Sub</span>
                  <textarea
                    rows={3}
                    value={content.en.hero.sub}
                    onChange={(e) =>
                      updateContent((prev) => ({
                        ...prev,
                        en: {
                          ...prev.en,
                          hero: { ...prev.en.hero, sub: e.target.value },
                        },
                      }))
                    }
                  />
                </label>
                <div className="grid-2-col">
                  <label>
                    <span>Button 1</span>
                    <input
                      value={content.en.hero.cta1}
                      onChange={(e) =>
                        updateContent((prev) => ({
                          ...prev,
                          en: {
                            ...prev.en,
                            hero: { ...prev.en.hero, cta1: e.target.value },
                          },
                        }))
                      }
                    />
                  </label>
                  <label>
                    <span>Button 2</span>
                    <input
                      value={content.en.hero.cta2}
                      onChange={(e) =>
                        updateContent((prev) => ({
                          ...prev,
                          en: {
                            ...prev.en,
                            hero: { ...prev.en.hero, cta2: e.target.value },
                          },
                        }))
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="field-group">
              <label>
                <span>صورة خلفية الواجهة (Hero Image)</span>
              </label>
              <Dropzone
                value={content.settings.heroImageUrl}
                allowUrl
                onUploaded={(url) =>
                  updateContent((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, heroImageUrl: url },
                  }))
                }
                onUrlChange={(url) =>
                  updateContent((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, heroImageUrl: url },
                  }))
                }
              />
            </div>
          </section>
        )}

        {/* SECTION: SERVICES */}
        {activeSection === "services" && (
          <section className="section-form-stack">
            <header className="section-header flex-header">
              <div>
                <h3>{copy.site.sections.services}</h3>
                <p>خدمات الشركة التي تظهر في الصفحة الرئيسية.</p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  updateContent((prev) => ({
                    ...prev,
                    ar: {
                      ...prev.ar,
                      services: {
                        ...prev.ar.services,
                        items: [
                          ...prev.ar.services.items,
                          { title: "خدمة جديدة", desc: "وصف الخدمة" },
                        ],
                      },
                    },
                    en: {
                      ...prev.en,
                      services: {
                        ...prev.en.services,
                        items: [
                          ...prev.en.services.items,
                          { title: "New Service", desc: "Service description" },
                        ],
                      },
                    },
                  }))
                }
              >
                <Icon name="plus" size={14} />
                <span>{copy.site.addService}</span>
              </button>
            </header>

            <div className="repeatable-items-list">
              {content.ar.services.items.map((arItem, idx) => {
                const enItem = content.en.services.items[idx] || {
                  title: "",
                  desc: "",
                };
                return (
                  <div key={idx} className="repeatable-item-card">
                    <div className="item-card-header">
                      <span className="item-index-pill">0{idx + 1}</span>
                      <strong className="item-summary-title">
                        {arItem.title || enItem.title || "خدمة"}
                      </strong>
                      <div className="item-header-actions">
                        <button
                          type="button"
                          className="icon-button"
                          disabled={idx === 0}
                          onClick={() =>
                            updateContent((prev) => {
                              const arCopy = [...prev.ar.services.items];
                              const enCopy = [...prev.en.services.items];
                              const tempAr = arCopy[idx]!;
                              const tempEn = enCopy[idx]!;
                              arCopy[idx] = arCopy[idx - 1]!;
                              enCopy[idx] = enCopy[idx - 1]!;
                              arCopy[idx - 1] = tempAr;
                              enCopy[idx - 1] = tempEn;
                              return {
                                ...prev,
                                ar: {
                                  ...prev.ar,
                                  services: {
                                    ...prev.ar.services,
                                    items: arCopy,
                                  },
                                },
                                en: {
                                  ...prev.en,
                                  services: {
                                    ...prev.en.services,
                                    items: enCopy,
                                  },
                                },
                              };
                            })
                          }
                          title={copy.common.moveUp}
                        >
                          <Icon name="arrowUp" size={14} />
                        </button>
                        <button
                          type="button"
                          className="icon-button"
                          disabled={
                            idx === content.ar.services.items.length - 1
                          }
                          onClick={() =>
                            updateContent((prev) => {
                              const arCopy = [...prev.ar.services.items];
                              const enCopy = [...prev.en.services.items];
                              const tempAr = arCopy[idx]!;
                              const tempEn = enCopy[idx]!;
                              arCopy[idx] = arCopy[idx + 1]!;
                              enCopy[idx] = enCopy[idx + 1]!;
                              arCopy[idx + 1] = tempAr;
                              enCopy[idx + 1] = tempEn;
                              return {
                                ...prev,
                                ar: {
                                  ...prev.ar,
                                  services: {
                                    ...prev.ar.services,
                                    items: arCopy,
                                  },
                                },
                                en: {
                                  ...prev.en,
                                  services: {
                                    ...prev.en.services,
                                    items: enCopy,
                                  },
                                },
                              };
                            })
                          }
                          title={copy.common.moveDown}
                        >
                          <Icon name="arrowDown" size={14} />
                        </button>
                        <button
                          type="button"
                          className="icon-button danger-btn"
                          disabled={content.ar.services.items.length <= 1}
                          onClick={() =>
                            updateContent((prev) => ({
                              ...prev,
                              ar: {
                                ...prev.ar,
                                services: {
                                  ...prev.ar.services,
                                  items: prev.ar.services.items.filter(
                                    (_, i) => i !== idx,
                                  ),
                                },
                              },
                              en: {
                                ...prev.en,
                                services: {
                                  ...prev.en.services,
                                  items: prev.en.services.items.filter(
                                    (_, i) => i !== idx,
                                  ),
                                },
                              },
                            }))
                          }
                          title={copy.common.delete}
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid-2-col item-card-body">
                      <div dir="rtl">
                        <label>
                          <span>العنوان (AR)</span>
                          <input
                            value={arItem.title}
                            onChange={(e) =>
                              updateContent((prev) => {
                                const arItems = [...prev.ar.services.items];
                                arItems[idx] = {
                                  ...arItems[idx]!,
                                  title: e.target.value,
                                };
                                return {
                                  ...prev,
                                  ar: {
                                    ...prev.ar,
                                    services: {
                                      ...prev.ar.services,
                                      items: arItems,
                                    },
                                  },
                                };
                              })
                            }
                          />
                        </label>
                        <label>
                          <span>الوصف (AR)</span>
                          <textarea
                            rows={3}
                            value={arItem.desc}
                            onChange={(e) =>
                              updateContent((prev) => {
                                const arItems = [...prev.ar.services.items];
                                arItems[idx] = {
                                  ...arItems[idx]!,
                                  desc: e.target.value,
                                };
                                return {
                                  ...prev,
                                  ar: {
                                    ...prev.ar,
                                    services: {
                                      ...prev.ar.services,
                                      items: arItems,
                                    },
                                  },
                                };
                              })
                            }
                          />
                        </label>
                      </div>

                      <div dir="ltr">
                        <label>
                          <span>Title (EN)</span>
                          <input
                            value={enItem.title}
                            onChange={(e) =>
                              updateContent((prev) => {
                                const enItems = [...prev.en.services.items];
                                enItems[idx] = {
                                  ...enItems[idx]!,
                                  title: e.target.value,
                                };
                                return {
                                  ...prev,
                                  en: {
                                    ...prev.en,
                                    services: {
                                      ...prev.en.services,
                                      items: enItems,
                                    },
                                  },
                                };
                              })
                            }
                          />
                        </label>
                        <label>
                          <span>Description (EN)</span>
                          <textarea
                            rows={3}
                            value={enItem.desc}
                            onChange={(e) =>
                              updateContent((prev) => {
                                const enItems = [...prev.en.services.items];
                                enItems[idx] = {
                                  ...enItems[idx]!,
                                  desc: e.target.value,
                                };
                                return {
                                  ...prev,
                                  en: {
                                    ...prev.en,
                                    services: {
                                      ...prev.en.services,
                                      items: enItems,
                                    },
                                  },
                                };
                              })
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION: SHOWREEL */}
        {activeSection === "showreel" && (
          <section className="section-form-stack">
            <header className="section-header flex-header">
              <div>
                <h3>{copy.site.sections.showreel}</h3>
                <p>
                  أضف صور المعاينة وروابط الفيديو التي تتحرك تلقائياً في الموقع.
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                disabled={content.ar.showreel.items.length >= 12}
                onClick={() =>
                  updateContent((prev) => {
                    const fallback = prev.en.showreel.items[0]!.thumbnailUrl;
                    return {
                      ...prev,
                      ar: {
                        ...prev.ar,
                        showreel: {
                          ...prev.ar.showreel,
                          items: [
                            ...prev.ar.showreel.items,
                            {
                              title: "عرض جديد",
                              desc: "وصف مختصر للعرض",
                              thumbnailUrl: fallback,
                              videoUrl: "",
                            },
                          ],
                        },
                      },
                      en: {
                        ...prev.en,
                        showreel: {
                          ...prev.en.showreel,
                          items: [
                            ...prev.en.showreel.items,
                            {
                              title: "New preview",
                              desc: "A short description of this preview",
                              thumbnailUrl: fallback,
                              videoUrl: "",
                            },
                          ],
                        },
                      },
                    };
                  })
                }
              >
                <Icon name="plus" size={14} />
                <span>إضافة عرض / Add preview</span>
              </button>
            </header>

            <div className="grid-2-col">
              <div className="lang-field-card" dir="rtl">
                <span className="lang-tag">العربية</span>
                {(
                  [
                    ["label", "التسمية"],
                    ["heading", "العنوان"],
                    ["sub", "الوصف"],
                    ["playLabel", "نص زر العرض"],
                  ] as const
                ).map(([field, label]) => (
                  <label key={field}>
                    <span>{label}</span>
                    {field === "sub" ? (
                      <textarea
                        rows={3}
                        value={content.ar.showreel[field]}
                        onChange={(event) =>
                          updateContent((prev) => ({
                            ...prev,
                            ar: {
                              ...prev.ar,
                              showreel: {
                                ...prev.ar.showreel,
                                [field]: event.target.value,
                              },
                            },
                          }))
                        }
                      />
                    ) : (
                      <input
                        value={content.ar.showreel[field]}
                        onChange={(event) =>
                          updateContent((prev) => ({
                            ...prev,
                            ar: {
                              ...prev.ar,
                              showreel: {
                                ...prev.ar.showreel,
                                [field]: event.target.value,
                              },
                            },
                          }))
                        }
                      />
                    )}
                  </label>
                ))}
              </div>

              <div className="lang-field-card" dir="ltr">
                <span className="lang-tag">English</span>
                {(
                  [
                    ["label", "Label"],
                    ["heading", "Heading"],
                    ["sub", "Description"],
                    ["playLabel", "Preview button label"],
                  ] as const
                ).map(([field, label]) => (
                  <label key={field}>
                    <span>{label}</span>
                    {field === "sub" ? (
                      <textarea
                        rows={3}
                        value={content.en.showreel[field]}
                        onChange={(event) =>
                          updateContent((prev) => ({
                            ...prev,
                            en: {
                              ...prev.en,
                              showreel: {
                                ...prev.en.showreel,
                                [field]: event.target.value,
                              },
                            },
                          }))
                        }
                      />
                    ) : (
                      <input
                        value={content.en.showreel[field]}
                        onChange={(event) =>
                          updateContent((prev) => ({
                            ...prev,
                            en: {
                              ...prev.en,
                              showreel: {
                                ...prev.en.showreel,
                                [field]: event.target.value,
                              },
                            },
                          }))
                        }
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="repeatable-items-list">
              {content.ar.showreel.items.map((arItem, idx) => {
                const enItem = content.en.showreel.items[idx]!;
                return (
                  <div className="repeatable-item-card" key={idx}>
                    <div className="item-card-header">
                      <span className="item-index-pill">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <strong className="item-summary-title">
                        {arItem.title || enItem.title}
                      </strong>
                      <button
                        type="button"
                        className="icon-button danger-btn"
                        disabled={content.ar.showreel.items.length <= 1}
                        title={copy.common.delete}
                        onClick={() =>
                          updateContent((prev) => ({
                            ...prev,
                            ar: {
                              ...prev.ar,
                              showreel: {
                                ...prev.ar.showreel,
                                items: prev.ar.showreel.items.filter(
                                  (_, itemIndex) => itemIndex !== idx,
                                ),
                              },
                            },
                            en: {
                              ...prev.en,
                              showreel: {
                                ...prev.en.showreel,
                                items: prev.en.showreel.items.filter(
                                  (_, itemIndex) => itemIndex !== idx,
                                ),
                              },
                            },
                          }))
                        }
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>

                    <div className="grid-2-col item-card-body">
                      <div dir="rtl">
                        <label>
                          <span>العنوان (AR)</span>
                          <input
                            value={arItem.title}
                            onChange={(event) =>
                              updateContent((prev) => {
                                const items = [...prev.ar.showreel.items];
                                items[idx] = {
                                  ...items[idx]!,
                                  title: event.target.value,
                                };
                                return {
                                  ...prev,
                                  ar: {
                                    ...prev.ar,
                                    showreel: {
                                      ...prev.ar.showreel,
                                      items,
                                    },
                                  },
                                };
                              })
                            }
                          />
                        </label>
                        <label>
                          <span>الوصف (AR)</span>
                          <textarea
                            rows={3}
                            value={arItem.desc}
                            onChange={(event) =>
                              updateContent((prev) => {
                                const items = [...prev.ar.showreel.items];
                                items[idx] = {
                                  ...items[idx]!,
                                  desc: event.target.value,
                                };
                                return {
                                  ...prev,
                                  ar: {
                                    ...prev.ar,
                                    showreel: {
                                      ...prev.ar.showreel,
                                      items,
                                    },
                                  },
                                };
                              })
                            }
                          />
                        </label>
                      </div>

                      <div dir="ltr">
                        <label>
                          <span>Title (EN)</span>
                          <input
                            value={enItem.title}
                            onChange={(event) =>
                              updateContent((prev) => {
                                const items = [...prev.en.showreel.items];
                                items[idx] = {
                                  ...items[idx]!,
                                  title: event.target.value,
                                };
                                return {
                                  ...prev,
                                  en: {
                                    ...prev.en,
                                    showreel: {
                                      ...prev.en.showreel,
                                      items,
                                    },
                                  },
                                };
                              })
                            }
                          />
                        </label>
                        <label>
                          <span>Description (EN)</span>
                          <textarea
                            rows={3}
                            value={enItem.desc}
                            onChange={(event) =>
                              updateContent((prev) => {
                                const items = [...prev.en.showreel.items];
                                items[idx] = {
                                  ...items[idx]!,
                                  desc: event.target.value,
                                };
                                return {
                                  ...prev,
                                  en: {
                                    ...prev.en,
                                    showreel: {
                                      ...prev.en.showreel,
                                      items,
                                    },
                                  },
                                };
                              })
                            }
                          />
                        </label>
                      </div>
                    </div>

                    <div className="showreel-media-fields">
                      <div>
                        <label>
                          <span>صورة المعاينة / Thumbnail</span>
                        </label>
                        <Dropzone
                          compact
                          allowUrl
                          value={arItem.thumbnailUrl}
                          alt={{ ar: arItem.title, en: enItem.title }}
                          onUploaded={(url) =>
                            updateShowreelMedia(idx, "thumbnailUrl", url)
                          }
                          onUrlChange={(url) =>
                            updateShowreelMedia(idx, "thumbnailUrl", url)
                          }
                        />
                      </div>
                      <label>
                        <span>رابط الفيديو / Video URL</span>
                        <input
                          dir="ltr"
                          type="url"
                          placeholder="https://youtube.com/watch?v=..."
                          value={arItem.videoUrl}
                          onChange={(event) =>
                            updateShowreelMedia(
                              idx,
                              "videoUrl",
                              event.target.value,
                            )
                          }
                        />
                        <small>
                          YouTube or a direct MP4/WebM link. Leave empty for an
                          image preview.
                        </small>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION: VALUES */}
        {activeSection === "values" && (
          <section className="section-form-stack">
            <header className="section-header flex-header">
              <div>
                <h3>{copy.site.sections.values}</h3>
                <p>ركائز وقيم الشركة.</p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  updateContent((prev) => ({
                    ...prev,
                    ar: {
                      ...prev.ar,
                      values: {
                        ...prev.ar.values,
                        items: [
                          ...prev.ar.values.items,
                          { title: "قيمة جديدة", desc: "وصف القيمة" },
                        ],
                      },
                    },
                    en: {
                      ...prev.en,
                      values: {
                        ...prev.en.values,
                        items: [
                          ...prev.en.values.items,
                          { title: "New Value", desc: "Description" },
                        ],
                      },
                    },
                  }))
                }
              >
                <Icon name="plus" size={14} />
                <span>{copy.site.addValue}</span>
              </button>
            </header>

            <div className="repeatable-items-list">
              {content.ar.values.items.map((arVal, idx) => {
                const enVal = content.en.values.items[idx] || {
                  title: "",
                  desc: "",
                };
                return (
                  <div key={idx} className="repeatable-item-card">
                    <div className="item-card-header">
                      <span className="item-index-pill">0{idx + 1}</span>
                      <strong className="item-summary-title">
                        {arVal.title || enVal.title}
                      </strong>
                      <div className="item-header-actions">
                        <button
                          type="button"
                          className="icon-button danger-btn"
                          disabled={content.ar.values.items.length <= 1}
                          onClick={() =>
                            updateContent((prev) => ({
                              ...prev,
                              ar: {
                                ...prev.ar,
                                values: {
                                  ...prev.ar.values,
                                  items: prev.ar.values.items.filter(
                                    (_, i) => i !== idx,
                                  ),
                                },
                              },
                              en: {
                                ...prev.en,
                                values: {
                                  ...prev.en.values,
                                  items: prev.en.values.items.filter(
                                    (_, i) => i !== idx,
                                  ),
                                },
                              },
                            }))
                          }
                          title={copy.common.delete}
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="grid-2-col item-card-body">
                      <div dir="rtl">
                        <label>
                          <span>العنوان (AR)</span>
                          <input
                            value={arVal.title}
                            onChange={(e) =>
                              updateContent((prev) => {
                                const arItems = [...prev.ar.values.items];
                                arItems[idx] = {
                                  ...arItems[idx]!,
                                  title: e.target.value,
                                };
                                return {
                                  ...prev,
                                  ar: {
                                    ...prev.ar,
                                    values: {
                                      ...prev.ar.values,
                                      items: arItems,
                                    },
                                  },
                                };
                              })
                            }
                          />
                        </label>
                        <label>
                          <span>الوصف (AR)</span>
                          <textarea
                            rows={2}
                            value={arVal.desc}
                            onChange={(e) =>
                              updateContent((prev) => {
                                const arItems = [...prev.ar.values.items];
                                arItems[idx] = {
                                  ...arItems[idx]!,
                                  desc: e.target.value,
                                };
                                return {
                                  ...prev,
                                  ar: {
                                    ...prev.ar,
                                    values: {
                                      ...prev.ar.values,
                                      items: arItems,
                                    },
                                  },
                                };
                              })
                            }
                          />
                        </label>
                      </div>

                      <div dir="ltr">
                        <label>
                          <span>Title (EN)</span>
                          <input
                            value={enVal.title}
                            onChange={(e) =>
                              updateContent((prev) => {
                                const enItems = [...prev.en.values.items];
                                enItems[idx] = {
                                  ...enItems[idx]!,
                                  title: e.target.value,
                                };
                                return {
                                  ...prev,
                                  en: {
                                    ...prev.en,
                                    values: {
                                      ...prev.en.values,
                                      items: enItems,
                                    },
                                  },
                                };
                              })
                            }
                          />
                        </label>
                        <label>
                          <span>Description (EN)</span>
                          <textarea
                            rows={2}
                            value={enVal.desc}
                            onChange={(e) =>
                              updateContent((prev) => {
                                const enItems = [...prev.en.values.items];
                                enItems[idx] = {
                                  ...enItems[idx]!,
                                  desc: e.target.value,
                                };
                                return {
                                  ...prev,
                                  en: {
                                    ...prev.en,
                                    values: {
                                      ...prev.en.values,
                                      items: enItems,
                                    },
                                  },
                                };
                              })
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION: CLIENTS */}
        {activeSection === "clients" && (
          <section className="section-form-stack">
            <header className="section-header">
              <h3>{copy.site.sections.clients}</h3>
              <p>{copy.site.clientsHint}</p>
            </header>

            {/* Chip input for client names */}
            <div className="chip-input-container">
              <div className="chips-list">
                {content.settings.clientNames.map((client, idx) => (
                  <span key={idx} className="chip-tag">
                    <span>{client}</span>
                    <button
                      type="button"
                      className="chip-remove-btn"
                      onClick={() =>
                        updateContent((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            clientNames: prev.settings.clientNames.filter(
                              (_, i) => i !== idx,
                            ),
                          },
                        }))
                      }
                    >
                      <Icon name="close" size={12} />
                    </button>
                  </span>
                ))}
              </div>

              <div className="chip-add-row">
                <input
                  placeholder={copy.site.chipPlaceholder}
                  value={newClientInput}
                  onChange={(e) => setNewClientInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newClientInput.trim()) {
                      e.preventDefault();
                      const names = newClientInput
                        .split(",")
                        .map((n) => n.trim())
                        .filter(Boolean);
                      updateContent((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          clientNames: [...prev.settings.clientNames, ...names],
                        },
                      }));
                      setNewClientInput("");
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={!newClientInput.trim()}
                  onClick={() => {
                    const names = newClientInput
                      .split(",")
                      .map((n) => n.trim())
                      .filter(Boolean);
                    updateContent((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        clientNames: [...prev.settings.clientNames, ...names],
                      },
                    }));
                    setNewClientInput("");
                  }}
                >
                  <Icon name="plus" size={14} />
                  <span>{copy.add}</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* SECTION: STATS */}
        {activeSection === "stats" && (
          <section className="section-form-stack">
            <header className="section-header flex-header">
              <div>
                <h3>{copy.site.sections.stats}</h3>
                <p>الأرقام والإحصائيات التي تبرز إنجازات الشركة.</p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                disabled={content.settings.statistics.length >= 6}
                onClick={() =>
                  updateContent((prev) => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      statistics: [
                        ...prev.settings.statistics,
                        {
                          target: 100,
                          suffix: "+",
                          labelAr: "إحصائية جديدة",
                          labelEn: "New Stat",
                        },
                      ],
                    },
                  }))
                }
              >
                <Icon name="plus" size={14} />
                <span>{copy.site.addStat}</span>
              </button>
            </header>

            <div className="stats-editor-grid">
              {content.settings.statistics.map((st, idx) => (
                <div key={idx} className="stat-card-editor">
                  <div className="stat-editor-header">
                    <span className="stat-pill">#{idx + 1}</span>
                    <button
                      type="button"
                      className="icon-button danger-btn"
                      disabled={content.settings.statistics.length <= 1}
                      onClick={() =>
                        updateContent((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            statistics: prev.settings.statistics.filter(
                              (_, i) => i !== idx,
                            ),
                          },
                        }))
                      }
                      title={copy.common.delete}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>

                  <div className="grid-2-col">
                    <label>
                      <span>{copy.site.statNumber}</span>
                      <input
                        type="number"
                        min={0}
                        value={st.target}
                        onChange={(e) =>
                          updateContent((prev) => {
                            const statsCopy = [...prev.settings.statistics];
                            statsCopy[idx] = {
                              ...statsCopy[idx]!,
                              target: Number(e.target.value) || 0,
                            };
                            return {
                              ...prev,
                              settings: {
                                ...prev.settings,
                                statistics: statsCopy,
                              },
                            };
                          })
                        }
                      />
                    </label>

                    <label>
                      <span>{copy.site.statSuffix}</span>
                      <input
                        value={st.suffix}
                        onChange={(e) =>
                          updateContent((prev) => {
                            const statsCopy = [...prev.settings.statistics];
                            statsCopy[idx] = {
                              ...statsCopy[idx]!,
                              suffix: e.target.value,
                            };
                            return {
                              ...prev,
                              settings: {
                                ...prev.settings,
                                statistics: statsCopy,
                              },
                            };
                          })
                        }
                      />
                    </label>
                  </div>

                  <label dir="rtl">
                    <span>{copy.site.statLabelAr}</span>
                    <input
                      value={st.labelAr}
                      onChange={(e) =>
                        updateContent((prev) => {
                          const statsCopy = [...prev.settings.statistics];
                          statsCopy[idx] = {
                            ...statsCopy[idx]!,
                            labelAr: e.target.value,
                          };
                          return {
                            ...prev,
                            settings: {
                              ...prev.settings,
                              statistics: statsCopy,
                            },
                          };
                        })
                      }
                    />
                  </label>

                  <label dir="ltr">
                    <span>{copy.site.statLabelEn}</span>
                    <input
                      value={st.labelEn}
                      onChange={(e) =>
                        updateContent((prev) => {
                          const statsCopy = [...prev.settings.statistics];
                          statsCopy[idx] = {
                            ...statsCopy[idx]!,
                            labelEn: e.target.value,
                          };
                          return {
                            ...prev,
                            settings: {
                              ...prev.settings,
                              statistics: statsCopy,
                            },
                          };
                        })
                      }
                    />
                  </label>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION: CONTACT */}
        {activeSection === "contact" && (
          <section className="section-form-stack">
            <header className="section-header">
              <h3>{copy.site.sections.contact}</h3>
              <p>أرقام الهواتف، العناوين، وروابط التواصل الاجتماعي.</p>
            </header>

            {/* Phones chip input */}
            <div className="field-group">
              <label>
                <span>أرقام الهواتف</span>
                <small>{copy.site.phonesHint}</small>
              </label>
              <div className="chip-input-container">
                <div className="chips-list">
                  {content.settings.phones.map((phone, idx) => (
                    <span key={idx} className="chip-tag">
                      <span>{phone}</span>
                      <button
                        type="button"
                        className="chip-remove-btn"
                        disabled={content.settings.phones.length <= 1}
                        onClick={() =>
                          updateContent((prev) => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              phones: prev.settings.phones.filter(
                                (_, i) => i !== idx,
                              ),
                            },
                          }))
                        }
                      >
                        <Icon name="close" size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="chip-add-row">
                  <input
                    dir="ltr"
                    placeholder="01111666635"
                    value={newPhoneInput}
                    onChange={(e) => setNewPhoneInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newPhoneInput.trim()) {
                        e.preventDefault();
                        updateContent((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            phones: [
                              ...prev.settings.phones,
                              newPhoneInput.trim(),
                            ],
                          },
                        }));
                        setNewPhoneInput("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={!newPhoneInput.trim()}
                    onClick={() => {
                      updateContent((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          phones: [
                            ...prev.settings.phones,
                            newPhoneInput.trim(),
                          ],
                        },
                      }));
                      setNewPhoneInput("");
                    }}
                  >
                    <Icon name="plus" size={14} />
                    <span>{copy.add}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="social-links-editor">
              <div className="social-links-editor-heading">
                <div>
                  <h4>روابط التواصل / Social links</h4>
                  <p>
                    أضف أي منصة أو موقع أو بريد أو رقم هاتف، واكتب اسمه بالعربية
                    والإنجليزية.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={content.settings.socialLinks.length >= 20}
                  onClick={() =>
                    updateContent((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        socialLinks: [
                          ...prev.settings.socialLinks,
                          {
                            type: "other",
                            labelAr: "رابط جديد",
                            labelEn: "New link",
                            url: "",
                          },
                        ],
                      },
                    }))
                  }
                >
                  <Icon name="plus" size={14} />
                  <span>إضافة رابط / Add link</span>
                </button>
              </div>

              <div className="social-link-list">
                {content.settings.socialLinks.map((social, idx) => (
                  <article className="social-link-editor-card" key={idx}>
                    <div className="social-link-card-header">
                      <span className="social-link-number">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <strong>
                        {social.labelAr || social.labelEn || "Social link"}
                      </strong>
                      <button
                        type="button"
                        className="icon-button"
                        disabled={idx === 0}
                        title={copy.common.moveUp}
                        onClick={() =>
                          updateContent((prev) => {
                            const links = [...prev.settings.socialLinks];
                            [links[idx - 1], links[idx]] = [
                              links[idx]!,
                              links[idx - 1]!,
                            ];
                            return {
                              ...prev,
                              settings: {
                                ...prev.settings,
                                socialLinks: links,
                              },
                            };
                          })
                        }
                      >
                        <Icon name="arrowUp" size={14} />
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        disabled={
                          idx === content.settings.socialLinks.length - 1
                        }
                        title={copy.common.moveDown}
                        onClick={() =>
                          updateContent((prev) => {
                            const links = [...prev.settings.socialLinks];
                            [links[idx], links[idx + 1]] = [
                              links[idx + 1]!,
                              links[idx]!,
                            ];
                            return {
                              ...prev,
                              settings: {
                                ...prev.settings,
                                socialLinks: links,
                              },
                            };
                          })
                        }
                      >
                        <Icon name="arrowDown" size={14} />
                      </button>
                      <button
                        type="button"
                        className="icon-button danger-btn"
                        title={copy.common.delete}
                        onClick={() =>
                          updateContent((prev) => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              socialLinks: prev.settings.socialLinks.filter(
                                (_, itemIndex) => itemIndex !== idx,
                              ),
                            },
                          }))
                        }
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>

                    <div className="social-link-fields">
                      <label>
                        <span>النوع / Type</span>
                        <select
                          value={social.type}
                          onChange={(event) =>
                            updateContent((prev) => {
                              const links = [...prev.settings.socialLinks];
                              links[idx] = {
                                ...links[idx]!,
                                type: event.target.value as SocialLinkType,
                              };
                              return {
                                ...prev,
                                settings: {
                                  ...prev.settings,
                                  socialLinks: links,
                                },
                              };
                            })
                          }
                        >
                          {socialTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label dir="rtl">
                        <span>الاسم بالعربية</span>
                        <input
                          value={social.labelAr}
                          onChange={(event) =>
                            updateContent((prev) => {
                              const links = [...prev.settings.socialLinks];
                              links[idx] = {
                                ...links[idx]!,
                                labelAr: event.target.value,
                              };
                              return {
                                ...prev,
                                settings: {
                                  ...prev.settings,
                                  socialLinks: links,
                                },
                              };
                            })
                          }
                        />
                      </label>

                      <label dir="ltr">
                        <span>English label</span>
                        <input
                          value={social.labelEn}
                          onChange={(event) =>
                            updateContent((prev) => {
                              const links = [...prev.settings.socialLinks];
                              links[idx] = {
                                ...links[idx]!,
                                labelEn: event.target.value,
                              };
                              return {
                                ...prev,
                                settings: {
                                  ...prev.settings,
                                  socialLinks: links,
                                },
                              };
                            })
                          }
                        />
                      </label>

                      <label className="social-url-field" dir="ltr">
                        <span>URL / Link</span>
                        <input
                          value={social.url}
                          placeholder={
                            social.type === "email"
                              ? "mailto:hello@example.com"
                              : social.type === "phone"
                                ? "tel:+201000000000"
                                : "https://..."
                          }
                          onChange={(event) =>
                            updateContent((prev) => {
                              const links = [...prev.settings.socialLinks];
                              links[idx] = {
                                ...links[idx]!,
                                url: event.target.value,
                              };
                              return {
                                ...prev,
                                settings: {
                                  ...prev.settings,
                                  socialLinks: links,
                                },
                              };
                            })
                          }
                        />
                      </label>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="grid-2-col">
              <label dir="rtl">
                <span>العنوان بالعربية</span>
                <input
                  value={content.ar.contact.address}
                  onChange={(e) =>
                    updateContent((prev) => ({
                      ...prev,
                      ar: {
                        ...prev.ar,
                        contact: {
                          ...prev.ar.contact,
                          address: e.target.value,
                        },
                      },
                    }))
                  }
                />
              </label>

              <label dir="ltr">
                <span>Address (EN)</span>
                <input
                  value={content.en.contact.address}
                  onChange={(e) =>
                    updateContent((prev) => ({
                      ...prev,
                      en: {
                        ...prev.en,
                        contact: {
                          ...prev.en.contact,
                          address: e.target.value,
                        },
                      },
                    }))
                  }
                />
              </label>
            </div>
          </section>
        )}

        {/* SECTION: ABOUT */}
        {activeSection === "about" && (
          <section className="section-form-stack">
            <header className="section-header">
              <h3>{copy.site.sections.about}</h3>
              <p>نصوص من نحن، الرؤية، والرسالة.</p>
            </header>

            <div className="grid-2-col">
              <div className="lang-field-card" dir="rtl">
                <span className="lang-tag">العربية</span>
                <label>
                  <span>العنوان</span>
                  <input
                    value={content.ar.about.heading}
                    onChange={(e) =>
                      updateContent((prev) => ({
                        ...prev,
                        ar: {
                          ...prev.ar,
                          about: { ...prev.ar.about, heading: e.target.value },
                        },
                      }))
                    }
                  />
                </label>
                <label>
                  <span>من نحن</span>
                  <textarea
                    rows={3}
                    value={content.ar.about.who}
                    onChange={(e) =>
                      updateContent((prev) => ({
                        ...prev,
                        ar: {
                          ...prev.ar,
                          about: { ...prev.ar.about, who: e.target.value },
                        },
                      }))
                    }
                  />
                </label>
                <label>
                  <span>ماذا نفعل</span>
                  <textarea
                    rows={3}
                    value={content.ar.about.what}
                    onChange={(e) =>
                      updateContent((prev) => ({
                        ...prev,
                        ar: {
                          ...prev.ar,
                          about: { ...prev.ar.about, what: e.target.value },
                        },
                      }))
                    }
                  />
                </label>
                <label>
                  <span>الرؤية</span>
                  <textarea
                    rows={2}
                    value={content.ar.about.vision}
                    onChange={(e) =>
                      updateContent((prev) => ({
                        ...prev,
                        ar: {
                          ...prev.ar,
                          about: { ...prev.ar.about, vision: e.target.value },
                        },
                      }))
                    }
                  />
                </label>
                <label>
                  <span>الرسالة</span>
                  <textarea
                    rows={2}
                    value={content.ar.about.mission}
                    onChange={(e) =>
                      updateContent((prev) => ({
                        ...prev,
                        ar: {
                          ...prev.ar,
                          about: { ...prev.ar.about, mission: e.target.value },
                        },
                      }))
                    }
                  />
                </label>
              </div>

              <div className="lang-field-card" dir="ltr">
                <span className="lang-tag">English</span>
                <label>
                  <span>Heading</span>
                  <input
                    value={content.en.about.heading}
                    onChange={(e) =>
                      updateContent((prev) => ({
                        ...prev,
                        en: {
                          ...prev.en,
                          about: { ...prev.en.about, heading: e.target.value },
                        },
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Who</span>
                  <textarea
                    rows={3}
                    value={content.en.about.who}
                    onChange={(e) =>
                      updateContent((prev) => ({
                        ...prev,
                        en: {
                          ...prev.en,
                          about: { ...prev.en.about, who: e.target.value },
                        },
                      }))
                    }
                  />
                </label>
                <label>
                  <span>What</span>
                  <textarea
                    rows={3}
                    value={content.en.about.what}
                    onChange={(e) =>
                      updateContent((prev) => ({
                        ...prev,
                        en: {
                          ...prev.en,
                          about: { ...prev.en.about, what: e.target.value },
                        },
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Vision</span>
                  <textarea
                    rows={2}
                    value={content.en.about.vision}
                    onChange={(e) =>
                      updateContent((prev) => ({
                        ...prev,
                        en: {
                          ...prev.en,
                          about: { ...prev.en.about, vision: e.target.value },
                        },
                      }))
                    }
                  />
                </label>
                <label>
                  <span>Mission</span>
                  <textarea
                    rows={2}
                    value={content.en.about.mission}
                    onChange={(e) =>
                      updateContent((prev) => ({
                        ...prev,
                        en: {
                          ...prev.en,
                          about: { ...prev.en.about, mission: e.target.value },
                        },
                      }))
                    }
                  />
                </label>
              </div>
            </div>
          </section>
        )}

        {/* SECTION: BRAND & LOGO */}
        {activeSection === "brand" && (
          <section className="section-form-stack">
            <header className="section-header">
              <h3>{copy.site.sections.brand}</h3>
              <p>شعار الموقع والوسائط العامة.</p>
            </header>

            <div className="field-group">
              <label>
                <span>شعار الشركة (Logo URL)</span>
              </label>
              <div className="logo-preview-box">
                <Image
                  src={previewUrl(content.settings.logoUrl)}
                  alt="Logo"
                  width={140}
                  height={50}
                  unoptimized
                  className="logo-display-img"
                />
              </div>
              <input
                dir="ltr"
                value={content.settings.logoUrl}
                onChange={(e) =>
                  updateContent((prev) => ({
                    ...prev,
                    settings: { ...prev.settings, logoUrl: e.target.value },
                  }))
                }
              />
            </div>

            {/* Color Scheme Customizer */}
            <div
              style={{
                marginTop: 32,
                borderTop: "1px solid var(--border)",
                paddingTop: 28,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <div>
                  <h4
                    style={{
                      margin: "0 0 6px",
                      fontSize: "1.08rem",
                      fontWeight: 700,
                      color: "var(--text-heading)",
                    }}
                  >
                    {lang === "ar"
                      ? "ألوان وثيم الموقع بالكامل"
                      : "Full Site Color Theme"}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.85rem",
                      color: "var(--text-muted)",
                      maxWidth: 540,
                    }}
                  >
                    {lang === "ar"
                      ? "تحكم في ألوان الواجهة العامة للموقع. يتم نشر أي تعديل فورياً للموقع المباشر."
                      : "Customize the public theme colors. Changes take effect instantly upon saving."}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: "0.82rem", padding: "8px 16px" }}
                  onClick={() =>
                    updateContent((prev) => ({
                      ...prev,
                      settings: {
                        ...prev.settings,
                        theme: { ...defaultSiteTheme },
                      },
                    }))
                  }
                >
                  {lang === "ar"
                    ? "استعادة الألوان الافتراضية"
                    : "Reset to defaults"}
                </button>
              </div>

              {/* Presets Row */}
              <div style={{ marginBottom: 24 }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: "var(--text-heading)",
                    marginBottom: 10,
                  }}
                >
                  {lang === "ar"
                    ? "نماذج ألوان جاهزة (بنقرة واحدة):"
                    : "Quick Theme Presets:"}
                </span>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: 10,
                  }}
                >
                  {themePresets.map((preset) => {
                    const currentTheme =
                      content.settings.theme ?? defaultSiteTheme;
                    const isSelected =
                      currentTheme.primary === preset.theme.primary &&
                      currentTheme.brandNavy === preset.theme.brandNavy &&
                      currentTheme.background === preset.theme.background;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() =>
                          updateContent((prev) => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              theme: { ...preset.theme },
                            },
                          }))
                        }
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: 8,
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: isSelected
                            ? "2px solid var(--gold, #c9952e)"
                            : "1px solid var(--border)",
                          background: isSelected
                            ? "var(--gold-subtle, rgba(201, 149, 46, 0.08))"
                            : "var(--card-bg, rgba(255, 255, 255, 0.03))",
                          cursor: "pointer",
                          textAlign: "start",
                          transition: "all 0.2s ease",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            gap: 5,
                            width: "100%",
                          }}
                        >
                          <span
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              background: preset.theme.primary,
                              display: "inline-block",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                            }}
                          />
                          <span
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              background: preset.theme.brandNavy,
                              display: "inline-block",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                            }}
                          />
                          <span
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              background: preset.theme.accent,
                              display: "inline-block",
                              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                            }}
                          />
                          <span
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: "50%",
                              background: preset.theme.background,
                              border: "1px solid #ccc",
                              display: "inline-block",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: isSelected ? 700 : 500,
                            color: "var(--text-heading)",
                          }}
                        >
                          {lang === "ar" ? preset.nameAr : preset.nameEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Individual Color Inputs */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: 16,
                  marginBottom: 28,
                }}
              >
                {colorControls.map((item) => {
                  const currentTheme =
                    content.settings.theme ?? defaultSiteTheme;
                  const colorVal =
                    currentTheme[item.key] || defaultSiteTheme[item.key];
                  return (
                    <div
                      key={item.key}
                      style={{
                        padding: 14,
                        borderRadius: 12,
                        border: "1px solid var(--border)",
                        background: "var(--card-bg, rgba(255, 255, 255, 0.02))",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.86rem",
                            fontWeight: 600,
                            color: "var(--text-heading)",
                          }}
                        >
                          {lang === "ar" ? item.labelAr : item.labelEn}
                        </span>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: colorVal,
                            border: "1px solid rgba(0,0,0,0.15)",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                            flexShrink: 0,
                          }}
                        />
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.76rem",
                          color: "var(--text-muted)",
                          lineHeight: 1.4,
                        }}
                      >
                        {lang === "ar" ? item.descAr : item.descEn}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          marginTop: 4,
                        }}
                      >
                        <input
                          type="color"
                          value={colorVal}
                          onChange={(e) =>
                            updateContent((prev) => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                theme: {
                                  ...(prev.settings.theme ?? defaultSiteTheme),
                                  [item.key]: e.target.value,
                                },
                              },
                            }))
                          }
                          style={{
                            width: 40,
                            height: 38,
                            padding: 0,
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            cursor: "pointer",
                            background: "transparent",
                          }}
                        />
                        <input
                          type="text"
                          dir="ltr"
                          value={colorVal}
                          maxLength={7}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateContent((prev) => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                theme: {
                                  ...(prev.settings.theme ?? defaultSiteTheme),
                                  [item.key]: val,
                                },
                              },
                            }));
                          }}
                          placeholder="#000000"
                          style={{
                            flex: 1,
                            height: 38,
                            fontFamily: "monospace",
                            fontSize: "0.85rem",
                            textTransform: "lowercase",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Live Preview Swatch */}
              <div
                style={{
                  borderRadius: 14,
                  padding: 20,
                  border: "1px solid var(--border)",
                  background: (content.settings.theme ?? defaultSiteTheme)
                    .background,
                  color: (content.settings.theme ?? defaultSiteTheme)
                    .foreground,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      opacity: 0.7,
                    }}
                  >
                    {lang === "ar"
                      ? "معاينة حية لتنسيق الألوان"
                      : "Live Theme Preview"}
                  </span>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: 20,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: (content.settings.theme ?? defaultSiteTheme)
                        .accent,
                      color: "#ffffff",
                    }}
                  >
                    {lang === "ar" ? "شارة فرعية" : "Accent Badge"}
                  </span>
                </div>
                <div
                  style={{
                    borderRadius: 10,
                    padding: "16px 20px",
                    background: (content.settings.theme ?? defaultSiteTheme)
                      .brandNavy,
                    color: "#ffffff",
                    marginBottom: 16,
                  }}
                >
                  <h4
                    style={{
                      margin: "0 0 6px",
                      fontSize: "1.1rem",
                      fontWeight: 800,
                    }}
                  >
                    <span
                      style={{
                        color: (content.settings.theme ?? defaultSiteTheme)
                          .primary,
                      }}
                    >
                      {lang === "ar" ? "آرتكس برودكشن " : "Artex Production "}
                    </span>
                    {lang === "ar"
                      ? "تخطّى حدود المساحة"
                      : "Go Beyond Your Space"}
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.82rem", opacity: 0.85 }}>
                    {lang === "ar"
                      ? "هكذا تظهر الألوان معاً على شريط التنقل وقسم الواجهة الرئيسية."
                      : "This is how the colors look together on the dark navigation and hero."}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button
                    type="button"
                    style={{
                      border: "none",
                      borderRadius: 10,
                      padding: "10px 22px",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      background: (content.settings.theme ?? defaultSiteTheme)
                        .primary,
                      color: "#12242b",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                    }}
                  >
                    {lang === "ar"
                      ? "زر رئيسي تجريبي"
                      : "Sample Primary Button"}
                  </button>
                  <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>
                    {lang === "ar"
                      ? "نص عادي على خلفية الموقع"
                      : "Normal body text on background"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
