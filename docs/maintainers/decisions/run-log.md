# Base setup run log

Decisions made during the unattended base-setup run. Each entry: decision, alternatives, why, how to reverse.

## R1. Node 26 from fnm, not the shell default

- **Decision:** run every command with Node 26.13 (fnm install) because the shell default is Node 22 and the repo requires `node: 26`.
- **Alternatives:** let pnpm's `devEngines` download Node.
- **Why:** devEngines download is slow on this network; Node 26 was already installed.
- **Reverse:** n/a (environment only).

## R2. No demo mode

- **Decision:** upstream has no credential-free mode, so none is built. Dev shows a setup page instead; docs point to a free Shopify dev store.
- **Alternatives:** a mock Storefront API.
- **Why:** the brief says don't build one; mock data would drift from Shopify.
- **Reverse:** n/a.

## R3. PKR formatting default

- **Decision:** `currencyDisplay: "symbol"` is the default. Node 26 `Intl` gives `Rs 124,999` for `en-PK` (0 fraction digits, western grouping); `"code"` gives `PKR 124,999`.
- **Alternatives:** `"code"` default.
- **Why:** "Rs" is how Pakistani shoppers read prices.
- **Reverse:** set `localization.currencyDisplay: "code"` in `brand/config.ts`.
