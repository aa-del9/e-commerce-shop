# 2. Working with Claude Code

Claude Code is the AI assistant that makes changes to the store's code for you. You describe what you want
in plain words; it edits the right files, checks them, and gives you a preview link. You never need to run git
(the tool that tracks code changes) yourself.

## Asking for a change

Good requests say **what** a shopper should see and **where**:

- "Change the store name to Example and the WhatsApp number to 0300 1234567."
- "Make the buttons dark green and the corners less rounded."
- "Build this Figma frame as a section on the home page: <link>."
- "Turn off the size chart."
- "Ship this change."

Claude Code reads `CLAUDE.md` first, which tells it where each kind of change belongs. If something belongs in
the Shopify admin instead (prices, products, homepage content), it tells you the exact admin path instead of
changing code.

[screenshot: a Claude Code conversation asking to change the store name]

## Skills

Skills are step-by-step playbooks Claude Code follows. You can name one ("use the configure-brand skill") or
just describe the task and it will pick the right one.

| Skill                      | What it does for you                                                                                                                                     |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `configure-brand`          | Asks you questions one at a time and fills in the store name, contacts, WhatsApp, features and wording. Then lists the settings still missing on Vercel. |
| `apply-figma-theme`        | Reads colors, fonts, roundness and shadows from a Figma file and applies them. Lists anything it could not match.                                        |
| `build-section-from-figma` | Builds a page section from a Figma frame link and checks it on phone and desktop sizes.                                                                  |
| `add-content-type`         | Adds a new kind of editable content to Shopify (for example a new product field). This is a **base change**.                                             |
| `verify`                   | Runs all checks and explains any problem in plain language.                                                                                              |
| `ship-change`              | Saves the work on a branch, opens a pull request and gives you the preview link. Never publishes on its own.                                             |
| `sync-from-base`           | Pulls the latest improvements from the base into a store. Stops and explains if a developer is needed.                                                   |
| `new-store-checklist`      | Walks you through [setting up a new store](03-setting-up-a-new-store.md), step by step.                                                                  |

Skills that come from the upstream template (mostly for developers): `build-shop`, `shopify-graphql-reference`,
`enable-analytics`, `enable-i18n`, `enable-shopify-markets`, `enable-shopify-menus`, `init-vercel-shop`,
`update-shop`. Language, multi-country and menu skills are developer tasks for this base.

## From change to live site

1. **You ask** for a change. Claude Code makes it and runs the checks (`pnpm verify`).
2. **Ship it:** say "ship this change". Claude Code creates a pull request (a proposal to change the live site)
   with a description, screenshots at phone (360px) and desktop (1280px) widths, and a checklist.
3. **Preview:** Vercel (the hosting service) builds a private copy of the site with your change. Claude Code
   gives you the link. Open it on your phone and check.
   [screenshot: the Vercel preview link in a pull request]
4. **Review:** the maintainer reviews the pull request.
5. **Merge:** once approved and merged, the live site updates within a couple of minutes.

Need another tweak? Ask Claude Code on the same pull request; the preview updates.

## "This is a base change"

The base is shared by every store. In a store repo, Claude Code may only edit `brand/`, `public/`, `docs/` and
`.env.example`. If your request needs anything else (for example a new kind of Shopify content, a change to the
cart, or a fix in a shared component), Claude Code will say **"this is a base change"**. A safety hook also blocks
such edits automatically.

What to do:

1. Ask Claude Code to "draft a change request for the base".
2. Open a **Change request** issue on the base repo (`aa-del9/e-commerce-shop` → Issues → New issue) and paste it.
3. Once the base is updated, run the `sync-from-base` skill to bring it into your store.

Developers can override the hook with `ALLOW_BASE_EDITS=1` when they really mean to change the base.

## Connecting Figma and Shopify docs (MCP)

MCP servers are add-ons that let Claude Code read other tools. Two are preconfigured in `.mcp.json`:

- **Figma** (`https://mcp.figma.com/mcp`): lets Claude Code read your designs. The first time, type `/mcp` in
  Claude Code, choose **figma**, and sign in with the Figma account that can open the design file in the browser
  window that opens. Needed for `apply-figma-theme` and `build-section-from-figma`.
- **Shopify Dev MCP** (`npx -y @shopify/dev-mcp@latest`): lets Claude Code look up Shopify's official
  documentation and API details instead of guessing. It runs on your computer and needs Node.js (already
  required for this project). No sign-in.

If Claude Code says a Figma tool is missing, run `/mcp` and check that **figma** shows as connected.

## Useful commands

You don't need to type these, but you may see Claude Code use them:

| Command                        | Meaning                                                          |
| ------------------------------ | ---------------------------------------------------------------- |
| `pnpm dev`                     | Runs the site on your computer at http://localhost:3000          |
| `pnpm verify`                  | Runs all checks                                                  |
| `pnpm env:check`               | Lists which settings are set (✅) or missing (❌)                |
| `pnpm screenshots /path`       | Takes phone and desktop screenshots of a page                    |
| `pnpm shopify:setup --dry-run` | Shows what would be set up in Shopify, without changing anything |
