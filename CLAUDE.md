@AGENTS.md
@docs/ai/brand-layer.md

# Working in this repo

A headless Shopify storefront for Pakistan (PKR, `en-PK`, COD-first), built on `vercel/shop`. Most requests
come from a non-technical product manager (PM). Make the change, verify it, explain it in plain language.

## Repo role

Read `.repo-role` before editing.

- `base`: this is the shared base. Any file may change; list every upstream file you touch in `UPSTREAM.md`.
- `store`: a store built from the base. Edit only `brand/**`, `public/**`, `docs/**` and `.env.example`
  unless the user explicitly says it is a base change. Reason: everything else must stay identical to the
  base so updates merge cleanly. A hook enforces this (`ALLOW_BASE_EDITS=1` overrides it for maintainers).

## Where things go

| I want to…                                                 | Do this                                                                                   |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Change store name, contacts, WhatsApp number, social links | `brand/config.ts` → `identity` (skill: `configure-brand`)                                 |
| Turn a feature on or off                                   | `brand/config.ts` → `features` (never delete code)                                        |
| Change COD, delivery, returns wording                      | `brand/config.ts` → `commerceCopy`                                                        |
| Change SEO title template, description, OG image           | `brand/config.ts` → `seo`; image in `brand/assets/og-image.svg`, then `pnpm brand:assets` |
| Change header or footer links                              | `brand/config.ts` → `navigation`                                                          |
| Change colors, radius, shadows, type sizes                 | `brand/theme.css` (skill: `apply-figma-theme`)                                            |
| Change fonts                                               | `brand/fonts.ts`                                                                          |
| Change logo, favicon, app icons                            | `brand/assets/*.svg`, then `pnpm brand:assets`                                            |
| Change the layout of a page                                | `brand/pages/<page>.tsx`                                                                  |
| Build a section from a Figma frame                         | `brand/sections/` (skill: `build-section-from-figma`)                                     |
| Change homepage content, FAQ, announcements, size charts   | Shopify admin → Content → Metaobjects, not code                                           |
| Change product highlights, badges, preorder, delivery note | Shopify admin → product → Metafields, not code                                            |
| Change prices, stock, products, collections, discounts     | Shopify admin, not code                                                                   |
| Change shipping rates, payment methods, checkout           | Shopify admin → Settings, not code                                                        |
| Add a new kind of Shopify content                          | Base change (skill: `add-content-type`)                                                   |
| Set a token, ID or secret                                  | Vercel → Settings → Environment Variables (`docs/04-environment-variables.md`)            |
| Ship a change for review                                   | skill: `ship-change`                                                                      |
| Pull updates from the base                                 | skill: `sync-from-base` (store repos)                                                     |
| Set up a new store                                         | skill: `new-store-checklist`                                                              |

## Commands

| Command                        | Does                                                                             |
| ------------------------------ | -------------------------------------------------------------------------------- |
| `pnpm dev`                     | Local site at http://localhost:3000 (shows a setup page if env vars are missing) |
| `pnpm lint`                    | oxlint + oxfmt check (`pnpm format` fixes formatting)                            |
| `pnpm typecheck`               | Next route types + TypeScript                                                    |
| `pnpm test`                    | Unit tests (Vitest)                                                              |
| `pnpm test:e2e`                | Playwright smoke tests against `BASE_URL` (skipped when unset)                   |
| `pnpm env:check`               | Brand config + env vars with ✅/❌                                               |
| `pnpm verify`                  | lint + typecheck + test + env check; run before every PR                         |
| `pnpm screenshots /path …`     | Saves 360px and 1280px screenshots to `docs/maintainers/screenshots/`            |
| `pnpm shopify:setup --dry-run` | Shows which Shopify definitions and webhooks setup would create                  |
| `pnpm shopify:setup`           | Creates them (needs Admin credentials in `.env.local`)                           |

## Definition of done

- `pnpm verify` passes.
- UI changes checked at 360px and 1280px (`pnpm dev`, then `pnpm screenshots`).
- No brand values outside `brand/`: no hex colors, font names or store copy in `components/`, `app/`, `lib/`.
- `UPSTREAM.md` updated if an upstream file changed.
- Docs updated if behavior changed (`docs/` for the PM, `docs/maintainers/` for developers).

## Ask before

- Adding a dependency.
- Touching `lib/shopify/**`, `proxy.ts`, or anything in the cart (`lib/cart/**`, `components/cart/**`).
- Changing caching (`"use cache"`, `cacheLife`, `cacheTag`, webhook tags).
- Anything involving payments. Payment flows are out of scope; Shopify checkout owns them.
- Running `pnpm shopify:setup` or `pnpm shopify:seed` without `--dry-run`.

## Talking to the PM

- Explain outcomes, not code: what changed on the site, where to see it, what is left.
- After pushing, share the Vercel preview link and say what to check on a phone.
- Never ask the PM to run git commands; use the `ship-change` and `sync-from-base` skills.
- When a request needs a base change in a store repo, say so plainly and offer to draft the change request.
- When something belongs in the Shopify admin, give the exact admin path instead of changing code.
