import type { Image } from "@/lib/media/types";
import type { ProductCard } from "@/lib/product/types";
import { transformImage, transformShopifyProductCard } from "@/lib/shopify/transforms/product";
import type {
  ShopifyContentField,
  ShopifyContentMetaobject,
  ShopifyProductContentMetafield,
} from "@/lib/shopify/transforms/store-content/types";
import type {
  Announcement,
  FaqItem,
  HomeSection,
  HomeSectionType,
  Lookbook,
  ProductContent,
  SizeChart,
} from "@/lib/store-content/types";
import { HOME_SECTION_TYPES, SIZE_CHART_UNITS } from "@/shopify/schema";

interface PlainField {
  key: string;
  value?: string | null;
}

function text(fields: readonly PlainField[], key: string): string | undefined {
  const value = fields.find((field) => field.key === key)?.value?.trim();
  return value ? value : undefined;
}

// List metafield values arrive as JSON-encoded arrays of strings.
export function parseList(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string" && item.trim() !== "")
      : [];
  } catch {
    return [];
  }
}

function integer(fields: readonly PlainField[], key: string, fallback: number): number {
  const parsed = Number.parseInt(text(fields, key) ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function fieldByKey(
  metaobject: ShopifyContentMetaobject,
  key: string,
): ShopifyContentField | undefined {
  return metaobject.fields.find((candidate) => candidate.key === key);
}

type ContentNode = NonNullable<ShopifyContentField["references"]>["nodes"][number];

function imagesFrom(nodes: readonly ContentNode[] | undefined): Image[] {
  return (nodes ?? []).flatMap((node) =>
    node.__typename === "MediaImage" ? [transformImage(node.image)].filter((image) => !!image) : [],
  );
}

function productsFrom(nodes: readonly ContentNode[] | undefined): ProductCard[] {
  return (nodes ?? []).flatMap((node) =>
    node.__typename === "Product" ? [transformShopifyProductCard(node)] : [],
  );
}

export function parseSizeChartRows(rows: readonly string[]): string[][] {
  return rows.map((row) => row.split("|").map((cell) => cell.trim()));
}

export function toSizeChart(fields: readonly PlainField[]): SizeChart | null {
  const columns = parseList(text(fields, "columns"));
  const rows = parseSizeChartRows(parseList(text(fields, "rows")));
  if (columns.length === 0 || rows.length === 0) return null;
  const unit = text(fields, "unit");
  return {
    columns,
    name: text(fields, "name") ?? "Size chart",
    note: text(fields, "note"),
    rows,
    unit: SIZE_CHART_UNITS.find((candidate) => candidate === unit),
  };
}

export function toAnnouncement(metaobject: ShopifyContentMetaobject): Announcement | null {
  const message = text(metaobject.fields, "text");
  if (!message) return null;
  return {
    endsAt: text(metaobject.fields, "ends_at"),
    id: metaobject.id,
    link: text(metaobject.fields, "link"),
    startsAt: text(metaobject.fields, "starts_at"),
    text: message,
  };
}

export function toFaqItem(metaobject: ShopifyContentMetaobject): FaqItem | null {
  const question = text(metaobject.fields, "question");
  const answer = text(metaobject.fields, "answer");
  if (!question || !answer) return null;
  return {
    answer,
    category: text(metaobject.fields, "category") ?? "",
    id: metaobject.id,
    question,
    sortOrder: integer(metaobject.fields, "sort_order", Number.MAX_SAFE_INTEGER),
  };
}

function toLookbook(reference: ShopifyContentField["reference"] | undefined): Lookbook | undefined {
  if (reference?.__typename !== "Metaobject" || reference.type !== "lookbook") return undefined;
  const images = imagesFrom(
    reference.fields.find(({ key }) => key === "images")?.references?.nodes,
  );
  const products = productsFrom(
    reference.fields.find(({ key }) => key === "products")?.references?.nodes,
  );
  if (images.length === 0 && products.length === 0) return undefined;
  return { images, products, title: text(reference.fields, "title") ?? "" };
}

export function toHomeSection(metaobject: ShopifyContentMetaobject): HomeSection | null {
  const type = HOME_SECTION_TYPES.find(
    (candidate) => candidate === text(metaobject.fields, "type"),
  );
  if (!type) return null;
  const imageReference = fieldByKey(metaobject, "image")?.reference;
  const collectionReference = fieldByKey(metaobject, "collection")?.reference;
  const section: HomeSection = {
    body: text(metaobject.fields, "body"),
    collection:
      collectionReference?.__typename === "Collection"
        ? { handle: collectionReference.handle, title: collectionReference.title }
        : undefined,
    heading: text(metaobject.fields, "heading"),
    id: metaobject.id,
    image:
      imageReference?.__typename === "MediaImage" ? transformImage(imageReference.image) : null,
    link: text(metaobject.fields, "link"),
    linkLabel: text(metaobject.fields, "link_label"),
    lookbook: toLookbook(fieldByKey(metaobject, "lookbook")?.reference),
    sortOrder: integer(metaobject.fields, "sort_order", Number.MAX_SAFE_INTEGER),
    type,
  };
  return hasRenderableContent(section) ? section : null;
}

const REQUIRED_CONTENT: Record<HomeSectionType, (section: HomeSection) => boolean> = {
  featured_collection: (section) => !!section.collection,
  hero: (section) => !!(section.heading || section.image),
  image_text: (section) => !!(section.image && (section.heading || section.body)),
  lookbook: (section) => !!section.lookbook,
  product_grid: () => true,
};

function hasRenderableContent(section: HomeSection): boolean {
  return REQUIRED_CONTENT[section.type](section);
}

export function sortBySortOrder<T extends { sortOrder: number }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function toProductContent(
  metafields: ReadonlyArray<ShopifyProductContentMetafield | null>,
): ProductContent {
  const byKey = new Map(
    metafields.flatMap((metafield) => (metafield ? [[metafield.key, metafield] as const] : [])),
  );
  const value = (key: string) => byKey.get(key)?.value?.trim() || undefined;
  const sizeChartReference = byKey.get("size_chart")?.reference;
  return {
    badges: parseList(value("badges")),
    care: value("care"),
    deliveryNote: value("delivery_note"),
    dispatchNote: value("dispatch_note"),
    dropAt: value("drop_at"),
    highlights: parseList(value("highlights")),
    materials: value("materials"),
    modelInfo: value("model_info"),
    preorder: value("preorder") === "true",
    sizeChart:
      sizeChartReference?.__typename === "Metaobject"
        ? toSizeChart(sizeChartReference.fields)
        : null,
  };
}
