// src/components/widgets/wakatime/WakaWeekChart.tsx
import styles from "@/styles/components/widgets/wakatime/WakaWeekChart.module.scss";
import type { CSSProperties } from "react";
import { formatDuration } from "@/lib/helpers/duration";
import type { CodingDay } from "@/types/wakatime";

type WakaWeekChartProps = {
  days: CodingDay[];
};

// Dates are plain YYYY-MM-DD, so format them in UTC to avoid day shifts.
const formatWeekday = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });

const WakaWeekChart = ({ days }: WakaWeekChartProps) => {
  // Bars are scaled to the longest day, so the busiest day fills the height.
  const maxSeconds = Math.max(...days.map((day) => day.seconds), 0);
  const today = days.at(-1);

  return (
    <ol className={styles.chart} aria-label="Coding time, last 7 days">
      {days.map((day) => (
        <li
          key={day.date}
          className={styles.day}
          data-today={day === today || undefined}
          title={formatDuration(day.seconds)}
        >
          <span className={styles.track}>
            <span
              className={styles.bar}
              style={
                {
                  "--value": maxSeconds > 0 ? day.seconds / maxSeconds : 0,
                } as CSSProperties
              }
            />
          </span>
          <span className={styles.label}>
            {formatWeekday(day.date)}
            <span className={styles.srOnly}>
              : {formatDuration(day.seconds)}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
};

export default WakaWeekChart;
