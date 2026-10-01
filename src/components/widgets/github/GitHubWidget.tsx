// src/components/widgets/github/GitHubWidget.tsx
import styles from "@/styles/components/widgets/github/GitHubWidget.module.scss";
import PushCount from "./PushCount";
import ContributionCalendar from "./ContributionCalendar";
import { getGitHubActivity } from "@/server/queries/github";

const GitHubWidget = async () => {
  // Push count and contribution calendar of the signed-in user
  const activity = await getGitHubActivity();

  return (
    <section className={styles.widget} aria-labelledby="github-widget-title">
      <h2 id="github-widget-title" className={styles.title}>
        GitHub activity
      </h2>

      {activity ? (
        <>
          <PushCount count={activity.pushCount} days={activity.windowDays} />
          <ContributionCalendar calendar={activity.calendar} />
        </>
      ) : (
        <p className={styles.empty}>GitHub activity is unavailable.</p>
      )}
    </section>
  );
};

export default GitHubWidget;
