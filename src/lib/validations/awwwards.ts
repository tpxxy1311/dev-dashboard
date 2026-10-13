// src/lib/validations/awwwards.ts
import { z } from "zod";

// Awwwards has no API. The Sites of the Day page is scraped instead, so these
// schemas guard against markup changes. Only the fields the dashboard uses are
// validated, everything else is stripped.

// JSON in each card's `data-collectable-model-value` attribute.
export const siteModelSchema = z.object({
  id: z.number().int(),
  slug: z.string().min(1),
  title: z.string().min(1),
  createdAt: z.number().int(), // Unix seconds, midnight UTC of the award day
  images: z.object({
    thumbnail: z.string().min(1), // path relative to the assets CDN
  }),
  tags: z.array(z.string()).catch([]),
});

// One card: the model plus the values read from the card's HTML.
export const siteCardSchema = z.object({
  model: siteModelSchema,
  // Missing on some cards, so the widget shows the site without them.
  author: z.string().trim().min(1).nullable().catch(null),
  // Only http(s), so a changed href can't inject e.g. a `javascript:` link.
  websiteUrl: z.httpUrl().nullable().catch(null),
  // Badge labels like "SOTD" or "DEV".
  awards: z.array(z.string().trim().min(1)).catch([]),
});
