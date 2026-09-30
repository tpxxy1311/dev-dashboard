// src/server/actions/signOut.ts
"use server";

import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

// Deletes the session in the database and clears the cookie, then goes to /login.
export const signOut = async () => {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
};
