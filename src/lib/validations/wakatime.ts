// src/lib/validations/wakatime.ts
import { z } from "zod";

// WakaTime API responses. Only the fields the dashboard uses are validated,
// everything else is stripped.

// GET /api/v1/users/current, used to identify the account when linking.
export const userResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    email: z.string().nullable(),
    display_name: z.string(),
    photo: z.string().nullable(),
  }),
});

// A language or project within one day's summary.
const summaryItemSchema = z.object({
  name: z.string(),
  total_seconds: z.number(),
});

// GET /api/v1/users/current/summaries: one entry per day, oldest first.
export const summariesResponseSchema = z.object({
  data: z.array(
    z.object({
      grand_total: z.object({ total_seconds: z.number() }),
      range: z.object({ date: z.string() }),
      languages: z.array(summaryItemSchema),
      projects: z.array(summaryItemSchema),
    }),
  ),
});
