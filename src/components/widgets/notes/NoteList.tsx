// src/components/widgets/notes/NoteList.tsx
"use client";

import { startTransition, useOptimistic, useState } from "react";
import styles from "@/styles/components/widgets/notes/NoteList.module.scss";
import NoteDialog from "./NoteDialog";
import NoteHeader from "./NoteHeader";
import NoteItem from "./NoteItem";
import {
  createNote,
  deleteNote,
  toggleNotePin,
  updateNote,
} from "@/server/actions/notes";
import type { Note, OptimisticNote } from "@/types/note";

type Props = { initialNotes: Note[] };

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

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Called from NoteDialog's form action with validated values. Runs inside
  // that action's transition, so optimistic updates are allowed here.
  const handleCreate = async (title: string | null, content: string) => {
    setItemError(null);
    const now = new Date();
    applyOptimistic({
      type: "add",
      note: {
        id: crypto.randomUUID(),
        userId: "",
        title,
        content,
        pinnedAt: null,
        createdAt: now,
        updatedAt: now,
        pending: true,
      },
    });

    // The dialog has closed by now, so errors show above the list.
    const result = await createNote({ title, content });
    if (!result.ok) setItemError(result.error);
  };

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

  return (
    <div className={styles.noteList}>
      <NoteHeader
        isNewNoteOpen={isCreateOpen}
        onNewNote={() => setIsCreateOpen(true)}
      />

      {/* Mounted only while open, so every dialog starts empty. */}
      {isCreateOpen && (
        <NoteDialog
          onSave={handleCreate}
          onClose={() => setIsCreateOpen(false)}
        />
      )}

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
