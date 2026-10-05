// src/lib/helpers/calendar.ts
// Calendar date logic. Everything is computed in APP_TIME_ZONE, so the server
// (UTC in production) and the browser agree on days, weeks and months.
import { TZDate, tz } from "@date-fns/tz";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";

export const APP_TIME_ZONE = "Europe/Berlin";

/** date-fns context option: pass as `{ in: inAppTz }` to compute in APP_TIME_ZONE. */
export const inAppTz = tz(APP_TIME_ZONE);

const weekOptions = { in: inAppTz, weekStartsOn: 1 } as const; // Monday

/** A time span with an exclusive end, matching `startsAt < to AND endsAt > from`. */
export type DateRange = { from: Date; to: Date };

//Ranges

/** Monday 00:00 of the week containing `date` until the next Monday 00:00. */
export const getWeekRange = (date: Date): DateRange => {
  const from = startOfWeek(date, weekOptions);
  return { from, to: addWeeks(from, 1, { in: inAppTz }) };
};

/** The 1st of the month containing `date` until the 1st of the next month. */
export const getMonthRange = (date: Date): DateRange => {
  const from = startOfMonth(date, { in: inAppTz });
  return { from, to: addMonths(from, 1, { in: inAppTz }) };
};

/**
 * All days shown in a month grid: from the Monday on or before the 1st until
 * the Monday after the week containing the last day (5 or 6 full weeks).
 */
export const getMonthGridRange = (month: Date): DateRange => {
  const from = startOfWeek(startOfMonth(month, { in: inAppTz }), weekOptions);
  const lastWeek = startOfWeek(endOfMonth(month, { in: inAppTz }), weekOptions);
  return { from, to: addWeeks(lastWeek, 1, { in: inAppTz }) };
};

/**
 * Range for the dashboard widget: from today 00:00 until the later of the
 * week's and the month's end (on Oct 29 the week ends in November).
 */
export const getUpcomingRange = (now: Date): DateRange => {
  const week = getWeekRange(now);
  const month = getMonthRange(now);
  return {
    from: startOfDay(now, { in: inAppTz }),
    to: week.to > month.to ? week.to : month.to,
  };
};

/** One Date per day in the range (its `to` is exclusive). */
export const getDaysInRange = ({ from, to }: DateRange): Date[] =>
  eachDayOfInterval(
    { start: from, end: subDays(to, 1, { in: inAppTz }) },
    { in: inAppTz },
  );

//URL Params

/** Parses `?month=2026-10` into the 1st of that month, or `null` if invalid. */
export const parseMonthParam = (value: string | undefined): Date | null => {
  const match = value?.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  if (!match) return null;
  return new TZDate(Number(match[1]), Number(match[2]) - 1, 1, APP_TIME_ZONE);
};

/** Formats a date as a month param: "2026-10". */
export const toMonthParam = (date: Date): string =>
  format(date, "yyyy-MM", { in: inAppTz });

//Keys And Labels

/** Stable per-day key for grouping and React keys: "2026-10-05". */
export const toDayKey = (date: Date): string =>
  format(date, "yyyy-MM-dd", { in: inAppTz });

/** "14:30" */
export const formatEventTime = (date: Date): string =>
  format(date, "HH:mm", { in: inAppTz });

/** "Mon, Oct 5" */
export const formatDayHeading = (date: Date): string =>
  format(date, "EEE, MMM d", { in: inAppTz });

/** "October 2026" */
export const formatMonthTitle = (date: Date): string =>
  format(date, "MMMM yyyy", { in: inAppTz });

/** Grid column headers, starting on Monday. */
export const WEEKDAY_LABELS = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;

//Form Values

/**
 * Builds an instant from `<input type="date">` and `<input type="time">`
 * values, read as wall-clock time in APP_TIME_ZONE (not the browser's zone).
 */
export const fromDateTimeInputs = (date: string, time = "00:00"): Date => {
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  return new TZDate(year, month - 1, day, hours, minutes, APP_TIME_ZONE);
};

/** Value for `<input type="date">`: "2026-10-05". */
export const toDateInputValue = (date: Date): string => toDayKey(date);

/** Value for `<input type="time">`: "14:30". */
export const toTimeInputValue = (date: Date): string => formatEventTime(date);

//All-Day Events

/**
 * Snaps an all-day event to whole days: start down to 00:00, end up to the
 * next 00:00 (exclusive). A one-day event on Oct 5 becomes Oct 5 → Oct 6.
 */
export const normalizeAllDayRange = (startsAt: Date, endsAt: Date) => {
  const endDay = startOfDay(endsAt, { in: inAppTz });
  return {
    startsAt: startOfDay(startsAt, { in: inAppTz }),
    endsAt:
      endDay.getTime() === endsAt.getTime()
        ? endDay
        : addDays(endDay, 1, { in: inAppTz }),
  };
};

/** Last day an all-day event covers, for display and the form's end date. */
export const getAllDayLastDay = (endsAt: Date): Date =>
  subDays(endsAt, 1, { in: inAppTz });
