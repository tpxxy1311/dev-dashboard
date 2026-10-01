// src/components/widgets/tasks/TaskWidget.tsx
import styles from "@/styles/components/widgets/tasks/TaskWidget.module.scss";
import TaskList from "./TaskList";
import { getTasks } from "@/server/queries/tasks";

const TaskWidget = async () => {
  // Fetch tasks for the signed-in user
  const tasks = await getTasks();

  return (
    <section className={styles.widget} aria-label="Tasks">
      <TaskList initialTasks={tasks} />
    </section>
  );
};

export default TaskWidget;
