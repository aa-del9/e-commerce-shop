# Template notes: vercel/shop 2026.11.0

A map of the upstream template as found before the base layer was added. Use it to decide where
base code goes and what to re-check after an upstream sync.

## Stack

Next.js 16.4 App Router with `cacheComponents`, `partialPrefetching` and the React Compiler;
React 19.3; Tailwind 4.3 through `@tailwindcss/turbopack`; shadcn `base-nova` on Base UI;
`@shopify/hydrogen` 2026.10 (framework-agnostic SDK, not the React Router framework);
TypeScript 7 (`tsc` is the Go compiler, no compiler API); oxlint + oxfmt; Node 26 via
`devEngines` (pnpm downloads it when missing); pnpm 12. No tests, no test runner.

## Owners (from `AGENTS.md`)

| Owner | Lives in |
| --- | --- |
| Shopify (commerce) | `lib/shopify/**`, `lib/cart/**`, `lib/auth/{request,server}.ts`, Hydrogen handlers in `proxy.ts`, `lib/<domain>/types.ts` |
| Next.js (app) | `app/`, `components/`, `lib/<domain>/{index,server,client,action}.ts`, `lib/config/`, `next.config.ts`, `proxy.ts`, SEO / Markdown surface |
| Eve (agent) | `agent/`, `lib/agent/`, `components/agent/`, `app/api/agent/session`, `app/agent/ucp-profile.json` |

The base adds a fourth owner, the brand layer (`brand/`), see `docs/ai/brand-layer.md`.

## Data flow

- `lib/shopify/operations/<domain>/server.ts` exports uncached `fetch*` functions that call
  `storefront.request(DOC, { variables })` (`lib/shopify/storefront/server.ts`). The wrapper injects
  `$country`/`$language` from `shopConfig.localization`.
- `lib/<domain>/server.ts` exports `get*` wrappers with `"use cache: remote"`, `cacheLife("max")`
  and `cacheTag(...)`. Pages call `get*`; Eve calls `fetch*`.
- GraphQL documents use `gql()` from `@shopify/hydrogen`, types via `ResultOf<typeof DOC>`.
  `hydrogen gql check` does not work with TS 7; validate against Shopify docs/MCP instead.
- Transforms in `lib/shopify/transforms/**` turn responses into domain models in
  `lib/<domain>/types.ts`. Components never see raw Shopify responses.
- Cart writes only through Hydrogen handlers served by `proxy.ts` at `/api/cart`.

## Caching and invalidation

`app/api/webhooks/shopify/route.ts` verifies the HMAC with `SHOPIFY_WEBHOOK_SECRET` (404 when
unset) and revalidates tags by topic prefix:

- `products/*` → `product-<handle>`, `product-<numericId>`, `recommendations-<handle>`,
  plus `products-index` on create/delete
- `collections/*` → `collection-<handle>`, `collection-<numericId>`, plus `collections-index`
- `metaobjects/*` → `metaobjects` (broad) and `metaobject-<handle>`

`app/api/revalidate/route.ts` takes `?tag=` with `Authorization: Bearer $REVALIDATE_SECRET`
(menus, pages, policies have no webhook).

Upstream already expects metaobject content: the `metaobjects` tag is the hook the base content
loaders use.

## Feature flags (`shopConfig` in `lib/config/index.ts`)

| Flag | Effect |
| --- | --- |
| `agent.isEnabled` | Eve agent (`withEve` plugin in `next.config.ts`, `AgentButton`) |
| `analytics.shopify.isEnabled` | Hydrogen `ShopifyScripts` with `channel: "headless"` analytics |
| `analytics.shopify.consent.{isEnabled,mode}` | Shopify Customer Privacy banner |
| `analytics.vercel`, `analytics.speedInsights` | Vercel Web Analytics / Speed Insights |
| `auth.isEnabled` | Customer Account API (needs 3 server env vars, checked at config time) |
| `botid.{isEnabled,checkLevel}` | BotID (`withBotId` plugin, `BotIdClient` in layout) |
| `localization.{country,language,locale}` | Storefront context (country/language) and formatting locale |
| `pdp.{bundles,buyWithShop,complementaryProducts,quantityPicker,relatedProducts}` | PDP blocks |
| `redirects.shopifyNotFound` | 404 page asks Shopify for URL redirects |
| `search.isEnabled` | Predictive search modal in the nav |
| `shopify.webmcp` | WebMCP tool registration through Shopify scripts |
| `site.{name,description,url}` | Metadata, schema, manifest, breadcrumbs |

