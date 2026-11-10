import type { BrandConfig } from "./schema";

// Typed identity so client bundles skip zod; `withBrand` validates the same object at dev start and build.
export function defineBrand(config: BrandConfig): BrandConfig {
  return config;
}
