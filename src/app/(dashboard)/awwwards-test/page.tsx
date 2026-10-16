// src/app/(dashboard)/awwwards-test/page.tsx
// TEMPORARY: checks getAwwwardsSites() inside Next.js before the widget exists.
// Delete this page once the Awwwards widget is in place.
import { getAwwwardsSites } from "@/server/queries/awwwards";

export const metadata = { title: "Awwwards test" };

// Measures the query, so a cache hit (a few ms) and a real fetch are easy to tell apart.
const loadTimed = async () => {
  const startedAt = performance.now();
  const sites = await getAwwwardsSites();
  return { sites, durationMs: Math.round(performance.now() - startedAt) };
};

export default async function AwwwardsTest() {
  const { sites, durationMs } = await loadTimed();

  return (
    <div>
      <p>
        {sites === null ? "null (see server log)" : `${sites.length} sites`} in{" "}
        {durationMs} ms
      </p>
      <pre style={{ whiteSpace: "pre-wrap" }}>
        {JSON.stringify(sites, null, 2)}
      </pre>
    </div>
  );
}
