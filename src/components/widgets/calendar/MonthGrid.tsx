// src/components/widgets/calendar/CalendarHeader.tsx
import styles from "@/styles/components/widgets/calendar/MonthGrid.module.scss";
import {
  getRangeOfDayKeys,
  groupEventsByDay,
  WEEKDAY_LABELS,
} from "@/lib/helpers/calendar";
import type { CalendarEvent } from "@/types/events";
import DayCell from "./DayCell";

type Props = {
  // Shown month ("2026-10"), to grey out days of the neighboring months.
  monthKey: string;
  // Every day in the grid, Monday first ("2026-09-28", …): 35 or 42 keys.
  dayKeys: string[];
  todayKey: string;
  events: CalendarEvent[];
};

const MonthGrid = ({ monthKey, dayKeys, todayKey, events }: Props) => {
  // Grouped here (not on the page), so step 3 can pass optimistic events.
  const eventsByDay = groupEventsByDay(events, getRangeOfDayKeys(dayKeys));

  return (
    <div className={styles.grid}>
      {/* Each cell announces its full date, so the header is visual only. */}
      <ol className={styles.weekdays} aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <li key={label} className={styles.weekday}>
            {label}
          </li>
        ))}
      </ol>

      <ol className={styles.days}>
        {dayKeys.map((dayKey) => (
          <DayCell
            key={dayKey}
            dayKey={dayKey}
            events={eventsByDay.get(dayKey) ?? []}
            isOutsideMonth={!dayKey.startsWith(monthKey)}
            isToday={dayKey === todayKey}
          />
        ))}
      </ol>
    </div>
  );
};

export default MonthGrid;
