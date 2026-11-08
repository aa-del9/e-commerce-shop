# ADR 001: Fork vercel/shop as the base

- **Status:** accepted (2026-11-08)

## Context

Each store needs a fast, SEO-friendly headless Shopify storefront that a small team can keep current. Building
one from scratch means owning cart, checkout handoff, caching, search, SEO and accessibility ourselves.

## Decision

Fork `vercel/shop` (template 2026.11.0) into `aa-del9/e-commerce-shop` and create store repos from that base:
`vercel/shop → base → store repos`. Keep upstream's structure; add base code where upstream's `AGENTS.md` says
it belongs; record every modified upstream file in `UPSTREAM.md`; disable features through config instead of
deleting them.

## Consequences

- Upstream fixes and Next.js/Hydrogen upgrades arrive through merges (`UPSTREAM.md`, `update-shop` skill).
- Every upstream file the base modifies is a potential merge conflict, so edits stay small and listed.
- The stack is fixed by upstream: Next.js 16 App Router, React 19, Tailwind 4, Hydrogen SDK, TypeScript 7.
