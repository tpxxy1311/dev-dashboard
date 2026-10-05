// src/components/widgets/calendar/EventItem.tsx
import styles from "@/styles/components/widgets/calendar/EventItem.module.scss";
import { formatEventTime } from "@/lib/helpers/calendar";
import type { CalendarEvent } from "@/types/events";

type Props = { event: CalendarEvent };

const EventItem = ({ event }: Props) => {
  return (
    // data-label drives the dot color in SCSS (tokens follow in step 5).
    <li className={styles.item} data-label={event.label}>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.time}>
        {event.allDay ? (
          "All day"
        ) : (
          <>
            <time dateTime={event.startsAt.toISOString()}>
              {formatEventTime(event.startsAt)}
            </time>
            –
            <time dateTime={event.endsAt.toISOString()}>
              {formatEventTime(event.endsAt)}
            </time>
          </>
        )}
      </span>
      <span className={styles.title}>{event.title}</span>
    </li>
  );
};

export default EventItem;
