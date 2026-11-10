import { cacheLife, cacheTag } from "next/cache";

import { tagProducts } from "@/lib/product/server";
import {
  fetchContentMetaobjects,
  fetchProductContent,
} from "@/lib/shopify/operations/store-content/server";
import {
  sortBySortOrder,
  toAnnouncement,
  toFaqItem,
  toHomeSection,
} from "@/lib/shopify/transforms/store-content";
import { isAnnouncementLive, nextAnnouncementChange } from "@/lib/store-content";
import type { Announcement, FaqItem, HomeSection, ProductContent } from "@/lib/store-content/types";

// Errors are thrown inside the cache scope so they are never cached, then turned into "no content" here.
function emptyOnError<T>(label: string, fallback: T) {
  return (error: unknown): T => {
    console.error(`[store-content] ${label} failed; rendering nothing.`, error);
    return fallback;
  };
}

async function cachedAnnouncements(): Promise<Announcement[]> {
  "use cache: remote";
  cacheTag("metaobjects", "metaobjects-announcement");

  const all = (await fetchContentMetaobjects({ first: 20, type: "announcement" }))
    .map(toAnnouncement)
    .filter((announcement) => announcement !== null);
  const now = Date.now();
  const nextChange = nextAnnouncementChange(all, now);
  if (nextChange === undefined) {
    cacheLife("max");
  } else {
    // Shopify sends no webhook when a scheduled window opens or closes, so expire at the next boundary.
    cacheLife({ revalidate: Math.max(300, Math.ceil((nextChange - now) / 1000)) });
  }
  return all.filter((announcement) => isAnnouncementLive(announcement, now));
}

export async function getAnnouncements(): Promise<Announcement[]> {
  return cachedAnnouncements().catch(emptyOnError("announcements", []));
}

async function cachedFaqItems(): Promise<FaqItem[]> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("metaobjects", "metaobjects-faq_item");

  const items = (await fetchContentMetaobjects({ first: 100, type: "faq_item" }))
    .map(toFaqItem)
    .filter((item) => item !== null);
  return sortBySortOrder(items);
}

export async function getFaqItems(): Promise<FaqItem[]> {
  return cachedFaqItems().catch(emptyOnError("FAQ items", []));
}

async function cachedHomeSections(): Promise<HomeSection[]> {
  "use cache: remote";
  cacheLife("max");
  cacheTag("metaobjects", "metaobjects-home_section");

  const sections = (await fetchContentMetaobjects({ first: 20, type: "home_section" }))
    .map(toHomeSection)
    .filter((section) => section !== null);
  // Lookbook product cards carry prices, so product webhooks must refresh this entry too.
  tagProducts(sections.flatMap((section) => section.lookbook?.products ?? []));
  return sortBySortOrder(sections);
}

export async function getHomeSections(): Promise<HomeSection[]> {
  return cachedHomeSections().catch(emptyOnError("home sections", []));
}

async function cachedProductContent(handle: string): Promise<ProductContent | undefined> {
  "use cache: remote";
  cacheLife("max");
  // Size charts are metaobjects, so their edits invalidate through the broad metaobjects tag.
  cacheTag("products", `product-${handle}`, "metaobjects");

  return fetchProductContent({ handle });
}

export async function getProductContent(handle: string): Promise<ProductContent | undefined> {
  return cachedProductContent(handle).catch(
    emptyOnError(`product content for ${handle}`, undefined),
  );
}
