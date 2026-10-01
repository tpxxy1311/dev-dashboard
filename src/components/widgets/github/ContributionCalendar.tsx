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

const ContributionCalendar = ({ calendar }: ContributionCalendarProps) => {
  const summary = `${calendar.total} ${calendar.total === 1 ? "contribution" : "contributions"} in the last year`;

  return (
    <figure className={styles.calendar}>
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${calendar.weeks.length}, 1fr)` }}
        role="img"
        aria-label={summary}
      >
        {calendar.weeks.map((week, weekIndex) =>
          week.map((day) => (
            <span
              key={day.date}
              className={styles.day}
              data-level={day.level}
              // Explicit placement: the first and last week can be partial.
              style={{ gridColumn: weekIndex + 1, gridRow: day.weekday + 1 }}
              title={`${day.count} on ${formatDay(day.date)}`}
            />
          )),
        )}
      </div>
      <figcaption className={styles.caption}>{summary}</figcaption>
    </figure>
  );
};

export default ContributionCalendar;
