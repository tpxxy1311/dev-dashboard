// src/server/actions/events.ts
"use server";

import "server-only";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/server/db";
import { events } from "@/server/db/schema";
import { requireUser } from "@/server/session";
import { normalizeAllDayRange } from "@/lib/helpers/calendar";
import {
  createEventSchema,
  updateEventSchema,
  deleteEventSchema,
  type CreateEventInput,
} from "@/lib/validations/events";
import type { ActionResult } from "@/types/action";
import type { CalendarEvent } from "@/types/events";

/**
 * Builds the columns to write. All-day events are snapped to whole days on the
 * server, so the stored range never depends on what the client sent.
 */
const toEventValues = (data: CreateEventInput) => {
  const range = data.allDay
    ? normalizeAllDayRange(data.startsAt, data.endsAt)
    : { startsAt: data.startsAt, endsAt: data.endsAt };

  return {
    title: data.title,
    label: data.label,
    allDay: data.allDay,
    ...range,
  };
};

// The dashboard widget and the calendar page show the same events.
const revalidateEvents = () => {
  revalidatePath("/");
  revalidatePath("/calendar");
};

/**
 * Creates an event for the signed-in user. `input` is `unknown` on purpose:
 * Server Actions are public POST endpoints, so everything is validated here.
 */
export const createEvent = async (
  input: unknown,
): Promise<ActionResult<CalendarEvent>> => {
  const user = await requireUser();

  const parsed = createEventSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Invalid input",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  // userId always comes from the session, never from the client.
  const [event] = await db
    .insert(events)
    .values({ ...toEventValues(parsed.data), userId: user.id })
    .returning();

  revalidateEvents();
  return { ok: true, data: event };
};

/**
 * Updates all fields of an event. Filters on id AND userId, so an event id
 * belonging to another user matches no row and is reported as not found.
 */
export const updateEvent = async (
  input: unknown,
): Promise<ActionResult<CalendarEvent>> => {
  const user = await requireUser();

  const parsed = updateEventSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Invalid input",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { id, ...data } = parsed.data;
  const [event] = await db
    .update(events)
    .set(toEventValues(data))
    .where(and(eq(events.id, id), eq(events.userId, user.id)))
    .returning();

  if (!event) return { ok: false, error: "Event not found" };

  revalidateEvents();
  return { ok: true, data: event };
};

/**
 * Deletes an event. Filters on id AND userId, so an event id belonging to
 * another user matches no row and is reported as not found.
 */
export const deleteEvent = async (
  input: unknown,
): Promise<ActionResult<{ id: string }>> => {
  const user = await requireUser();

  const parsed = deleteEventSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid input" };

  const [deleted] = await db
    .delete(events)
    .where(and(eq(events.id, parsed.data.id), eq(events.userId, user.id)))
    .returning({ id: events.id });

  if (!deleted) return { ok: false, error: "Event not found" };

  revalidateEvents();
  return { ok: true, data: deleted };
};
