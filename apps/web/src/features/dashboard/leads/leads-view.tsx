"use client";

import { useMemo, useState } from "react";
import { useCopy } from "@/features/dashboard/i18n/copy";
import { useToast } from "@/features/dashboard/shell/toast";
import { Icon } from "@/features/dashboard/shell/icons";

export type LeadItem = {
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

type LeadsViewProps = {
  leads: LeadItem[];
  onRefresh: () => void;
};

export function LeadsView({ leads, onRefresh }: LeadsViewProps) {
  const { copy } = useCopy();
  const { notify } = useToast();

  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filter !== "all" && lead.status !== filter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        lead.name.toLowerCase().includes(q) ||
        (lead.email && lead.email.toLowerCase().includes(q)) ||
        lead.company.toLowerCase().includes(q) ||
        lead.service.toLowerCase().includes(q) ||
        lead.message.toLowerCase().includes(q)
      );
    });
  }, [leads, filter, search]);

  async function updateStatus(id: string, newStatus: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error(copy.common.requestFailed);
      notify(copy.leads.updated, "success");
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
    <section className="leads-container">
      <header className="leads-top-bar">
        <div className="search-wrap">
          <Icon name="search" size={16} />
          <input
            type="search"
            placeholder={copy.common.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-chips">
          {(
            [
              ["all", copy.common.all],
              ["new", copy.status.new],
              ["contacted", copy.status.contacted],
              ["closed", copy.status.closed],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`filter-chip ${filter === key ? "active" : ""}`}
              onClick={() => setFilter(key)}
            >
              <span>{label}</span>
              <span className="chip-count">
                {key === "all"
                  ? leads.length
                  : leads.filter((l) => l.status === key).length}
              </span>
            </button>
          ))}
        </div>
      </header>

      {filteredLeads.length === 0 ? (
        <div className="empty-state-box">
          <Icon name="inbox" size={36} />
          <p>{copy.leads.empty}</p>
        </div>
      ) : (
        <div className="leads-grid">
          {filteredLeads.map((lead) => {
            const isBusy = busyId === lead.id;
            return (
              <article key={lead.id} className="lead-card panel">
                <div className="lead-card-top">
                  <div>
                    <h4 className="lead-name">{lead.name}</h4>
                    <span className="lead-subtitle">
                      {lead.company || copy.leads.independent} ·{" "}
                      {lead.service || copy.leads.general}
                    </span>
                  </div>
                  <span className={`status-badge badge-${lead.status}`}>
                    {copy.status[lead.status as keyof typeof copy.status] ||
                      lead.status}
                  </span>
                </div>

                <p className="lead-message">{lead.message}</p>

                {lead.budget && (
                  <div className="lead-budget-tag">
                    <small>{copy.leads.budget}:</small>{" "}
                    <strong>{lead.budget}</strong>
                  </div>
                )}

                <div className="lead-contact-info">
                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}
                      className="lead-email-link"
                    >
                      <Icon name="mail" size={13} />
                      <span>{lead.email}</span>
                    </a>
                  )}
                  <time className="lead-time">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </time>
                </div>

                <footer className="lead-actions-row">
                  {lead.email && (
                    <a href={`mailto:${lead.email}`} className="btn-ghost">
                      <Icon name="mail" size={13} />
                      <span>{copy.leads.reply}</span>
                    </a>
                  )}

                  {lead.status === "new" && (
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={isBusy}
                      onClick={() => updateStatus(lead.id, "contacted")}
                    >
                      <span>{copy.leads.markContacted}</span>
                    </button>
                  )}

                  {lead.status !== "closed" && (
                    <button
                      type="button"
                      className="btn-ghost"
                      disabled={isBusy}
                      onClick={() => updateStatus(lead.id, "closed")}
                    >
                      <span>{copy.leads.close}</span>
                    </button>
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
