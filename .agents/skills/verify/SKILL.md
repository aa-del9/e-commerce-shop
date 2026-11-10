---
name: verify
description: Run the project's checks (lint, typecheck, unit tests, brand config and environment check) and explain any failure in plain language with a suggested fix. Use before shipping a change, when the PM asks "is everything OK?", or after editing code.
---

# Verify

1. Run `pnpm verify`. It runs, in order: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm env:check --warn-only`.
2. If it passes, say so in one line and mention anything the env check marked ❌ (those block the live site,
   not the checks).
3. If something fails, read the output and explain each failure in plain language:

   | Failing step | Usually means | Fix |
   | --- | --- | --- |
   | Formatting (`oxfmt --check`) | Code style only | Run `pnpm format`, then verify again |
   | `oxlint` | A likely bug or unsafe pattern | Fix the named line; never disable the rule |
   | `typecheck` | Code uses a value the wrong way, often after a config change | Open the file and line it names |
   | `test` | Behavior changed: price format, brand config validation, env rules, setup plan | Read the test name; fix the code, or update the test only if the behavior change was intended |
   | `brand/config.ts has a problem` | A field in brand config is invalid | The message names the field and the fix |
   | ❌ env vars | Missing settings | `docs/04-environment-variables.md` says where to get each |

4. Fix what you can (formatting, obvious mistakes) and run `pnpm verify` again. Ask before changing behavior.
5. For visual changes, also run `pnpm dev` and `pnpm screenshots <paths>` and look at 360px and 1280px.
