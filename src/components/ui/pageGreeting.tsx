// src/components/ui/pageGreeting.tsx
"use client";

import { useNow } from "@/hooks/useNow";
import { formatLongDate, formatTime, getGreeting } from "@/lib/helpers/date";
import { getFirstName } from "@/lib/helpers/user";

type PageGreetingProps = {
  name: string;
};

const PageGreeting = ({ name }: PageGreetingProps) => {
  const now = useNow();
  const firstName = getFirstName(name);

  // Until the client knows the local time, keep the lines' height with a
  // non-breaking space so the layout doesn't jump.
  if (!now) {
    return (
      <div>
        <h1>{" "}</h1>
        <p>{" "}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>
        {getGreeting(now)}, {firstName}
      </h1>
      <p>
        {formatLongDate(now)}
        <span></span>
        <time dateTime={now.toISOString()}>{formatTime(now)}</time>
      </p>
    </div>
  );
};

export default PageGreeting;
