// src/app/(dashboard)/calendar/page.tsx
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
import CalendarBoard from "@/components/widgets/calendar/CalendarBoard";

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

export default async function Calendar({
  searchParams,
}: PageProps<"/calendar">) {
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

  // Only strings and plain rows go to the board, so it can live on the client.
  return (
    <CalendarBoard
      monthKey={monthKey}
      isCurrentMonth={monthKey === toMonthParam(currentMonth)}
      dayKeys={getDaysInRange(range).map(toDayKey)}
      todayKey={toDayKey(now)}
      events={events}
    />
  );
}
