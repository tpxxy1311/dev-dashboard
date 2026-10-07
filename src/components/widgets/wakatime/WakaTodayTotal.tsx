// src/components/widgets/wakatime/WakaTodayTotal.tsx
import styles from "@/styles/components/widgets/wakatime/WakaTodayTotal.module.scss";
import { formatDuration } from "@/lib/helpers/duration";

type WakaTodayTotalProps = {
  todaySeconds: number;
  dailyAverageSeconds: number;
};

const WakaTodayTotal = ({
  todaySeconds,
  dailyAverageSeconds,
}: WakaTodayTotalProps) => (
  <div className={styles.todayTotal}>
    <p className={styles.value}>{formatDuration(todaySeconds)}</p>
    <p className={styles.label}>
      coded today · avg. {formatDuration(dailyAverageSeconds)} per day
    </p>
  </div>
);

export default WakaTodayTotal;
