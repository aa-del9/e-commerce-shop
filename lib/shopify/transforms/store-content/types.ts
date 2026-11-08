import type {
  CONTENT_FIELD_FRAGMENT,
  PRODUCT_CONTENT_METAFIELD_FRAGMENT,
} from "@/lib/shopify/fragments/store-content";
import type { ResultOf } from "@/lib/shopify/types";

export type ShopifyContentField = ResultOf<typeof CONTENT_FIELD_FRAGMENT>;
export interface ShopifyContentMetaobject {
  fields: ShopifyContentField[];
  handle: string;
  id: string;
  type: string;
}
export type ShopifyProductContentMetafield = ResultOf<typeof PRODUCT_CONTENT_METAFIELD_FRAGMENT>;
