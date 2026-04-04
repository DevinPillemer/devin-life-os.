"use client";

import { getGreeting, getWeekNumber, formatDate } from "@/lib/utils";

export function Header() {
  const now = new Date();
  const greeting = getGreeting();
  const weekNum = getWeekNumber(now);
  const dateStr = formatDate(now);

  return (
    <header className="mb-8">
      <h1 className="text-2xl font-semibold text-text-primary">
        {greeting}, <span className="text-accent">Devin</span>
      </h1>
      <p className="text-sm text-text-muted mt-1">
        {dateStr} &middot; Week {weekNum}
      </p>
    </header>
  );
}
