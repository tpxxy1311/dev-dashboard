// src/server/queries/wakatime.ts
import "server-only";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { z } from "zod";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { account } from "@/server/db/schema";
import { requireUser } from "@/server/session";
import { summariesResponseSchema } from "@/lib/validations/wakatime";
import type { CodingShare, CodingStats, WakaTimeData } from "@/types/wakatime";

const API_URL = "https://wakatime.com/api/v1";
// WakaTime only updates summaries every few minutes. Responses are cached per
// user (the token header is part of the cache key).
const REVALIDATE_SECONDS = 600;
// Covers today and the six days before it.
const RANGE = "Last 7 Days";
// How many languages and projects the widget lists.
const TOP_COUNT = 5;

type SummaryDay = z.infer<typeof summariesResponseSchema>["data"][number];

const wakatimeFetch = async (path: string, token: string) => {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "force-cache",
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`WakaTime API ${path} responded ${res.status}`);
  return res.json();
};

/**
 * Returns a valid WakaTime access token for the user, refreshed by Better Auth
 * if needed. `null` if the user has not linked a WakaTime account.
 */
const getWakaTimeToken = async (userId: string): Promise<string | null> => {
  const [wakatimeAccount] = await db
    .select({ id: account.id })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "wakatime")))
    .limit(1);
  if (!wakatimeAccount) return null;

  const { accessToken } = await auth.api.getAccessToken({
    body: { accountId: wakatimeAccount.id },
    headers: await headers(),
  });
  return accessToken;
};

/**
 * Adds up the per-day languages or projects into totals for the whole window,
 * largest first, limited to TOP_COUNT entries.
 */
const toShares = (
  days: SummaryDay[],
  key: "languages" | "projects",
  totalSeconds: number,
): CodingShare[] => {
  const secondsByName = new Map<string, number>();
  for (const day of days) {
    for (const item of day[key]) {
      secondsByName.set(
        item.name,
        (secondsByName.get(item.name) ?? 0) + item.total_seconds,
      );
    }
  }

  return [...secondsByName]
    .map(([name, seconds]) => ({
      name,
      seconds,
      percent: totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0,
    }))
    .sort((a, b) => b.seconds - a.seconds)
    .slice(0, TOP_COUNT);
};

const getSummaries = async (token: string): Promise<CodingStats> => {
  const params = new URLSearchParams({ range: RANGE });
  const json = await wakatimeFetch(`/users/current/summaries?${params}`, token);
  const { data: days } = summariesResponseSchema.parse(json);

  const totalSeconds = days.reduce(
    (sum, day) => sum + day.grand_total.total_seconds,
    0,
  );

  return {
    todaySeconds: days.at(-1)?.grand_total.total_seconds ?? 0,
    totalSeconds,
    dailyAverageSeconds: days.length > 0 ? totalSeconds / days.length : 0,
    days: days.map((day) => ({
      date: day.range.date,
      seconds: day.grand_total.total_seconds,
    })),
    languages: toShares(days, "languages", totalSeconds),
    projects: toShares(days, "projects", totalSeconds),
  };
};

/**
 * Returns the signed-in user's coding time for the last 7 days: per day, in
 * total and split by language and project.
 */
export const getCodingStats = async (): Promise<WakaTimeData> => {
  const user = await requireUser();

  try {
    const token = await getWakaTimeToken(user.id);
    if (!token) return { connected: false };

    return { connected: true, stats: await getSummaries(token) };
  } catch (error) {
    console.error("Failed to load WakaTime stats", error);
    return { connected: true, stats: null };
  }
};
