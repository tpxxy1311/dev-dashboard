// src/components/widgets/tasks/TaskItem.tsx
"use client";

import styles from "@/styles/components/widgets/tasks/TaskItem.module.scss";
import { TrashIcon } from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/16/solid";
import type { OptimisticTask } from "@/types/task";

type Props = {
  task: OptimisticTask;
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
};

const TaskItem = ({ task, onToggle, onDelete }: Props) => {
  return (
    <li
      className={styles.item}
      data-done={task.done}
      data-pending={task.pending}
    >
      <label className={styles.label}>
        {/* Input and icon share one grid cell; the icon is decoration only. */}
        <span className={styles.control}>
          <input
            type="checkbox"
            checked={task.done}
            // Optimistic rows have a temporary id that does not exist in the DB yet.
            disabled={task.pending}
            onChange={(e) => onToggle(task.id, e.target.checked)}
            className={styles.checkbox}
          />
          <CheckIcon className={styles.checkIcon} aria-hidden="true" />
        </span>
        <span className={styles.title}>{task.title}</span>
      </label>
      <button
        type="button"
        onClick={() => onDelete(task.id)}
        disabled={task.pending}
        aria-label={`Delete "${task.title}"`}
        className={styles.deleteButton}
      >
        <TrashIcon width={14} height={14} aria-hidden="true" />
      </button>
    </li>
  );
};

export default TaskItem;
