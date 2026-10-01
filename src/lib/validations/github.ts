// src/lib/validations/github.ts
import { z } from "zod";

// GitHub API responses. Only the fields the dashboard uses are validated,
// everything else is stripped.

export const contributionLevelSchema = z.enum([
  "NONE",
  "FIRST_QUARTILE",
  "SECOND_QUARTILE",
  "THIRD_QUARTILE",
  "FOURTH_QUARTILE",
]);

export const contributionCalendarResponseSchema = z.object({
  data: z.object({
    viewer: z.object({
      login: z.string(),
      contributionsCollection: z.object({
        contributionCalendar: z.object({
          totalContributions: z.number(),
          weeks: z.array(
            z.object({
              contributionDays: z.array(
                z.object({
                  date: z.string(),
                  weekday: z.number(),
                  contributionCount: z.number(),
                  contributionLevel: contributionLevelSchema,
                }),
              ),
            }),
          ),
        }),
      }),
    }),
  }),
});

export const eventsResponseSchema = z.array(
  z.object({
    type: z.string().nullable(),
    created_at: z.string(),
  }),
);
