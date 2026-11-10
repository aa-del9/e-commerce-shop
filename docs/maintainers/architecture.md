# Architecture

The base is `vercel/shop` 2026.11.0 plus a brand layer and Pakistan-ready storefront defaults. Read
`template-notes.md` for the upstream map; this file covers what the base adds and how the pieces connect.

## Owners

| Owner                   | Owns                                                       | Lives in                                                                |
| ----------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| Shopify (upstream)      | Catalog, cart, checkout, customers, prices, analytics bus  | `lib/shopify/**`, `lib/cart/**`, `lib/auth/**`, handlers in `proxy.ts`  |
| Next.js (upstream)      | Routing, caching, metadata/SEO, Suspense geometry          | `app/`, `components/`, `lib/<domain>/`, `lib/config/`, `next.config.ts` |
| Eve (upstream, dormant) | Shop Agent                                                 | `agent/`, `lib/agent/`, `components/agent/`                             |
| **Brand layer (base)**  | Identity, flags, copy, tokens, fonts, page views, sections | `brand/**`, `public/**` (see `docs/ai/brand-layer.md`)                  |

Base-owned support code sits where upstream's conventions put it:

| Path                                                           | Role                                                                                         |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `lib/brand/`                                                   | `defineBrand` (typed identity), zod schema + `validateBrand`, `withBrand` next.config plugin |
| `lib/config/index.ts`                                          | Adapter: derives upstream `shopConfig` from `brand/config.ts` (same shape as upstream)       |
| `lib/env/`                                                     | Single list of env vars; `checkEnv`, report formatting, dev setup page (`request.ts`)        |
| `lib/store-content/`                                           | Domain types, pure window/size helpers, cached `get*` loaders for metafields/metaobjects     |
| `lib/shopify/{fragments,operations,transforms}/store-content/` | GraphQL documents, uncached `fetch*`, transforms                                             |
| `lib/analytics/marketing/`                                     | Meta Pixel / GA4 event mapping, bus destination, server-side gating                          |
| `lib/media/index.ts`                                           | `next/image` custom loader for Shopify's CDN                                                 |
| `lib/menu/index.ts`, `lib/whatsapp/`, `lib/datetime/`          | Brand navigation → `MenuItem[]`, wa.me links, store-timezone formatting                      |
| `shopify/schema.ts`, `shopify/plan.ts`                         | Content model as code; pure setup planner                                                    |
| `scripts/*.mts`                                                | Node 26 scripts: setup, seed, env check/example, screenshots, brand assets                   |

## Config flow

```
brand/config.ts ──defineBrand──► brand (typed object, no zod in client bundles)
   │                                   │
   │ validateBrand (zod)               ├─► lib/config/index.ts → shopConfig (upstream shape, client + server)
   │  at next dev/build (withBrand)    ├─► lib/money (currencyDisplay), lib/datetime, lib/menu, lib/whatsapp
   │  and pnpm env:check / tests       └─► brand/pages, brand/sections, app/layout.tsx metadata
```

Feature flags that exist upstream are mapped, never re-implemented: `customerAccounts → auth.isEnabled`,
`agent → agent.isEnabled` (and the `withEve` plugin), `botProtection → botid.isEnabled` (and `withBotId`),
`predictiveSearch → search.isEnabled`, `bundles → pdp.bundles`, `relatedProducts → pdp.relatedProducts` and
`pdp.complementaryProducts`. `i18n` and `markets` are literal `false` in the schema: upstream enables them
through skills, not flags. `pdp.buyWithShop` is off (Shop Pay is unavailable to Pakistani merchants).

## Route shells → brand pages

`app/**/page.tsx` files keep everything Next.js owns: params, `generateMetadata`, `generateStaticParams`,
data loading through `get*`, analytics trackers, Suspense boundaries and the 404/redirect logic. They render a
view from `brand/pages/*` and pass data or promises down.

| Route                                                    | Shell keeps                                                                                         | Brand view                                                                              |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `/`                                                      | metadata, `getHomeSections()`                                                                       | `HomePageView` → `brand/sections/home/*`; falls back to name + tagline + `ProductsGrid` |
| `/products/[handle]`                                     | static params, metadata, `getProduct` + `getProductContent` in parallel, variant promises, trackers | `ProductPageView` → upstream `ProductDetailSection` with `slots` + related products     |
| `/collections/[handle]`, `/collections/all` (+ `refine`) | layout, metadata, `getCollectionResults` / `fetch*` for refine, `SearchParamsProbe`                 | `CollectionPageView` (grid area)                                                        |
| `/search`                                                | `readBrowseState`, results/query promises, metadata, tracker                                        | `SearchPageView` (moved upstream JSX, same Suspense geometry)                           |
| `/cart`                                                  | metadata, tracker                                                                                   | `CartPageView`                                                                          |
| not found                                                | Shopify redirect lookup                                                                             | `NotFoundView`                                                                          |
| `/faq` (base)                                            | metadata, feature flag → 404, `getFaqItems()`                                                       | `FaqPageView`                                                                           |
| `/contact` (base)                                        | metadata                                                                                            | `ContactPageView`                                                                       |

