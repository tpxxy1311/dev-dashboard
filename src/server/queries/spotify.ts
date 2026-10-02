// src/server/queries/spotify.ts
import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { account } from "@/server/db/schema";
import { requireUser } from "@/server/session";

/** Whether the signed-in user has linked a Spotify account. */
export const isSpotifyConnected = async (): Promise<boolean> => {
  const user = await requireUser();

  const [spotifyAccount] = await db
    .select({ id: account.id })
    .from(account)
    .where(and(eq(account.userId, user.id), eq(account.providerId, "spotify")))
    .limit(1);

  return Boolean(spotifyAccount);
};
