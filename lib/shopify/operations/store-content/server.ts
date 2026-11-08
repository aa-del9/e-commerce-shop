import { gql } from "@shopify/hydrogen";

import { shopConfig } from "@/lib/config";
import type { CommerceLocale } from "@/lib/config/types";
import { assertStorefrontOk } from "@/lib/shopify/errors/server";
import {
  CONTENT_FIELD_FRAGMENT,
  PRODUCT_CONTENT_METAFIELD_FRAGMENT,
} from "@/lib/shopify/fragments/store-content";
import { storefront } from "@/lib/shopify/storefront/server";
import { toProductContent } from "@/lib/shopify/transforms/store-content";
import type { ShopifyContentMetaobject } from "@/lib/shopify/transforms/store-content/types";
import type { ProductContent } from "@/lib/store-content/types";
import {
  METAFIELD_NAMESPACE,
  type MetaobjectType,
  PRODUCT_METAFIELD_DEFINITIONS,
} from "@/shopify/schema";

const GET_METAOBJECTS_QUERY = gql(
  `#graphql
  query getStoreContentMetaobjects($type: String!, $first: Int!, $country: CountryCode, $language: LanguageCode) @inContext(country: $country, language: $language) {
    metaobjects(type: $type, first: $first) {
      nodes {
        id
        handle
        type
        fields {
          ...StoreContentField
        }
      }
    }
  }
`,
  [CONTENT_FIELD_FRAGMENT],
);

const GET_PRODUCT_CONTENT_QUERY = gql(
  `#graphql
  query getProductStoreContent($handle: String!, $identifiers: [HasMetafieldsIdentifier!]!, $country: CountryCode, $language: LanguageCode) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      metafields(identifiers: $identifiers) {
        ...ProductContentMetafield
      }
    }
  }
`,
  [PRODUCT_CONTENT_METAFIELD_FRAGMENT],
);

// Entries of a type that has no definition, no storefront access, or no Active entries come back empty.
export async function fetchContentMetaobjects({
  first = 50,
  locale = shopConfig.localization,
  type,
}: {
  first?: number;
  locale?: CommerceLocale;
  type: MetaobjectType;
}): Promise<ShopifyContentMetaobject[]> {
  const response = await storefront.request(GET_METAOBJECTS_QUERY, {
    locale,
    variables: { first, type },
  });
  assertStorefrontOk(response, "getStoreContentMetaobjects");
  return response.data.metaobjects.nodes;
}

export async function fetchProductContent({
  handle,
  locale = shopConfig.localization,
}: {
  handle: string;
  locale?: CommerceLocale;
}): Promise<ProductContent | undefined> {
  const response = await storefront.request(GET_PRODUCT_CONTENT_QUERY, {
    locale,
    variables: {
      handle,
      identifiers: PRODUCT_METAFIELD_DEFINITIONS.map(({ key }) => ({
        key,
        namespace: METAFIELD_NAMESPACE,
      })),
    },
  });
  assertStorefrontOk(response, "getProductStoreContent");
  const product = response.data.product;
  if (!product) return undefined;
  return toProductContent(product.metafields);
}
