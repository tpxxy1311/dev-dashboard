// src/components/widgets/TaskItem.tsx
"use client";

import styles from "@/styles/components/widgets/TaskItem.module.scss";
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
        <input
          type="checkbox"
          checked={task.done}
          // Optimistic rows have a temporary id that does not exist in the DB yet.
          disabled={task.pending}
          onChange={(e) => onToggle(task.id, e.target.checked)}
          className={styles.checkbox}
        />
        <span className={styles.title}>{task.title}</span>
      </label>
      <button
        type="button"
        onClick={() => onDelete(task.id)}
        disabled={task.pending}
        className={styles.deleteButton}
      >
        Delete
      </button>
    </li>
  );
};

export default TaskItem;
