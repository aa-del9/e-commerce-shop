# Base setup report

Branch `base-setup` → `main` on `aa-del9/e-commerce-shop`, from `vercel/shop` template 2026.11.0.

## 1. What was built

I turned `vercel/shop` into a brand-neutral, Pakistan-ready base where each store is configured from `brand/`,
the Shopify admin and Vercel env vars. Upstream structure is unchanged, and nothing upstream was deleted.

- **Step 0, template map:** `docs/maintainers/template-notes.md`. Upstream has no credential-free demo mode,
  and its webhook route already invalidates a `metaobjects` cache tag, which the base content loaders use.
- **Step 1, foundations:** toolchain checked on Node 26 / pnpm 12; `upstream` remote added; `UPSTREAM.md`
  covers sync steps, conflict rules and every modified upstream file; `.repo-role` = `base`.
- **Step 2, brand layer:**
  - `brand/config.ts` (`defineBrand`) is validated by a zod schema (`lib/brand/schema.ts`) at `next dev`,
    `next build`, `pnpm env:check` and in tests. Errors name the exact field and the fix.
  - `lib/config/index.ts` derives upstream's `shopConfig` from it.
  - Tokens live in `brand/theme.css`, fonts in `brand/fonts.ts`, and neutral SVG assets in `brand/assets/`
    (`pnpm brand:assets` renders the favicon, app icons and OG image).
  - Route shells in `app/` render `brand/pages/*` views (home, product, collection, search, cart, 404, FAQ,
    contact) with upstream's data loading, Suspense and caching kept.
  - Hard-coded colors in 11 upstream components moved onto tokens: overlay, warning, floating shadow.
- **Step 3, storefront defaults:**
  - Images: a Shopify CDN `next/image` loader (ADR 003).
  - Prices: PKR display shows `Rs 4,999` by default, or `PKR 4,999` (`currencyDisplay`).
  - Announcement bar from `announcement` metaobjects, with the time window applied at cache time.
  - A WhatsApp `wa.me` button that prefills the product title and link on PDPs, hides while a control passes
    under it, and gets footer clearance.
  - PDP blocks through two slot props on upstream's `ProductDetailSection`: badges, preorder label, drop
    countdown, model info, size chart drawer with a cm/in toggle, dispatch/delivery/returns/COD notices, and
    highlights/materials/care accordions.
  - FAQ page from `faq_item` entries.
  - Homepage from `home_section` entries (hero, featured collection, product grid, image + text, lookbook),
    with a fallback when there are none.
  - Robots now also blocks `sort_by=`, `filter.`, `q=` and `refine`.
  - Meta Pixel + GA4 run as one destination on Hydrogen's analytics bus: production only, consent-gated by
    the bus, with a shared `event_id`. The Conversions API is stubbed (run log R7).
- **Step 4, content model as code:**
  - `shopify/schema.ts` defines 10 product metafields and 5 metaobject types, all with `PUBLIC_READ` access
    and publishable entries.
  - `shopify/plan.ts` is a pure planner: create or update only, never delete, and it warns on type
    conflicts.
  - `pnpm shopify:setup [--dry-run]` creates the definitions and webhooks (metaobject topics carry the
    required type filter) and prints the manual checklist.
  - `pnpm shopify:seed` upserts neutral sample entries. It touches only metaobjects.
- **Step 5, environment:**
  - `lib/env/index.ts` is the single list of variables. It generates `.env.example` and
    `docs/04-environment-variables.md` (`pnpm env:example`).
  - `pnpm dev` shows a setup page listing what's missing instead of crashing, and production builds fail
    with the same table.
  - `pnpm env:check` prints ✅/❌ and looks up the shop ID once the domain and token are set.
- **Step 6, Claude Code:**
  - `CLAUDE.md` (79 lines) and `docs/ai/brand-layer.md`.
  - 8 skills in `.agents/skills/`.
  - `.mcp.json`: the Figma remote server `https://mcp.figma.com/mcp`, checked in Figma's docs, and the
    Shopify Dev MCP.
  - `.claude/settings.json` sets permissions plus two Node hooks: a repo-role guard and oxfmt on save.
