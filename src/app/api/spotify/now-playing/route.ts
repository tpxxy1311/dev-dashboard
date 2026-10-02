// src/app/api/spotify/now-playing/route.ts
import { getSpotifyPlayback } from "@/server/queries/spotify";
import { requireUser } from "@/server/session";

/**
 * Polled by the Spotify widget to keep the current track up to date. Returns
 * the same data the widget gets on first render.
 */
export async function GET() {
  await requireUser();

  const playback = await getSpotifyPlayback();

  return Response.json(playback, {
    // Playback changes constantly: the browser must not reuse old responses.
    headers: { "Cache-Control": "no-store" },
  });
}
