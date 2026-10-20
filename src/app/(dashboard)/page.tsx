// src/app/(dashboard)/page.tsx
import styles from "@/styles/layout/pages/Dashboard.module.scss";
import { Suspense } from "react";
import WidgetSkeleton from "@/components/ui/widgetSkeleton";
import GitHubWidget from "@/components/widgets/github/GitHubWidget";
import NoteWidget from "@/components/widgets/notes/NoteWidget";
import TaskWidget from "@/components/widgets/tasks/TaskWidget";
import SpotifyWidget from "@/components/widgets/spotify/SpotifyWidget";
import CalendarWidget from "@/components/widgets/calendar/CalendarWidget";
import WakaTimeWidget from "@/components/widgets/wakatime/WakaTimeWidget";
import AwwwardsWidget from "@/components/widgets/awwwards/AwwwardsWidget";

export default function Dashboard() {
  return (
    <div className={styles.page}>
      <div className={styles.topWidgetRow}>
        <Suspense fallback={<WidgetSkeleton label="Tasks" />}>
          <TaskWidget />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton label="GitHub activity" />}>
          <GitHubWidget />
        </Suspense>
        <Suspense fallback={<WidgetSkeleton label="Events this week" />}>
          <CalendarWidget />
        </Suspense>
        <div className={styles.widgetColumn}>
          <Suspense fallback={<WidgetSkeleton label="Spotify" size="sm" />}>
            <SpotifyWidget />
          </Suspense>
          <Suspense fallback={<WidgetSkeleton label="WakaTime" size="sm" />}>
            <WakaTimeWidget />
          </Suspense>
        </div>
      </div>
      <div className={styles.bottomWidgetRow}>
        <Suspense fallback={<WidgetSkeleton label="Notes" size="sm" />}>
          <NoteWidget />
        </Suspense>
        <Suspense
          fallback={<WidgetSkeleton label="Recent Inspirations" size="sm" />}
        >
          <AwwwardsWidget />
        </Suspense>
      </div>
    </div>
  );
}
