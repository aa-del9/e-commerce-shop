import type { MetadataRoute } from "next";

import { shopConfig } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cart",
          "/account",
          "/login",
          "/search",
          "/*/cart",
          "/*/account",
          "/*/login",
          "/*/search",
          "/collections/*?*sort=",
          "/collections/*?*filter.",
          "/*/collections/*?*sort=",
          "/*/collections/*?*filter.",
          // Base: Hydrogen's sort parameter is `sort_by`, which the `sort=` patterns above do not match.
          "/*?*sort_by=",
          "/*?*filter.",
          "/*?*q=",
          "/collections/*/refine",
        ],
      },
    ],
    sitemap: `${shopConfig.site.url}/sitemap.xml`,
  };
}
