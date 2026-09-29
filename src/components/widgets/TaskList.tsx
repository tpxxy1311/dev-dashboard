// src/components/widgets/TaskList.tsx
"use client";

import {
  startTransition,
  useActionState,
  useOptimistic,
  useState,
} from "react";
import styles from "@/styles/components/widgets/TaskList.module.scss";
import TaskItem from "./TaskItem";
import { createTask, deleteTask, toggleTask } from "@/server/actions/tasks";
import { createTaskSchema } from "@/lib/validations/tasks";
import type { ActionResult } from "@/types/action";
import type { OptimisticTask, Task } from "@/types/task";

type Props = { initialTasks: Task[] };

type CreateState = ActionResult<Task> | null;

type OptimisticAction =
  | { type: "add"; task: OptimisticTask }
  | { type: "toggle"; id: string; done: boolean }
  | { type: "delete"; id: string };

// Same order as getTasks(): open first, newest first.
const byStatusThenNewest = (a: OptimisticTask, b: OptimisticTask) =>
  Number(a.done) - Number(b.done) ||
  b.createdAt.getTime() - a.createdAt.getTime();

const applyAction = (
  tasks: OptimisticTask[],
  action: OptimisticAction,
): OptimisticTask[] => {
  switch (action.type) {
    case "add":
      return [action.task, ...tasks].sort(byStatusThenNewest);
    case "toggle":
      return tasks
        .map((task) =>
          task.id === action.id ? { ...task, done: action.done } : task,
        )
        .sort(byStatusThenNewest);
    case "delete":
      return tasks.filter((task) => task.id !== action.id);
  }
};

const TaskList = ({ initialTasks }: Props) => {
  // Shows initialTasks plus pending changes; falls back to initialTasks
  // automatically once the transition ends (after revalidation or on error).
  const [optimisticTasks, applyOptimistic] = useOptimistic<
    OptimisticTask[],
    OptimisticAction
  >(initialTasks, applyAction);
  const [itemError, setItemError] = useState<string | null>(null);

  // Runs inside a transition (started by useActionState), so optimistic updates are allowed.
  const submitCreate = async (
    _prev: CreateState,
    formData: FormData,
  ): Promise<CreateState> => {
    const input = { title: formData.get("title") };

    // Same schema as the server: skips the round trip for obviously invalid input.
    const parsed = createTaskSchema.safeParse(input);
    if (parsed.success) {
      const now = new Date();
      applyOptimistic({
        type: "add",
        task: {
          id: crypto.randomUUID(),
          userId: "",
          title: parsed.data.title,
          done: false,
          completedAt: null,
          createdAt: now,
          updatedAt: now,
          pending: true,
        },
      });
    }

    return createTask(input);
  };

  const [state, formAction, isPending] = useActionState(submitCreate, null);

  const handleToggle = (id: string, done: boolean) => {
    setItemError(null);
    startTransition(async () => {
      applyOptimistic({ type: "toggle", id, done });
      const result = await toggleTask({ id, done });
      if (!result.ok) setItemError(result.error);
    });
  };

  const handleDelete = (id: string) => {
    setItemError(null);
    startTransition(async () => {
      applyOptimistic({ type: "delete", id });
      const result = await deleteTask({ id });
      if (!result.ok) setItemError(result.error);
    });
  };

  const titleError =
    state && !state.ok ? (state.fieldErrors?.title?.[0] ?? state.error) : null;

  return (
    <div className={styles.taskList}>
      <form action={formAction} className={styles.form}>
        <input
          name="title"
          type="text"
          placeholder="Add a task…"
          aria-label="New task"
          aria-invalid={titleError ? true : undefined}
          aria-describedby={titleError ? "task-title-error" : undefined}
          maxLength={200}
          required
          className={styles.input}
        />
        <button type="submit" disabled={isPending} className={styles.button}>
          {isPending ? "Adding…" : "Add"}
        </button>
      </form>

      {titleError && (
        <p id="task-title-error" role="alert" className={styles.error}>
          {titleError}
        </p>
      )}

      {itemError && (
        <p role="alert" className={styles.error}>
          {itemError}
        </p>
      )}

      {optimisticTasks.length === 0 ? (
        <p className={styles.empty}>No tasks yet.</p>
      ) : (
        <ul className={styles.list}>
          {optimisticTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
