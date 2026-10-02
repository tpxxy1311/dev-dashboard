// src/components/widgets/spotify/SpotifyNowPlaying.tsx
"use client";

import styles from "@/styles/components/widgets/spotify/SpotifyNowPlaying.module.scss";
import type { NowPlaying, SpotifyPlayback } from "@/types/spotify";
import Image from "next/image";
import { useEffect, useState } from "react";
import SpotifyProgress from "./SpotifyProgress";

const ACTIVE_POLL_MS = 20_000; // playing / paused
const IDLE_POLL_MS = 60_000; // lastPlayed

const statusLabels: Record<NowPlaying["status"], string> = {
  playing: "Now playing",
  paused: "Paused",
  lastPlayed: "Last played",
};

type Props = { initial: NowPlaying };

const SpotifyNowPlaying = ({ initial }: Props) => {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying>(initial);

  useEffect(() => {
    const pollInterval =
      nowPlaying.status === "lastPlayed" ? IDLE_POLL_MS : ACTIVE_POLL_MS;

    const poll = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch("/api/spotify/now-playing");
        const playback = (await res.json()) as SpotifyPlayback;
        if (playback.connected && playback.nowPlaying) {
          setNowPlaying(playback.nowPlaying);
        }
      } catch {
        // Network error or expired session (HTML instead of JSON): keep the last state.
      }
    };

    // Catch up right away when the tab becomes visible again.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") poll();
    };

    const intervalId = setInterval(poll, pollInterval);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [nowPlaying.status]);

  const { track } = nowPlaying;

  return (
    <div className={styles.nowPlaying} data-status={nowPlaying.status}>
      <div className={styles.cover}>
        {track.coverUrl && (
          // Decorative: the title next to it already names the track.
          <Image src={track.coverUrl} alt="" width={160} height={160} />
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.status}>{statusLabels[nowPlaying.status]}</p>
        <a
          className={styles.title}
          href={track.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {track.title}
        </a>
        <p className={styles.artists}>{track.artists}</p>
      </div>

      {nowPlaying.status !== "lastPlayed" && (
        <div className={styles.progress}>
          <SpotifyProgress
            // New key per poll: restarts the bar animation from fresh values.
            key={nowPlaying.fetchedAt}
            progressMs={nowPlaying.progressMs}
            durationMs={track.durationMs}
            isPlaying={nowPlaying.status === "playing"}
          />
        </div>
      )}
    </div>
  );
};

export default SpotifyNowPlaying;
