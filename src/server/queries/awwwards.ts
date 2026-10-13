// src/server/queries/awwwards.ts
import "server-only";
import { type HTMLElement, parse } from "node-html-parser";
import { toDayKey } from "@/lib/helpers/calendar";
import { siteCardSchema } from "@/lib/validations/awwwards";
import { requireUser } from "@/server/session";
import type { AwwwardsData, AwwwardsSite } from "@/types/awwwards";

const BASE_URL = "https://www.awwwards.com";
const PAGE_URL = `${BASE_URL}/websites/sites_of_the_day/`;
const THUMBNAIL_URL =
  "https://assets.awwwards.com/awards/media/cache/thumb_880_660";
// Awwwards has no API, so the Sites of the Day page is scraped. The HTML is
// cached for all users and fetched again at most every 6 hours, so a new Site
// of the Day shows up within that time.
const REVALIDATE_SECONDS = 6 * 60 * 60;
// How many sites the widget shows.
const SITE_COUNT = 3;

const fetchPage = async (): Promise<string> => {
  const res = await fetch(PAGE_URL, {
    headers: {
      Accept: "text/html",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
    },
    cache: "force-cache",
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`Awwwards responded ${res.status}`);
  return res.text();
};

/**
 * Reads one card (`<li>` with the site as JSON in a data attribute). Returns
 * `null` if the card doesn't match the expected markup, so one broken card
 * doesn't hide the others.
 */
const toSite = (card: HTMLElement): AwwwardsSite | null => {
  let model: unknown;
  try {
    model = JSON.parse(card.getAttribute("data-collectable-model-value") ?? "");
  } catch {
    return null;
  }

  const parsed = siteCardSchema.safeParse({
    model,
    author: card.querySelector(".avatar-name__title")?.text ?? null,
    websiteUrl:
      card.querySelector("a.figure-rollover__bt")?.getAttribute("href") ?? null,
    awards: card.querySelectorAll(".budget-tag").map((tag) => tag.text),
  });
  if (!parsed.success) return null;

  const { model: site, author, websiteUrl, awards } = parsed.data;
  return {
    id: site.id,
    title: site.title,
    date: toDayKey(new Date(site.createdAt * 1000)),
    awwwardsUrl: `${BASE_URL}/sites/${encodeURIComponent(site.slug)}`,
    websiteUrl,
    thumbnailUrl: `${THUMBNAIL_URL}/${site.images.thumbnail}`,
    author,
    tags: site.tags,
    awards,
  };
};

/**
 * Returns the latest Sites of the Day from awwwards.com, newest first, or
 * `null` if the page can't be loaded or contains no readable sites.
 */
export const getAwwwardsSites = async (): Promise<AwwwardsData> => {
  await requireUser();

  try {
    const root = parse(await fetchPage());
    const sites = root
      .querySelectorAll("[data-collectable-model-value]")
      .map(toSite)
      .filter((site) => site !== null)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, SITE_COUNT);

    // No sites at all means the markup has changed.
    if (sites.length === 0) throw new Error("No sites found on the page");
    return sites;
  } catch (error) {
    console.error("Failed to load Awwwards sites", error);
    return null;
  }
};
