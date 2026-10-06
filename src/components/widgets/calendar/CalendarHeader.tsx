// src/components/widgets/calendar/CalendarHeader.tsx
import Link from "next/link";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import styles from "@/styles/components/widgets/calendar/CalendarHeader.module.scss";
import {
  formatMonthTitle,
  parseMonthParam,
  shiftMonth,
  toMonthParam,
} from "@/lib/helpers/calendar";

type Props = {
  // Shown month as a URL param ("2026-10").
  monthKey: string;
  isCurrentMonth: boolean;
  // Opens the dialog for a new event; the board picks the default day.
  onNewEvent: () => void;
};

const monthHref = (month: Date) => `/calendar?month=${toMonthParam(month)}`;

const CalendarHeader = ({ monthKey, isCurrentMonth, onNewEvent }: Props) => {
  // monthKey comes from the page, which already validated it.
  const month = parseMonthParam(monthKey)!;

  return (
    <header className={styles.header}>
      <h2 className={styles.title}>{formatMonthTitle(month)}</h2>

      <div className={styles.actions}>
        <nav className={styles.nav} aria-label="Change month">
          <Link
            href={monthHref(shiftMonth(month, -1))}
            className={styles.arrow}
            aria-label="Previous month"
          >
            <ChevronLeftIcon width={20} height={20} aria-hidden="true" />
          </Link>
          <Link
            href={monthHref(shiftMonth(month, 1))}
            className={styles.arrow}
            aria-label="Next month"
          >
            <ChevronRightIcon width={20} height={20} aria-hidden="true" />
          </Link>
          {isCurrentMonth ? (
            // Already on the current month: plain label, nothing to navigate to.
            <span className={styles.today} aria-current="date">
              Today
            </span>
          ) : (
            <Link href="/calendar" className={styles.today}>
              Today
            </Link>
          )}
        </nav>

        <button
          type="button"
          onClick={onNewEvent}
          aria-label="New event"
          aria-haspopup="dialog"
          className={styles.addButton}
        >
          <PlusIcon width={24} height={24} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};

export default CalendarHeader;
