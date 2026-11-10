import type { ImageLoaderProps } from "next/image";

const SHOPIFY_CDN_HOSTS = ["cdn.shopify.com"];

export function isShopifyCdnUrl(src: string): boolean {
  if (!src.startsWith("https://")) return false;
  const { hostname } = new URL(src);
  return SHOPIFY_CDN_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`));
}

// Shopify's CDN resizes by `width` and negotiates WebP/AVIF itself, so Vercel Image Optimization is skipped.
export default function shopifyImageLoader({ src, width }: ImageLoaderProps): string {
  if (!isShopifyCdnUrl(src)) return src;
  const url = new URL(src);
  url.searchParams.set("width", String(Math.min(width, 5760)));
  return url.toString();
}
