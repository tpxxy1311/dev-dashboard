// src/components/widgets/calendar/EventList.tsx
"use client";

import styles from "@/styles/components/widgets/calendar/EventList.module.scss";
import { useState } from "react";
import { CalendarEvent } from "@/types/events";
import { formatDayHeading, toDayKey } from "@/lib/helpers/calendar";
import EventItem from "./EventItem";

type Props = {
  events: CalendarEvent[];
  // Exclusive ends of the current week and month as ISO strings, computed on the server.
  weekEnd: string;
  monthEnd: string;
};

type EventFilter = "week" | "month";

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

const EventList = ({ events, weekEnd, monthEnd }: Props) => {
  const [filter, setFilter] = useState<EventFilter>("week");

  // The server already limited events to "from today", so only the end differs.
  const weekEvents = events.filter((e) => e.startsAt < new Date(weekEnd));
  const monthEvents = events.filter((e) => e.startsAt < new Date(monthEnd));
  const visibleEvents = filter === "week" ? weekEvents : monthEvents;

  const tabs = [
    { value: "week", label: "Week", count: weekEvents.length },
    { value: "month", label: "Month", count: monthEvents.length },
  ] as const;

  return (
    <div className={styles.eventList}>
      <div className={styles.header}>
        <div className={styles.switch} role="group" aria-label="Filter events">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={filter === tab.value}
              onClick={() => setFilter(tab.value)}
              className={styles.tab}
            >
              {tab.label}
              <span className={styles.count}>{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      {visibleEvents.length === 0 ? (
        <p className={styles.empty}>
          {filter === "week"
            ? "No events this week."
            : "No more events this month."}
        </p>
      ) : (
        <ol className={styles.days}>
          {groupByDay(visibleEvents).map((group) => (
            <li key={group.key} className={styles.day}>
              <h3 className={styles.dayHeading}>
                <time dateTime={group.key}>{formatDayHeading(group.date)}</time>
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
  );
};

export default EventList;
