// src/types/github.ts
// Shapes of the GitHub data shown in the dashboard, mapped from the GitHub API
// responses in server/queries/github.ts.

// 0 = no contributions, 4 = top quartile (same scale as github.com).
export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export type ContributionDay = {
  date: string; // YYYY-MM-DD
  weekday: number; // 0 = Sunday
  count: number;
  level: ContributionLevel;
};

export type ContributionCalendarData = {
  total: number;
  weeks: ContributionDay[][];
};

export type GitHubActivity = {
  pushCount: number;
  pushWindowDays: number;
  calendar: ContributionCalendarData;
};
