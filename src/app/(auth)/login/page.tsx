// src/app/(auth)/login/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/server/session";
import GitHubSignInButton from "@/components/auth/gitHubSignInButton";

export default async function LoginPage() {
  // Signed-in users don't need the login page. getSession() checks the
  // database, so a stale cookie can't cause a redirect loop with proxy.ts.
  const session = await getSession();
  if (session) redirect("/");

  return <GitHubSignInButton />;
}
