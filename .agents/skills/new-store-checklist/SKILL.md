---
name: new-store-checklist
description: Walk the product manager through creating a new store from the base, step by step, following docs/03-setting-up-a-new-store.md - repo, repo role, Shopify store and Headless channel, environment variables on Vercel, shopify:setup, domains and checkout domain. Use when someone wants to start a new store.
---

# New store checklist

Follow `docs/03-setting-up-a-new-store.md`; it is the source of truth. This skill turns it into a guided
conversation.

1. Read `docs/03-setting-up-a-new-store.md` in full before starting.
2. Ask where they are: no repo yet, repo created, Shopify connected, or deployed. Start from the first
   unfinished step.
3. Take **one step at a time**. For each step: say what it achieves in one sentence, give the exact clicks or
   the command you will run, do it (or wait for the PM to do the clicks), then confirm the result before moving
   on. Keep a running checklist in your replies with ✅ and ⬜.
4. Steps you run yourself (with permission): creating the repo from the base, setting `.repo-role` to `store`
   (commit it), `pnpm env:check`, `pnpm shopify:setup --dry-run` then `pnpm shopify:setup`, optional
   `pnpm shopify:seed`, and the `configure-brand` skill.
5. Steps the PM does in a browser: Shopify store and Headless channel, Dev Dashboard app for Admin access,
   Vercel project and environment variables, domains and the checkout subdomain. Point to the exact section of
   the doc and wait for them to say it is done. Never ask them to paste secrets into the chat; they paste
   secrets into Vercel or `.env.local` themselves.
6. Finish with `docs/08-launch-checklist.md` and remind them that payments are a pending decision.
