// src/server/queries/github.ts
import "server-only";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { z } from "zod";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { account } from "@/server/db/schema";
import { requireUser } from "@/server/session";
import {
  contributionCalendarResponseSchema,
  type contributionLevelSchema,
  eventsResponseSchema,
} from "@/lib/validations/github";
import type {
  ContributionCalendarData,
  ContributionLevel,
  GitHubActivity,
} from "@/types/github";

const API_URL = "https://api.github.com";
// Responses are cached per user (the token header is part of the cache key).
const REVALIDATE_SECONDS = 300;
const PUSH_WINDOW_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
// The Events API returns at most 300 events: 3 pages of 100.
const EVENTS_PER_PAGE = 100;
const MAX_EVENT_PAGES = 3;

const CALENDAR_QUERY = `
  query {
    viewer {
      login
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays { date weekday contributionCount contributionLevel }
          }
        }
      }
    }
  }
`;

const levels: Record<
  z.infer<typeof contributionLevelSchema>,
  ContributionLevel
> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

const githubFetch = async (path: string, token: string, init?: RequestInit) => {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "force-cache",
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`GitHub API ${path} responded ${res.status}`);
  return res.json();
};

/**
 * Returns a valid GitHub access token for the user, refreshed by Better Auth
 * if needed. `null` if the user has no linked GitHub account.
 */
const getGitHubToken = async (userId: string): Promise<string | null> => {
  const [githubAccount] = await db
    .select({ id: account.id })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "github")))
    .limit(1);
  if (!githubAccount) return null;

  const { accessToken } = await auth.api.getAccessToken({
    body: { accountId: githubAccount.id },
    headers: await headers(),
  });
  return accessToken;
};

const getContributionCalendar = async (
  token: string,
): Promise<{ login: string; calendar: ContributionCalendarData }> => {
  const json = await githubFetch("/graphql", token, {
    method: "POST",
    body: JSON.stringify({ query: CALENDAR_QUERY }),
  });
  const { viewer } = contributionCalendarResponseSchema.parse(json).data;
  const { totalContributions, weeks } =
    viewer.contributionsCollection.contributionCalendar;

  return {
    login: viewer.login,
    calendar: {
      total: totalContributions,
      weeks: weeks.map((week) =>
        week.contributionDays.map((day) => ({
          date: day.date,
          weekday: day.weekday,
          count: day.contributionCount,
          level: levels[day.contributionLevel],
        })),
      ),
    },
  };
};

/**
 * Counts the user's push events in the last PUSH_WINDOW_DAYS days. Events
 * come newest first, so paging stops once a page reaches past the window.
 */
const countRecentPushes = async (
  login: string,
  token: string,
): Promise<number> => {
  const since = Date.now() - PUSH_WINDOW_DAYS * DAY_MS;
  let count = 0;

  for (let page = 1; page <= MAX_EVENT_PAGES; page++) {
    const json = await githubFetch(
      `/users/${encodeURIComponent(login)}/events?per_page=${EVENTS_PER_PAGE}&page=${page}`,
      token,
    );
    const events = eventsResponseSchema.parse(json);
    const recent = events.filter((e) => Date.parse(e.created_at) >= since);
    count += recent.filter((e) => e.type === "PushEvent").length;

    if (recent.length < events.length || events.length < EVENTS_PER_PAGE) break;
  }

  return count;
};

/**
 * Returns the signed-in user's push count and contribution calendar, or
 * `null` if there is no GitHub token or the GitHub API fails.
 */
export const getGitHubActivity = async (): Promise<GitHubActivity | null> => {
  const user = await requireUser();

  try {
    const token = await getGitHubToken(user.id);
    if (!token) return null;

    // The push count needs the login, which the calendar query returns.
    const { login, calendar } = await getContributionCalendar(token);
    const pushCount = await countRecentPushes(login, token);

    return { pushCount, pushWindowDays: PUSH_WINDOW_DAYS, calendar };
  } catch (error) {
    console.error("Failed to load GitHub activity", error);
    return null;
  }
};
