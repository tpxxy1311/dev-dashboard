// src/components/widgets/calendar/EventWeekNav.tsx
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import styles from "@/styles/components/widgets/calendar/EventWeekNav.module.scss";

type Props = {
  rangeLabel: string;
  isCurrentWeek: boolean;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
};

const EventWeekNav = ({
  rangeLabel,
  isCurrentWeek,
  onPrev,
  onNext,
  onReset,
}: Props) => {
  return (
    <div className={styles.nav} role="group" aria-label="Choose week">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous week"
        className={styles.arrow}
      >
        <ChevronLeftIcon width={18} height={18} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Next week"
        className={styles.arrow}
      >
        <ChevronRightIcon width={18} height={18} aria-hidden="true" />
      </button>

      {/* Doubles as "back to this week"; disabled while already there. */}
      <button
        type="button"
        onClick={onReset}
        disabled={isCurrentWeek}
        title={isCurrentWeek ? undefined : "Back to this week"}
        className={styles.range}
      >
        {/* Announces the new week to screen readers after paging. */}
        <span aria-live="polite">{rangeLabel}</span>
      </button>
    </div>
  );
};

export default EventWeekNav;
