// src/components/widgets/spotify/SpotifyConnectionButton.tsx
"use client";

import styles from "@/styles/components/widgets/spotify/SpotifyConnectionButton.module.scss";
import { useTransition } from "react";
import { authClient } from "@/lib/auth-client";

const SpotifyConnectionButton = () => {
  const [isPending, startTransition] = useTransition();

  const handleConnect = () =>
    startTransition(async () => {
      await authClient.linkSocial({
        provider: "spotify",
        callbackURL: "/",
        errorCallbackURL: "/",
      });
    });

  return (
    <button className={styles.spotifyButton} onClick={handleConnect}>
      {isPending ? "Connecting…" : "Connect Spotify"}
    </button>
  );
};

export default SpotifyConnectionButton;
