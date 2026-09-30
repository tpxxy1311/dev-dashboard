// src/server/actions/notes.ts
"use server";

import "server-only";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { notes } from "@/server/db/schema";
import { requireUser } from "@/server/session";
import {
  createNoteSchema,
  updateNoteSchema,
  togglePinNoteSchema,
  deleteNoteSchema,
} from "@/lib/validations/notes";
import type { ActionResult } from "@/types/action";
import type { Note } from "@/types/note";

// Notes appear on the notes page and in the dashboard widget.
const revalidateNotes = () => {
  revalidatePath("/");
  revalidatePath("/notes");
};

/**
 * Creates a note for the signed-in user. `input` is `unknown` on purpose:
 * Server Actions are public POST endpoints, so everything is validated here.
 */
export const createNote = async (
  input: unknown,
): Promise<ActionResult<Note>> => {
  const user = await requireUser();

  const parsed = createNoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Invalid input",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  // userId always comes from the session, never from the client.
  const [note] = await db
    .insert(notes)
    .values({
      title: parsed.data.title,
      content: parsed.data.content,
      userId: user.id,
    })
    .returning();

  revalidateNotes();
  return { ok: true, data: note };
};

/**
 * Updates title and content of a note. Filters on id AND userId, so a note id
 * belonging to another user matches no row and is reported as not found.
 */
export const updateNote = async (
  input: unknown,
): Promise<ActionResult<Note>> => {
  const user = await requireUser();

  const parsed = updateNoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Invalid input",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { id, title, content } = parsed.data;
  const [note] = await db
    .update(notes)
    .set({ title, content })
    .where(and(eq(notes.id, id), eq(notes.userId, user.id)))
    .returning();

  if (!note) return { ok: false, error: "Note not found" };

  revalidateNotes();
  return { ok: true, data: note };
};

/**
 * Pins or unpins a note. Filters on id AND userId, so a note id belonging to
 * another user matches no row and is reported as not found.
 */
export const toggleNotePin = async (
  input: unknown,
): Promise<ActionResult<Note>> => {
  const user = await requireUser();

  const parsed = togglePinNoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Invalid input",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { id, pinned } = parsed.data;
  const [note] = await db
    .update(notes)
    .set({ pinnedAt: pinned ? new Date() : null })
    .where(and(eq(notes.id, id), eq(notes.userId, user.id)))
    .returning();

  if (!note) return { ok: false, error: "Note not found" };

  revalidateNotes();
  return { ok: true, data: note };
};

/**
 * Deletes a note. Filters on id AND userId, so a note id belonging to another
 * user matches no row and is reported as not found.
 */
export const deleteNote = async (
  input: unknown,
): Promise<ActionResult<{ id: string }>> => {
  const user = await requireUser();

  const parsed = deleteNoteSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const [deleted] = await db
    .delete(notes)
    .where(and(eq(notes.id, parsed.data.id), eq(notes.userId, user.id)))
    .returning({ id: notes.id });

  if (!deleted) return { ok: false, error: "Note not found" };

  revalidateNotes();
  return { ok: true, data: deleted };
};
