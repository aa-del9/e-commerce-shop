// Lets Node scripts import app modules that use extensionless paths and the "@/" alias (tsconfig paths).
import { existsSync } from "node:fs";
import { registerHooks } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));

function candidates(basePath: string): string[] {
  return [`${basePath}.ts`, `${basePath}.tsx`, `${basePath}/index.ts`, `${basePath}/index.tsx`];
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    let basePath: string | undefined;
    if (specifier.startsWith("@/")) basePath = `${root}${specifier.slice(2)}`;
    else if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL) {
      basePath = fileURLToPath(new URL(specifier, context.parentURL));
    }
    if (basePath && !/\.[cm]?[jt]sx?$/.test(basePath)) {
      const match = candidates(basePath).find((candidate) => existsSync(candidate));
      if (match) return nextResolve(pathToFileURL(match).href, context);
    }
    return nextResolve(specifier, context);
  },
});
