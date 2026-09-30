// src/lib/validations/notes.ts
import { z } from "zod";

export const noteIdSchema = z.uuid();

// Optional: an empty or missing title is stored as null.
const noteTitleSchema = z
  .string()
  .trim()
  .max(200, "Max. 200 characters")
  .nullish()
  .transform((title) => title || null);

const noteContentSchema = z
  .string()
  .trim()
  .min(1, "Note can't be empty")
  .max(10_000, "Max. 10,000 characters");

export const createNoteSchema = z.object({
  title: noteTitleSchema,
  content: noteContentSchema,
});

export const updateNoteSchema = z.object({
  id: noteIdSchema,
  title: noteTitleSchema,
  content: noteContentSchema,
});

export const togglePinNoteSchema = z.object({
  id: noteIdSchema,
  pinned: z.boolean(),
});

export const deleteNoteSchema = z.object({ id: noteIdSchema });

export type CreateNoteInput = z.input<typeof createNoteSchema>;
export type UpdateNoteInput = z.input<typeof updateNoteSchema>;
export type TogglePinNoteInput = z.infer<typeof togglePinNoteSchema>;
export type DeleteNoteInput = z.infer<typeof deleteNoteSchema>;
