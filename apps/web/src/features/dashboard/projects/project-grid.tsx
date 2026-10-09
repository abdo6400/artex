"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useCopy } from "@/features/dashboard/i18n/copy";
import { useToast } from "@/features/dashboard/shell/toast";
import { Icon } from "@/features/dashboard/shell/icons";
import { previewUrl } from "@/features/dashboard/media/preview-url";

export type ProjectSummaryItem = {
  id: string;
  slug: string;
  clientName: string;
  title: string | null;
  status: "draft" | "published" | "archived";
  version: number;
  updatedAt: string;
  coverUrl?: string;
};

type ProjectGridProps = {
  projects: ProjectSummaryItem[];
  userRole: string;
  onEdit: (id: string) => void;
  onOpenQuickAdd: () => void;
  onRefresh: () => void;
};

type StatusFilter = "all" | "published" | "draft" | "archived";

export function ProjectGrid({
  projects,
  userRole,
  onEdit,
  onOpenQuickAdd,
  onRefresh,
}: ProjectGridProps) {
  const { copy } = useCopy();
  const { notify } = useToast();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        (p.title && p.title.toLowerCase().includes(q)) ||
        p.clientName.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
    });
  }, [projects, statusFilter, search]);

  const counts = useMemo(() => {
    return {
      all: projects.length,
      published: projects.filter((p) => p.status === "published").length,
      draft: projects.filter((p) => p.status === "draft").length,
      archived: projects.filter((p) => p.status === "archived").length,
    };
  }, [projects]);

  async function toggleStatus(project: ProjectSummaryItem) {
    if (userRole === "viewer") return;
    const nextStatus = project.status === "published" ? "draft" : "published";
    setBusyId(project.id);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          version: project.version,
        }),
      });
      if (!res.ok) throw new Error(copy.common.requestFailed);
      notify(
        nextStatus === "published"
          ? copy.projects.published
          : copy.projects.unpublished,
        "success",
      );
      onRefresh();
    } catch (err) {
      notify(
        err instanceof Error ? err.message : copy.common.networkError,
        "error",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleArchive(project: ProjectSummaryItem) {
    if (userRole === "viewer") return;
    if (!window.confirm(copy.projects.archiveConfirm)) return;
    setBusyId(project.id);
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(copy.common.requestFailed);
      notify(copy.projects.archived, "info");
      onRefresh();
    } catch (err) {
      notify(
        err instanceof Error ? err.message : copy.common.networkError,
        "error",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="projects-container">
      {/* Top action bar: Search, Filter Tabs, Add Button */}
      <header className="projects-top-bar">
        <div className="search-wrap">
          <Icon name="search" size={16} />
          <input
            type="search"
            placeholder={copy.common.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Chips */}
        <div className="filter-chips">
          {(
            [
              ["all", copy.common.all, counts.all],
              ["published", copy.status.published, counts.published],
              ["draft", copy.status.draft, counts.draft],
              ["archived", copy.status.archived, counts.archived],
            ] as const
          ).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              className={`filter-chip ${statusFilter === key ? "active" : ""}`}
              onClick={() => setStatusFilter(key)}
            >
              <span>{label}</span>
              <span className="chip-count">{count}</span>
            </button>
          ))}
        </div>

        {userRole !== "viewer" && (
          <button
            type="button"
            className="btn-primary add-project-btn"
            onClick={onOpenQuickAdd}
          >
            <Icon name="plus" size={16} />
            <span>{copy.projects.add}</span>
          </button>
        )}
      </header>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="empty-state-box">
          <Icon name="grid" size={36} />
          <h3>{copy.projects.empty}</h3>
          {userRole !== "viewer" && (
            <button
              type="button"
              className="btn-primary"
              onClick={onOpenQuickAdd}
            >
              <Icon name="plus" size={16} />
              <span>{copy.quick.title}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="project-cards-grid">
          {filteredProjects.map((project) => {
            const isBusy = busyId === project.id;
            return (
              <article key={project.id} className="project-card">
                <div className="project-card-thumb">
                  {project.coverUrl ? (
                    <Image
                      src={previewUrl(project.coverUrl)}
                      alt=""
                      fill
                      unoptimized
                      sizes="320px"
                      className="project-card-img"
                    />
                  ) : (
                    <div className="project-card-placeholder">
                      <Icon name="image" size={24} />
                    </div>
                  )}

                  <span className={`status-badge badge-${project.status}`}>
                    {copy.status[project.status]}
                  </span>
                </div>

                <div className="project-card-body">
                  <div className="client-slug-row">
                    <strong className="client-title">
                      {project.clientName}
                    </strong>
                    <code className="slug-code" dir="ltr">
                      /{project.slug}
                    </code>
                  </div>
                  <h4 className="project-title">
                    {project.title || project.slug}
                  </h4>
                </div>

                <footer className="project-card-footer">
                  {userRole !== "viewer" ? (
                    <>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => onEdit(project.id)}
                      >
                        <Icon name="edit" size={14} />
                        <span>{copy.common.edit}</span>
                      </button>

                      {project.status !== "archived" && (
                        <button
                          type="button"
                          className="btn-ghost"
                          disabled={isBusy}
                          onClick={() => toggleStatus(project)}
                        >
                          <Icon
                            name={
                              project.status === "published" ? "eyeOff" : "eye"
                            }
                            size={14}
                          />
                          <span>
                            {project.status === "published"
                              ? copy.projects.unpublish
                              : copy.projects.publish}
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn-ghost danger-text"
                        disabled={isBusy}
                        onClick={() => handleArchive(project)}
                        title={copy.projects.archive}
                      >
                        <Icon name="archive" size={14} />
                      </button>
                    </>
                  ) : (
                    <span className="badge">{copy.common.readOnly}</span>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
