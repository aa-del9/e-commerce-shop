import { brand } from "@/brand/config";
import type { MenuItem } from "@/lib/menu/types";

interface BrandLink {
  items?: BrandLink[];
  title: string;
  url?: string;
}

function toMenuItems(links: readonly BrandLink[], prefix: string): MenuItem[] {
  return links.map((link, index) => ({
    id: `${prefix}-${index}`,
    items: toMenuItems(link.items ?? [], `${prefix}-${index}`),
    title: link.title,
    url: link.url ?? "",
  }));
}

export function getBrandMainMenu(): MenuItem[] {
  return toMenuItems(brand.navigation.main, "brand-nav");
}

export function getBrandFooterMenu(): MenuItem[] {
  return toMenuItems(brand.navigation.footer, "brand-footer");
}
