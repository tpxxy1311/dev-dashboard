// src/components/widgets/notes/NoteItem.tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import styles from "@/styles/components/widgets/notes/NoteItem.module.scss";
import NoteEditor from "./NoteEditor";
import { updateNoteSchema } from "@/lib/validations/notes";
import type { OptimisticNote } from "@/types/note";

type Props = {
  note: OptimisticNote;
  onUpdate: (id: string, title: string | null, content: string) => void;
  onTogglePin: (id: string, pinned: boolean) => void;
  onDelete: (id: string) => void;
};

type FieldErrors = Record<string, string[] | undefined>;

const NoteItem = ({ note, onUpdate, onTogglePin, onDelete }: Props) => {
  // UI state only: which mode the card is in and client-side field errors.
  const [isEditing, setIsEditing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>();

  const closeEditor = () => {
    setIsEditing(false);
    setFieldErrors(undefined);
  };

  // Same schema as the server: invalid input keeps the editor open with errors.
  const handleSave = (formData: FormData) => {
    const parsed = updateNoteSchema.safeParse({
      id: note.id,
      title: formData.get("title"),
      content: formData.get("content"),
    });

    if (!parsed.success) {
      setFieldErrors(z.flattenError(parsed.error).fieldErrors);
      return;
    }

    onUpdate(note.id, parsed.data.title, parsed.data.content);
    closeEditor();
  };

  const isPinned = note.pinnedAt !== null;

  return (
    <li
      className={styles.item}
      data-pinned={isPinned}
      data-pending={note.pending}
    >
      {isEditing ? (
        <NoteEditor
          action={handleSave}
          submitLabel="Save"
          defaultTitle={note.title ?? ""}
          defaultContent={note.content}
          fieldErrors={fieldErrors}
          onCancel={closeEditor}
        />
      ) : (
        <>
          {isPinned && <p className={styles.badge}>Pinned</p>}
          {note.title && <h3 className={styles.title}>{note.title}</h3>}
          <p className={styles.content}>{note.content}</p>

          {/* Optimistic rows have a temporary id that does not exist in the DB yet. */}
          <div className={styles.actions}>
            <button
              type="button"
              onClick={() => onTogglePin(note.id, !isPinned)}
              disabled={note.pending}
              aria-pressed={isPinned}
              className={styles.actionButton}
            >
              {isPinned ? "Unpin" : "Pin"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              disabled={note.pending}
              className={styles.actionButton}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(note.id)}
              disabled={note.pending}
              className={styles.actionButton}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </li>
  );
};

export default NoteItem;
