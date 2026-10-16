"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";

/** Live clock in the owner's time zone. Renders a stable placeholder on the server. */
export function LocalTime({ seconds = true, className }: { seconds?: boolean; className?: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: seconds ? "2-digit" : undefined,
      hour12: false,
      timeZone: site.timezone,
    });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [seconds]);

  return (
    <span className={className} suppressHydrationWarning>
      <span className="tabular-nums">{time ?? (seconds ? "--:--:--" : "--:--")}</span> {site.timezoneLabel}
    </span>
  );
}
