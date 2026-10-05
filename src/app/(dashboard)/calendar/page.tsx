// src/app/(dashboard)/calendar/page.tsx
import styles from "@/styles/layout/pages/Calendar.module.scss";
import { requireUser } from "@/server/session";
import { getEventsInRange } from "@/server/queries/events";
import {
  formatMonthTitle,
  getCurrentMonth,
  getDaysInRange,
  getMonthGridRange,
  parseMonthParam,
  toDayKey,
  toMonthParam,
} from "@/lib/helpers/calendar";
import CalendarHeader from "@/components/widgets/calendar/CalendarHeader";
import MonthGrid from "@/components/widgets/calendar/MonthGrid";

// `?month=a&month=b` arrives as an array; only the first value counts.
const resolveMonth = async (
  searchParams: PageProps<"/calendar">["searchParams"],
) => {
  const { month } = await searchParams;
  return parseMonthParam(Array.isArray(month) ? month[0] : month);
};

export const generateMetadata = async ({
  searchParams,
}: PageProps<"/calendar">) => {
  const month =
    (await resolveMonth(searchParams)) ?? getCurrentMonth(new Date());
  return { title: `${formatMonthTitle(month)} · Calendar` };
};

export default async function Calendar({searchParams}: PageProps<"/calendar">) {
  
  await requireUser();

  const now = new Date();
  const currentMonth = getCurrentMonth(now);
  // Invalid or missing ?month= falls back to the current month.
  const month = (await resolveMonth(searchParams)) ?? currentMonth;

  // The whole visible grid, including the greyed-out days of the
  // neighboring months.
  const range = getMonthGridRange(month);
  const events = await getEventsInRange(range);

  const monthKey = toMonthParam(month);

  return (
    <main className={styles.page}>
      <CalendarHeader
        monthKey={monthKey}
        isCurrentMonth={monthKey === toMonthParam(currentMonth)}
      />
      <MonthGrid
        monthKey={monthKey}
        dayKeys={getDaysInRange(range).map(toDayKey)}
        todayKey={toDayKey(now)}
        events={events}
      />
    </main>
  );
}
