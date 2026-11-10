import { gql } from "@shopify/hydrogen";

import { PRODUCT_CARD_FRAGMENT } from "@/lib/shopify/fragments/product";

export const CONTENT_FIELD_FRAGMENT = gql(
  `#graphql
  fragment StoreContentField on MetaobjectField {
    key
    type
    value
    reference {
      __typename
      ... on MediaImage {
        image {
          url
          altText
          width
          height
        }
      }
      ... on Collection {
        handle
        title
      }
      ... on Metaobject {
        id
        handle
        type
        fields {
          key
          type
          value
          references(first: 20) {
            nodes {
              __typename
              ... on MediaImage {
                image {
                  url
                  altText
                  width
                  height
                }
              }
              ... on Product {
                ...ProductCardFields
              }
            }
          }
        }
      }
    }
    references(first: 20) {
      nodes {
        __typename
        ... on MediaImage {
          image {
            url
            altText
            width
            height
          }
        }
        ... on Product {
          ...ProductCardFields
        }
      }
    }
  }
`,
  [PRODUCT_CARD_FRAGMENT],
);

export const PRODUCT_CONTENT_METAFIELD_FRAGMENT = gql(`#graphql
  fragment ProductContentMetafield on Metafield {
    key
    namespace
    type
    value
    reference {
      __typename
      ... on Metaobject {
        id
        type
        fields {
          key
          type
          value
        }
      }
    }
  }
`);