- **Step 7, quality gates:**
  - 38 Vitest tests and Playwright smoke tests (`pnpm test:e2e`, skipped without `BASE_URL`).
  - `pnpm verify`, GitHub Actions CI, the PR template, both issue templates, `CODEOWNERS`, and
    `docs/maintainers/repo-setup.md`.
- **Step 8, docs:**
  - Short root README.
  - PM guides `docs/01`–`09` plus an index.
  - Maintainer docs: architecture, roadmap, repo setup, template notes, ADRs 001–006, and the run log
    (R1–R13).

**Definition of done:**

| Item                                                       | Status                                                                                                                                                                                                      |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install && pnpm dev` with only `.env.example` copied | ✅ Setup page instead of a crash (HTTP 503 HTML page, screenshots at 360/1280)                                                                                                                              |
| Dev-store flows, PKR, 360/1280                             | ❌ No dev store (`<DEV_STORE>` is still a placeholder). Home, PDP, search, cart and the checkout redirect pass against Shopify's public `mock.shop` (prices CAD). PKR formatting is covered by unit tests.  |
| `pnpm verify`; CI green                                    | ✅ Locally; CI status is on the PR                                                                                                                                                                          |
| No brand/category values outside `brand/`                  | ✅ The only exceptions are documented: Shop Pay purple, the dev-only setup page, and Eve's red error text                                                                                                   |
| Flags on/off; empty content renders nothing                | ✅ All launch flags toggled off and on with rendered HTML checked. Empty-content state checked on mock.shop. `agent`/`botProtection` were not run live because they need extra credentials.                 |
| `shopify:setup --dry-run`                                  | ✅ Plans against an empty store (no credentials) and prints the manual checklist                                                                                                                            |
| Eve, BotID, i18n, Markets disabled via config              | ✅ (`i18n`/`markets` are `z.literal(false)`)                                                                                                                                                                |
| `UPSTREAM.md` complete                                     | ✅ Cross-checked against `git diff upstream/main`                                                                                                                                                           |
| Docs exist and match the code                              | ✅                                                                                                                                                                                                          |
| Guard hook                                                 | ✅ With role `store`, edits to `lib/`, `app/` and `proxy.ts` are blocked (exit 2), and `brand/`, `docs/`, `public/` and `.env.example` are allowed. The override works and the role was restored to `base`. |
| Branch pushed, PR open                                     | ✅ See the PR link                                                                                                                                                                                          |

Screenshots (gitignored) are in `docs/maintainers/screenshots/` for the home, collection, search, PDP,
cart, FAQ, contact, 404 and setup pages at 360 and 1280.

## 2. Modified upstream files

| Path                                                                                                                                                                         | What changed                                                                                                                                             | Why                                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `AGENTS.md`                                                                                                                                                                  | Next.js-generated "nextjs-agent-rules" block refreshed by `next dev` 16.4.3                                                                              | Generated by Next; take upstream's version on sync                                                                 |
| `.gitignore`                                                                                                                                                                 | Ignore local screenshots and Playwright output                                                                                                           | Base tooling                                                                                                       |
| `package.json`, `pnpm-lock.yaml`                                                                                                                                             | Base scripts (`verify`, `test`, `env:check`, `shopify:*`, `screenshots`, `brand:assets`) and dev dependencies                                            | Base tooling; keep upstream's dependency versions on sync, then re-add base entries                                |
| `next.config.ts`                                                                                                                                                             | `images.loader: "custom"` + `loaderFile: ./lib/media/index.ts`; `withBrand` plugin                                                                       | Serve images from Shopify's CDN (ADR 003); validate `brand/config.ts` at dev start and build                       |
| `lib/config/index.ts`                                                                                                                                                        | Values derived from `brand/config.ts` (same shape as upstream); `buyWithShop` off                                                                        | Stores never edit `lib/config`; Shop Pay is unavailable in Pakistan (run log R6)                                   |
| `app/globals.css`                                                                                                                                                            | Imports `brand/theme.css`; `:root` values moved there; tokens for overlay, warning, display text, floating shadow; fonts via `--font-body`/`--font-code` | Brand owns token values; base owns the Tailwind mapping                                                            |
| `app/layout.tsx`                                                                                                                                                             | Fonts from `brand/fonts.ts`; theme color, description, OG image, title template, Twitter handle from brand config; announcement bar and WhatsApp button  | Brand layer owns identity and fonts                                                                                |
| `app/manifest.ts`                                                                                                                                                            | Colors from `brand.seo.themeColor`                                                                                                                       | No hex values outside `brand/`                                                                                     |
| `app/page.tsx`                                                                                                                                                               | Route shell rendering `brand/pages/home.tsx`; title/description from brand config                                                                        | Route shell → brand page                                                                                           |
| `app/products/[handle]/page.tsx`                                                                                                                                             | Renders `brand/pages/product.tsx`; loads product content (metafields) in parallel                                                                        | Route shell → brand page                                                                                           |
| `app/collections/[handle]/page.tsx`, `…/refine/page.tsx`, `app/collections/all/page.tsx`, `…/all/refine/page.tsx`                                                            | Render `brand/pages/collection.tsx` instead of `CollectionResults`                                                                                       | Route shell → brand page                                                                                           |
| `app/search/page.tsx`                                                                                                                                                        | Presentation moved to `brand/pages/search.tsx`; shell keeps promises, metadata and the tracker                                                           | Route shell → brand page                                                                                           |
| `app/cart/page.tsx`                                                                                                                                                          | Renders `brand/pages/cart.tsx`                                                                                                                           | Route shell → brand page                                                                                           |
| `app/not-found.tsx`                                                                                                                                                          | Copy block moved to `brand/pages/not-found.tsx`; Shopify redirect logic stays                                                                            | Route shell → brand page                                                                                           |
| `app/icon.svg`, `app/favicon.ico`, `app/apple-icon.png`, `public/icons/*.png`, `public/og-default.png`                                                                       | Neutral placeholders generated by `pnpm brand:assets` from `brand/assets/*.svg`                                                                          | Upstream files carried Vercel/Shopify marks. On sync keep ours                                                     |
| `components/nav/index.tsx`                                                                                                                                                   | Menu items from `brand.navigation.main`; logo from `brand/sections/logo.tsx`                                                                             | Navigation and logo are brand-owned (Shopify menus remain available via `enable-shopify-menus`)                    |
| `components/footer/index.tsx`                                                                                                                                                | Footer columns from `brand.navigation.footer`; social links from `brand.identity.social`                                                                 | Brand-owned navigation                                                                                             |
| `components/product-detail/product-detail-section.tsx`                                                                                                                       | Optional `slots` prop (`afterPrice`, `afterBuyButtons`)                                                                                                  | Extension point for base PDP blocks without forking the section                                                    |
| `components/ui/sheet.tsx`, `components/ui/dialog.tsx`, `components/nav/search-modal.tsx`, `components/product-detail/lightbox.tsx`, `components/product-card/components.tsx` | `bg-black/*` → `bg-overlay/*` (lightbox close button uses `text-background`)                                                                             | Scrim color is a theme token                                                                                       |
| `components/ui/button.tsx`, `components/ui/badge.tsx`                                                                                                                        | `text-white` → `text-destructive-foreground` on the destructive variant                                                                                  | Use the existing token                                                                                             |
| `components/ui/image-placeholder.tsx`                                                                                                                                        | `bg-white` → `bg-background`                                                                                                                             | Token                                                                                                              |
| `components/cart/warnings.tsx`                                                                                                                                               | Amber palette → `warning`, `warning-border`, `warning-foreground` tokens                                                                                 | Token; the template has no dark mode, so the `dark:` variants were dropped                                         |
| `components/action-bar/index.tsx`                                                                                                                                            | Arbitrary `rgba` shadow → `shadow-floating`                                                                                                              | Token shared with the WhatsApp button                                                                              |
| `lib/money/index.ts`                                                                                                                                                         | Passes `brand.localization.currencyDisplay` to Hydrogen `formatMoney`                                                                                    | `Rs 4,999` vs `PKR 4,999` (run log R3)                                                                             |
| `app/robots.ts`                                                                                                                                                              | Also disallows `sort_by=`, `filter.`, `q=` on any path and `/collections/*/refine`                                                                       | Hydrogen's sort parameter is `sort_by`, which upstream's `sort=` rule misses                                       |
| `components/analytics/index.tsx`                                                                                                                                             | Mounts Shopify scripts when Meta Pixel/GA4 are configured; renders `MarketingDestinations`                                                               | Marketing destinations ride Hydrogen's analytics bus (ADR 006)                                                     |
| `components/cart/summary.tsx`                                                                                                                                                | `data-analytics-initiate-checkout` on the checkout button                                                                                                | InitiateCheckout has no bus event; attribute only, cart logic unchanged                                            |
| `proxy.ts`                                                                                                                                                                   | First lines of `proxy()` return the dev setup page when required env vars are missing (development only)                                                 | Friendly setup page instead of a crash (Step 5)                                                                    |
| `lib/config/server.ts`                                                                                                                                                       | `assertRequiredEnv` uses `lib/env` (`checkEnv`/`formatEnvReport`); warns in dev, throws the same table in build/start                                    | One env list for dev, build and `pnpm env:check`                                                                   |
| `.env.example`                                                                                                                                                               | Regenerated by `pnpm env:example` from `lib/env/index.ts`; required values use `__REPLACE_ME__`, optional ones are commented out                         | Grouped, documented variables (run log R12)                                                                        |
| `turbo.json`                                                                                                                                                                 | `globalEnv` lists every variable in `lib/env/index.ts`                                                                                                   | AGENTS.md rule 8                                                                                                   |
| `README.md`                                                                                                                                                                  | Replaced with a short base README pointing to `docs/README.md`                                                                                           | Two audiences need the base's docs, not the template's marketing page; upstream's README stays reachable on GitHub |
| `agent/instructions.ts`                                                                                                                                                      | Example lead-in "Here are some jackets." → "Here are some options."                                                                                      | No product-category words in the base (Eve stays disabled)                                                         |

## 3. Dependencies added

There are no new runtime dependencies. Both additions are dev-only and pinned:

| Package                   | Why                                                                                                                                                         |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vitest` 5.1.0            | Unit tests (`pnpm test`), which the brief requires                                                                                                          |
| `@playwright/test` 1.65.0 | Smoke tests (`pnpm test:e2e`), plus `pnpm screenshots` and `pnpm brand:assets`, which render the SVG brand assets to PNG/ICO, so no image library is needed |

