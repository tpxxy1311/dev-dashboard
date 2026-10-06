// src/components/widgets/calendar/DayCell.tsx
import styles from "@/styles/components/widgets/calendar/DayCell.module.scss";
import { parseDayKey } from "@/lib/helpers/calendar";
import type { CalendarEvent } from "@/types/events";
import EventChip from "./EventChip";

type Props = {
  dayKey: string;
  events: CalendarEvent[];
  isOutsideMonth: boolean;
  isToday: boolean;
};

const DayCell = ({ dayKey, events, isOutsideMonth, isToday }: Props) => {
  return (
    <li
      className={styles.cell}
      // Styling hooks; data attributes keep the class list static.
      data-outside={isOutsideMonth || undefined}
      data-today={isToday || undefined}
    >
      <time
        dateTime={dayKey}
        className={styles.date}
        aria-current={isToday ? "date" : undefined}
      >
        {/* "2026-10-05" → 5 */}
        {Number(dayKey.slice(8))}
      </time>

      {events.length > 0 && (
        <ul className={styles.events}>
          {events.map((event) => (
            <EventChip key={event.id} event={event} dayKey={dayKey} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default DayCell;
