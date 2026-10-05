// src/types/events.ts
// Type-only import: erased at compile time, so this file is safe for Client Components.
import type { events } from "@/server/db/schema/events";

// Not named `Event`, which would shadow the DOM type.
export type CalendarEvent = typeof events.$inferSelect;
export type NewCalendarEvent = typeof events.$inferInsert;

// An event as shown in the UI: `pending` marks optimistic rows not yet saved.
export type OptimisticCalendarEvent = CalendarEvent & { pending?: boolean };

// An event as sent by GET /api/events: JSON turns every Date into an ISO string.
export type CalendarEventJson = Omit<
  CalendarEvent,
  "startsAt" | "endsAt" | "createdAt" | "updatedAt"
> & {
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
};
