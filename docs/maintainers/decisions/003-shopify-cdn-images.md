# ADR 003: Serve images from Shopify's CDN

- **Status:** accepted (2026-11-08)

## Context

Upstream sends every image through Vercel Image Optimization. Vercel bills image transformations and cache
reads; a catalog store with many product photos and variants generates a lot of them, on every store project.
Shopify's CDN already resizes images by URL parameter (`width`, `height`, `crop`, up to 5760px) and negotiates
WebP/AVIF per browser, at no extra cost to the merchant.

## Decision

A global `next/image` custom loader (`lib/media/index.ts`, `images.loader: "custom"` in `next.config.ts`) adds
`?width=` to `cdn.shopify.com` URLs and passes other sources through unchanged. Upstream's
`deviceSizes: [1320, 1920]` and `sizes="100vw"` rules stay, so each image still has two variants.

## Consequences

- Vercel Image Optimization usage drops to roughly zero; image bandwidth is Shopify's.
- `quality` is not forwarded (unverified for raw CDN URLs); Shopify chooses compression.
- Local images (`/og-default.png`, brand assets) are served as-is; keep them small.
- Reversible: remove the two `images` lines in `next.config.ts`.
