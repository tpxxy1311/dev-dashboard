// src/components/widgets/notes/NoteActions.tsx
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import styles from "@/styles/components/widgets/notes/NoteActions.module.scss";

type Props = {
  // True for optimistic rows: their temporary id does not exist in the DB yet.
  disabled?: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

/**
 * Action tray at the bottom of a note card. Presentational: NoteItem binds
 * the note id into the callbacks. Pinning lives in the card header.
 */
const NoteActions = ({ disabled, onEdit, onDelete }: Props) => {
  return (
    <div role="group" aria-label="Note actions" className={styles.actions}>
      <button
        type="button"
        onClick={onEdit}
        disabled={disabled}
        aria-label="Edit note"
        className={styles.button}
      >
        <PencilSquareIcon className={styles.icon} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        aria-label="Delete note"
        className={styles.button}
      >
        <TrashIcon className={styles.icon} aria-hidden="true" />
      </button>
    </div>
  );
};

export default NoteActions;
