// src/components/widgets/spotify/SpotifyWidget.tsx
import styles from "@/styles/components/widgets/spotify/SpotifyWidget.module.scss";
import SpotifyConnectionButton from "./SpotifyConnectionButton";
import { getSpotifyPlayback } from "@/server/queries/spotify";
import SpotifyNowPlaying from "./SpotifyNowPlaying";

const SpotifyWidget = async () => {
  const playback = await getSpotifyPlayback();

  // Temporary output to check the query. Replaced by <NowPlaying> later.
  return (
    <section className={styles.widget} aria-label="Spotify">
      {!playback.connected ? (
        <SpotifyConnectionButton />
      ) : playback.nowPlaying ? (
        <SpotifyNowPlaying initial={playback.nowPlaying} />
      ) : (
        <p>Spotify is unavailable.</p>
      )}
    </section>
  );
};

export default SpotifyWidget;
