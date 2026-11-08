import {
  ProductDetailSection,
  type ProductDetailSlots,
} from "@/components/product-detail/product-detail-section";
import { RelatedProductsSection } from "@/components/product/related-products-section";
import { shopConfig } from "@/lib/config";
import type { ProductDetails, ProductVariant, SelectedOptions } from "@/lib/product/types";

interface ProductPageViewProps {
  product: ProductDetails;
  selectedOptionsPromise: Promise<SelectedOptions>;
  slots?: ProductDetailSlots;
  variantPromise: Promise<ProductVariant | undefined>;
}

export function ProductPageView({
  product,
  selectedOptionsPromise,
  slots,
  variantPromise,
}: ProductPageViewProps) {
  return (
    <>
      <ProductDetailSection
        product={product}
        selectedOptionsPromise={selectedOptionsPromise}
        slots={slots}
        variantPromise={variantPromise}
      />
      {shopConfig.pdp.relatedProducts.isEnabled ? (
        <RelatedProductsSection handle={product.handle} limit={4} />
      ) : null}
    </>
  );
}
