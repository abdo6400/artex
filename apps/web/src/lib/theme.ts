import type { SiteTheme } from "@artex/contracts";

export function generateThemeCss(theme?: Partial<SiteTheme> | null): string {
  if (!theme) return "";
  const vars: string[] = [];

  if (theme.primary) {
    vars.push(`--primary: ${theme.primary};`);
    vars.push(`--ring: ${theme.primary};`);
  }
  if (theme.brandNavy) {
    vars.push(`--brand-navy: ${theme.brandNavy};`);
  }
  if (theme.background) {
    vars.push(`--background: ${theme.background};`);
  }
  if (theme.accent) {
    vars.push(`--accent: ${theme.accent};`);
  }
  if (theme.foreground) {
    vars.push(`--foreground: ${theme.foreground};`);
    vars.push(`--card-foreground: ${theme.foreground};`);
  }

  return vars.length > 0 ? `:root {\n  ${vars.join("\n  ")}\n}` : "";
}
