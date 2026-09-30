// src/components/widgets/notes/NoteList.tsx
"use client";

import {
  startTransition,
  useActionState,
  useOptimistic,
  useState,
} from "react";
import styles from "@/styles/components/widgets/notes/NoteList.module.scss";
import NoteEditor from "./NoteEditor";
import NoteItem from "./NoteItem";
import {
  createNote,
  deleteNote,
  toggleNotePin,
  updateNote,
} from "@/server/actions/notes";
import { createNoteSchema } from "@/lib/validations/notes";
import type { ActionResult } from "@/types/action";
import type { Note, OptimisticNote } from "@/types/note";

type Props = { initialNotes: Note[] };

// Keeps the submitted values so the form can be refilled after an error.
type CreateState =
  (ActionResult<Note> & { values: { title: string; content: string } }) | null;

type OptimisticAction =
  | { type: "add"; note: OptimisticNote }
  | { type: "update"; id: string; title: string | null; content: string }
  | { type: "togglePin"; id: string; pinned: boolean }
  | { type: "delete"; id: string };

// Same order as getNotes(): most recently pinned first, then newest first.
// Unpinned notes count as -Infinity; -Infinity - -Infinity is NaN (falsy),
// so two unpinned notes fall through to createdAt.
const pinnedTime = (note: OptimisticNote) =>
  note.pinnedAt?.getTime() ?? -Infinity;

const byPinnedThenNewest = (a: OptimisticNote, b: OptimisticNote) =>
  pinnedTime(b) - pinnedTime(a) ||
  b.createdAt.getTime() - a.createdAt.getTime();

// FormData values can also be files; only text fields are expected here.
const textField = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
};

const applyAction = (
  notes: OptimisticNote[],
  action: OptimisticAction,
): OptimisticNote[] => {
  switch (action.type) {
    case "add":
      return [action.note, ...notes].sort(byPinnedThenNewest);
    case "update":
      return notes.map((note) =>
        note.id === action.id
          ? { ...note, title: action.title, content: action.content }
          : note,
      );
    case "togglePin":
      return notes
        .map((note) =>
          note.id === action.id
            ? { ...note, pinnedAt: action.pinned ? new Date() : null }
            : note,
        )
        .sort(byPinnedThenNewest);
    case "delete":
      return notes.filter((note) => note.id !== action.id);
  }
};

const NoteList = ({ initialNotes }: Props) => {
  // Shows initialNotes plus pending changes; falls back to initialNotes
  // automatically once the transition ends (after revalidation or on error).
  const [optimisticNotes, applyOptimistic] = useOptimistic<
    OptimisticNote[],
    OptimisticAction
  >(initialNotes, applyAction);
  const [itemError, setItemError] = useState<string | null>(null);

  // Runs inside a transition (started by useActionState), so optimistic updates are allowed.
  const submitCreate = async (
    _prev: CreateState,
    formData: FormData,
  ): Promise<CreateState> => {
    const values = {
      title: textField(formData, "title"),
      content: textField(formData, "content"),
    };

    // Same schema as the server: skips the optimistic row for invalid input.
    const parsed = createNoteSchema.safeParse(values);
    if (parsed.success) {
      const now = new Date();
      applyOptimistic({
        type: "add",
        note: {
          id: crypto.randomUUID(),
          userId: "",
          title: parsed.data.title,
          content: parsed.data.content,
          pinnedAt: null,
          createdAt: now,
          updatedAt: now,
          pending: true,
        },
      });
    }

    const result = await createNote(values);
    return { ...result, values };
  };

  const [state, formAction, isPending] = useActionState(submitCreate, null);

  const handleUpdate = (id: string, title: string | null, content: string) => {
    setItemError(null);
    startTransition(async () => {
      applyOptimistic({ type: "update", id, title, content });
      const result = await updateNote({ id, title, content });
      if (!result.ok) setItemError(result.error);
    });
  };

  const handleTogglePin = (id: string, pinned: boolean) => {
    setItemError(null);
    startTransition(async () => {
      applyOptimistic({ type: "togglePin", id, pinned });
      const result = await toggleNotePin({ id, pinned });
      if (!result.ok) setItemError(result.error);
    });
  };

  const handleDelete = (id: string) => {
    setItemError(null);
    startTransition(async () => {
      applyOptimistic({ type: "delete", id });
      const result = await deleteNote({ id });
      if (!result.ok) setItemError(result.error);
    });
  };

  const createFailed = state !== null && !state.ok;

  return (
    <div className={styles.noteList}>
      <NoteEditor
        // Remount after each submit so the fields show the right defaults:
        // empty after success, the submitted values after an error.
        key={state ? JSON.stringify(state.values) + state.ok : "new"}
        action={formAction}
        submitLabel={isPending ? "Adding…" : "Add note"}
        defaultTitle={createFailed ? state.values.title : ""}
        defaultContent={createFailed ? state.values.content : ""}
        pending={isPending}
        fieldErrors={createFailed ? state.fieldErrors : undefined}
        error={createFailed ? state.error : null}
      />

      {itemError && (
        <p role="alert" className={styles.error}>
          {itemError}
        </p>
      )}

      {optimisticNotes.length === 0 ? (
        <p className={styles.empty}>No notes yet.</p>
      ) : (
        <ul className={styles.list}>
          {optimisticNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onUpdate={handleUpdate}
              onTogglePin={handleTogglePin}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default NoteList;
