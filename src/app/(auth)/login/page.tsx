// src/app/(auth)/login/page.tsx
import styles from "@/styles/layout/pages/Login.module.scss";
import { redirect } from "next/navigation";
import { getSession } from "@/server/session";
import GitHubSignInButton from "@/components/auth/gitHubSignInButton";

export default async function LoginPage() {
  // Signed-in users don't need the login page. getSession() checks the
  // database, so a stale cookie can't cause a redirect loop with proxy.ts.
  const session = await getSession();
  if (session) redirect("/");

  return (
    <div className={styles.page}>
      <div className={styles.loginContainer}>
        <h2 className={styles.headline}>Let's get started!</h2>
        <p className={styles.subtext}>Sign in with your GitHub Account to access your personal Dashboard.</p>
        <GitHubSignInButton />
      </div>
    </div>
  );
}
