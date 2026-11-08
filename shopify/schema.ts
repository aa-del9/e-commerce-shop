// The Shopify content model this storefront reads: product metafields and metaobject definitions.
// `pnpm shopify:setup` creates or updates these in Shopify; the storefront loaders read the same keys.
// Type names verified against shopify.dev "List of data types" (Admin API 2026-10). Types can never
// change after a definition exists, so a new type needs a new key.
// Every definition gets Storefront API read access (PUBLIC_READ); without it the storefront sees nothing.

export const METAFIELD_NAMESPACE = "custom";

export type MetafieldType =
  | "boolean"
  | "collection_reference"
  | "date_time"
  | "file_reference"
  | "json"
  | "list.file_reference"
  | "list.product_reference"
  | "list.single_line_text_field"
  | "metaobject_reference"
  | "multi_line_text_field"
  | "number_integer"
  | "single_line_text_field"
  | "url";

export interface FieldValidation {
  // Option names from shopify.dev "List of validation options"; values are strings (JSON arrays where noted).
  name: "choices" | "file_type_options" | "metaobject_definition_type";
  value: string;
}

export interface ProductMetafieldDefinition {
  description: string;
  key: string;
  name: string;
  type: MetafieldType;
  validations?: FieldValidation[];
}

export interface MetaobjectFieldDefinition {
  description?: string;
  key: string;
  name: string;
  required?: boolean;
  type: MetafieldType;
  validations?: FieldValidation[];
}

export interface MetaobjectDefinition {
  description: string;
  displayNameKey: string;
  fields: MetaobjectFieldDefinition[];
  name: string;
  // Publishable entries start as drafts; only Active entries show on the storefront.
  publishable: boolean;
  type: string;
}

const IMAGE_ONLY: FieldValidation = { name: "file_type_options", value: '["Image"]' };

export const HOME_SECTION_TYPES = [
  "hero",
  "featured_collection",
  "product_grid",
  "image_text",
  "lookbook",
] as const;

export const SIZE_CHART_UNITS = ["cm", "in"] as const;

export const METAOBJECT_DEFINITIONS = [
  {
    description: "A size table attached to products. One row per size; cells separated by |.",
    displayNameKey: "name",
    fields: [
      { key: "name", name: "Name", required: true, type: "single_line_text_field" },
      {
        description: "Unit of the measurements in the table.",
        key: "unit",
        name: "Unit",
        type: "single_line_text_field",
        validations: [{ name: "choices", value: JSON.stringify(SIZE_CHART_UNITS) }],
      },
      {
        description:
          'Column headings, first one is the size label. Example: "Size", "Chest", "Length".',
        key: "columns",
        name: "Columns",
        required: true,
        type: "list.single_line_text_field",
      },
      {
        description: 'One entry per size, cells separated by "|". Example: "M | 102 | 70".',
        key: "rows",
        name: "Rows",
        required: true,
        type: "list.single_line_text_field",
      },
      { key: "note", name: "Note", type: "multi_line_text_field" },
    ],
    name: "Size chart",
    publishable: true,
    type: "size_chart",
  },
  {
    description: "A question and answer on the FAQ page.",
    displayNameKey: "question",
    fields: [
      { key: "question", name: "Question", required: true, type: "single_line_text_field" },
      { key: "answer", name: "Answer", required: true, type: "multi_line_text_field" },
      {
        description: "Groups questions on the FAQ page, such as Delivery or Returns.",
        key: "category",
        name: "Category",
        type: "single_line_text_field",
      },
      {
        description: "Lower numbers show first.",
        key: "sort_order",
        name: "Sort order",
        type: "number_integer",
      },
    ],
    name: "FAQ item",
    publishable: true,
    type: "faq_item",
  },
  {
    description: "A message in the bar above the header, optionally limited to a time window.",
    displayNameKey: "text",
    fields: [
      { key: "text", name: "Text", required: true, type: "single_line_text_field" },
      {
        description: 'A site path like "/collections/new" or a full https:// address.',
        key: "link",
        name: "Link",
        type: "single_line_text_field",
      },
      {
        description: "Leave empty to show immediately.",
        key: "starts_at",
        name: "Starts at",
        type: "date_time",
      },
      {
        description: "Leave empty to keep showing.",
        key: "ends_at",
        name: "Ends at",
        type: "date_time",
      },
    ],
    name: "Announcement",
    publishable: true,
    type: "announcement",
  },
  {
    description: "A set of images and products shown as a lookbook on the home page.",
    displayNameKey: "title",
    fields: [
      { key: "title", name: "Title", required: true, type: "single_line_text_field" },
      // file_type_options is only documented for single file references, so the list stays unrestricted.
      { key: "images", name: "Images", type: "list.file_reference" },
      { key: "products", name: "Products", type: "list.product_reference" },
    ],
    name: "Lookbook",
    publishable: true,
    type: "lookbook",
  },
  {
    description: "A block on the home page. The home page shows Active sections by sort order.",
    displayNameKey: "heading",
    fields: [
      {
        description: HOME_SECTION_TYPES.join(", "),
        key: "type",
        name: "Section type",
        required: true,
        type: "single_line_text_field",
        validations: [{ name: "choices", value: JSON.stringify(HOME_SECTION_TYPES) }],
      },
      { key: "heading", name: "Heading", type: "single_line_text_field" },
      { key: "body", name: "Body", type: "multi_line_text_field" },
      { key: "image", name: "Image", type: "file_reference", validations: [IMAGE_ONLY] },
      {
        description: 'A site path like "/collections/new" or a full https:// address.',
        key: "link",
        name: "Link",
        type: "single_line_text_field",
      },
      { key: "link_label", name: "Link label", type: "single_line_text_field" },
      {
        description: "For featured collection sections.",
        key: "collection",
        name: "Collection",
        type: "collection_reference",
      },
      {
        description: "For lookbook sections.",
        key: "lookbook",
        name: "Lookbook",
        type: "metaobject_reference",
        validations: [{ name: "metaobject_definition_type", value: "lookbook" }],
      },
      {
        description: "Lower numbers show first.",
        key: "sort_order",
        name: "Sort order",
        type: "number_integer",
      },
    ],
    name: "Home section",
    publishable: true,
    type: "home_section",
  },
] as const satisfies readonly MetaobjectDefinition[];