`zod`, `lucide-react` and `next/font` were already upstream dependencies.

## 4. Not verified, and assumptions

- **No dev store and no Admin token.**
  - `pnpm shopify:setup` (real run) and `pnpm shopify:seed` have never written to a store.
  - The Admin mutations, payload names (`createdDefinition`, `updatedDefinition`, `metaobjectUpsert`),
    metafield types and validation options were checked against shopify.dev (Admin API 2026-10), not
    executed.
  - The Shopify Dev MCP needed re-authentication in this run, so shopify.dev pages were the source (run
    log R4).
- **Storefront content queries** for metaobjects and product metafields:
  - They typecheck against Hydrogen's bundled Storefront schema (`gql()` inference) and ran against
    mock.shop without errors.
  - mock.shop has no metaobjects, though, so the "content present" rendering was checked only through
    unit-tested transforms.
- **`products/update` on metafield-only edits:** assumed to fire and revalidate PDP content.
  - This is marked `VERIFY` in `docs/maintainers/architecture.md`.
  - If it doesn't fire, edits show up after a product save or `POST /api/revalidate?tag=product-<handle>`.
- **Webhook secret:** I assumed webhooks created by a Dev Dashboard app are signed with that app's client
  secret (`SHOPIFY_WEBHOOK_SECRET`).
