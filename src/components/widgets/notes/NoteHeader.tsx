// src/components/widgets/notes/NoteHeader.tsx
import { PlusIcon } from "@heroicons/react/24/outline";
import styles from "@/styles/components/widgets/notes/NoteHeader.module.scss";

type Props = {
  // True while the new note dialog is open.
  isNewNoteOpen: boolean;
  onNewNote: () => void;
};

// Anchor name of the "+" button; the note dialog docks below it (md and up).
// Set inline, so CSS Modules can't rename it.
export const NEW_NOTE_ANCHOR = "--new-note-button";

const NoteHeader = ({ isNewNoteOpen, onNewNote }: Props) => {
  return (
    <header className={styles.header}>
      <button
        type="button"
        // While the dialog is open the page is inert: a click here hits the
        // dialog's backdrop, which closes it. So this only ever opens.
        onClick={onNewNote}
        aria-label={isNewNoteOpen ? "Close new note" : "New note"}
        aria-haspopup="dialog"
        aria-expanded={isNewNoteOpen}
        className={styles.addButton}
        style={{ anchorName: NEW_NOTE_ANCHOR }}
      >
        <PlusIcon width={24} height={24} aria-hidden="true" />
      </button>
    </header>
  );
};

export default NoteHeader;
