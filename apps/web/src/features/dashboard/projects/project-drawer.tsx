"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { useCopy } from "@/features/dashboard/i18n/copy";
import { useToast } from "@/features/dashboard/shell/toast";
import { Icon } from "@/features/dashboard/shell/icons";
import { Dropzone } from "@/features/dashboard/media/dropzone";
import { previewUrl } from "@/features/dashboard/media/preview-url";
import {
  adminProjectDetailResponseSchema,
  type AdminProjectDetail,
} from "@artex/contracts";
import {
  CATEGORY_PRESETS,
  generateProjectSlug,
  type CategoryPreset,
} from "./category-presets";
import type { ProjectDraftValues } from "./quick-add-modal";

type ProjectDrawerProps = {
  isOpen: boolean;
  projectId: string | null;
  initialValues?: ProjectDraftValues | null;
  onClose: () => void;
  onSaved: () => void;
  existingCategories?: Array<{
    slug: string;
    nameAr?: string;
    nameEn?: string;
  }>;
};

type TabKey = "basics" | "arabic" | "english" | "gallery" | "advanced";

export function ProjectDrawer({
  isOpen,
  projectId,
  initialValues,
  onClose,
  onSaved,
  existingCategories = [],
}: ProjectDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="drawer-backdrop">
      <aside className="drawer-panel" role="dialog" aria-modal="true">
        <DrawerInner
          key={projectId || (initialValues ? "initial" : "new")}
          projectId={projectId}
          initialValues={initialValues}
          onClose={onClose}
          onSaved={onSaved}
          existingCategories={existingCategories}
        />
      </aside>
    </div>
  );
}

