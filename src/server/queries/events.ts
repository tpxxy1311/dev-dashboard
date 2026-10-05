// src/server/queries/events.ts
import "server-only";
import { and, asc, eq, gt, lt } from "drizzle-orm";
import { db } from "@/server/db";
import { events } from "@/server/db/schema";
import { requireUser } from "@/server/session";
import type { DateRange } from "@/lib/helpers/calendar";
import type { CalendarEvent } from "@/types/events";

/**
 * Returns all events of the signed-in user that overlap the range, sorted by
 * start. Overlap (not "starts within") keeps multi-day events visible, e.g. a
 * vacation that began last month. `to` is exclusive.
 */
export const getEventsInRange = async ({
  from,
  to,
}: DateRange): Promise<CalendarEvent[]> => {
  const user = await requireUser();

  return db
    .select()
    .from(events)
    .where(
      and(
        eq(events.userId, user.id),
        lt(events.startsAt, to),
        gt(events.endsAt, from),
      ),
    )
    .orderBy(asc(events.startsAt), asc(events.endsAt));
};
