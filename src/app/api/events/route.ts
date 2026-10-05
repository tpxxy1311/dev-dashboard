// src/app/api/events/route.ts
import { z } from "zod";
import { getWeekRange, parseDayKey } from "@/lib/helpers/calendar";
import { weekQuerySchema } from "@/lib/validations/events";
import { getEventsInRange } from "@/server/queries/events";
import { requireUser } from "@/server/session";

/**
 * Loaded by the calendar widget when the user pages to another week
 * (GET /api/events?start=2026-10-05). The first week comes from the server
 * render; this returns the same data for any other week.
 */
export async function GET(request: Request) {
  await requireUser();

  const { searchParams } = new URL(request.url);
  const parsed = weekQuerySchema.safeParse({
    start: searchParams.get("start"),
  });
  // z.iso.date() checks the format; parseDayKey also reads it in APP_TIME_ZONE.
  const day = parsed.success ? parseDayKey(parsed.data.start) : null;

  if (!day) {
    return Response.json(
      {
        error: "Invalid week",
        fieldErrors: parsed.success
          ? undefined
          : z.flattenError(parsed.error).fieldErrors,
      },
      { status: 400 },
    );
  }

  // Normalizes any day to its week (Monday 00:00 → next Monday 00:00).
  const events = await getEventsInRange(getWeekRange(day));

  return Response.json(events, {
    // Events change when created on /calendar: never reuse old responses.
    headers: { "Cache-Control": "no-store" },
  });
}
