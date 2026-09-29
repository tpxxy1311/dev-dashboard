// src/app/(dashboard)/page.tsx
import { Suspense } from "react";
import TaskWidget from "@/components/widgets/TaskWidget";

export default function Dashboard() {
  return (
    <>
      <h1>Dashboard</h1>
      <Suspense fallback={<p>Loading tasks…</p>}>
        <TaskWidget />
      </Suspense>
    </>
  );
}