The root layout renders `AnnouncementBar` (inside `Suspense`) above the nav and the `WhatsAppButton` after
the cart UI. The PDP adds blocks through two slot props on upstream's `ProductDetailSection`
(`afterPrice`, `afterBuyButtons`), so the section's streaming and skeleton geometry are untouched.

## Data flow for store content

```
Shopify Admin (metaobjects / product metafields, storefront PUBLIC_READ)
   │ Storefront API
lib/shopify/operations/store-content/server.ts   fetchContentMetaobjects(type) · fetchProductContent(handle)
   │ transforms (pure, tested)
lib/store-content/server.ts                       "use cache: remote" get* loaders
   │                                              errors → empty result (never cached)
app shells / brand sections                       render nothing when the result is empty
```

- `fetchProductContent` requests every key in `PRODUCT_METAFIELD_DEFINITIONS` through
  `product.metafields(identifiers:)`, so a new product metafield in `shopify/schema.ts` is fetched
  automatically.
- Home sections resolve images, collections and lookbooks (with product cards) in one query.

## Caching and invalidation

| Loader              | `cacheLife`                                                                 | Tags                                                                            |
| ------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `getHomeSections`   | `max`                                                                       | `metaobjects`, `metaobjects-home_section`, `product-<id>` for lookbook products |
| `getFaqItems`       | `max`                                                                       | `metaobjects`, `metaobjects-faq_item`                                           |
| `getAnnouncements`  | `max`, or `{ revalidate }` until the next `starts_at`/`ends_at` (min 5 min) | `metaobjects`, `metaobjects-announcement`                                       |
| `getProductContent` | `max`                                                                       | `products`, `product-<handle>`, `metaobjects`                                   |

Upstream's webhook route already revalidates `metaobjects` on `metaobjects/*` topics and `product-<handle>` on
`products/*`. `pnpm shopify:setup` registers those topics; metaobject topics carry the required type filter
(`METAOBJECT_WEBHOOK_FILTER`). Shopify sends `products/update` when product metafields change.
<!-- VERIFY: confirm on a dev store that editing only a product metafield fires products/update. -->

Menus, pages and policies still need `POST /api/revalidate` with `REVALIDATE_SECRET`.

## Images

`next.config.ts` sets `images.loader: "custom"` with `lib/media/index.ts`. Shopify CDN URLs get `?width=`
(deviceSizes stay `[1320, 1920]`); other sources pass through unchanged. Vercel Image Optimization is not
used, so image transformations cost nothing on Vercel (ADR 003).

## Environment and setup page

`lib/env/index.ts` lists every variable once. It drives `.env.example` and
`docs/04-environment-variables.md` (`pnpm env:example`), `pnpm env:check`, `assertRequiredEnv` in
`lib/config/server.ts` (warns in dev, throws in build/start), and the dev-only setup page returned at the top
of `proxy.ts`. Placeholders (`__REPLACE_ME__`, upstream `your-…-here`) count as missing.

## Analytics

`components/analytics/index.tsx` (server) calls `getMarketingConfig()`: IDs from env, active only when
`VERCEL_ENV=production` or `ANALYTICS_FORCE_ENABLE=true`. When active it mounts Shopify's scripts (the bus)
and `MarketingDestinations`, which adds one destination to `window.Shopify.analytics`. The bus applies
Shopify Customer Privacy consent and replays buffered events. Each event gets one `event_id` shared by the
Pixel (`eventID`) and GA4 (`event_id`). InitiateCheckout comes from a click on the element marked
`data-analytics-initiate-checkout` (cart summary). Purchase events come from Shopify checkout through
Shopify's Facebook & Instagram and Google & YouTube apps. Shopify's own analytics follows
`brand.analytics.shopify` (upstream path, `channel: "headless"`).

## Tests and checks

`pnpm verify` = lint (oxlint + oxfmt) + typecheck + Vitest (`tests/`) + `env:check --warn-only`.
`pnpm test:e2e` runs Playwright smoke tests (`e2e/`) against `BASE_URL`. CI runs `pnpm verify` only; Vercel
previews cover `next build` (see `repo-setup.md`).
