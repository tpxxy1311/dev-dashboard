// src/types/note.ts
// Type-only import: erased at compile time, so this file is safe for Client Components.
import type { notes } from "@/server/db/schema/notes";

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

// A note as shown in the UI: `pending` marks optimistic rows not yet saved.
export type OptimisticNote = Note & { pending?: boolean };
