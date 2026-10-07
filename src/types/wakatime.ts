// src/types/wakatime.ts
// Shapes of the WakaTime data shown in the dashboard, mapped from the WakaTime
// API responses in server/queries/wakatime.ts.

export type CodingDay = {
  date: string; // YYYY-MM-DD, in the timezone set in the WakaTime profile
  seconds: number;
};

// A language or project and its share of the coding time in the window.
export type CodingShare = {
  name: string;
  seconds: number;
  percent: number; // 0–100
};

export type CodingStats = {
  todaySeconds: number;
  totalSeconds: number; // whole window
  dailyAverageSeconds: number;
  days: CodingDay[]; // oldest first, last entry is today
  languages: CodingShare[]; // largest first
  projects: CodingShare[]; // largest first
};

// `stats` is `null` if the WakaTime API fails.
export type WakaTimeData =
  { connected: false } | { connected: true; stats: CodingStats | null };
