// src/components/widgets/awwwards/AwwwardsWidget.tsx
import { getAwwwardsSites } from "@/server/queries/awwwards";
import styles from "@/styles/components/widgets/awwwards/AwwwardsWidget.module.scss";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import AwwwardsSiteCard from "./AwwwardsSiteCard";

const AwwwardsWidget = async () => {
  // Fetching latest Sites of the Day, newest first
  const sites = await getAwwwardsSites();

  return (
    <section className={styles.widget} aria-labelledby="awwwards-widget-title">
      <div className={styles.header}>
        <h2 id="awwwards-widget-title" className={styles.title}>
          Recent Inspirations
        </h2>
        <a
          className={styles.headerLink}
          href="https://www.awwwards.com/websites/nominees/"
          target="_blank"
          rel="noopener noreferrer"
        >
          View All
          <ChevronRightIcon
            className={styles.headerLinkIcon}
            aria-hidden="true"
          />
        </a>
      </div>

      {sites ? (
        <ol className={styles.list}>
          {sites.map((site) => (
            <li key={site.id}>
              <AwwwardsSiteCard site={site} />
            </li>
          ))}
        </ol>
      ) : (
        <p className={styles.empty}>
          Awwwards Sites of the Day are unavailable.
        </p>
      )}
    </section>
  );
};

export default AwwwardsWidget;
