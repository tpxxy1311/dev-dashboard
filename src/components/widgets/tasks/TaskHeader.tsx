// src/components/widgets/tasks/TaskHeader.tsx
"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import styles from "@/styles/components/widgets/tasks/TaskHeader.module.scss";

export type TaskFilter = "open" | "done";

type Props = {
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  openCount: number;
  doneCount: number;
  isFormOpen: boolean;
  onToggleForm: () => void;
  formId: string;
};

const TaskHeader = ({
  filter,
  onFilterChange,
  openCount,
  doneCount,
  isFormOpen,
  onToggleForm,
  formId,
}: Props) => {
  const tabs = [
    { value: "open", label: "Open", count: openCount },
    { value: "done", label: "Done", count: doneCount },
  ] as const;
  const hasTasks = openCount + doneCount > 0;

  return (
    <div className={styles.header}>
      {/* Nothing to filter while the list is empty. */}
      {hasTasks && (
        <div className={styles.switch} role="group" aria-label="Filter tasks">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              aria-pressed={filter === tab.value}
              onClick={() => onFilterChange(tab.value)}
              className={styles.tab}
            >
              {tab.label}
              <span className={styles.count}>{tab.count}</span>
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        aria-label={isFormOpen ? "Close new task form" : "Add task"}
        aria-expanded={isFormOpen}
        aria-controls={formId}
        onClick={onToggleForm}
        className={styles.addButton}
      >
        <PlusIcon width={24} height={24} aria-hidden="true" />
      </button>
    </div>
  );
};

export default TaskHeader;
