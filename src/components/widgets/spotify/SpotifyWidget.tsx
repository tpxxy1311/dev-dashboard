// src/components/widgets/spotify/SpotifyWidget.tsx
import styles from "@/styles/components/widgets/spotify/SpotifyWidget.module.scss";
import SpotifyConnectionButton from "./SpotifyConnectionButton";
import { isSpotifyConnected } from "@/server/queries/spotify";

const SpotifyWidget = async () => {
  const connected = await isSpotifyConnected();

  return (
    <section className={styles.widget} aria-label="Spotify">
      {connected ? <p>Spotify connected ✓</p> : <SpotifyConnectionButton />}
    </section>
  );
};

export default SpotifyWidget;