`isShopifyScriptsEnabled` decides whether `ShopifyScripts` mounts at all. The Hydrogen analytics
bus (`window.Shopify.analytics`, `lib/analytics/client.ts` → `addAnalyticsDestination`) only exists
when those scripts load.

i18n and Markets have **no flag**: they are added by the `enable-i18n` /
`enable-shopify-markets` skills. Menus have no flag either: the nav has an inline `items` array
and `enable-shopify-menus` adds a cached Shopify menu read.

`shopConfig` is imported by client components, so anything it reads must be identical on server
and client (no server-only env vars in it).

## Theme and fonts

- `app/globals.css`: `@theme inline` maps CSS variables to Tailwind colors/radius; `:root` holds
  the hex values (light only, no dark-mode tokens). `--color-shop` is Shop Pay purple.
- Fonts: `Geist` + `Geist_Mono` from `next/font/google` in `app/layout.tsx`, exposed as
  `--font-geist-sans`/`--font-geist-mono`.
- `viewport.themeColor` (layout) and `app/manifest.ts` hard-code `#ffffff`.
- A few components use raw palette classes: scrims (`bg-black/30–60`), white text on
  destructive/Shop Pay, amber cart warnings, red agent errors, an `rgba` shadow on the action bar.

## Pages and composition

- Routes with runtime params render a synchronous page that wraps async content in `Suspense`
  with a route skeleton (`aria-busy`), never `loading.tsx`.
- Home (`app/page.tsx`): static hero copy + `ProductsGrid` (search index, first 8).
- PDP (`app/products/[handle]/page.tsx`): `getProduct` (cached), selected options/variant promises
  from `searchParams`, `ProductDetailSection` (schema, media, info, buy buttons, bundles,
  complementary, description) + `RelatedProductsSection`.
- Collections: layout loads the collection; page streams `getCollectionResults`; `proxy.ts`
  rewrites filtered/sorted URLs to `refine`.
- Search, cart and 404 are self-contained pages.
- Primitives: `Page` (top padding), `Container` (width), `Sections` (gap). Copy is inline.

## Images

All images use `next/image` with `sizes="100vw"`; `deviceSizes: [1320, 1920]`, `imageSizes: []`,
`remotePatterns` for `cdn.shopify.com`. Images go through Vercel Image Optimization by default.

## SEO surface

`app/robots.ts` (disallows cart/account/search and `sort=`/`filter.` collection URLs),
`app/sitemap*`, `components/schema/*` and `components/product-detail/schema.tsx` (Product JSON-LD
with Shopify's `currencyCode`), `lib/seo` (`buildAlternates`, `buildOpenGraph`), Markdown mirrors
under `app/md/**` and `/llms.txt`.

## Environment

Required: `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`, `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN`,
`NEXT_PUBLIC_SHOPIFY_SHOP_ID`. `withShopConfig` (`lib/config/server.ts`) throws in dev, build and
start when one is missing. Every `process.env` read must be in `.env.example` and
`turbo.json` `globalEnv`.

**No demo / no-credentials mode exists upstream.** Without credentials the dev server refuses to
start. The base replaces the crash with a setup page in dev and keeps the fail-fast in builds.

## Extension points the base uses

| Need | Extension point |
| --- | --- |
| Brand identity and flags | Derive `shopConfig` from `brand/config.ts` (adapter in `lib/config/index.ts`) |
| Content (metafields/metaobjects) | New `lib/shopify/operations/content/server.ts` (`fetch*`) + `lib/content-model/server.ts` (`get*`, tag `metaobjects`/`product-<handle>`) |
| PDP blocks | Slot props on `ProductDetailSection` |
| Pixel / GA4 | `addAnalyticsDestination` on the Hydrogen analytics bus |
| Images | Global `next/image` custom loader in `next.config.ts` |
| Setup page | Early return in `proxy.ts` when required env is missing in dev |
| Navigation | Inline nav/footer items replaced by brand config (Shopify menus stay available via `enable-shopify-menus`) |
