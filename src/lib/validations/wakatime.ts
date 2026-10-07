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
