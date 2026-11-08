# ADR 006: Marketing analytics only in production

- **Status:** accepted (2026-11-08)

## Context

Every PR gets a Vercel preview. If the Meta Pixel or GA4 loaded there, test clicks would pollute ad
optimization and reports. Pakistani stores rely on Meta ads, so data quality matters.

## Decision

- Meta Pixel and GA4 are destinations on Hydrogen's analytics bus, registered by
  `components/analytics/marketing-client.tsx`. The bus applies Shopify Customer Privacy consent and replays
  buffered events.
- They load only when their ID env var is set **and** `VERCEL_ENV === "production"`, or when
  `ANALYTICS_FORCE_ENABLE=true` for a deliberate test. The decision is made on the server
  (`lib/analytics/marketing/server.ts`), so server and browser renders agree.
- Events: PageView, ViewContent, AddToCart, InitiateCheckout, each with one `event_id` shared by both tools.
- Purchase events come from Shopify checkout through Shopify's Facebook & Instagram and Google & YouTube apps.
- The server-side Meta Conversions API is deferred (run log R7, roadmap).

## Consequences

- Previews and local dev never send marketing events.
- Testing tracking needs `ANALYTICS_FORCE_ENABLE=true` on a single preview or locally, plus Meta's Test Events.
- Scripts load on the first consented event, not at page load.
