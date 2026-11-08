# Base setup log

Resume protocol: read this file, `git log --oneline`, `docs/maintainers/template-notes.md` and
`docs/maintainers/decisions/run-log.md`, then continue at the first unticked item.

Node: use Node 26 (`~/.local/share/fnm/node-versions/v26.13.0/installation/bin` on the setup machine).

## Steps

- [x] Step 0: Understand the template → `docs/maintainers/template-notes.md`
- [x] Step 1: Repo foundations (toolchain, upstream remote, `UPSTREAM.md`, `.repo-role`)
- [x] Step 2: Brand layer (`brand/`, schema, adapter, route shells, theme, token sweep)
- [x] Step 3: Storefront defaults (images, PK localization, announcement, WhatsApp, PDP blocks, preorders, FAQ, home sections, SEO, analytics)
- [x] Step 4: Shopify content model as code + setup/seed scripts
- [x] Step 5: Environment variables (`.env.example`, `lib/env`, setup page, `env:check`, docs)
- [x] Step 6: AI-assisted development (CLAUDE.md, skills, `.mcp.json`, settings, hooks)
- [x] Step 7: Quality gates (Vitest, Playwright, `verify`, CI, templates, CODEOWNERS, repo-setup doc)
- [x] Step 8: Documentation (README, PM docs, maintainer docs, ADRs)

## Definition of done

- [x] `pnpm install && pnpm dev` works with only `.env.example` copied to `.env.local` (friendly setup page)
- ❌ With dev store credentials: storefront flows, PKR prices, clean neutral theme at 360/1280 — no dev store available (`<DEV_STORE>` placeholder); flows verified on mock.shop instead, PKR via unit tests
- [x] `pnpm verify` passes; CI green on the PR (see PR checks)
- [x] No brand/category strings or values outside `brand/` (documented exceptions)
- [x] Every feature flag works on/off; content blocks render nothing when empty (agent/botProtection not run live)
- [x] `pnpm shopify:setup --dry-run` runs and prints plan + manual checklist (no dev store: planned against an empty store)
- [x] Eve, BotID, i18n, Markets disabled via config, not deleted
- [x] `UPSTREAM.md` lists every modified upstream file with a reason
- [x] All listed docs exist and match the final code
- [x] Guard hook blocks an edit outside `brand/` with `.repo-role=store`; role restored to `base` (hook script driven with PreToolUse payloads)
- [x] Branch `base-setup` pushed and PR open to `main`

## Notes

- Step 0: upstream mapped; no demo mode upstream; metaobjects webhook tag already exists.
- Step 1: install/lint/typecheck pass on Node 26; `pnpm dev` without env crashes in next.config (baseline); `upstream` remote added.
- Step 2: brand/ layer, adapter, theme tokens, fonts, route shells, neutral assets (`pnpm brand:assets`); token sweep in 11 upstream components.
- Step 3: store-content loaders (metafields/metaobjects), PDP slots, announcement/WhatsApp/FAQ/contact/home sections, CDN loader, PKR display, robots, Pixel+GA4 on the bus (CAPI stubbed). Checked on mock.shop (empty content state).
- Step 4: shopify/schema.ts + plan.ts, setup (dry-run verified without creds) and seed scripts; links stored as text (R11).
- Step 5: lib/env single list → .env.example, docs/04, setup page (verified 503 page), build fail-fast (verified), env:check.
- Step 6: CLAUDE.md, docs/ai/brand-layer.md, 8 skills, .mcp.json (Figma remote https://mcp.figma.com/mcp verified on developers.figma.com), settings + guard/format hooks tested.
- Step 7: 38 Vitest tests; Playwright smoke (6/6 pass vs local mock.shop with E2E_PRODUCT_PATH); verify script; CI (no next build, by design); templates; CODEOWNERS; repo-setup doc.
- Step 8: README, PM docs 01–09 + index, architecture, roadmap, ADRs 001–006, final report (`base-setup-report.md`).
