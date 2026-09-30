// src/hooks/useCanGoBack.ts
import { useSyncExternalStore } from "react";

// TypeScript's DOM lib doesn't include the Navigation API yet, so this types
// only the parts used here.
type NavigationLike = EventTarget & { canGoBack: boolean };

const getNavigation = () =>
  (window as Window & { navigation?: NavigationLike }).navigation;

/**
 * Re-checks whenever the current history entry changes (every navigation,
 * including back/forward).
 */
const subscribe = (onChange: () => void) => {
  const navigation = getNavigation();
  navigation?.addEventListener("currententrychange", onChange);
  return () => navigation?.removeEventListener("currententrychange", onChange);
};

// canGoBack only counts same-origin entries, so "back" never leaves the app
// (e.g. to the GitHub login page). Browsers without the API get `false`.
const getSnapshot = () => getNavigation()?.canGoBack ?? false;

// The server has no history, so the button starts out disabled.
const getServerSnapshot = () => false;

/**
 * Returns whether there is a previous page within this app to go back to.
 */
export const useCanGoBack = (): boolean =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
