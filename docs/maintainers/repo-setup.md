# Repo and Vercel setup (maintainer)

One-time settings for the base repo and for each store repo. None of these live in code.

## GitHub: protect `main`

Goal: every change reaches `main` through a pull request with a green `verify` check and a review from
CODEOWNERS; nobody force-pushes or deletes `main`.

```sh
REPO=aa-del9/e-commerce-shop   # or the store repo

gh api -X PUT "repos/$REPO/branches/main/protection" \
  -H "Accept: application/vnd.github+json" --input - <<'JSON'
{
  "required_status_checks": { "strict": true, "checks": [{ "context": "verify" }] },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON

# Check it
gh api "repos/$REPO/branches/main/protection" --jq '{checks: .required_status_checks.checks, reviews: .required_pull_request_reviews.require_code_owner_reviews, force: .allow_force_pushes.enabled}'
```

- The `verify` check name comes from the job in `.github/workflows/ci.yml`. It only appears in the
  picker after CI has run once on a PR.
- With a single maintainer, GitHub does not let you approve your own PR. `enforce_admins: false` lets the
  admin merge their own base changes; PM pull requests still need the maintainer's review.
- `CODEOWNERS` makes `@aa-del9` the owner of everything except `brand/`, `public/` and `docs/`, so store
  brand changes can be approved by anyone with write access while base files always need the maintainer.
- Also recommended: Settings → General → Pull Requests → allow squash merging only, and automatically
  delete head branches.

### Why CI does not run `next build`

`next build` stops immediately without real Shopify credentials (by design: `lib/config/server.ts` fails
fast on missing env vars) and needs network access for Google Fonts and Shopify. CI has neither, so the
build is covered by the Vercel preview deployment on every PR. If you later add read-only Storefront
credentials as GitHub secrets, add `- run: pnpm build` with those secrets in `env:`.

## Vercel project (one per store)

1. **Import** the store repo in Vercel (framework: Next.js; root directory: repo root). Node version comes from
   `package.json` `engines` (26).
2. **Environment variables:** follow `docs/04-environment-variables.md` (the "Vercel environments" column).
3. **Domains:** add the store domain; set `NEXT_PUBLIC_SITE_URL` to it. The checkout subdomain points to
   Shopify, not Vercel (`docs/03-setting-up-a-new-store.md`).
4. **Spend management** (Settings → Billing → Spend Management, Pro plan): set a low on-demand budget (for
   example the plan's included usage plus a small buffer), turn on notifications at **50%, 75% and 90%**, and
   decide whether to pause projects at 100%. Images are served by Shopify's CDN (ADR 003), so image
   optimization usage should stay near zero; watch Function invocations and Fast Data Transfer instead.
5. **Firewall** (Security → Firewall):
   - turn on **Bot Protection** (managed ruleset) in Log mode first, then Challenge once logs look right;
   - turn on the **AI Bots** managed ruleset if you do not want AI crawlers;
   - add a rate-limit rule for `/api/*` (cart and predictive search) such as 100 requests per minute per IP.
     BotID inside the app stays off (`features.botProtection`) unless the Shop Agent is enabled.
6. **Functions region** (Settings → Functions): the default is `iad1` (Washington, D.C.). For shoppers in
   Pakistan, `bom1` (Mumbai) is closer to the user, but Shopify's Storefront API is the main upstream call
   for most pages. Measure before switching: run `curl -w "%{time_starttransfer}\n" -o /dev/null -s <url>`
   from a Pakistani network (or a PK-located test service) against an uncached page (search with a new query)
   on two preview deployments, one per region, and keep the faster one. Static and cached pages are served
   from the edge either way.
7. **Previews:** keep Preview deployments on for every branch so the PM gets a link per PR. Marketing tags do
   not load on previews (`VERCEL_ENV` is `preview`).

## Plan note

Vercel's Hobby plan is for non-commercial use. A live store is commercial, so plan for Vercel Pro per team.
This is a cost decision for the owner; the base itself adds no paid services.
