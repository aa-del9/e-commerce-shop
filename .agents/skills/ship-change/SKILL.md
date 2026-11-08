---
name: ship-change
description: For the product manager - put the current changes on a new branch, commit them with a clear message, push, open a pull request using the template, and return the Vercel preview link. Never merges. Use when the PM says "ship it", "send this for review", "make a preview", or "publish this change".
---

# Ship a change

The PM never runs git. You do, and you explain the result.

1. Run `pnpm verify`. If it fails, fix it or explain why it cannot pass; do not ship a failing change.
2. For visual changes, take screenshots: `pnpm screenshots <changed paths>` (360px and 1280px).
3. Check what changed: `git status` and `git diff --stat`. In a store repo, if anything outside `brand/`,
   `public/`, `docs/`, `.env.example` changed, stop and explain it is a base change.
4. Create a branch from the current default branch: `git switch -c change/<short-kebab-description>`
   (if already on a non-default branch for this work, stay on it).
5. Commit with a conventional, plain message, for example `feat: show delivery note on product pages` or
   `style: apply the new color palette`.
6. Push: `git push -u origin HEAD`. Never push to `main`, never force-push.
7. Open a pull request with `gh pr create --fill-first`, then edit the body to follow
   `.github/pull_request_template.md`: what changed in plain language, the checklist ticked honestly,
   base vs brand change marked. Attach or describe the screenshots.
8. Wait for the Vercel preview: `gh pr checks --watch` (or poll `gh pr view --json statusCheckRollup`), then
   find the preview URL in the Vercel bot comment or the deployment status (`gh pr view --comments`).
9. Reply to the PM with: the PR link, the preview link, what to check on their phone, and that a maintainer
   merges it after review. Never merge, approve, or enable auto-merge.

If `gh` is not signed in, push the branch, give the PM the "Compare & pull request" link GitHub prints, and
explain the one click they need.
