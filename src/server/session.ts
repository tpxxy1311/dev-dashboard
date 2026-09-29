// src/server/session.ts
import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/**
 * Returns the current session, or `null` if the user is not signed in.
 *
 * Validates the session against the database (unlike the proxy, which only
 * checks for the presence of the cookie). Wrapped in React `cache()` so the
 * lookup runs at most once per request, no matter how many components call it.
 *
 * Use this where signed-out users are allowed, e.g. to toggle UI.
 */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/**
 * Returns the signed-in user, or redirects to `/login` if there is no session.
 *
 * Call this at the top of every protected query and page. Not cached itself —
 * it reuses the cached `getSession()`.
 */
export const requireUser = async () => {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
};
