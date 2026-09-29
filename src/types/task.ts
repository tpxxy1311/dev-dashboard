// src/types/task.ts
// Type-only import: erased at compile time, so this file is safe for Client Components.
import type { tasks } from "@/server/db/schema/tasks";

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
