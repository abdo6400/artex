"use client";

import { useState, type ReactNode } from "react";
import { useCopy } from "@/features/dashboard/i18n/copy";
import type { SiteSectionId } from "@/features/dashboard/site/types";
import { Icon, type IconName } from "./icons";
import {
  savePreference,
  THEME_COOKIE,
  LANG_COOKIE,
  type Theme,
  type UiLang,
} from "./preferences";

export type NavTabId = "overview" | "projects" | "website" | "leads" | "users";

type AppShellProps = {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  websiteSection: SiteSectionId;
  onSelectWebsiteSection: (section: SiteSectionId) => void;
  user: { name: string; email: string; role: string };
  newLeadsCount: number;
  publicSiteUrl: string;
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  lang: UiLang;
  onLangChange: (l: UiLang) => void;
  onOpenQuickAdd: () => void;
  onQuickAction?: (
    action: "project" | "service" | "client" | "stat" | "hero",
  ) => void;
  onSignOut: () => void;
  children: ReactNode;
};

export function AppShell({
  activeTab,
  onSelectTab,
  websiteSection,
  onSelectWebsiteSection,
  user,
  newLeadsCount,
  publicSiteUrl,
  theme,
  onThemeChange,
  lang,
  onLangChange,
  onOpenQuickAdd,
  onQuickAction,
  onSignOut,
  children,
}: AppShellProps) {
  const { copy } = useCopy();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);

  const navItems: Array<{
    id: NavTabId;
    label: string;
    icon: IconName;
    count?: number;
  }> = [
    { id: "overview", label: copy.nav.overview, icon: "home" },
    { id: "projects", label: copy.nav.projects, icon: "grid" },
    { id: "website", label: copy.nav.website, icon: "globe" },
    { id: "leads", label: copy.nav.leads, icon: "inbox", count: newLeadsCount },
  ];

  if (user.role === "owner") {
    navItems.push({ id: "users", label: copy.nav.users, icon: "users" });
  }

  const websiteSections: Array<{
    id: SiteSectionId;
    label: string;
    icon: IconName;
  }> = [
    { id: "hero", label: copy.site.sections.hero, icon: "home" },
    { id: "about", label: copy.site.sections.about, icon: "layers" },
    { id: "services", label: copy.site.sections.services, icon: "briefcase" },
    { id: "showreel", label: copy.site.sections.showreel, icon: "image" },
    { id: "values", label: copy.site.sections.values, icon: "sparkle" },
    { id: "clients", label: copy.site.sections.clients, icon: "users" },
    { id: "stats", label: copy.site.sections.stats, icon: "chart" },
    { id: "contact", label: copy.site.sections.contact, icon: "mail" },
    { id: "brand", label: copy.site.sections.brand, icon: "image" },
  ];

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    onThemeChange(next);
    savePreference(THEME_COOKIE, next);
    document.documentElement.setAttribute("data-theme", next);
  }

  function toggleLanguage() {
    const next: UiLang = lang === "ar" ? "en" : "ar";
    onLangChange(next);
    savePreference(LANG_COOKIE, next);
    document.documentElement.setAttribute("lang", next);
    document.documentElement.setAttribute("dir", next === "ar" ? "rtl" : "ltr");
  }

  return (
    <div className="admin-app-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <span className="brand-logo-mark" aria-hidden="true">
            A
          </span>
          <div className="brand-text">
            <strong>ARTEX</strong>
            <small>PRODUCTION CONSOLE</small>
          </div>
        </div>

        {/* Global Quick Add Button */}
        {user.role !== "viewer" && (
          <div className="sidebar-quick-add">
            <div className="add-menu-anchor">
              <button
                type="button"
                className="btn-primary global-add-btn"
                onClick={() => setAddMenuOpen(!addMenuOpen)}
              >
                <Icon name="plus" size={16} />
                <span>{copy.add}</span>
                <Icon name={addMenuOpen ? "arrowUp" : "arrowDown"} size={12} />
              </button>

              {addMenuOpen && (
                <div
                  className="quick-add-dropdown-menu"
                  onClick={() => setAddMenuOpen(false)}
                >
                  <button
                    type="button"
                    className="menu-option"
                    onClick={onOpenQuickAdd}
                  >
                    <Icon name="grid" size={15} />
                    <div>
                      <strong>{copy.addMenu.project}</strong>
                      <small>{copy.addMenu.projectHint}</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="menu-option"
                    onClick={() => {
                      onSelectTab("website");
                      onQuickAction?.("service");
                    }}
                  >
                    <Icon name="briefcase" size={15} />
                    <div>
                      <strong>{copy.addMenu.service}</strong>
                      <small>{copy.addMenu.serviceHint}</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="menu-option"
                    onClick={() => {
                      onSelectTab("website");
                      onQuickAction?.("client");
                    }}
                  >
                    <Icon name="users" size={15} />
                    <div>
                      <strong>{copy.addMenu.client}</strong>
                      <small>{copy.addMenu.clientHint}</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="menu-option"
                    onClick={() => {
                      onSelectTab("website");
                      onQuickAction?.("stat");
                    }}
                  >
                    <Icon name="chart" size={15} />
                    <div>
                      <strong>{copy.addMenu.stat}</strong>
                      <small>{copy.addMenu.statHint}</small>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="sidebar-nav">
          <span className="sidebar-section-label">WORKSPACE</span>
          {navItems.map((item) => (
            <div className="sidebar-nav-group" key={item.id}>
              <button
                type="button"
                className={`nav-item-btn ${activeTab === item.id ? "active" : ""}`}
                aria-current={activeTab === item.id ? "page" : undefined}
                onClick={() => {
                  onSelectTab(item.id);
                  if (item.id !== "website") setMobileMenuOpen(false);
                }}
              >
                <span className="nav-item-icon">
                  <Icon name={item.icon} size={18} />
                </span>
                <span className="nav-label">{item.label}</span>
                {typeof item.count === "number" && item.count > 0 && (
                  <span className="nav-counter-pill">{item.count}</span>
                )}
              </button>

              {item.id === "website" && activeTab === "website" && (
                <div className="website-sidebar-subnav">
                  {websiteSections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      className={`website-subnav-item ${websiteSection === section.id ? "active" : ""}`}
                      aria-current={
                        websiteSection === section.id ? "page" : undefined
                      }
                      onClick={() => {
                        onSelectWebsiteSection(section.id);
                        setMobileMenuOpen(false);
                      }}
                    >
                      <Icon name={section.icon} size={14} />
                      <span>{section.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer: Preferences & User */}
        <footer className="sidebar-footer">
          {/* Theme & Language controls */}
          <div className="prefs-controls-row">
            <button
              type="button"
              className="icon-pref-btn"
              onClick={toggleTheme}
              title={theme === "dark" ? copy.theme.light : copy.theme.dark}
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
              <span className="pref-label">
                {theme === "dark" ? copy.theme.light : copy.theme.dark}
              </span>
            </button>

            <button
              type="button"
              className="lang-pref-btn"
              onClick={toggleLanguage}
              title={copy.switchLang}
            >
              <Icon name="globe" size={15} />
              <span>{copy.switchLang}</span>
            </button>
          </div>

          {/* User info */}
          <div className="user-profile-badge">
            <span className="user-avatar-circle">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="user-text">
              <strong>{user.name}</strong>
              <small>
                {copy.roles[user.role as keyof typeof copy.roles] || user.role}
              </small>
            </div>
            <button
              type="button"
              className="signout-icon-btn"
              onClick={onSignOut}
              title={copy.signOut}
            >
              <Icon name="logout" size={16} />
            </button>
          </div>
        </footer>
      </aside>

      {mobileMenuOpen && (
        <button
          type="button"
          className="sidebar-mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Main Workspace Area */}
      <div className="admin-main-wrapper">
        <header className="workspace-top-bar">
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <Icon name={mobileMenuOpen ? "close" : "menu"} size={20} />
          </button>

          <div className="top-bar-title-group">
            <span className="top-bar-eyebrow">ARTEX CONSOLE</span>
            <h2>
              {navItems.find((i) => i.id === activeTab)?.label ||
                copy.nav.overview}
            </h2>
          </div>

          <div className="top-bar-actions">
            <a
              href={`${publicSiteUrl}/${lang}`}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost view-site-link"
            >
              <Icon name="external" size={14} />
              <span>{copy.viewSite}</span>
            </a>
          </div>
        </header>

        <main className="workspace-scroll-area">{children}</main>
      </div>
    </div>
  );
}
