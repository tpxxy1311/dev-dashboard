// src/components/widgets/spotify/WakaTimeConnectionButton.tsx
"use client";

import styles from "@/styles/components/widgets/wakatime/WakaTimeConnectionButton.module.scss";
import { useTransition } from "react";
import { authClient } from "@/lib/auth-client";

const WakaTimeConnectionButton = () => {
  const [isPending, startTransition] = useTransition();

  const handleConnect = () =>
    startTransition(async () => {
      await authClient.linkSocial({
        provider: "wakatime",
        callbackURL: "/",
        errorCallbackURL: "/",
      });
    });

  return (
    <button className={styles.spotifyButton} onClick={handleConnect}>
      {isPending ? "Connecting…" : "Connect WakaTime"}
    </button>
  );
};

export default WakaTimeConnectionButton;
