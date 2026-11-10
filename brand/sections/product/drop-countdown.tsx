"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { formatCountdown } from "@/lib/datetime";

interface DropCountdownProps {
  dropAt: string;
  formattedDropAt: string;
}

const subscribeNoop = () => () => {};

// The date renders on the server; the ticking countdown appears after hydration to avoid a mismatch.
export function DropCountdown({ dropAt, formattedDropAt }: DropCountdownProps) {
  const target = Date.parse(dropAt);
  const isHydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(interval);
  }, []);

  if (Number.isNaN(target)) return null;
  if (isHydrated && now >= target) return null;

  return (
    <p className="text-sm" data-slot="drop-countdown">
      <span className="font-medium">Drops {formattedDropAt}</span>
      <span className="text-muted-foreground">
        {isHydrated ? ` · in ${formatCountdown(target - now)}` : ""}
      </span>
    </p>
  );
}
