// src/lib/helpers/theme.ts

export type Theme = "light" | "dark";

/** Name of the cookie that stores the chosen theme (per device). */
export const THEME_COOKIE = "theme";

/**
 * Narrows an unknown value (e.g. a cookie) to a valid theme.
 */
export const isTheme = (value: unknown): value is Theme =>
  value === "light" || value === "dark";

/**
 * Returns the theme that is currently shown: the manual choice on `<html>`,
 * or the system setting if none was made yet. Browser only.
 */
export const getActiveTheme = (): Theme => {
  const chosen = document.documentElement.dataset.theme;
  if (isTheme(chosen)) return chosen;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

/**
 * Applies a theme immediately and remembers it for a year, so the server can
 * render `<html data-theme>` on the next load without a flash. Browser only.
 */
export const setTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
};
