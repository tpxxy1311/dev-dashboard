// src/components/widgets/calendar/EventChip.tsx
import styles from "@/styles/components/widgets/calendar/EventChip.module.scss";
import { formatEventTime, toDayKey } from "@/lib/helpers/calendar";
import type { CalendarEvent } from "@/types/events";

type Props = {
  event: CalendarEvent;
  dayKey: String;
};

const EventChip = ({ event, dayKey }: Props) => {
  // A multi-day event shows its start time only on the day it starts.
  const showTime = !event.allDay && toDayKey(event.startsAt) === dayKey;
  return (
    // data-label drives the dot color via the --color-label-* tokens.
    <li
      className={styles.chip}
      data-label={event.label}
      data-all-day={event.allDay || undefined}
      // Full title on hover, since the chip truncates it.
      title={event.title}
    >
      <span className={styles.dot} aria-hidden="true" />
      {showTime && (
        <time dateTime={event.startsAt.toISOString()} className={styles.time}>
          {formatEventTime(event.startsAt)}
        </time>
      )}
      <span className={styles.title}>{event.title}</span>
    </li>
  );
};

export default EventChip;
