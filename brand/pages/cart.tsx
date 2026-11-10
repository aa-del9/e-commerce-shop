import { Suspense } from "react";

import { CartPageContent, CartPageSkeleton } from "@/components/cart/cart-page";

export function CartPageView() {
  return (
    <Suspense fallback={<CartPageSkeleton />}>
      <CartPageContent />
    </Suspense>
  );
}
