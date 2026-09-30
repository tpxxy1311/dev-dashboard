// src/server/queries/notes.ts
import "server-only";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { notes } from "@/server/db/schema";
import { requireUser } from "@/server/session";
import type { Note } from "@/types/note";

// Pinned notes first (most recently pinned on top), then newest first.
const pinnedFirst = [
  sql`${notes.pinnedAt} desc nulls last`,
  desc(notes.createdAt),
];

/**
 * Returns all notes of the signed-in user, pinned notes first.
 */
export const getNotes = async (): Promise<Note[]> => {
  const user = await requireUser();

  return db
    .select()
    .from(notes)
    .where(eq(notes.userId, user.id))
    .orderBy(...pinnedFirst);
};

/**
 * Returns the note for the dashboard widget: the most recently pinned note,
 * or the newest note if none is pinned. `null` if the user has no notes.
 */
export const getFeaturedNote = async (): Promise<Note | null> => {
  const user = await requireUser();

  const [note] = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, user.id))
    .orderBy(...pinnedFirst)
    .limit(1);

  return note ?? null;
};
