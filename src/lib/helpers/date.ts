// src/lib/helpers/date.ts

export type Greeting =
  "Good Morning" | "Good Afternoon" | "Good Evening" | "Good Night";

/**
 * Returns a greeting for the time of day in the date's local time.
 *
 * 05–11 Morning, 12–16 Afternoon, 17–21 Evening, 22–04 Night.
 */
export const getGreeting = (date: Date): Greeting => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 22) return "Good Evening";
  return "Good Night";
};

const ordinalRules = new Intl.PluralRules("en-US", { type: "ordinal" });
const ordinalSuffixes: Record<Intl.LDMLPluralRule, string> = {
  zero: "th",
  one: "st",
  two: "nd",
  few: "rd",
  many: "th",
  other: "th",
};

/**
 * Adds the English ordinal suffix to a number: 1 → "1st", 12 → "12th", 23 → "23rd".
 * `Intl.DateTimeFormat` has no option for this, so it uses `Intl.PluralRules`.
 */
export const toOrdinal = (n: number): string =>
  `${n}${ordinalSuffixes[ordinalRules.select(n)]}`;

/**
 * Formats a date as "Wednesday, October 12th, 2023".
 */
export const formatLongDate = (date: Date): string => {
  const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const month = date.toLocaleDateString("en-US", { month: "long" });
  return `${weekday}, ${month} ${toOrdinal(date.getDate())}, ${date.getFullYear()}`;
};

/**
 * Formats the time as "08:30 AM" (12-hour clock, no seconds).
 */
export const formatTime = (date: Date): string =>
  date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