function DrawerInner({
  projectId,
  initialValues,
  onClose,
  onSaved,
  existingCategories,
}: {
  projectId: string | null;
  initialValues?: ProjectDraftValues | null;
  onClose: () => void;
  onSaved: () => void;
  existingCategories: Array<{ slug: string; nameAr?: string; nameEn?: string }>;
}) {
  const { copy } = useCopy();
  const { notify } = useToast();

  const [activeTab, setActiveTab] = useState<TabKey>("basics");
  const [loading, setLoading] = useState<boolean>(Boolean(projectId));
  const [saving, setSaving] = useState(false);
  const [version, setVersion] = useState<number | null>(null);

  // Initial values initialized cleanly
  const slugEditedRef = useRef(Boolean(initialValues?.slug));
  const [slug, setSlug] = useState(
    initialValues?.slug ||
      generateProjectSlug(initialValues?.titleEn, initialValues?.clientName) ||
      "",
  );
  const [clientName, setClientName] = useState(initialValues?.clientName || "");
  const [status, setStatus] = useState<"draft" | "published" | "archived">(
    initialValues?.status || "published",
  );
  const [sortOrder, setSortOrder] = useState(0);

  const initialCat = initialValues?.category || CATEGORY_PRESETS[0]!;
  const [categorySlug, setCategorySlug] = useState(initialCat.slug);
  const [categoryAr, setCategoryAr] = useState(initialCat.nameAr);
  const [categoryEn, setCategoryEn] = useState(initialCat.nameEn);

  const [titleAr, setTitleAr] = useState(initialValues?.titleAr || "");
  const [summaryAr, setSummaryAr] = useState(initialValues?.summaryAr || "");
  const [descriptionAr, setDescriptionAr] = useState("");

  const [titleEn, setTitleEn] = useState(initialValues?.titleEn || "");
  const [summaryEn, setSummaryEn] = useState(initialValues?.summaryEn || "");
  const [descriptionEn, setDescriptionEn] = useState("");

  const [coverUrl, setCoverUrl] = useState(initialValues?.coverUrl || "");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  // Category presets
  const categoryOptions: CategoryPreset[] = [...CATEGORY_PRESETS];
  for (const ext of existingCategories) {
    if (!categoryOptions.some((c) => c.slug === ext.slug)) {
      categoryOptions.push({
        slug: ext.slug,
        nameAr: ext.nameAr || ext.slug,
        nameEn: ext.nameEn || ext.slug,
      });
    }
  }

  // Load existing data asynchronously
  useEffect(() => {
    if (!projectId) return;

    let active = true;
    fetch(`/api/admin/projects/${projectId}`)
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        const parsed = adminProjectDetailResponseSchema.safeParse(body);
        if (!res.ok || !parsed.success) {
          throw new Error(copy.projects.loadFailed);
        }
        return parsed.data.data;
      })
      .then((item: AdminProjectDetail) => {
        if (!active) return;
        setVersion(item.version);
        setSlug(item.slug);
        setClientName(item.clientName);
        setStatus(item.status);
        setSortOrder(item.sortOrder);

        setCategorySlug(item.category.slug);
        setCategoryAr(item.category.nameAr);
        setCategoryEn(item.category.nameEn);

        setTitleAr(item.ar.title);
        setSummaryAr(item.ar.summary);
        setDescriptionAr(item.ar.description);

        setTitleEn(item.en.title);
        setSummaryEn(item.en.summary);
        setDescriptionEn(item.en.description);

        setCoverUrl(item.cover?.url || "");
        setGalleryUrls(item.gallery.map((g) => g.url));
        setLoading(false);
      })
      .catch((err) => {
        if (active) {
          notify(
            err instanceof Error ? err.message : copy.projects.loadFailed,
            "error",
          );
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [projectId, copy.projects.loadFailed, notify]);

  function handleSelectCategory(catSlug: string) {
    const found = categoryOptions.find((c) => c.slug === catSlug);
    if (found) {
      setCategorySlug(found.slug);
      setCategoryAr(found.nameAr);
      setCategoryEn(found.nameEn);
    }
  }

  function handleCopyFromArabic() {
    if (titleAr && !titleEn) setTitleEn(titleAr);
    if (summaryAr && !summaryEn) setSummaryEn(summaryAr);
    if (descriptionAr && !descriptionEn) setDescriptionEn(descriptionAr);
    notify(copy.site.copyFromAr, "info");
  }

  function moveGalleryItem(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= galleryUrls.length) return;
    const copyList = [...galleryUrls];
    const temp = copyList[index]!;
    copyList[index] = copyList[newIndex]!;
    copyList[newIndex] = temp;
    setGalleryUrls(copyList);
  }

  function removeGalleryItem(url: string) {
    setGalleryUrls((list) => list.filter((u) => u !== url));
  }

  function makeCover(url: string) {
    setCoverUrl(url);
    notify(copy.drawer.isCover, "success");
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!titleAr.trim() || !clientName.trim()) {
      notify(copy.quick.needTitle, "error");
      return;
    }

    setSaving(true);
    const finalSlug =
      slug.trim() ||
      generateProjectSlug(titleEn, clientName) ||
      `project-${Date.now().toString(36)}`;

    const body = {
      slug: finalSlug,
      clientName: clientName.trim(),
      status,
      sortOrder: Number(sortOrder) || 0,
      category: {
        slug: categorySlug.trim() || "general",
        nameAr: categoryAr.trim() || "عام",
        nameEn: categoryEn.trim() || "General",
      },
      ar: {
        title: titleAr.trim(),
        ...(summaryAr.trim() ? { summary: summaryAr.trim() } : {}),
        ...(descriptionAr.trim() ? { description: descriptionAr.trim() } : {}),
      },
      ...(titleEn.trim() || summaryEn.trim() || descriptionEn.trim()
        ? {
            en: {
              title: titleEn.trim() || titleAr.trim(),
              ...(summaryEn.trim() ? { summary: summaryEn.trim() } : {}),
              ...(descriptionEn.trim()
                ? { description: descriptionEn.trim() }
                : {}),
            },
          }
        : {}),
      ...(coverUrl
        ? {
            cover: {
              url: coverUrl,
              altAr: titleAr.trim(),
              altEn: titleEn.trim() || titleAr.trim(),
            },
          }
        : projectId
          ? { cover: null }
          : {}),
      gallery: galleryUrls.map((url) => ({
        url,
        altAr: titleAr.trim(),
        altEn: titleEn.trim() || titleAr.trim(),
      })),
      ...(projectId && version !== null ? { version } : {}),
    };

    try {
      const url = projectId
        ? `/api/admin/projects/${projectId}`
        : "/api/admin/projects";
      const method = projectId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.title || copy.common.requestFailed,
        );
      }

      notify(
        projectId ? copy.projects.saved : copy.projects.created,
        "success",
      );
      onSaved();
      onClose();
    } catch (err) {
      notify(
        err instanceof Error ? err.message : copy.common.networkError,
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="drawer-header">
        <div>
          <span className="eyebrow">
            {projectId ? "ARTEX // EDIT" : "ARTEX // NEW"}
          </span>
          <h3>{projectId ? copy.drawer.editTitle : copy.drawer.newTitle}</h3>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label={copy.common.close}
        >
          <Icon name="close" size={18} />
        </button>
      </header>

      {loading ? (
        <div className="drawer-loading">
          <Icon name="sparkle" size={24} />
          <p>{copy.common.loading}</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="drawer-form">
          {/* Tabs Bar */}
          <div className="drawer-tabs">
            {(
              [
                ["basics", copy.drawer.tabs.basics, "grid"],
                ["arabic", copy.drawer.tabs.arabic, "globe"],
                ["english", copy.drawer.tabs.english, "globe"],
                ["gallery", copy.drawer.tabs.gallery, "image"],
                ["advanced", copy.drawer.tabs.advanced, "layers"],
              ] as const
            ).map(([tabKey, label, icon]) => (
              <button
                key={tabKey}
                type="button"
                className={`drawer-tab-btn ${activeTab === tabKey ? "active" : ""}`}
                onClick={() => setActiveTab(tabKey)}
              >
                <Icon name={icon} size={14} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="drawer-content">
            {/* TAB: BASICS */}
            {activeTab === "basics" && (
              <div className="tab-pane">
                <label>
                  <span>
                    {copy.quick.titleAr} <b className="req-dot">*</b>
                  </span>
                  <input
                    required
                    dir="rtl"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="عنوان المشروع بالعربية"
                  />
                </label>

                <div className="grid-2-col">
                  <label>
                    <span>
                      {copy.quick.client} <b className="req-dot">*</b>
                    </span>
                    <input
                      required
                      value={clientName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setClientName(val);
                        if (!projectId && !slugEditedRef.current) {
                          const auto = generateProjectSlug(titleEn, val);
                          if (auto) setSlug(auto);
                        }
                      }}
                      placeholder="Siemens, Dell, ..."
                    />
                  </label>

                  <label>
                    <span>{copy.drawer.status}</span>
                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(
                          e.target.value as "draft" | "published" | "archived",
                        )
                      }
                    >
                      <option value="published">{copy.status.published}</option>
                      <option value="draft">{copy.status.draft}</option>
                      <option value="archived">{copy.status.archived}</option>
                    </select>
                  </label>
                </div>

                <div className="category-selection-card">
                  <label>
                    <span>{copy.quick.category}</span>
                    <select
                      value={categorySlug}
                      onChange={(e) => handleSelectCategory(e.target.value)}
                    >
                      {categoryOptions.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.nameAr} ({c.nameEn})
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid-2-col">
                    <label>
                      <span>{copy.quick.newCategoryAr}</span>
                      <input
                        dir="rtl"
                        value={categoryAr}
                        onChange={(e) => setCategoryAr(e.target.value)}
                      />
                    </label>
                    <label>
                      <span>{copy.quick.newCategoryEn}</span>
                      <input
                        value={categoryEn}
                        onChange={(e) => setCategoryEn(e.target.value)}
                      />
                    </label>
                  </div>
                </div>

                <div className="field-group">
                  <label>
                    <span>{copy.quick.cover}</span>
                  </label>
                  <Dropzone
                    value={coverUrl}
                    allowUrl
                    onUploaded={(url) => setCoverUrl(url)}
                    onUrlChange={(url) => setCoverUrl(url)}
                    alt={{ ar: titleAr, en: titleEn }}
                  />
                </div>
              </div>
            )}

            {/* TAB: ARABIC COPY */}
            {activeTab === "arabic" && (
              <div className="tab-pane" dir="rtl">
                <label>
                  <span>
                    {copy.quick.titleAr} <b className="req-dot">*</b>
                  </span>
                  <input
                    required
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                  />
                </label>
                <label>
                  <span>{copy.drawer.summary}</span>
                  <textarea
                    rows={3}
                    value={summaryAr}
                    onChange={(e) => setSummaryAr(e.target.value)}
                    placeholder="ملخص قصير للبطاقات وقائمة الأعمال"
                  />
                </label>
                <label>
                  <span>{copy.drawer.description}</span>
                  <textarea
                    rows={6}
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                    placeholder="اكتب القصة الكاملة وتفاصيل التنفيذ والهيكل..."
                  />
                </label>
              </div>
            )}

            {/* TAB: ENGLISH COPY */}
            {activeTab === "english" && (
              <div className="tab-pane" dir="ltr">
                <div className="tab-helper-bar">
                  <small>{copy.drawer.englishNote}</small>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={handleCopyFromArabic}
                  >
                    <Icon name="copy" size={14} />
                    <span>{copy.site.copyFromAr}</span>
                  </button>
                </div>
                <label>
                  <span>{copy.quick.titleEn}</span>
                  <input
                    value={titleEn}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTitleEn(val);
                      if (!projectId && !slugEditedRef.current) {
                        const auto = generateProjectSlug(val, clientName);
                        if (auto) setSlug(auto);
                      }
                    }}
                    placeholder="Project title in English"
                  />
                </label>
                <label>
                  <span>{copy.drawer.summary}</span>
                  <textarea
                    rows={3}
                    value={summaryEn}
                    onChange={(e) => setSummaryEn(e.target.value)}
                    placeholder="Short card summary"
                  />
                </label>
                <label>
                  <span>{copy.drawer.description}</span>
                  <textarea
                    rows={6}
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    placeholder="Full project description and build specs..."
                  />
                </label>
              </div>
            )}

            {/* TAB: GALLERY & MEDIA */}
            {activeTab === "gallery" && (
              <div className="tab-pane">
                <div className="field-group">
                  <label>
                    <span>{copy.quick.cover}</span>
                  </label>
                  <Dropzone
                    value={coverUrl}
                    allowUrl
                    onUploaded={(url) => setCoverUrl(url)}
                    onUrlChange={(url) => setCoverUrl(url)}
                    alt={{ ar: titleAr, en: titleEn }}
                  />
                </div>

                <div className="field-group">
                  <label>
                    <span>{copy.drawer.gallery}</span>
                    <small>{copy.drawer.galleryHint}</small>
                  </label>
                  <Dropzone
                    multiple
                    onUploaded={(newUrl) =>
                      setGalleryUrls((current) =>
                        current.includes(newUrl)
                          ? current
                          : [...current, newUrl],
                      )
                    }
                    alt={{ ar: titleAr, en: titleEn }}
                  />
                </div>

                {galleryUrls.length > 0 && (
                  <div className="gallery-manager-grid">
                    {galleryUrls.map((url, idx) => (
                      <div key={url} className="gallery-tile">
                        <Image
                          src={previewUrl(url)}
                          alt=""
                          width={160}
                          height={110}
                          unoptimized
                          className="gallery-thumb"
                        />
                        <div className="gallery-tile-actions">
                          <button
                            type="button"
                            className="icon-button"
                            disabled={idx === 0}
                            onClick={() => moveGalleryItem(idx, -1)}
                            title={copy.common.moveUp}
                          >
                            <Icon name="arrowUp" size={14} />
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            disabled={idx === galleryUrls.length - 1}
                            onClick={() => moveGalleryItem(idx, 1)}
                            title={copy.common.moveDown}
                          >
                            <Icon name="arrowDown" size={14} />
                          </button>
                          <button
                            type="button"
                            className="icon-button star-btn"
                            onClick={() => makeCover(url)}
                            title={copy.drawer.makeCover}
                          >
                            <Icon name="star" size={14} />
                          </button>
                          <button
                            type="button"
                            className="icon-button danger-btn"
                            onClick={() => removeGalleryItem(url)}
                            title={copy.common.remove}
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: ADVANCED */}
            {activeTab === "advanced" && (
              <div className="tab-pane">
                <label>
                  <span>{copy.quick.slug}</span>
                  <input
                    dir="ltr"
                    disabled={Boolean(projectId)}
                    value={slug}
                    onChange={(e) => {
                      slugEditedRef.current = true;
                      setSlug(e.target.value);
                    }}
                    placeholder="cairo-expo-2026"
                  />
                  {projectId && (
                    <small className="muted-text">
                      {copy.drawer.slugLocked}
                    </small>
                  )}
                </label>

                <div className="grid-2-col">
                  <label>
                    <span>{copy.drawer.order}</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={sortOrder}
                      onChange={(e) => setSortOrder(Number(e.target.value))}
                    />
                    <small className="muted-text">
                      {copy.drawer.orderHint}
                    </small>
                  </label>

                  <label>
                    <span>{copy.drawer.categorySlug}</span>
                    <input
                      dir="ltr"
                      value={categorySlug}
                      onChange={(e) => setCategorySlug(e.target.value)}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          <footer className="drawer-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {copy.common.cancel}
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? copy.common.saving : copy.common.save}
            </button>
          </footer>
        </form>
      )}
    </>
  );
}
