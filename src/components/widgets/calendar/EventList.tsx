// src/components/widgets/calendar/EventList.tsx
"use client";

import { useRef, useState } from "react";
import styles from "@/styles/components/widgets/calendar/EventList.module.scss";
import type { CalendarEvent, CalendarEventJson } from "@/types/events";
import {
  formatDayHeading,
  formatWeekRange,
  getWeekRange,
  parseDayKey,
  shiftWeek,
  toDayKey,
} from "@/lib/helpers/calendar";
import EventItem from "./EventItem";
import EventWeekNav from "./EventWeekNav";

type Props = {
  // Events of the current week, loaded on the server.
  initialEvents: CalendarEvent[];
  // Monday of the current week as a day key ("2026-10-05").
  initialWeekStart: string;
};

type LoadedWeek = { start: string; events: CalendarEvent[] };

type DayGroup = { key: string; date: Date; events: CalendarEvent[] };

// Events arrive sorted by start, so events of the same day are always adjacent.
const groupByDay = (events: CalendarEvent[]): DayGroup[] => {
  const groups: DayGroup[] = [];
  for (const event of events) {
    const key = toDayKey(event.startsAt);
    const last = groups.at(-1);
    if (last?.key === key) last.events.push(event);
    else groups.push({ key, date: event.startsAt, events: [event] });
  }
  return groups;
};

// JSON has no Date type: turn the ISO strings from /api/events back into Dates.
const fromJson = (event: CalendarEventJson): CalendarEvent => ({
  ...event,
  startsAt: new Date(event.startsAt),
  endsAt: new Date(event.endsAt),
  createdAt: new Date(event.createdAt),
  updatedAt: new Date(event.updatedAt),
});

const EventList = ({ initialEvents, initialWeekStart }: Props) => {
  // The week the user asked for. Updates on click, before its data arrives,
  // so fast clicks page from the latest target, not from the shown week.
  const [targetStart, setTargetStart] = useState(initialWeekStart);
  // Last week loaded from /api/events. The current week always comes from
  // props, so it stays fresh when the server re-renders after a change.
  const [loaded, setLoaded] = useState<LoadedWeek | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Lets a new click cancel the previous request, so a slow old response
  // can never overwrite a newer week.
  const requestRef = useRef<AbortController | null>(null);

  const isCurrentWeek = targetStart === initialWeekStart;
  const isLoading = !isCurrentWeek && loaded?.start !== targetStart;
  // While loading, keep showing the previous week (dimmed) instead of a blank list.
  const shownStart = isCurrentWeek
    ? initialWeekStart
    : (loaded?.start ?? initialWeekStart);
  const events =
    shownStart === initialWeekStart ? initialEvents : (loaded?.events ?? []);

  const targetDay = parseDayKey(targetStart);
  const rangeLabel = targetDay ? formatWeekRange(getWeekRange(targetDay)) : "";

  const goToWeek = async (start: string) => {
    requestRef.current?.abort();
    setTargetStart(start);
    setError(null);

    // Served from props, no request needed.
    if (start === initialWeekStart) return;

    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const res = await fetch(`/api/events?start=${start}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data: CalendarEventJson[] = await res.json();
      setLoaded({ start, events: data.map(fromJson) });
    } catch {
      // Replaced by a newer click: that request handles the UI now.
      if (controller.signal.aborted) return;
      setError("Couldn't load events. Please try again.");
      // Point the nav back at the week that is actually shown.
      setTargetStart(shownStart);
    }
  };

  const pageBy = (weeks: number) => {
    if (!targetDay) return;
    void goToWeek(toDayKey(shiftWeek(targetDay, weeks)));
  };

  return (
    <div className={styles.eventList}>
      <EventWeekNav
        rangeLabel={rangeLabel}
        isCurrentWeek={isCurrentWeek}
        onPrev={() => pageBy(-1)}
        onNext={() => pageBy(1)}
        onReset={() => void goToWeek(initialWeekStart)}
      />

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      <div className={styles.content} aria-busy={isLoading}>
        {events.length === 0 ? (
          <p className={styles.empty}>No events this week.</p>
        ) : (
          <ol className={styles.days}>
            {groupByDay(events).map((group) => (
              <li key={group.key} className={styles.day}>
                <h3 className={styles.dayHeading}>
                  <time dateTime={group.key}>
                    {formatDayHeading(group.date)}
                  </time>
                </h3>
                <ul className={styles.events}>
                  {group.events.map((event) => (
                    <EventItem key={event.id} event={event} />
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
};

export default EventList;
