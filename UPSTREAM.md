# Upstream

This base repo is a fork of [`vercel/shop`](https://github.com/vercel/shop). Updates flow
`vercel/shop → base → store repos`.

- **Synced to template version:** `2026.11.0` (see `.vercel-shop/template.json`, upstream tag `template@2026.11.0`)
- **Upstream remote:** `upstream` → `https://github.com/vercel/shop.git`

## How to sync

Do this on a branch, never on `main`.

1. **GitHub UI:** on `aa-del9/e-commerce-shop`, use **Sync fork → Update branch**. If GitHub reports
   conflicts, use the command line instead.
2. **Command line:**

   ```sh
   git fetch upstream --tags
   git switch -c sync/upstream-<version> main
   git merge upstream/main          # or: git merge template@<version>
   pnpm install && pnpm verify
   ```

3. **Release-aware review:** ask Claude Code to run the upstream `update-shop` skill in **Plan**
   mode. It reads the release notes between `.vercel-shop/template.json` and the newest
   `template@*` tag and lists what changed per owner.
4. Re-check every file in the table below against the new upstream version, update this file's
   template version, and open a PR.

Store repos sync from this base the same way (remote `base` instead of `upstream`), through the
`sync-from-base` skill.

## Conflict resolution

- **Base-owned files** (`brand/**`, `lib/brand/**`, `lib/env/**`, `lib/content-model/**`,
  `lib/shopify/operations/content/**`, `lib/storefront/**`, `shopify/**`, `scripts/**`, `docs/**`,
  `CLAUDE.md`, `.claude/**` except the skills symlink, new skills): keep the base version, then
  re-read the upstream change and port its intent if it matters.
- **Modified upstream files** (table below): take upstream's new version, then re-apply the base
  change described in the table. Keep the base edit as small as the table says.
- **Route shells** (`app/**/page.tsx` that render `brand/pages/*`): when upstream changes a page's
  presentation, port the presentation change into the matching `brand/pages/*` file and keep
  upstream's data loading, Suspense boundaries and caching in the shell.
- Never resolve a conflict by deleting an upstream feature. Disable it through `brand/config.ts`.

## Modified upstream files

| Path | What changed | Why |
| ---- | ------------ | --- |
