---
name: sync-from-base
description: Store repos only - pull the latest changes from the shared base repo into this store, explain what is coming, and stop with a plain-language summary if conflicts touch files outside the brand layer. Use when the PM asks to update the store, get the latest fixes, or sync with the base.
---

# Sync from the base

Store repos are created from the base (`aa-del9/e-commerce-shop`) and receive its updates. The store's own work
lives in `brand/`, `public/` and `docs/`, so syncs normally merge cleanly.

1. Check `.repo-role` is `store`. If it is `base`, stop: the base syncs from `vercel/shop` (see `UPSTREAM.md`).
2. Make sure the working tree is clean (`git status`). If not, ask whether to ship or set aside the changes first.
3. Add the base remote if missing: `git remote add base https://github.com/aa-del9/e-commerce-shop.git`,
   then `git fetch base`.
4. Explain what is coming, in plain language: `git log --oneline HEAD..base/main`, grouped into features,
   fixes and docs. Mention anything that needs a new env var or a `pnpm shopify:setup` run (check
   `.env.example`, `shopify/schema.ts` and `docs/` changes).
5. Create a branch: `git switch -c sync/base-<yyyy-mm-dd>` and merge: `git merge base/main`.
6. If there are conflicts:
   - Conflicts only in `brand/`, `public/` or `docs/`: resolve them keeping the store's content and the base's
     new structure (for example a new required field in `brand/config.ts`). Explain each choice.
   - Any conflict elsewhere: **stop**. Run `git merge --abort`. Tell the PM: "The update changes files this
     store also changed outside the brand folder. A developer needs to resolve it," and list the files.
7. After a clean merge: `pnpm install`, `pnpm verify`, `pnpm shopify:setup --dry-run` (report any new content
   definitions), and screenshots of the home and a product page.
8. Ship it with the `ship-change` skill (title: `chore: sync from base`). Never merge it yourself.
