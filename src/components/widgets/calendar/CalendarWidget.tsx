// src/components/widgets/calendar/CalendarWidget.tsx
import styles from "@/styles/components/widgets/calendar/CalendarWidget.module.scss";
import { getEventsInRange } from "@/server/queries/events";
import { getWeekRange, toDayKey } from "@/lib/helpers/calendar";
import EventList from "./EventList";

const CalendarWidget = async () => {
  // The current week (Monday to Sunday); other weeks are loaded by the client.
  const week = getWeekRange(new Date());

  // Fetch events for the signed-in user
  const events = await getEventsInRange(week);

  return (
    <section className={styles.widget} aria-label="Events this week">
      <EventList
        initialEvents={events}
        // Day key, not a Date: a plain string survives serialization and is
        // the same format the client sends to /api/events.
        initialWeekStart={toDayKey(week.from)}
      />
    </section>
  );
};

export default CalendarWidget;
