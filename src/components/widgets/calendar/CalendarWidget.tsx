// src/components/widgets/calendar/CalendarWidget.tsx
import styles from "@/styles/components/widgets/calendar/CalendarWidget.module.scss";
import { getEventsInRange } from "@/server/queries/events";
import {
  getMonthRange,
  getUpcomingRange,
  getWeekRange,
} from "@/lib/helpers/calendar";
import EventList from "./EventList";

const CalendarWidget = async () => {
  // Current Date
  const now = new Date();

  // Fetch events for the signed-in user
  const events = await getEventsInRange(getUpcomingRange(now));

  return (
    <section className={styles.widget}>
      <EventList
        events={events}
        weekEnd={getWeekRange(now).to.toISOString()}
        monthEnd={getMonthRange(now).to.toISOString()}
      />
    </section>
  );
};

export default CalendarWidget;
