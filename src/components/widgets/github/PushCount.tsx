// src/components/widgets/github/PushCount.tsx
import styles from "@/styles/components/widgets/github/PushCount.module.scss";

type PushCountProps = {
  count: number;
  days: number;
};

const PushCount = ({ count, days }: PushCountProps) => (
  <div className={styles.pushCount}>
    <p className={styles.value}>{count}</p>
    <p className={styles.label}>
      {count === 1 ? "Push" : "Pushes"} in the last {days} days
    </p>
  </div>
);

export default PushCount;
