"use client";

import { useState } from "react";
import Image from "next/image";
import { useCopy } from "@/features/dashboard/i18n/copy";
import { useToast } from "@/features/dashboard/shell/toast";
import { Icon } from "@/features/dashboard/shell/icons";
import { Dropzone } from "@/features/dashboard/media/dropzone";
import { previewUrl } from "@/features/dashboard/media/preview-url";
import {
  CATEGORY_PRESETS,
  generateProjectSlug,
  type CategoryPreset,
} from "./category-presets";

export type ProjectDraftValues = {
  titleAr: string;
  clientName: string;
  category: { slug: string; nameAr: string; nameEn: string };
  coverUrl?: string;
  titleEn?: string;
  summaryAr?: string;
  summaryEn?: string;
  slug?: string;
  status: "published" | "draft";
};

type QuickAddProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  existingCategories?: Array<{
    slug: string;
    nameAr?: string;
    nameEn?: string;
  }>;
  onOpenFullEditor?: (initial: ProjectDraftValues) => void;
};

export function QuickAddModal({
  isOpen,
  onClose,
  onCreated,
  existingCategories = [],
  onOpenFullEditor,
}: QuickAddProps) {
  const { copy } = useCopy();
  const { notify } = useToast();

  const [titleAr, setTitleAr] = useState("");
  const [clientName, setClientName] = useState("");
  const [selectedCatSlug, setSelectedCatSlug] = useState(
    CATEGORY_PRESETS[0]!.slug,
  );
  const [customCatAr, setCustomCatAr] = useState("");
  const [customCatEn, setCustomCatEn] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const [coverUrl, setCoverUrl] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [summaryAr, setSummaryAr] = useState("");
  const [slugOverride, setSlugOverride] = useState("");
  const [publishImmediately, setPublishImmediately] = useState(true);

  const [showEnglish, setShowEnglish] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  // Combine presets with any custom ones already in DB
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

  const activeCategory: CategoryPreset = isCustomCategory
    ? {
        slug:
          generateProjectSlug(customCatEn || customCatAr) || "custom-category",
        nameAr: customCatAr.trim() || customCatEn.trim() || "تصنيف جديد",
        nameEn: customCatEn.trim() || customCatAr.trim() || "New Category",
      }
    : categoryOptions.find((c) => c.slug === selectedCatSlug) ||
      CATEGORY_PRESETS[0]!;

  const autoSlug =
    slugOverride.trim() ||
    generateProjectSlug(titleEn || clientName, clientName);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titleAr.trim() || !clientName.trim()) {
      notify(copy.quick.needTitle, "error");
      return;
    }

    setSaving(true);
    const status = publishImmediately ? "published" : "draft";

    const body = {
      slug: autoSlug,
      clientName: clientName.trim(),
      status,
      sortOrder: 0,
      category: {
        slug: activeCategory.slug,
        nameAr: activeCategory.nameAr,
        nameEn: activeCategory.nameEn,
      },
      ar: {
        title: titleAr.trim(),
        ...(summaryAr.trim() ? { summary: summaryAr.trim() } : {}),
      },
      ...(titleEn.trim()
        ? {
            en: {
              title: titleEn.trim(),
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
        : {}),
      gallery: [],
    };

    try {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.title || copy.common.requestFailed,
        );
      }

      notify(copy.projects.created, "success");
      onCreated();
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

  function handleFullEditor() {
    if (!onOpenFullEditor) return;
    onOpenFullEditor({
      titleAr,
      clientName,
      category: activeCategory,
      coverUrl,
      titleEn,
      summaryAr,
      slug: autoSlug,
      status: publishImmediately ? "published" : "draft",
    });
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card quick-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="modal-header">
          <div>
            <span className="eyebrow">ARTEX // FAST ADD</span>
            <h2>{copy.quick.title}</h2>
            <p>{copy.quick.sub}</p>
          </div>
          <button
            type="button"
            className="icon-button modal-close"
            onClick={onClose}
            aria-label={copy.common.close}
          >
            <Icon name="close" size={16} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="quick-modal-body">
          <div className="quick-modal-columns">
            {/* Left/Main Column: Fast inputs */}
            <div className="quick-fields">
              <label>
                <span>
                  {copy.quick.titleAr} <b className="req-dot">*</b>
                </span>
                <input
                  required
                  dir="rtl"
                  autoFocus
                  placeholder={copy.quick.titleArPlaceholder}
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                />
              </label>

              <div className="grid-2-col">
                <label>
                  <span>
                    {copy.quick.client} <b className="req-dot">*</b>
                  </span>
                  <input
                    required
                    placeholder={copy.quick.clientPlaceholder}
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                </label>

                <label>
                  <span>{copy.quick.category}</span>
                  <select
                    value={isCustomCategory ? "__custom__" : selectedCatSlug}
                    onChange={(e) => {
                      if (e.target.value === "__custom__") {
                        setIsCustomCategory(true);
                      } else {
                        setIsCustomCategory(false);
                        setSelectedCatSlug(e.target.value);
                      }
                    }}
                  >
                    {categoryOptions.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.nameAr} ({cat.nameEn})
                      </option>
                    ))}
                    <option value="__custom__">{copy.quick.newCategory}</option>
                  </select>
                </label>
              </div>

              {isCustomCategory && (
                <div className="grid-2-col custom-category-box">
                  <label>
                    <span>{copy.quick.newCategoryAr}</span>
                    <input
                      required
                      dir="rtl"
                      placeholder="مثال: ديكور استوديو"
                      value={customCatAr}
                      onChange={(e) => setCustomCatAr(e.target.value)}
                    />
                  </label>
                  <label>
                    <span>{copy.quick.newCategoryEn}</span>
                    <input
                      placeholder="e.g. Studio Decor"
                      value={customCatEn}
                      onChange={(e) => setCustomCatEn(e.target.value)}
                    />
                  </label>
                </div>
              )}

              {/* Cover Photo Dropzone */}
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

              {/* Optional English Accordion */}
              <div className="accordion-section">
                <button
                  type="button"
                  className="accordion-toggle"
                  onClick={() => setShowEnglish(!showEnglish)}
                >
                  <Icon
                    name={showEnglish ? "arrowUp" : "arrowDown"}
                    size={14}
                  />
                  <span>{copy.quick.english}</span>
                  <small>{copy.quick.englishHint}</small>
                </button>
                {showEnglish && (
                  <div className="accordion-content">
                    <label>
                      <span>{copy.quick.titleEn}</span>
                      <input
                        placeholder="e.g. Siemens Cairo Expo Booth"
                        value={titleEn}
                        onChange={(e) => setTitleEn(e.target.value)}
                      />
                    </label>
                    <label>
                      <span>{copy.quick.summary}</span>
                      <textarea
                        rows={2}
                        placeholder="Brief summary..."
                        value={summaryAr}
                        onChange={(e) => setSummaryAr(e.target.value)}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Optional Advanced Settings */}
              <div className="accordion-section">
                <button
                  type="button"
                  className="accordion-toggle"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <Icon
                    name={showAdvanced ? "arrowUp" : "arrowDown"}
                    size={14}
                  />
                  <span>{copy.quick.advanced}</span>
                </button>
                {showAdvanced && (
                  <div className="accordion-content">
                    <label>
                      <span>{copy.quick.slug}</span>
                      <input
                        dir="ltr"
                        placeholder="cairo-expo-2026"
                        value={slugOverride || autoSlug}
                        onChange={(e) => setSlugOverride(e.target.value)}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Publish Toggle */}
              <div className="publish-toggle-box">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={publishImmediately}
                    onChange={(e) => setPublishImmediately(e.target.checked)}
                  />
                  <span>{copy.quick.publishNow}</span>
                </label>
              </div>
            </div>

            {/* Right Column: Live Website Card Preview */}
            <div className="quick-preview-panel">
              <span className="preview-heading">{copy.quick.preview}</span>
              <div className="preview-card-shell">
                <div className="preview-card-image-wrap">
                  {coverUrl ? (
                    <Image
                      src={previewUrl(coverUrl)}
                      alt=""
                      fill
                      unoptimized
                      sizes="340px"
                      className="preview-card-img"
                    />
                  ) : (
                    <div className="preview-card-empty-img">
                      <Icon name="image" size={32} />
                      <small>{copy.media.dropOne}</small>
                    </div>
                  )}
                  <span className="preview-category-tag">
                    {activeCategory.nameAr}
                  </span>
                </div>
                <div className="preview-card-content">
                  <strong className="preview-card-client">
                    {clientName || "اسم العميل"}
                  </strong>
                  <h4 className="preview-card-title">
                    {titleAr || "عنوان المشروع يظهر هنا"}
                  </h4>
                  <div className="preview-card-footer">
                    <span
                      className={`badge ${publishImmediately ? "published" : "draft"}`}
                    >
                      {publishImmediately
                        ? copy.status.published
                        : copy.status.draft}
                    </span>
                    <span className="preview-link-arrow">
                      عرض المشروع <Icon name="arrowLeft" size={12} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="modal-footer">
            {onOpenFullEditor && (
              <button
                type="button"
                className="btn-ghost"
                onClick={handleFullEditor}
              >
                <Icon name="external" size={14} />
                <span>{copy.quick.fullEditor}</span>
              </button>
            )}
            <div className="modal-footer-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                {copy.common.cancel}
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving || !titleAr.trim() || !clientName.trim()}
              >
                {saving
                  ? copy.common.saving
                  : publishImmediately
                    ? copy.quick.submitPublish
                    : copy.quick.submitDraft}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
