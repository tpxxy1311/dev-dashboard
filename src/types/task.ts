// src/types/task.ts
// Type-only import: erased at compile time, so this file is safe for Client Components.
import type { tasks } from "@/server/db/schema/tasks";

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

// A task as shown in the UI: `pending` marks optimistic rows not yet saved.
export type OptimisticTask = Task & { pending?: boolean };
