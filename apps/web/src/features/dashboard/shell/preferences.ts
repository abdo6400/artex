export type Theme = "light" | "dark";
export type UiLang = "ar" | "en";

export const THEME_COOKIE = "artex_dashboard_theme";
export const LANG_COOKIE = "artex_dashboard_lang";

export function parseTheme(value: string | undefined): Theme {
  return value === "light" ? "light" : "dark";
}

/** Arabic is the default interface language. */
export function parseLang(value: string | undefined): UiLang {
  return value === "en" ? "en" : "ar";
}

/** Persist a preference for one year and apply it to <html> immediately. */
export function savePreference(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
}
