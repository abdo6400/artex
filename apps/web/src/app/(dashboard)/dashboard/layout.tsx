import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./dashboard.css";
import { cookies } from "next/headers";
import { connection } from "next/server";
import {
  THEME_COOKIE,
  LANG_COOKIE,
  parseTheme,
  parseLang,
} from "@/features/dashboard/shell/preferences";

export const metadata: Metadata = {
  title: "Artex Dashboard",
  description: "Secure content management for Artex Production.",
  applicationName: "Artex Dashboard",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  robots: { index: false, follow: false, nocache: true },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  await connection();
  const store = await cookies();
  const theme = parseTheme(store.get(THEME_COOKIE)?.value);
  const lang = parseLang(store.get(LANG_COOKIE)?.value);
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir} data-theme={theme}>
      <body>{children}</body>
    </html>
  );
}
