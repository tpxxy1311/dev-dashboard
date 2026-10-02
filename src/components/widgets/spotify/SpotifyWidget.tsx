// src/components/widgets/spotify/SpotifyWidget.tsx
import styles from "@/styles/components/widgets/spotify/SpotifyWidget.module.scss";
import SpotifyConnectionButton from "./SpotifyConnectionButton";
import { getSpotifyPlayback } from "@/server/queries/spotify";

const SpotifyWidget = async () => {
  const playback = await getSpotifyPlayback();

  // Temporary output to check the query. Replaced by <NowPlaying> later.
  return (
    <section className={styles.widget} aria-label="Spotify">
      {!playback.connected ? (
        <SpotifyConnectionButton />
      ) : playback.nowPlaying ? (
        <p>
          {playback.nowPlaying.status}: {playback.nowPlaying.track.title} –{" "}
          {playback.nowPlaying.track.artists}
        </p>
      ) : (
        <p>Spotify is unavailable.</p>
      )}
    </section>
  );
};

export default SpotifyWidget;
