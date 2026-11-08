import type { MarketingConfig } from "@/lib/analytics/marketing";

// Previews and local dev never send marketing events unless ANALYTICS_FORCE_ENABLE=true.
export function isAnalyticsEnvironment(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.VERCEL_ENV === "production" || env.ANALYTICS_FORCE_ENABLE === "true";
}

export function getMarketingConfig(env: NodeJS.ProcessEnv = process.env): MarketingConfig | null {
  if (!isAnalyticsEnvironment(env)) return null;
  const metaPixelId = env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || undefined;
  const ga4MeasurementId = env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim() || undefined;
  if (!metaPixelId && !ga4MeasurementId) return null;
  return { ga4MeasurementId, metaPixelId };
}
