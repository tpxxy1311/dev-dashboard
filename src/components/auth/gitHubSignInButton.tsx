// src/components/auth/gitHubSignInButton.tsx
"use client";
import { authClient } from "@/lib/auth-client";

const GitHubSignInButton = () => (
  <button
    onClick={() =>
      authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
      })
    }
  >
    Sign in with GitHub
  </button>
);

export default GitHubSignInButton;
