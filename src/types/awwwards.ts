// src/types/awwwards.ts
// Shapes of the Awwwards data shown in the dashboard, mapped from the scraped
// Sites of the Day page in server/queries/awwwards.ts.

export type AwwwardsSite = {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD, the day the site won Site of the Day
  awwwardsUrl: string; // detail page on awwwards.com
  websiteUrl: string | null; // the site itself, http(s) only
  thumbnailUrl: string; // 880×660 on assets.awwwards.com
  author: string | null;
  tags: string[];
  awards: string[]; // badge labels, e.g. "SOTD", "DEV"
};

// Newest first. `null` if the page can't be loaded or parsed.
export type AwwwardsData = AwwwardsSite[] | null;
