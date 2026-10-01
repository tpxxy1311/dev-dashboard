// src/components/widgets/github/ContributionCalendar.tsx
import styles from "@/styles/components/widgets/github/ContributionCalendar.module.scss";
import type { ContributionCalendarData } from "@/types/github";

type ContributionCalendarProps = {
  calendar: ContributionCalendarData;
};

// Calendar dates are plain YYYY-MM-DD, so format them in UTC to avoid day shifts.
const formatDay = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

// GitHub weekdays start on Sunday (0). Columns start on Monday (0).
const toMondayFirst = (weekday: number) => (weekday + 6) % 7;

const ContributionCalendar = ({ calendar }: ContributionCalendarProps) => {
  const [firstDay] = calendar.days;

  return (
    <figure className={styles.calendar}>
      <div className={styles.grid} role="img">
        {calendar.days.map((day) => (
          <span
            key={day.date}
            className={styles.day}
            data-level={day.level}
            // Only the first day is placed explicitly, under its weekday.
            // Auto-placement fills the rest left to right, 7 per row.
            style={
              day === firstDay
                ? { gridColumnStart: toMondayFirst(day.weekday) + 1 }
                : undefined
            }
            title={`${day.count} on ${formatDay(day.date)}`}
          />
        ))}
      </div>
    </figure>
  );
};

export default ContributionCalendar;
