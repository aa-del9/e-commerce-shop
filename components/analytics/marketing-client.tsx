"use client";

import { useEffect } from "react";

import { getAnalytics } from "@/lib/analytics/client";
import type { MarketingConfig } from "@/lib/analytics/marketing";
import { createMarketingDestination } from "@/lib/analytics/marketing/client";

const BUS_WAIT_MS = 10_000;
const BUS_POLL_MS = 250;

// Registers Meta Pixel and GA4 as one destination on Hydrogen's analytics bus once the bus exists.
export function MarketingDestinations({ config }: { config: MarketingConfig }) {
  const { ga4MeasurementId, metaPixelId } = config;
  useEffect(() => {
    let removeDestination: (() => void) | undefined;
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const bus = getAnalytics();
      if (bus) {
        clearInterval(timer);
        removeDestination = bus.addDestination(
          createMarketingDestination({ ga4MeasurementId, metaPixelId }),
        );
      } else if (Date.now() - startedAt > BUS_WAIT_MS) {
        clearInterval(timer);
      }
    }, BUS_POLL_MS);
    return () => {
      clearInterval(timer);
      removeDestination?.();
    };
  }, [ga4MeasurementId, metaPixelId]);
  return null;
}
