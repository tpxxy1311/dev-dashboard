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
  // True while the dialog opened from this button is open.
  isNewEventOpen: boolean;
  onNewEvent: () => void;
};

// Anchor name of the "+" button; the event dialog docks below it (md and up).
// Set inline, so CSS Modules can't rename it.
export const NEW_EVENT_ANCHOR = "--new-event-button";

const monthHref = (month: Date) => `/calendar?month=${toMonthParam(month)}`;

const CalendarHeader = ({
  monthKey,
  isCurrentMonth,
  isNewEventOpen,
  onNewEvent,
}: Props) => {
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
          // While the dialog is open the page is inert: a click here hits the
          // dialog's backdrop, which closes it. So this only ever opens.
          onClick={onNewEvent}
          aria-label={isNewEventOpen ? "Close new event" : "New event"}
          aria-haspopup="dialog"
          aria-expanded={isNewEventOpen}
          className={styles.addButton}
          style={{ anchorName: NEW_EVENT_ANCHOR }}
        >
          <PlusIcon width={24} height={24} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
};

export default CalendarHeader;
