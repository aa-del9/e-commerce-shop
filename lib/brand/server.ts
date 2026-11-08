import { brand } from "../../brand/config";
import type { NextConfigPlugin } from "../config/types";
import { validateBrand } from "./schema";

// Runs when `next dev` or `next build` loads next.config.ts, so a bad brand/config.ts stops with a readable message.
export const withBrand: NextConfigPlugin = (config) => {
  validateBrand(brand);
  return config;
};