export const PRODUCT_METAFIELD_DEFINITIONS = [
  {
    description: "Short selling points shown as a list on the product page.",
    key: "highlights",
    name: "Highlights",
    type: "list.single_line_text_field",
  },
  {
    description: "What the product is made of.",
    key: "materials",
    name: "Materials",
    type: "multi_line_text_field",
  },
  {
    description: "How to look after the product.",
    key: "care",
    name: "Care",
    type: "multi_line_text_field",
  },
  {
    description: 'Size or fit worn in the photos, such as "Model is 183 cm and wears M".',
    key: "model_info",
    name: "Model info",
    type: "single_line_text_field",
  },
  {
    description: 'Short labels such as "New" or "Limited".',
    key: "badges",
    name: "Badges",
    type: "list.single_line_text_field",
  },
  {
    description: "Size chart shown in a drawer on the product page.",
    key: "size_chart",
    name: "Size chart",
    type: "metaobject_reference",
    validations: [{ name: "metaobject_definition_type", value: "size_chart" }],
  },
  {
    description: "Marks the product as a preorder.",
    key: "preorder",
    name: "Preorder",
    type: "boolean",
  },
  {
    description: "Drop date and time; the product page counts down until then.",
    key: "drop_at",
    name: "Drop at",
    type: "date_time",
  },
  {
    description: 'When preorders ship, such as "Ships in the first week of March".',
    key: "dispatch_note",
    name: "Dispatch note",
    type: "single_line_text_field",
  },
  {
    description: "Replaces the store-wide delivery message for this product.",
    key: "delivery_note",
    name: "Delivery note",
    type: "single_line_text_field",
  },
] as const satisfies readonly ProductMetafieldDefinition[];

export type ProductMetafieldKey = (typeof PRODUCT_METAFIELD_DEFINITIONS)[number]["key"];
export type MetaobjectType = (typeof METAOBJECT_DEFINITIONS)[number]["type"];

// Metaobject webhooks require a type filter (shopify.dev: webhooks/customize/filters).
export const METAOBJECT_WEBHOOK_FILTER = METAOBJECT_DEFINITIONS.map(
  ({ type }) => `type:${type}`,
).join(" OR ");

// Topics app/api/webhooks/shopify/route.ts turns into cache invalidations (products/*, collections/*, metaobjects/*).
export const WEBHOOK_SUBSCRIPTIONS = [
  { topic: "PRODUCTS_CREATE" },
  { topic: "PRODUCTS_UPDATE" },
  { topic: "PRODUCTS_DELETE" },
  { topic: "COLLECTIONS_CREATE" },
  { topic: "COLLECTIONS_UPDATE" },
  { topic: "COLLECTIONS_DELETE" },
  { filter: METAOBJECT_WEBHOOK_FILTER, topic: "METAOBJECTS_CREATE" },
  { filter: METAOBJECT_WEBHOOK_FILTER, topic: "METAOBJECTS_UPDATE" },
  { filter: METAOBJECT_WEBHOOK_FILTER, topic: "METAOBJECTS_DELETE" },
] as const;