- **Shopify CDN:**
  - Only `width` is sent; whether `quality` works on raw CDN URLs is unverified.
  - AVIF/WebP negotiation is documented for theme URLs and assumed for `cdn.shopify.com`.
- **Pixel/GA4:**
  - The event mapping is unit-tested, but not fired against Meta Test Events or the GA4 DebugView.
  - I assumed the bus delivers events without a banner for Pakistani visitors (Customer Privacy defaults).
- **Live Claude Code check:** the guard hook was tested by sending it PreToolUse payloads directly, not
  inside a live store-role Claude Code session. The format hook did run live in this session.
- **`next build`:**
  - Not run with real credentials. With placeholders it fails fast with the env table, as designed, and CI
    skips it (`repo-setup.md`).
  - Google Fonts (`next/font`) downloads at build time, as it does upstream.
- **Upstream quirks left alone:**
  - Next 16.4.3 dev logs an internal "instant validation" error on `/`, also expected upstream; I didn't
    compare against an unmodified checkout.
  - `next dev` rewrites a generated block in `AGENTS.md`; it's committed and listed in `UPSTREAM.md`.
- **Repo choices:**
  - `.env.example` uses `__REPLACE_ME__`, which conflicts with upstream AGENTS.md's realistic-placeholder
    rule; I followed the brief (R12).
  - Buy with Shop is off because Shop Pay is unavailable in Pakistan (R6).
  - Metaobject links are text fields, because `url` rejects relative paths (R11).
  - Size charts use list fields, not JSON (R5).

