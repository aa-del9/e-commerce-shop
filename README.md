# Storefront base

A brand-neutral base for headless Shopify stores in Pakistan, built on [`vercel/shop`](https://github.com/vercel/shop).
Shopify runs the catalog, cart, checkout and orders; this repo is the storefront. Each store is a copy of this
base whose look, settings and content live in `brand/`, the Shopify admin and Vercel environment variables.

**Start here: [docs/README.md](docs/README.md)**: guides for product managers and developers.

## Quick start

```sh
pnpm install                    # Node 26 and pnpm 12 (see .nvmrc)
cp .env.example .env.local      # then replace each __REPLACE_ME__ (docs/04-environment-variables.md)
pnpm dev                        # http://localhost:3000; shows a setup checklist until Shopify is connected
pnpm verify                     # lint, typecheck, tests, env check
pnpm shopify:setup --dry-run    # preview the Shopify content definitions this site needs
```

Working with Claude Code? Read [CLAUDE.md](CLAUDE.md). Syncing with upstream? Read [UPSTREAM.md](UPSTREAM.md).

License: MIT (inherited from `vercel/shop`).
