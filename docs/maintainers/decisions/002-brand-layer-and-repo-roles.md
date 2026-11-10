# ADR 002: A brand layer and repo roles

- **Status:** accepted (2026-11-08)

## Context

Stores are configured mostly by a non-technical PM working through Claude Code. If store edits touch shared
files, syncing base updates into each store turns into conflict resolution nobody on the store side can do.

## Decision

- Add a fourth owner, the **brand layer** (`brand/**`, `public/**`): identity, flags, copy, tokens, fonts, page
  views and sections. `lib/config/index.ts` derives upstream's `shopConfig` from `brand/config.ts`, validated
  by a zod schema at dev start, build and `pnpm env:check`.
- Route shells in `app/` keep data loading, caching and Suspense; they render `brand/pages/*` views.
- `.repo-role` marks a repo as `base` or `store`. In store repos, a Claude Code PreToolUse hook blocks edits
  outside `brand/`, `public/`, `docs/` and `.env.example` unless `ALLOW_BASE_EDITS=1`.

## Consequences

- Store syncs touch only base-owned files, so they merge cleanly unless a store broke the rule.
- Moving upstream page JSX into `brand/pages/` means upstream presentation changes must be ported there on
  sync (documented in `UPSTREAM.md`).
- The hook guards Claude's file tools only; shell edits and humans are guarded by CODEOWNERS and review.
