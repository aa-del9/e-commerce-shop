# Base setup progress

Resume protocol: read this file, `git log --oneline`, `docs/maintainers/template-notes.md` and
`docs/maintainers/decisions/run-log.md`, then continue at the first unticked item.

Node: use Node 26 (`~/.local/share/fnm/node-versions/v26.13.0/installation/bin` on the setup machine).

## Steps

- [x] Step 0: Understand the template → `docs/maintainers/template-notes.md`
- [x] Step 1: Repo foundations (toolchain, upstream remote, `UPSTREAM.md`, `.repo-role`)
- [x] Step 2: Brand layer (`brand/`, schema, adapter, route shells, theme, token sweep)
- [x] Step 3: Storefront defaults (images, PK localization, announcement, WhatsApp, PDP blocks, preorders, FAQ, home sections, SEO, analytics)
- [ ] Step 4: Shopify content model as code + setup/seed scripts
- [ ] Step 5: Environment variables (`.env.example`, `lib/env`, setup page, `env:check`, docs)
- [ ] Step 6: AI-assisted development (CLAUDE.md, skills, `.mcp.json`, settings, hooks)
- [ ] Step 7: Quality gates (Vitest, Playwright, `verify`, CI, templates, CODEOWNERS, repo-setup doc)
- [ ] Step 8: Documentation (README, PM docs, maintainer docs, ADRs)

## Definition of done

- [ ] `pnpm install && pnpm dev` works with only `.env.example` copied to `.env.local` (friendly setup page)
- [ ] With dev store credentials: storefront flows, PKR prices, clean neutral theme at 360/1280
- [ ] `pnpm verify` passes; CI green on the PR
- [ ] No brand/category strings or values outside `brand/`
- [ ] Every feature flag works on/off; content blocks render nothing when empty
- [ ] `pnpm shopify:setup --dry-run` runs and prints plan + manual checklist
- [ ] Eve, BotID, i18n, Markets disabled via config, not deleted
- [ ] `UPSTREAM.md` lists every modified upstream file with a reason
- [ ] All listed docs exist and match the final code
- [ ] Guard hook blocks an edit outside `brand/` with `.repo-role=store`; role restored to `base`
- [ ] Branch `base-setup` pushed and PR open to `main`

## Notes

- Step 0: upstream mapped; no demo mode upstream; metaobjects webhook tag already exists.
- Step 1: install/lint/typecheck pass on Node 26; `pnpm dev` without env crashes in next.config (baseline); `upstream` remote added.
- Step 2: brand/ layer, adapter, theme tokens, fonts, route shells, neutral assets (`pnpm brand:assets`); token sweep in 11 upstream components.
- Step 3: store-content loaders (metafields/metaobjects), PDP slots, announcement/WhatsApp/FAQ/contact/home sections, CDN loader, PKR display, robots, Pixel+GA4 on the bus (CAPI stubbed). Checked on mock.shop (empty content state).
