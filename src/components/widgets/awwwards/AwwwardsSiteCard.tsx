// src/components/widgets/awwwards/AwwwardsSiteCard.tsx
import styles from "@/styles/components/widgets/awwwards/AwwwardsSiteCard.module.scss";
import Image from "next/image";
import { formatDayHeading, parseDayKey } from "@/lib/helpers/calendar";
import type { AwwwardsSite } from "@/types/awwwards";

// How many tags each card shows, so the cards in a row stay about the same height.
const TAG_COUNT = 2;

type SiteCardProps = {
  site: AwwwardsSite;
};

const AwwwardsSiteCard = ({ site }: SiteCardProps) => {
  const day = parseDayKey(site.date);

  return (
    <article className={styles.card}>
      <Image
        className={styles.thumbnail}
        src={site.thumbnailUrl}
        alt=""
        width={880}
        height={660}
        // One of three columns from md up, a scrolling card of 75% below.
        sizes="(min-width: 48em) 33vw, 75vw"
      />

      <div className={styles.info}>
        <h3 className={styles.title}>
          {/* Stretched over the whole card via ::after, so the card is one click target. */}
          <a href={site.awwwardsUrl} target="_blank" rel="noopener noreferrer">
            {site.title}
          </a>
        </h3>

        <p className={styles.meta}>
          {site.author && <span>by {site.author}</span>}
          {day && <time dateTime={site.date}>{formatDayHeading(day)}</time>}
        </p>

        <div className={styles.chips}>
          {site.awards.length > 0 && (
            <ul className={styles.awards} aria-label="Awards">
              {site.awards.map((award) => (
                <li key={award}>{award}</li>
              ))}
            </ul>
          )}
          <ul className={styles.tags} aria-label="Tags">
            {site.tags.slice(0, TAG_COUNT).map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>

        {site.websiteUrl && (
          <a
            className={styles.visit}
            href={site.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit site
            <span className={styles.visuallyHidden}>: {site.title}</span>
          </a>
        )}
      </div>
    </article>
  );
};

export default AwwwardsSiteCard;
