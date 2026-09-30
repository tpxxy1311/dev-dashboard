// src/hooks/useNow.ts
import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

/**
 * Calls `onChange` at the start of every minute, and when the tab becomes
 * visible again (browsers throttle timers in background tabs).
 */
const subscribe = (onChange: () => void) => {
  let timeout: ReturnType<typeof setTimeout>;

  const schedule = () => {
    timeout = setTimeout(
      () => {
        onChange();
        schedule();
      },
      MINUTE - (Date.now() % MINUTE),
    );
  };

  const onVisibilityChange = () => {
    if (document.visibilityState === "visible") onChange();
  };

  schedule();
  document.addEventListener("visibilitychange", onVisibilityChange);

  return () => {
    clearTimeout(timeout);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
};

// The snapshot is the current minute as a number, so it stays equal
// (no re-render) until the minute actually changes.
const getSnapshot = () => Math.floor(Date.now() / MINUTE) * MINUTE;

// The server doesn't know the user's timezone, so it renders no time at all.
const getServerSnapshot = () => null;

/**
 * Returns the current time, updated every minute, or `null` during server
 * rendering and hydration. Render a placeholder while it is `null`.
 */
export const useNow = (): Date | null => {
  const minute = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return minute === null ? null : new Date(minute);
};
