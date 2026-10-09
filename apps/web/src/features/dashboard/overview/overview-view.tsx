"use client";

import Image from "next/image";
import { useCopy } from "@/features/dashboard/i18n/copy";
import { Icon } from "@/features/dashboard/shell/icons";
import { previewUrl } from "@/features/dashboard/media/preview-url";
import type { ProjectSummaryItem } from "@/features/dashboard/projects/project-grid";

type Lead = {
  id: string;
  name: string;
  email: string | null;
  company: string;
  service: string;
  budget: string;
  message: string;
  status: string;
  createdAt: string;
};

type OverviewProps = {
  user: { name: string; email: string; role: string };
  projects: ProjectSummaryItem[];
  leads: Lead[];
  onOpenQuickAdd: () => void;
  onNavigateTab: (tab: "projects" | "website" | "leads") => void;
  onEditProject: (id: string) => void;
};

export function OverviewView({
  user,
  projects,
  leads,
  onOpenQuickAdd,
  onNavigateTab,
  onEditProject,
}: OverviewProps) {
  const { copy } = useCopy();

  const publishedCount = projects.filter(
    (p) => p.status === "published",
  ).length;
  const draftCount = projects.filter((p) => p.status === "draft").length;
  const newLeadsCount = leads.filter((l) => l.status === "new").length;

  const recentProjects = projects.slice(0, 4);
  const recentLeads = leads.slice(0, 4);

  return (
    <div className="overview-container">
      {/* Welcome Banner */}
      <section className="overview-hero-card">
        <div className="overview-hero-text">
          <span className="eyebrow">
            {copy.overview.greeting}، {user.name}
          </span>
          <h2>{copy.overview.headline}</h2>
          <p>{copy.overview.sub}</p>
        </div>

        {user.role !== "viewer" && (
          <div className="overview-hero-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={onOpenQuickAdd}
            >
              <Icon name="plus" size={16} />
              <span>{copy.quick.title}</span>
            </button>
          </div>
        )}
      </section>

      {/* Metrics Row */}
      <section className="stats-row">
        <article className="stat-metric-card">
          <div className="stat-card-icon">
            <Icon name="grid" size={20} />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">{copy.overview.totalProjects}</span>
            <strong className="stat-value">{projects.length}</strong>
          </div>
        </article>

        <article className="stat-metric-card highlight-card">
          <div className="stat-card-icon gold-icon">
            <Icon name="globe" size={20} />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">{copy.overview.published}</span>
            <strong className="stat-value gold-text">{publishedCount}</strong>
          </div>
        </article>

        <article className="stat-metric-card">
          <div className="stat-card-icon">
            <Icon name="archive" size={20} />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">{copy.overview.drafts}</span>
            <strong className="stat-value">{draftCount}</strong>
          </div>
        </article>

        <article className="stat-metric-card">
          <div className="stat-card-icon cyan-icon">
            <Icon name="inbox" size={20} />
          </div>
          <div className="stat-card-info">
            <span className="stat-label">{copy.overview.newLeads}</span>
            <strong className="stat-value cyan-text">{newLeadsCount}</strong>
          </div>
        </article>
      </section>

      {/* Quick Action Tiles */}
      <section className="quick-actions-panel">
        <h3 className="section-title">{copy.overview.quickActions}</h3>
        <div className="quick-actions-grid">
          {user.role !== "viewer" && (
            <button
              type="button"
              className="quick-tile-btn"
              onClick={onOpenQuickAdd}
            >
              <span className="quick-tile-icon gold">
                <Icon name="plus" size={20} />
              </span>
              <strong>{copy.addMenu.project}</strong>
              <small>{copy.addMenu.projectHint}</small>
            </button>
          )}

          <button
            type="button"
            className="quick-tile-btn"
            onClick={() => onNavigateTab("website")}
          >
            <span className="quick-tile-icon">
              <Icon name="briefcase" size={20} />
            </span>
            <strong>{copy.addMenu.service}</strong>
            <small>{copy.addMenu.serviceHint}</small>
          </button>

          <button
            type="button"
            className="quick-tile-btn"
            onClick={() => onNavigateTab("website")}
          >
            <span className="quick-tile-icon">
              <Icon name="users" size={20} />
            </span>
            <strong>{copy.addMenu.client}</strong>
            <small>{copy.addMenu.clientHint}</small>
          </button>

          <button
            type="button"
            className="quick-tile-btn"
            onClick={() => onNavigateTab("website")}
          >
            <span className="quick-tile-icon">
              <Icon name="chart" size={20} />
            </span>
            <strong>{copy.addMenu.stat}</strong>
            <small>{copy.addMenu.statHint}</small>
          </button>
        </div>
      </section>

      {/* Recent Lists (Projects & Leads) */}
      <div className="overview-lists-grid">
        {/* Recent Projects */}
        <section className="overview-list-card panel">
          <header className="list-card-header">
            <h4>{copy.overview.recentProjects}</h4>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => onNavigateTab("projects")}
            >
              {copy.overview.seeAll}
            </button>
          </header>

          {recentProjects.length === 0 ? (
            <p className="empty-hint">{copy.overview.noProjects}</p>
          ) : (
            <div className="mini-projects-list">
              {recentProjects.map((p) => (
                <div key={p.id} className="mini-project-row">
                  <div className="mini-project-thumb">
                    {p.coverUrl ? (
                      <Image
                        src={previewUrl(p.coverUrl)}
                        alt=""
                        width={48}
                        height={36}
                        unoptimized
                        className="mini-thumb-img"
                      />
                    ) : (
                      <div className="mini-thumb-empty">
                        <Icon name="image" size={14} />
                      </div>
                    )}
                  </div>
                  <div className="mini-project-info">
                    <strong>{p.title || p.slug}</strong>
                    <small>{p.clientName}</small>
                  </div>
                  <span className={`status-badge badge-${p.status}`}>
                    {copy.status[p.status]}
                  </span>
                  {user.role !== "viewer" && (
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => onEditProject(p.id)}
                      title={copy.common.edit}
                    >
                      <Icon name="edit" size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent Leads */}
        <section className="overview-list-card panel">
          <header className="list-card-header">
            <h4>{copy.overview.latestLeads}</h4>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => onNavigateTab("leads")}
            >
              {copy.overview.seeAll}
            </button>
          </header>

          {recentLeads.length === 0 ? (
            <p className="empty-hint">{copy.overview.noLeads}</p>
          ) : (
            <div className="mini-leads-list">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="mini-lead-row">
                  <div className="mini-lead-avatar">
                    {lead.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="mini-lead-info">
                    <strong>{lead.name}</strong>
                    <small>
                      {lead.company ||
                        lead.service ||
                        lead.message.slice(0, 30)}
                    </small>
                  </div>
                  <span className={`status-badge badge-${lead.status}`}>
                    {copy.status[lead.status as keyof typeof copy.status] ||
                      lead.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
