// src/components/widgets/spotify/SpotifyProgress.tsx
import type { CSSProperties } from "react";
import styles from "@/styles/components/widgets/spotify/SpotifyProgress.module.scss";

type Props = {
  progressMs: number;
  durationMs: number;
  isPlaying: boolean;
};

/**
 * Progress bar that runs on its own via a CSS animation: it starts at the
 * current position and fills up over the remaining time. The parent passes a
 * new `key` on every poll, which restarts the animation with fresh values and
 * corrects any drift.
 */
const SpotifyProgress = ({ progressMs, durationMs, isPlaying }: Props) => {
  const start = durationMs > 0 ? Math.min(progressMs / durationMs, 1) : 0;
  const remainingMs = Math.max(durationMs - progressMs, 0);

  return (
    <div className={styles.track} aria-hidden="true">
      <div
        className={styles.bar}
        data-playing={isPlaying}
        style={
          {
            "--start": start,
            "--remaining": `${remainingMs}ms`,
          } as CSSProperties
        }
      />
    </div>
  );
};

export default SpotifyProgress;
