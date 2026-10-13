// src/app/(dashboard)/page.tsx
import styles from "@/styles/layout/pages/Dashboard.module.scss";
import { Suspense } from "react";
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
        <Suspense fallback={<p>Loading Tasks…</p>}>
          <TaskWidget />
        </Suspense>
        <Suspense fallback={<p>Loading GitHub Activity…</p>}>
          <GitHubWidget />
        </Suspense>
        <Suspense fallback={<p>Loading Events…</p>}>
          <CalendarWidget />
        </Suspense>
        <div className={styles.widgetColumn}>
          <Suspense fallback={<p>Loading Spotify…</p>}>
            <SpotifyWidget />
          </Suspense>
          <Suspense fallback={<p>Loading WakaTime...</p>}>
            <WakaTimeWidget />
          </Suspense>
        </div>
      </div>
      <div className={styles.bottomWidgetRow}>
        <Suspense fallback={<p>Loading Awwwards Sites...</p>}>
          <AwwwardsWidget />
        </Suspense>
      </div>
      {/* <Suspense fallback={<p>Loading notes…</p>}>
        <NoteWidget />
      </Suspense> */}
    </div>
  );
}
