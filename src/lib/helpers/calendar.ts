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

/** Monday 00:00 of the week `weeks` before (negative) or after `date`. */
export const shiftWeek = (date: Date, weeks: number): Date =>
  addWeeks(startOfWeek(date, weekOptions), weeks, { in: inAppTz });

/** The 1st of the month containing `now`, 00:00: the default month to show. */
export const getCurrentMonth = (now: Date): Date =>
  startOfMonth(now, { in: inAppTz });

/** The 1st of the month `months` before (negative) or after `month`. */
export const shiftMonth = (month: Date, months: number): Date =>
  addMonths(startOfMonth(month, { in: inAppTz }), months, { in: inAppTz });

/**
 * All days shown in a month grid: from the Monday on or before the 1st until
 * the Monday after the week containing the last day (5 or 6 full weeks).
 */
export const getMonthGridRange = (month: Date): DateRange => {
  const from = startOfWeek(startOfMonth(month, { in: inAppTz }), weekOptions);
  const lastWeek = startOfWeek(endOfMonth(month, { in: inAppTz }), weekOptions);
  return { from, to: addWeeks(lastWeek, 1, { in: inAppTz }) };
};

/** One Date per day in the range (its `to` is exclusive). */
export const getDaysInRange = ({ from, to }: DateRange): Date[] =>
  eachDayOfInterval(
    { start: from, end: subDays(to, 1, { in: inAppTz }) },
    { in: inAppTz },
  );

/**
 * Range covered by a list of day keys (sorted, e.g. a month grid's days):
 * the first day 00:00 until the day after the last. Throws on invalid keys,
 * since they always come from toDayKey.
 */
export const getRangeOfDayKeys = (dayKeys: string[]): DateRange => {
  const from = parseDayKey(dayKeys[0]);
  const last = parseDayKey(dayKeys.at(-1));
  if (!from || !last) throw new Error("Expected valid, non-empty day keys");
  return { from, to: addDays(last, 1, { in: inAppTz }) };
};

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

/** Stable per-day key for grouping, React keys and URLs: "2026-10-05". */
export const toDayKey = (date: Date): string =>
  format(date, "yyyy-MM-dd", { in: inAppTz });

/**
 * Parses a day key ("2026-10-05") into 00:00 of that day, or `null` if it is
 * malformed or not a real date (e.g. "2026-02-31").
 */
export const parseDayKey = (value: string | undefined): Date | null => {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new TZDate(year, month - 1, day, APP_TIME_ZONE);
  // Date rolls invalid days over (Feb 31 → Mar 3), so check the round trip.
  return toDayKey(date) === value ? date : null;
};

/** "14:30" */
export const formatEventTime = (date: Date): string =>
  format(date, "HH:mm", { in: inAppTz });

/** "Mon, Oct 5" */
export const formatDayHeading = (date: Date): string =>
  format(date, "EEE, MMM d", { in: inAppTz });

/**
 * Label for a week (or any range with an exclusive end), shortest form that
 * stays unambiguous: "Oct 5 – 11", "Sep 29 – Oct 5", "Dec 28, 2026 – Jan 3, 2027".
 */
export const formatWeekRange = ({ from, to }: DateRange): string => {
  const last = subDays(to, 1, { in: inAppTz });
  const options = { in: inAppTz };

  if (format(from, "yyyy", options) !== format(last, "yyyy", options)) {
    return `${format(from, "MMM d, yyyy", options)} – ${format(last, "MMM d, yyyy", options)}`;
  }
  if (format(from, "MM", options) !== format(last, "MM", options)) {
    return `${format(from, "MMM d", options)} – ${format(last, "MMM d", options)}`;
  }
  return `${format(from, "MMM d", options)} – ${format(last, "d", options)}`;
};

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

/**
 * Exclusive end for an all-day event from the form's end date input, which
 * names the last day: "2026-10-05" → Oct 6 00:00. Inverse of getAllDayLastDay.
 */
export const toAllDayEnd = (lastDay: string): Date =>
  addDays(fromDateTimeInputs(lastDay), 1, { in: inAppTz });

//Grouping

type TimedItem = { startsAt: Date; endsAt: Date; allDay: boolean };

// All-day events first, then by start time.
const compareInDay = (a: TimedItem, b: TimedItem): number =>
  Number(b.allDay) - Number(a.allDay) ||
  a.startsAt.getTime() - b.startsAt.getTime();

/**
 * Maps day keys to the events shown on that day. A multi-day event appears on
 * every day it covers, clipped to `range`. Ends are exclusive, so an event
 * ending at 00:00 does not show up on that day.
 */
export const groupEventsByDay = <T extends TimedItem>(
  events: T[],
  { from, to }: DateRange,
): Map<string, T[]> => {
  const days = new Map<string, T[]>();

  for (const event of events) {
    const first = event.startsAt > from ? event.startsAt : from;
    const end = event.endsAt < to ? event.endsAt : to;

    for (
      let day = startOfDay(first, { in: inAppTz });
      day < end;
      day = addDays(day, 1, { in: inAppTz })
    ) {
      const key = toDayKey(day);
      const list = days.get(key);
      if (list) list.push(event);
      else days.set(key, [event]);
    }
  }

  for (const list of days.values()) list.sort(compareInDay);
  return days;
};
