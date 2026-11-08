// Captures pages at 360px and 1280px into docs/maintainers/screenshots/ (gitignored).
// Usage: pnpm screenshots [/path ...]   (BASE_URL defaults to http://localhost:3000)
// Set PLAYWRIGHT_CHROMIUM_PATH to reuse an installed Chromium instead of `pnpm exec playwright install chromium`.
import { mkdir } from "node:fs/promises";

import { chromium } from "@playwright/test";

const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
const paths = process.argv.slice(2).length > 0 ? process.argv.slice(2) : ["/"];
const widths = [360, 1280];
const outDir = "docs/maintainers/screenshots";

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
});
try {
  for (const path of paths) {
    for (const width of widths) {
      const page = await browser.newPage({ viewport: { height: 900, width } });
      await page.goto(new URL(path, baseUrl).toString(), { waitUntil: "networkidle" });
      const name = path
        .replace(/^\/$/, "home")
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-|-$/g, "");
      const file = `${outDir}/${name}-${width}.png`;
      await page.screenshot({ fullPage: true, path: file });
      console.log(`saved ${file}`);
      await page.close();
    }
  }
} finally {
  await browser.close();
}
