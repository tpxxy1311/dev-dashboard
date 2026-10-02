// src/types/spotify.ts
// This file contains TypeScript types related to Spotify data structures.

export type SpotifyTrack = {
  id: string;
  title: string;
  artists: string; // "Artist A, Artist B"
  album: string;
  coverUrl: string | null;
  url: string; // Link zu open.spotify.com
  durationMs: number;
};

export type NowPlaying =
  | {
      status: "playing" | "paused";
      track: SpotifyTrack;
      progressMs: number;
      fetchedAt: number;
    }
  | { status: "lastPlayed"; track: SpotifyTrack; playedAt: string };

// `nowPlaying` is `null` if the Spotify API fails or nothing was ever played.
export type SpotifyPlayback =
  { connected: false } | { connected: true; nowPlaying: NowPlaying | null };
