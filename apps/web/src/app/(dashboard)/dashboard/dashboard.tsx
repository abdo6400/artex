"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dictionaries, CopyContext } from "@/features/dashboard/i18n/copy";
import { ToastProvider } from "@/features/dashboard/shell/toast";
import { AppShell, type NavTabId } from "@/features/dashboard/shell/app-shell";
import type { Theme, UiLang } from "@/features/dashboard/shell/preferences";

import { OverviewView } from "@/features/dashboard/overview/overview-view";
import {
  ProjectGrid,
  type ProjectSummaryItem,
} from "@/features/dashboard/projects/project-grid";
import {
  QuickAddModal,
  type ProjectDraftValues,
} from "@/features/dashboard/projects/quick-add-modal";
import { ProjectDrawer } from "@/features/dashboard/projects/project-drawer";
import { SiteEditor } from "@/features/dashboard/site/site-editor";
import type { SiteSectionId } from "@/features/dashboard/site/types";
import {
  LeadsView,
  type LeadItem,
} from "@/features/dashboard/leads/leads-view";
import { UserManagement } from "@/features/dashboard/users/user-management";
import { logout } from "./login/actions";

type DashboardProps = {
  projects: ProjectSummaryItem[];
  leads: LeadItem[];
  error?: string;
  user: { name: string; email: string; role: string };
  publicSiteUrl: string;
  initialTheme: Theme;
  initialLang: UiLang;
};

export function Dashboard(props: DashboardProps) {
  const [theme, setTheme] = useState<Theme>(props.initialTheme);
  const [lang, setLang] = useState<UiLang>(props.initialLang);

  const copy = dictionaries[lang];

  return (
    <CopyContext.Provider value={{ copy, lang }}>
      <ToastProvider>
        <DashboardInner
          {...props}
          theme={theme}
          onThemeChange={setTheme}
          lang={lang}
          onLangChange={setLang}
        />
      </ToastProvider>
    </CopyContext.Provider>
  );
}

function DashboardInner({
  projects,
  leads,
  error,
  user,
  publicSiteUrl,
  theme,
  onThemeChange,
  lang,
  onLangChange,
}: DashboardProps & {
  theme: Theme;
  onThemeChange: (t: Theme) => void;
  lang: UiLang;
  onLangChange: (l: UiLang) => void;
}) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<NavTabId>("overview");
  const [websiteSection, setWebsiteSection] = useState<SiteSectionId>("hero");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [drawerState, setDrawerState] = useState<{
    isOpen: boolean;
    projectId: string | null;
    initialValues?: ProjectDraftValues | null;
  }>({
    isOpen: false,
    projectId: null,
    initialValues: null,
  });

  const newLeadsCount = leads.filter((l) => l.status === "new").length;

  function refresh() {
    router.refresh();
  }

  function handleOpenDrawerForEdit(id: string) {
    setDrawerState({ isOpen: true, projectId: id, initialValues: null });
  }

  function handleOpenDrawerNew(initial?: ProjectDraftValues) {
    setDrawerState({
      isOpen: true,
      projectId: null,
      initialValues: initial || null,
    });
  }

  return (
    <AppShell
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      websiteSection={websiteSection}
      onSelectWebsiteSection={(section) => {
        setWebsiteSection(section);
        setActiveTab("website");
      }}
      user={user}
      newLeadsCount={newLeadsCount}
      publicSiteUrl={publicSiteUrl}
      theme={theme}
      onThemeChange={onThemeChange}
      lang={lang}
      onLangChange={onLangChange}
      onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      onQuickAction={(action) => {
        if (action === "project") setIsQuickAddOpen(true);
        else {
          setWebsiteSection(
            action === "service"
              ? "services"
              : action === "client"
                ? "clients"
                : action === "stat"
                  ? "stats"
                  : "hero",
          );
          setActiveTab("website");
        }
      }}
      onSignOut={() => {
        const form = document.createElement("form");
        form.action = logout as unknown as string;
        form.method = "POST";
        document.body.appendChild(form);
        form.submit();
      }}
    >
      {error && <div className="banner error">{error}</div>}

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <OverviewView
          user={user}
          projects={projects}
          leads={leads}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onNavigateTab={setActiveTab}
          onEditProject={handleOpenDrawerForEdit}
        />
      )}

      {/* PROJECTS TAB */}
      {activeTab === "projects" && (
        <ProjectGrid
          projects={projects}
          userRole={user.role}
          onEdit={handleOpenDrawerForEdit}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          onRefresh={refresh}
        />
      )}

      {/* WEBSITE TAB */}
      {activeTab === "website" && user.role !== "viewer" && (
        <SiteEditor activeSection={websiteSection} />
      )}

      {/* LEADS TAB */}
      {activeTab === "leads" && <LeadsView leads={leads} onRefresh={refresh} />}

      {/* USERS TAB */}
      {activeTab === "users" && user.role === "owner" && <UserManagement />}

      {/* QUICK ADD MODAL */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onCreated={refresh}
        onOpenFullEditor={handleOpenDrawerNew}
      />

      {/* FULL PROJECT DRAWER */}
      <ProjectDrawer
        isOpen={drawerState.isOpen}
        projectId={drawerState.projectId}
        initialValues={drawerState.initialValues}
        onClose={() =>
          setDrawerState({
            isOpen: false,
            projectId: null,
            initialValues: null,
          })
        }
        onSaved={refresh}
      />
    </AppShell>
  );
}