## 5. Manual steps left for you

1. **Review and merge the PR.** I didn't merge it, and I didn't push to `main`.
2. **GitHub branch protection** for `main`: the exact `gh api` command is in
   `docs/maintainers/repo-setup.md`. Run it after CI has run once, so the `verify` check exists.
3. **Dev store:** create a free Shopify dev store, then:
   1. install the Headless channel and set the three required env vars in `.env.local`;
   2. run `pnpm env:check` (it prints the shop ID);
   3. create a Dev Dashboard app with the six scopes listed in `docs/03`, install it, and add
      `SHOPIFY_ADMIN_CLIENT_ID`/`SECRET` to `.env.local`;
   4. run `pnpm shopify:setup --dry-run`, then `pnpm shopify:setup`, then optionally `pnpm shopify:seed`;
   5. run `BASE_URL=http://localhost:3000 pnpm test:e2e`.
4. **Vercel project** for the base preview: import the repo and set the env vars per `docs/04`. Also set
   spend management (alerts at 50/75/90%), Firewall bot rules and the function region test (`repo-setup.md`).
5. **Webhooks:** set `NEXT_PUBLIC_SITE_URL` to the public https domain before running `shopify:setup`, so
   webhooks register. Then set `SHOPIFY_WEBHOOK_SECRET` on Vercel.
6. **Figma MCP:** run `/mcp` → figma and sign in, once per machine. It's not used in this run.
7. **Optional:** a GitHub "Template repository" flag on the base if you prefer "Use this template" over a
   private repo with a `base` remote (`docs/03` explains both).

## 6. Open questions, most blocking first

1. **Dev store and Admin access:** without one, the setup script, content rendering with real data and PKR
   prices end to end are unverified. This blocks confidence for the first store.
2. **Vercel plan:** Hobby is non-commercial-only, and a live store needs Pro. Spend management also needs
   Pro. Is that acceptable, or should hosting be revisited?
3. **Payments at launch:** COD only, or an online gateway too? Gateways are configured in Shopify. The
   storefront needs no change, but the launch checklist depends on the answer.
4. **Webhook signing:** please confirm on the dev store that webhooks registered by the Dev Dashboard app
   verify with its client secret. If not, use `REVALIDATE_SECRET` as a fallback.
5. **Size chart editing:** are pipe-separated rows (`M | 102 | 70`) acceptable to the PM, or should rows be
   separate metaobject entries (roadmap)?
6. **Menus:** keep navigation in `brand/config.ts` (needs a PR to change), or switch to Shopify-managed menus
   with upstream's `enable-shopify-menus` skill?
7. **Function region:** `iad1` (default) or `bom1`. This needs a measurement from Pakistan.
8. **Meta Conversions API:** build the server-side sender now (needs rate limiting) or rely on Shopify's
   Facebook & Instagram app for Purchase events?
