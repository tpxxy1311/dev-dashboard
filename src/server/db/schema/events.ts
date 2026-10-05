// src/server/db/schema/events.ts
import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
// Relative import: drizzle-kit loads this file outside Next.js, so the "@/" alias is not guaranteed to resolve.
import { EVENT_LABELS } from "../../../lib/validations/events";
import { user } from "./auth";

export const eventLabel = pgEnum("event_label", EVENT_LABELS);

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    label: eventLabel("label").notNull().default("private"),
    // All-day events still store startsAt/endsAt; the UI ignores the time part.
    allDay: boolean("all_day").notNull().default(false),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    index("events_user_id_starts_at_idx").on(t.userId, t.startsAt),
    check("events_ends_after_start", sql`${t.endsAt} > ${t.startsAt}`),
  ],
);
