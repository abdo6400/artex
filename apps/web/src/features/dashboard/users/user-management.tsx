"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { userListResponseSchema } from "@artex/contracts";
import { useCopy } from "@/features/dashboard/i18n/copy";
import { Icon } from "@/features/dashboard/shell/icons";
import { useToast } from "@/features/dashboard/shell/toast";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

export function UserManagement() {
  const router = useRouter();
  const { copy } = useCopy();
  const { notify } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      const result = userListResponseSchema.safeParse(await response.json());
      if (!response.ok || !result.success)
        throw new Error(copy.users.loadFailed);
      setUsers(result.data.data);
    } catch (error) {
      notify(
        error instanceof Error ? error.message : copy.users.loadFailed,
        "error",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    async function loadInitial() {
      try {
        const response = await fetch("/api/admin/users");
        const result = userListResponseSchema.safeParse(await response.json());
        if (!response.ok || !result.success)
          throw new Error(copy.users.loadFailed);
        if (active) setUsers(result.data.data);
      } catch (error) {
        if (active) {
          notify(
            error instanceof Error ? error.message : copy.users.loadFailed,
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
  }, [copy.users.loadFailed, notify]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setCreating(true);
    try {
      const data = Object.fromEntries(new FormData(form));
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.title ?? copy.users.loadFailed);
      }
      form.reset();
      notify(copy.users.created, "success");
      await load();
    } catch (error) {
      notify(
        error instanceof Error ? error.message : copy.users.loadFailed,
        "error",
      );
    } finally {
      setCreating(false);
    }
  }

  async function change(
    user: User,
    update: { isActive?: boolean; role?: string },
  ) {
    setBusyId(user.id);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(update),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.title ?? copy.users.loadFailed);
      }
      notify(copy.users.updated, "success");
      await load();
      router.refresh();
    } catch (error) {
      notify(
        error instanceof Error ? error.message : copy.users.loadFailed,
        "error",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="team-access-page">
      <header className="team-page-header">
        <div>
          <span className="eyebrow">{copy.users.security}</span>
          <h2>{copy.users.title}</h2>
          <p>{copy.users.sub}</p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          disabled={loading}
          onClick={() => void load()}
        >
          <Icon name="arrowDown" size={14} />
          <span>{copy.users.refresh}</span>
        </button>
      </header>

      <div className="team-invite-panel panel">
        <div className="team-invite-heading">
          <span className="team-invite-icon">
            <Icon name="users" size={20} />
          </span>
          <div>
            <h3>{copy.users.inviteTitle}</h3>
            <p>{copy.users.inviteSub}</p>
          </div>
        </div>

        <form className="team-invite-form" onSubmit={submit}>
          <label>
            <span>{copy.users.name}</span>
            <input name="name" minLength={2} required />
          </label>
          <label>
            <span>{copy.users.email}</span>
            <input name="email" type="email" required />
          </label>
          <label>
            <span>{copy.users.password}</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
            />
            <small>{copy.users.passwordHint}</small>
          </label>
          <label>
            <span>{copy.users.role}</span>
            <select name="role" defaultValue="viewer">
              {(["viewer", "editor", "admin", "owner"] as const).map((role) => (
                <option key={role} value={role}>
                  {copy.roles[role]}
                </option>
              ))}
            </select>
          </label>
          <button
            className="btn-primary team-create-button"
            disabled={creating}
          >
            <Icon name="plus" size={15} />
            <span>{creating ? copy.users.creating : copy.users.create}</span>
          </button>
        </form>
      </div>

      <div className="team-list-panel panel">
        <div className="team-list-heading">
          <div>
            <h3>{copy.users.accounts}</h3>
            <p>{copy.users.accountsSub}</p>
          </div>
          <span className="team-count-badge">{users.length}</span>
        </div>

        {loading ? (
          <div className="team-loading-state">
            <Icon name="sparkle" size={22} />
            <span>{copy.common.loading}</span>
          </div>
        ) : users.length === 0 ? (
          <div className="team-loading-state">
            <Icon name="users" size={24} />
            <span>{copy.users.empty}</span>
          </div>
        ) : (
          <div className="team-table-wrap">
            <table className="team-table">
              <thead>
                <tr>
                  <th>{copy.users.account}</th>
                  <th>{copy.users.role}</th>
                  <th>{copy.users.status}</th>
                  <th>{copy.users.actions}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isBusy = busyId === user.id;
                  return (
                    <tr key={user.id}>
                      <td data-label={copy.users.account}>
                        <div className="team-account-cell">
                          <span className="team-account-avatar">
                            {user.name.slice(0, 1).toUpperCase()}
                          </span>
                          <span>
                            <strong>{user.name}</strong>
                            <small>{user.email}</small>
                          </span>
                        </div>
                      </td>
                      <td data-label={copy.users.role}>
                        <select
                          className="team-role-select"
                          value={user.role}
                          aria-label={`${copy.users.role}: ${user.name}`}
                          disabled={isBusy}
                          onChange={(event) =>
                            void change(user, { role: event.target.value })
                          }
                        >
                          {(
                            ["viewer", "editor", "admin", "owner"] as const
                          ).map((role) => (
                            <option key={role} value={role}>
                              {copy.roles[role]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td data-label={copy.users.status}>
                        <span
                          className={`team-status-badge ${user.isActive ? "active" : "inactive"}`}
                        >
                          <span className="team-status-dot" />
                          {user.isActive
                            ? copy.users.active
                            : copy.users.inactive}
                        </span>
                      </td>
                      <td data-label={copy.users.actions}>
                        <button
                          type="button"
                          className={`team-access-button ${user.isActive ? "danger" : "success"}`}
                          disabled={isBusy}
                          onClick={() =>
                            void change(user, { isActive: !user.isActive })
                          }
                        >
                          <Icon
                            name={user.isActive ? "lock" : "check"}
                            size={14}
                          />
                          <span>
                            {user.isActive
                              ? copy.users.disable
                              : copy.users.enable}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
