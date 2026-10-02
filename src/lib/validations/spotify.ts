// src/lib/validations/spotify.ts
import { z } from "zod";

// Spotify Web API responses. Only the fields the dashboard uses are validated,
// everything else is stripped.

const imageSchema = z.object({
  url: z.string(),
  width: z.number().nullable(),
});

export const trackSchema = z.object({
  id: z.string(),
  name: z.string(),
  duration_ms: z.number(),
  artists: z.array(z.object({ name: z.string() })),
  album: z.object({
    name: z.string(),
    // Largest first, may be empty.
    images: z.array(imageSchema),
  }),
  external_urls: z.object({
    spotify: z.string(),
  }),
});

// GET /me/player/currently-playing (a 204 with no body means nothing is playing).
export const currentlyPlayingResponseSchema = z.object({
  is_playing: z.boolean(),
  progress_ms: z.number().nullable(),
  // `null` during ads or private sessions. Podcast episodes and local files
  // (no `id`) don't match `trackSchema` and also become `null`, so the widget
  // treats them like "nothing playing".
  item: trackSchema.nullable().catch(null),
});

// GET /me/player/recently-played
export const recentlyPlayedResponseSchema = z.object({
  items: z.array(
    z.object({
      track: trackSchema,
      played_at: z.string(), // ISO 8601
    }),
  ),
});
