// src/components/widgets/calendar/EventDialog.tsx
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { z } from "zod";
import styles from "@/styles/components/widgets/calendar/EventDialog.module.scss";
import {
  getEventFormDefaults,
  toEventInput,
  type EventFormValues,
} from "@/lib/helpers/calendar";
import {
  createEventSchema,
  EVENT_LABELS,
  type CreateEventInput,
} from "@/lib/validations/events";
import type { OptimisticCalendarEvent } from "@/types/events";

export type EventDialogTarget =
  | { mode: "create"; dayKey: string }
  | { mode: "edit"; event: OptimisticCalendarEvent };

type Props = {
  target: EventDialogTarget;
  onSave: (data: CreateEventInput, id?: string) => Promise<void>;
  onDelete: (id: string) => void;
  onClose: () => void;
};

// Submitted values come back with the errors, so React's automatic form
// reset after the action refills the fields instead of clearing them.
type FormState = {
  values: EventFormValues;
  fieldErrors?: Record<string, string[] | undefined>;
};

const LABEL_NAMES = {
  private: "Private",
  work: "Work",
  vacation: "Vacation",
  birthday: "Birthday",
} as const;

// FormData → the dialog's string values.
const readForm = (formData: FormData): EventFormValues => ({
  title: String(formData.get("title") ?? ""),
  label: String(formData.get("label") ?? ""),
  allDay: formData.get("allDay") === "on",
  startDate: String(formData.get("startDate") ?? ""),
  startTime: String(formData.get("startTime") ?? ""),
  endDate: String(formData.get("endDate") ?? ""),
  endTime: String(formData.get("endTime") ?? ""),
});

const EventDialog = ({ target, onSave, onDelete, onClose }: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const editing = target.mode === "edit" ? target.event : null;

  // Mounted only while open: show it as a modal right away.
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const submit = async (
    _prev: FormState,
    formData: FormData,
  ): Promise<FormState> => {
    const values = readForm(formData);
    // Same schema as the server: errors show up without a round trip.
    const parsed = createEventSchema.safeParse(toEventInput(values));
    if (!parsed.success) {
      return { values, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }

    // State updates inside this action only render once it finishes, so
    // setting state here would keep the dialog open until the server
    // answers. Closing the native dialog is immediate; its "close" event
    // then tells the board (outside the transition).
    dialogRef.current?.close();
    await onSave(parsed.data, editing?.id);
    return { values };
  };

  const [state, formAction, isPending] = useActionState(submit, {
    values: getEventFormDefaults(
      editing ?? (target as { dayKey: string }).dayKey,
    ),
  });
  const [allDay, setAllDay] = useState(state.values.allDay);

  const { values, fieldErrors } = state;
  const error = (field: string) => fieldErrors?.[field]?.[0];

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      onClose={onClose}
      // A click on the backdrop targets the <dialog> itself.
      onClick={(e) =>
        e.target === e.currentTarget && dialogRef.current?.close()
      }
      aria-labelledby="event-dialog-title"
    >
      <form action={formAction} className={styles.form}>
        <h2 id="event-dialog-title" className={styles.heading}>
          {editing ? "Edit event" : "New event"}
        </h2>

        <label className={styles.field}>
          Title
          <input
            name="title"
            defaultValue={values.title}
            maxLength={200}
            required
            autoFocus
          />
          {error("title") && (
            <span className={styles.error}>{error("title")}</span>
          )}
        </label>

        <fieldset className={styles.labels}>
          <legend>Label</legend>
          {EVENT_LABELS.map((label) => (
            <label
              key={label}
              data-label={label}
              className={styles.labelOption}
            >
              <input
                type="radio"
                name="label"
                value={label}
                defaultChecked={values.label === label}
              />
              {LABEL_NAMES[label]}
            </label>
          ))}
        </fieldset>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            name="allDay"
            defaultChecked={values.allDay}
            onChange={(e) => setAllDay(e.target.checked)}
          />
          All day
        </label>

        <div className={styles.row}>
          <label className={styles.field}>
            Start
            <input
              type="date"
              name="startDate"
              defaultValue={values.startDate}
              required
            />
          </label>
          {/* hidden keeps the value in the form, so it survives toggling */}
          <label className={styles.field} hidden={allDay}>
            <span className={styles.srOnly}>Start time</span>
            <input
              type="time"
              name="startTime"
              defaultValue={values.startTime}
            />
          </label>
        </div>
        {error("startsAt") && (
          <p className={styles.error}>{error("startsAt")}</p>
        )}

        <div className={styles.row}>
          <label className={styles.field}>
            End
            <input
              type="date"
              name="endDate"
              defaultValue={values.endDate}
              required
            />
          </label>
          <label className={styles.field} hidden={allDay}>
            <span className={styles.srOnly}>End time</span>
            <input type="time" name="endTime" defaultValue={values.endTime} />
          </label>
        </div>
        {error("endsAt") && <p className={styles.error}>{error("endsAt")}</p>}

        <div className={styles.buttons}>
          {editing && (
            <button
              type="button"
              onClick={() => onDelete(editing.id)}
              className={styles.delete}
            >
              Delete
            </button>
          )}
          <button type="button" onClick={() => dialogRef.current?.close()}>
            Cancel
          </button>
          <button type="submit" disabled={isPending} className={styles.save}>
            Save
          </button>
        </div>
      </form>
    </dialog>
  );
};

export default EventDialog;
