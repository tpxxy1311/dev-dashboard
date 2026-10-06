// src/components/widgets/calendar/CalendarBoard.tsx
"use client";

import { startTransition, useOptimistic, useState } from "react";
import styles from "@/styles/components/widgets/calendar/CalendarBoard.module.scss";
import { createEvent, deleteEvent, updateEvent } from "@/server/actions/events";
import type { CreateEventInput } from "@/lib/validations/events";
import type { CalendarEvent, OptimisticCalendarEvent } from "@/types/events";
import CalendarHeader from "./CalendarHeader";
import EventDialog, { type EventDialogTarget } from "./EventDialog";
import MonthGrid from "./MonthGrid";

type Props = {
  // Shown month as a URL param ("2026-10").
  monthKey: string;
  isCurrentMonth: boolean;
  // Every day in the grid, Monday first ("2026-09-28", …).
  dayKeys: string[];
  todayKey: string;
  // Events overlapping the grid, loaded on the server.
  events: CalendarEvent[];
};

// Which dialog is open: a new event on a day, an existing event, or none.
type DialogState = EventDialogTarget | null;

type OptimisticAction =
  | { type: "add"; event: OptimisticCalendarEvent }
  | { type: "update"; event: OptimisticCalendarEvent }
  | { type: "delete"; id: string };

// No sorting needed: groupEventsByDay orders each day itself.
const applyAction = (
  events: OptimisticCalendarEvent[],
  action: OptimisticAction,
): OptimisticCalendarEvent[] => {
  switch (action.type) {
    case "add":
      return [...events, action.event];
    case "update":
      return events.map((e) => (e.id === action.event.id ? action.event : e));
    case "delete":
      return events.filter((e) => e.id !== action.id);
  }
};

const CalendarBoard = ({
  monthKey,
  isCurrentMonth,
  dayKeys,
  todayKey,
  events,
}: Props) => {
  // Shows `events` plus pending changes; falls back to `events` once the
  // transition ends (after revalidation or on error).
  const [optimisticEvents, applyOptimistic] = useOptimistic<
    OptimisticCalendarEvent[],
    OptimisticAction
  >(events, applyAction);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [error, setError] = useState<string | null>(null);

  // "New event" in the header: today in the current month, else the 1st.
  const defaultDayKey = isCurrentMonth ? todayKey : `${monthKey}-01`;

  const openCreate = (dayKey: string, anchored = false) =>
    setDialog({ mode: "create", dayKey, anchored });
  const openEdit = (event: OptimisticCalendarEvent) =>
    setDialog({ mode: "edit", event });
  const closeDialog = () => setDialog(null);

  /**
   * Saves validated dialog data. Called from the dialog's form action, which
   * already runs inside a transition, so optimistic updates are allowed.
   */
  const handleSave = async (data: CreateEventInput, id?: string) => {
    setError(null);
    const now = new Date();

    if (id) {
      const current = optimisticEvents.find((e) => e.id === id);
      if (current) {
        applyOptimistic({
          type: "update",
          event: { ...current, ...data, updatedAt: now, pending: true },
        });
      }
      const result = await updateEvent({ id, ...data });
      if (!result.ok) setError(result.error);
      return;
    }

    applyOptimistic({
      type: "add",
      event: {
        ...data,
        // Temporary id; the real row replaces it after revalidation.
        id: crypto.randomUUID(),
        userId: "",
        createdAt: now,
        updatedAt: now,
        pending: true,
      },
    });
    const result = await createEvent(data);
    if (!result.ok) setError(result.error);
  };

  const handleDelete = (id: string) => {
    setError(null);
    closeDialog();
    startTransition(async () => {
      applyOptimistic({ type: "delete", id });
      const result = await deleteEvent({ id });
      if (!result.ok) setError(result.error);
    });
  };

  return (
    <div className={styles.board}>
      <CalendarHeader
        monthKey={monthKey}
        isCurrentMonth={isCurrentMonth}
        // Only the dialog opened from "+" turns the plus into an "x".
        isNewEventOpen={dialog?.mode === "create" && dialog.anchored === true}
        onNewEvent={() => openCreate(defaultDayKey, true)}
      />

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}

      <MonthGrid
        monthKey={monthKey}
        dayKeys={dayKeys}
        todayKey={todayKey}
        events={optimisticEvents}
      />

      {dialog && (
        <EventDialog
          // A new target remounts the dialog with fresh defaults.
          key={
            dialog.mode === "edit" ? dialog.event.id : `new-${dialog.dayKey}`
          }
          target={dialog}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeDialog}
        />
      )}
    </div>
  );
};

export default CalendarBoard;
