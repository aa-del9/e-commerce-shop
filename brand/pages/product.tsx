import { ProductHeaderBlocks } from "@/brand/sections/product/product-header-blocks";
import { ProductInfoBlocks } from "@/brand/sections/product/product-info-blocks";
import { ProductDetailSection } from "@/components/product-detail/product-detail-section";
import { RelatedProductsSection } from "@/components/product/related-products-section";
import { shopConfig } from "@/lib/config";
import type { ProductDetails, ProductVariant, SelectedOptions } from "@/lib/product/types";
import type { ProductContent } from "@/lib/store-content/types";

interface ProductPageViewProps {
  content: ProductContent | undefined;
  product: ProductDetails;
  selectedOptionsPromise: Promise<SelectedOptions>;
  variantPromise: Promise<ProductVariant | undefined>;
}

export function ProductPageView({
  content,
  product,
  selectedOptionsPromise,
  variantPromise,
}: ProductPageViewProps) {
  return (
    <>
      <ProductDetailSection
        product={product}
        selectedOptionsPromise={selectedOptionsPromise}
        slots={{
          afterBuyButtons: (
            <ProductInfoBlocks
              content={content}
              path={`/products/${product.handle}`}
              title={product.title}
            />
          ),
          afterPrice: <ProductHeaderBlocks content={content} />,
        }}
        variantPromise={variantPromise}
      />
      {shopConfig.pdp.relatedProducts.isEnabled ? (
        <RelatedProductsSection handle={product.handle} limit={4} />
      ) : null}
    </>
  );
}
