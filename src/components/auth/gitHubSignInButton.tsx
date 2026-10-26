// src/components/auth/gitHubSignInButton.tsx
"use client";

import styles from "@/styles/components/auth/GitHubSignInButton.module.scss";
import { authClient } from "@/lib/auth-client";
import GitHubIcon from "@/components/icons/gitHubIcon";

const GitHubSignInButton = () => (
  <button
  className={styles.signInButton}
    onClick={() =>
      authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
      })
    }
  >
    <GitHubIcon className={styles.icon} />
    Sign in with GitHub
  </button>
);

export default GitHubSignInButton;
