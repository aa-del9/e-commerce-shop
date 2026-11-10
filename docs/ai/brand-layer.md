# The brand layer: the fourth owner

Upstream `AGENTS.md` names three owners (Shopify, Next.js, Eve). This base adds a fourth.

**The brand layer owns how one store looks and what it says.**

- Owns: store identity, feature flags, commerce copy, SEO defaults, navigation, design tokens, fonts,
  page compositions and presentational sections.
- Lives in: `brand/**` and `public/**`. Store repos edit only these, plus docs and `.env.example`.
- Read by the base through: `lib/config/index.ts` (adapter that derives `shopConfig`),
  `lib/brand/schema.ts` (validation), `app/globals.css` (token mapping) and the route shells in `app/`.

## What lives where

| Path                 | Holds                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `brand/config.ts`    | `defineBrand({...})`: identity, localization, features, commerceCopy, seo, navigation, analytics. Validated by `lib/brand/schema.ts` at dev start, build and `pnpm env:check`. |
| `brand/theme.css`    | Token values only (`:root` CSS variables). No selectors, no Tailwind.                                                                                                          |
| `brand/fonts.ts`     | `next/font` definitions exporting `--font-brand-sans` / `--font-brand-mono`.                                                                                                   |
| `brand/pages/*.tsx`  | One view per route: home, product, collection, search, cart, not-found, faq, contact.                                                                                          |
| `brand/sections/**`  | Presentational sections used by pages and the layout (announcement bar, WhatsApp button, PDP blocks, home sections, logo).                                                     |
| `brand/assets/*.svg` | Source artwork. `pnpm brand:assets` renders the favicon, app icons and OG image from them.                                                                                     |

## May import

- `@/brand/**`
- `@/components/**` (primitives in `components/ui`, domain components such as `ProductCard`, `ProductsGrid`)
- Domain types: `@/lib/<domain>/types`
- Pure helpers: `@/lib/<domain>` `index.ts` files (`formatPrice`, `formatDateTime`, `getWhatsAppUrl`…)
- Base loaders that already own caching: `@/lib/<domain>/server` `get*` functions, called from server
  components only, with no extra caching or fetching around them

## Must never

- Fetch data directly: no `fetch`, no `storefront.request`, no `lib/shopify/**` imports, no `"use cache"`.
  Data comes from route shells (props) or from base `get*` loaders.
- Mutate the cart or checkout. Use the upstream cart components (`useProductForm`, `useCartForm`) as they are.
- Hard-code prices, currency symbols or currency codes. Prices are `Money` from Shopify, formatted by
  `formatPrice` / `<Price>`; the display style comes from `brand.localization.currencyDisplay`.
- Hard-code colors, radii, shadows or fonts in components. Add or change a token in `brand/theme.css`,
  map it in `app/globals.css` if it is new, then use the Tailwind utility.
- Change data loading, Suspense boundaries or caching. Those stay in the route shell (`app/**/page.tsx`).
- Assume a product category. Copy and components work for any sized or unsized product.

## Adding a page section

1. Build the component in `brand/sections/` from `components/ui` primitives and tokens.
2. Give it typed props; if it needs Shopify content, render data a base loader already returns.
   New content fields are a base change (`add-content-type` skill).
3. Render it from the matching `brand/pages/*` view.
4. Check it at 360px and 1280px (`pnpm screenshots /path`).

## Exceptions outside `brand/`

These keep literal colors on purpose and are not brand values: Shop Pay purple (`--color-shop`, Shopify's
brand for the Buy with Shop button), the dev-only setup page (`lib/env/request.ts`), and agent error text in
`components/agent/**` (Eve-owned, off by default).
