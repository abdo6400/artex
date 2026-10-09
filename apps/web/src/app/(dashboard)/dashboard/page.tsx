import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Dashboard } from "./dashboard";
import { SESSION_COOKIE } from "@/features/dashboard/lib/auth";
import {
  THEME_COOKIE,
  LANG_COOKIE,
  parseTheme,
  parseLang,
} from "@/features/dashboard/shell/preferences";
import {
  adminProjectListResponseSchema,
  leadListResponseSchema,
  sessionResponseSchema,
} from "@artex/contracts";

async function getAdminData(path: string, token: string) {
  const base = process.env.API_INTERNAL_URL ?? "http://localhost:3000";
  try {
    const response = await fetch(`${base}/api/v1/admin/${path}`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok)
      return {
        data: [],
        status: response.status,
        error:
          response.status === 503
            ? "Database is not configured."
            : "Could not load data.",
      };
    const body: unknown = await response.json();
    const parsed =
      path === "projects"
        ? adminProjectListResponseSchema.safeParse(body)
        : leadListResponseSchema.safeParse(body);
    if (!parsed.success)
      return {
        data: [],
        status: 502,
        error: "The server returned an invalid response.",
      };
    return {
      data: parsed.data.data,
      status: response.status,
      error: undefined,
    };
  } catch {
    return {
      data: [],
      status: 503,
      error: "The platform API is unavailable. Check API_INTERNAL_URL.",
    };
  }
}

export default async function DashboardPage() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) redirect("/dashboard/login");
  const sessionResponse = await fetch(
    `${process.env.API_INTERNAL_URL ?? "http://localhost:3000"}/api/v1/auth/session`,
    { headers: { authorization: `Bearer ${token}` }, cache: "no-store" },
  );
  if (!sessionResponse.ok) redirect("/dashboard/login");
  const session = sessionResponseSchema.parse(await sessionResponse.json());
  if (session.data.mfaRequired) redirect("/dashboard/security");
  const [projects, leads] = await Promise.all([
    getAdminData("projects", token),
    getAdminData("leads", token),
  ]);
  if (projects.status === 401 || leads.status === 401)
    redirect("/dashboard/login");

  const theme = parseTheme(store.get(THEME_COOKIE)?.value);
  const lang = parseLang(store.get(LANG_COOKIE)?.value);

  return (
    <Dashboard
      projects={
        adminProjectListResponseSchema.parse({ data: projects.data }).data
      }
      leads={leadListResponseSchema.parse({ data: leads.data }).data}
      error={projects.error ?? leads.error}
      user={session.data.user}
      publicSiteUrl={process.env.WEB_ORIGIN ?? "http://localhost:3000"}
      initialTheme={theme}
      initialLang={lang}
    />
  );
}
