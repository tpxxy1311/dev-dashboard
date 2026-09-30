// src/app/(dashboard)/page.tsx
import { Suspense } from "react";
import NoteWidget from "@/components/widgets/notes/NoteWidget";
import TaskWidget from "@/components/widgets/tasks/TaskWidget";

export default function Dashboard() {
  return (
    <>
      <h1>Dashboard</h1>
      <Suspense fallback={<p>Loading tasks…</p>}>
        <TaskWidget />
      </Suspense>
      <Suspense fallback={<p>Loading notes…</p>}>
        <NoteWidget />
      </Suspense>
    </>
  );
}
