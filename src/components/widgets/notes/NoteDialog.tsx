// src/components/widgets/notes/NoteDialog.tsx
"use client";

import { useActionState, useEffect, useRef } from "react";
import { z } from "zod";
import styles from "@/styles/components/widgets/notes/NoteDialog.module.scss";
import NoteEditor from "./NoteEditor";
import { NEW_NOTE_ANCHOR } from "./NoteHeader";
import { createNoteSchema } from "@/lib/validations/notes";

type Props = {
  onSave: (title: string | null, content: string) => Promise<void>;
  onClose: () => void;
};

// Submitted values come back with the errors, so React's automatic form
// reset after the action refills the fields instead of clearing them.
type FormState = {
  values: { title: string; content: string };
  fieldErrors?: Record<string, string[] | undefined>;
};

// FormData values can also be files; only text fields are expected here.
const textField = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
};

const NoteDialog = ({ onSave, onClose }: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Mounted only while open: show it as a modal right away.
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const submit = async (
    _prev: FormState,
    formData: FormData,
  ): Promise<FormState> => {
    const values = {
      title: textField(formData, "title"),
      content: textField(formData, "content"),
    };

    // Same schema as the server: invalid input keeps the dialog open.
    const parsed = createNoteSchema.safeParse(values);
    if (!parsed.success) {
      return { values, fieldErrors: z.flattenError(parsed.error).fieldErrors };
    }

    // State updates inside this action only render once it finishes, so
    // close the native dialog first; its "close" event tells NoteList.
    dialogRef.current?.close();
    await onSave(parsed.data.title, parsed.data.content);
    return { values };
  };

  const [state, formAction, isPending] = useActionState(submit, {
    values: { title: "", content: "" },
  });

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      style={{ positionAnchor: NEW_NOTE_ANCHOR }}
      onClose={onClose}
      // A click on the backdrop targets the <dialog> itself.
      onClick={(e) =>
        e.target === e.currentTarget && dialogRef.current?.close()
      }
      aria-labelledby="note-dialog-title"
    >
      <div className={styles.content}>
        <h2 id="note-dialog-title" className={styles.heading}>
          New note
        </h2>
        <NoteEditor
          action={formAction}
          submitLabel="Add Note"
          defaultTitle={state.values.title}
          defaultContent={state.values.content}
          pending={isPending}
          fieldErrors={state.fieldErrors}
          onCancel={() => dialogRef.current?.close()}
        />
      </div>
    </dialog>
  );
};

export default NoteDialog;
