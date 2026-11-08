import {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
  PHASE_PRODUCTION_SERVER,
} from "next/constants";

import { checkEnv, formatEnvReport } from "../env";
import { shopConfig } from "./index";
import type {
  NextConfigContext,
  NextConfigFactory,
  NextConfigInput,
  NextConfigPlugin,
} from "./types";

function assertRequiredEnv(phase: string) {
  if (![PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER].includes(phase))
    return;
  // Next typegen uses the production-build phase but does not need Shopify credentials.
  if (process.argv.includes("typegen")) return;

  // Base: one report for dev, build and `pnpm env:check`; dev continues and proxy.ts shows a setup page.
  const report = checkEnv(process.env, { customerAccounts: shopConfig.auth.isEnabled });
  if (report.ok) return;
  const table = formatEnvReport(report);
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    console.warn(
      `\nThe store is not fully configured; pages show a setup checklist until these are set in .env.local:\n${table}\n`,
    );
    return;
  }
  throw new Error(
    `Missing or invalid environment variables:\n${table}\nSet them in Vercel → Project → Settings → Environment Variables (see docs/04-environment-variables.md).`,
  );
}

async function resolveConfig(config: NextConfigInput, phase: string, context: NextConfigContext) {
  return typeof config === "function" ? config(phase, context) : config;
}

export function withShopConfig(
  nextConfig: NextConfigInput,
  plugins: readonly (NextConfigPlugin | false | null | undefined)[] = [],
): NextConfigFactory {
  return async (phase, context) => {
    assertRequiredEnv(phase);

    let config = await resolveConfig(nextConfig, phase, context);
    for (const plugin of plugins) {
      if (plugin) config = await resolveConfig(await plugin(config), phase, context);
    }
    return config;
  };
}
