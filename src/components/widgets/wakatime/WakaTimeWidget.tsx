// src/components/widgets/wakatime/WakaTimeWidget.tsx
import styles from "@/styles/components/widgets/wakatime/WakaTimeWidget.module.scss";
import WakaTimeConnectionButton from "./WakaTimeConnectionButton";
import WakaTodayTotal from "./WakaTodayTotal";
import WakaWeekChart from "./WakaWeekChart";
import { getCodingStats } from "@/server/queries/wakatime";

const WakaTimeWidget = async () => {
  // Coding time of the signed-in user for the last 7 days
  const wakatime = await getCodingStats();

  return (
    <section className={styles.widget} aria-label="WakaTime">
      {!wakatime.connected ? (
        <WakaTimeConnectionButton />
      ) : wakatime.stats ? (
        <>
          <WakaTodayTotal
            todaySeconds={wakatime.stats.todaySeconds}
            dailyAverageSeconds={wakatime.stats.dailyAverageSeconds}
          />
          {/* <WakaWeekChart days={wakatime.stats.days} /> */}
        </>
      ) : (
        <p className={styles.empty}>WakaTime is unavailable.</p>
      )}
    </section>
  );
};

export default WakaTimeWidget;
