// src/app/(dashboard)/page.tsx
import styles from "@/styles/layout/pages/Dashboard.module.scss";
import { Suspense } from "react";
import GitHubWidget from "@/components/widgets/github/GitHubWidget";
import NoteWidget from "@/components/widgets/notes/NoteWidget";
import TaskWidget from "@/components/widgets/tasks/TaskWidget";

export default function Dashboard() {
  return (
    <>
      <div className={styles.topWidgetRow}>
        <Suspense fallback={<p>Loading tasks…</p>}>
          <TaskWidget />
        </Suspense>
        <Suspense fallback={<p>Loading GitHub activity…</p>}>
          <GitHubWidget />
        </Suspense>
      </div>
      {/* <Suspense fallback={<p>Loading notes…</p>}>
        <NoteWidget />
      </Suspense> */}
    </>
  );
}
