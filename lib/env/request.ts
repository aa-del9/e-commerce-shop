import { checkEnv, type EnvReport } from "@/lib/env";

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => `&#${character.charCodeAt(0)};`);
}

export function renderSetupPage(report: EnvReport): string {
  const rows = report.problems
    .map(
      (row) => `<tr>
  <td><code>${escapeHtml(row.spec.name)}</code><div class="status">${row.status === "missing" ? "Missing" : `Invalid: ${escapeHtml(row.message ?? "")}`}</div></td>
  <td>${escapeHtml(row.spec.purpose)}</td>
  <td>${escapeHtml(row.spec.where)}${row.spec.docs ? ` <a href="${escapeHtml(row.spec.docs)}" target="_blank" rel="noopener noreferrer">Guide</a>` : ""}</td>
</tr>`,
    )
    .join("\n");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Finish setting up the store</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 0; padding: 40px 20px; color: #111; background: #fafafa; }
  main { max-width: 960px; margin: 0 auto; }
  h1 { font-size: 28px; font-weight: 500; margin: 0 0 8px; }
  p { color: #555; line-height: 1.5; }
  table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e3e3e3; margin: 24px 0; }
  th, td { text-align: left; vertical-align: top; padding: 12px; border-bottom: 1px solid #e3e3e3; font-size: 14px; line-height: 1.5; }
  th { font-weight: 500; background: #f5f5f5; }
  code { font-size: 13px; word-break: break-all; }
  .status { color: #b42318; font-size: 12px; margin-top: 4px; }
  ol { color: #555; line-height: 1.7; padding-left: 20px; }
  @media (max-width: 640px) {
    thead { display: none; }
    tr, td { display: block; }
    tr { padding: 8px 0; border-bottom: 1px solid #e3e3e3; }
    td { border-bottom: none; padding: 4px 12px; }
  }
</style>
</head>
<body>
<main>
  <h1>Almost there: the store needs a few settings</h1>
  <p>The site can't reach Shopify yet. Add the values below, then save and reload this page. This page only appears on your computer during development; the live site never shows it.</p>
  <table>
    <thead><tr><th>Setting</th><th>What it's for</th><th>Where to find it</th></tr></thead>
    <tbody>
${rows}
    </tbody>
  </table>
  <ol>
    <li>Open <code>.env.local</code> in the project folder (copy it from <code>.env.example</code> if it doesn't exist).</li>
    <li>Replace each <code>__REPLACE_ME__</code> above with the real value.</li>
    <li>Save the file and restart <code>pnpm dev</code>.</li>
  </ol>
  <p>Full explanations: <code>docs/04-environment-variables.md</code>. Run <code>pnpm env:check</code> to see the same list in the terminal.</p>
</main>
</body>
</html>`;
}

// Development only: a friendly page instead of a Shopify crash while credentials are missing.
export function getSetupPageResponse(options: { customerAccounts: boolean }): Response | null {
  if (process.env.NODE_ENV !== "development") return null;
  const report = checkEnv(process.env, options);
  if (report.ok) return null;
  return new Response(renderSetupPage(report), {
    headers: { "Cache-Control": "no-store", "Content-Type": "text/html; charset=utf-8" },
    status: 503,
  });
}
