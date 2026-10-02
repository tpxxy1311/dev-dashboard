// src/server/queries/spotify.ts
import "server-only";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { z } from "zod";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { account } from "@/server/db/schema";
import { requireUser } from "@/server/session";
import {
  currentlyPlayingResponseSchema,
  recentlyPlayedResponseSchema,
  type trackSchema,
} from "@/lib/validations/spotify";
import type {
  NowPlaying,
  SpotifyPlayback,
  SpotifyTrack,
} from "@/types/spotify";

const API_URL = "https://api.spotify.com/v1";
// Smallest cover that still looks sharp in the widget. Spotify usually
// returns 640, 300 and 64 px versions.
const MIN_COVER_WIDTH = 300;

const spotifyFetch = async (path: string, token: string) => {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    // Playback state changes constantly, so never cache it.
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Spotify API ${path} responded ${res.status}`);
  return res;
};

/**
 * Returns a valid Spotify access token for the user, refreshed by Better Auth
 * if needed. `null` if the user has not linked a Spotify account.
 */
const getSpotifyToken = async (userId: string): Promise<string | null> => {
  const [spotifyAccount] = await db
    .select({ id: account.id })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "spotify")))
    .limit(1);
  if (!spotifyAccount) return null;

  const { accessToken } = await auth.api.getAccessToken({
    body: { accountId: spotifyAccount.id },
    headers: await headers(),
  });
  return accessToken;
};

const toTrack = (track: z.infer<typeof trackSchema>): SpotifyTrack => {
  // Images come largest first: pick the last one that is still big enough.
  const cover =
    track.album.images.findLast(
      (image) => (image.width ?? 0) >= MIN_COVER_WIDTH,
    ) ?? track.album.images[0];

  return {
    id: track.id,
    title: track.name,
    artists: track.artists.map((artist) => artist.name).join(", "),
    album: track.album.name,
    coverUrl: cover?.url ?? null,
    url: track.external_urls.spotify,
    durationMs: track.duration_ms,
  };
};

/**
 * Returns the track currently playing or paused, or `null` if there is no
 * active session or the item is not a track (ad, podcast, local file).
 */
const getCurrentlyPlaying = async (
  token: string,
): Promise<NowPlaying | null> => {
  const res = await spotifyFetch("/me/player/currently-playing", token);
  // 204: no active playback session.
  if (res.status === 204) return null;

  const { is_playing, progress_ms, item } =
    currentlyPlayingResponseSchema.parse(await res.json());
  if (!item) return null;

  return {
    status: is_playing ? "playing" : "paused",
    track: toTrack(item),
    progressMs: progress_ms ?? 0,
    fetchedAt: Date.now(),
  };
};

/** Returns the most recently played track, or `null` if there is none. */
const getLastPlayed = async (token: string): Promise<NowPlaying | null> => {
  const res = await spotifyFetch("/me/player/recently-played?limit=1", token);
  const [last] = recentlyPlayedResponseSchema.parse(await res.json()).items;
  if (!last) return null;

  return {
    status: "lastPlayed",
    track: toTrack(last.track),
    playedAt: last.played_at,
  };
};

/**
 * Returns what the signed-in user is listening to on Spotify: the current
 * track (playing or paused), otherwise the last played one. Used by the
 * widget on first render and by the polling Route Handler.
 */
export const getSpotifyPlayback = async (): Promise<SpotifyPlayback> => {
  const user = await requireUser();

  try {
    const token = await getSpotifyToken(user.id);
    if (!token) return { connected: false };

    const nowPlaying =
      (await getCurrentlyPlaying(token)) ?? (await getLastPlayed(token));
    return { connected: true, nowPlaying };
  } catch (error) {
    console.error("Failed to load Spotify playback", error);
    return { connected: true, nowPlaying: null };
  }
};
