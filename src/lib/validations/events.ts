// src/lib/validations/events.ts
import { z } from "zod";

export const EVENT_LABELS = [
  "private",
  "work",
  "vacation",
  "birthday",
] as const;

export type EventLabel = (typeof EVENT_LABELS)[number];

export const eventIdSchema = z.uuid();

const eventFields = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title can't be empty")
    .max(200, "Max. 200 characters"),
  label: z.enum(EVENT_LABELS),
  allDay: z.boolean(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
});

const endsAfterStart = (e: { startsAt: Date; endsAt: Date }) =>
  e.endsAt > e.startsAt;
const endsAfterStartError = {
  message: "End must be after start",
  path: ["endsAt"],
};

export const createEventSchema = eventFields.refine(
  endsAfterStart,
  endsAfterStartError,
);

export const updateEventSchema = eventFields
  .extend({ id: eventIdSchema })
  .refine(endsAfterStart, endsAfterStartError);

export const deleteEventSchema = z.object({ id: eventIdSchema });

// Query of GET /api/events: any day of the week to load ("2026-10-05").
export const weekQuerySchema = z.object({ start: z.iso.date() });

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type DeleteEventInput = z.infer<typeof deleteEventSchema>;
