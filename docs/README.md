# Documentation

Start here. The guides below are written for the product manager who runs a store through Claude Code.
No coding knowledge is needed; each guide explains the few technical words it uses.

## For the product manager

1. [How this repo works](01-how-this-repo-works.md): base vs store, the `brand/` folder, what is safe to change.
2. [Working with Claude Code](02-working-with-claude-code.md): how to ask for changes, skills, previews.
3. [Setting up a new store](03-setting-up-a-new-store.md): from an empty repo to a running site.
4. [Environment variables](04-environment-variables.md): every setting, where to get it, where to put it.
5. [Brand config](05-brand-config.md): every field of `brand/config.ts`, with examples.
6. [Theme and Figma](06-theme-and-figma.md): colors, fonts, logo, and building from Figma designs.
7. [Content in Shopify](07-content-in-shopify.md): what you edit in the Shopify admin and where it shows.
8. [Launch checklist](08-launch-checklist.md): everything to do before going live.
9. [Troubleshooting](09-troubleshooting.md): common problems and fixes.

## For developers

- [Architecture](maintainers/architecture.md): owners, route shells, data flow, caching, webhooks.
- [Template notes](maintainers/template-notes.md): map of the upstream `vercel/shop` template.
- [Repo and Vercel setup](maintainers/repo-setup.md): branch protection, CI, Vercel settings.
- [Roadmap](maintainers/roadmap.md): features left out on purpose and where they would plug in.
- [Decisions](maintainers/decisions/): short records of why things are the way they are.
- [UPSTREAM.md](../UPSTREAM.md): syncing with `vercel/shop` and every upstream file the base changed.
- [Brand layer rules for AI](ai/brand-layer.md): what code in `brand/` may and may not do.
