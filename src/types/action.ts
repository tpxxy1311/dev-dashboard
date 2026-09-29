// src/types/action.ts
// Shared return shape for Server Actions. Field errors come from Zod's
// flattenError(), keyed by input field name.
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };
