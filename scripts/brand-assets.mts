// Renders brand/assets/*.svg into the icon and social-image files Next.js and browsers expect.
// Usage: pnpm brand:assets   (uses Playwright's Chromium; set PLAYWRIGHT_CHROMIUM_PATH to reuse one)
import { copyFile, readFile, writeFile } from "node:fs/promises";

import { chromium } from "@playwright/test";

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
});

async function render(
  svgPath: string,
  width: number,
  height: number,
  padding = 0,
): Promise<Buffer> {
  const svg = await readFile(svgPath, "utf8");
  const page = await browser.newPage({ viewport: { height, width } });
  const inner = `width:${width - padding * 2}px;height:${height - padding * 2}px`;
  await page.setContent(
    `<html><body style="margin:0;display:grid;place-items:center;width:${width}px;height:${height}px;background:${padding ? "#111111" : "transparent"}"><div style="${inner}">${svg.replace("<svg ", '<svg style="width:100%;height:100%" ')}</div></body></html>`,
  );
  const png = await page.screenshot({ omitBackground: !padding, type: "png" });
  await page.close();
  return png;
}

// ICO files may embed PNG images directly (Vista+ format), so no image library is needed.
function toIco(images: Array<{ png: Buffer; size: number }>): Buffer {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ png, size }, index) => {
    const entry = 6 + index * 16;
    header.writeUInt8(size >= 256 ? 0 : size, entry);
    header.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map(({ png }) => png)]);
}

try {
  const favicon = "brand/assets/favicon.svg";
  await copyFile(favicon, "app/icon.svg");
  await writeFile("app/apple-icon.png", await render(favicon, 180, 180));
  await writeFile("public/icons/icon-192.png", await render(favicon, 192, 192));
  await writeFile("public/icons/icon-512.png", await render(favicon, 512, 512));
  await writeFile("public/icons/icon-maskable-512.png", await render(favicon, 512, 512, 52));
  await writeFile(
    "app/favicon.ico",
    toIco([
      { png: await render(favicon, 32, 32), size: 32 },
      { png: await render(favicon, 16, 16), size: 16 },
    ]),
  );
  await writeFile("public/og-default.png", await render("brand/assets/og-image.svg", 1200, 628));
  console.log(
    "Updated app/icon.svg, app/favicon.ico, app/apple-icon.png, public/icons/*, public/og-default.png",
  );
} finally {
  await browser.close();
}
