import type { Metadata } from "next";

import { CartPageView } from "@/brand/pages/cart";
import { CartViewedTracker } from "@/components/analytics/trackers";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Cart",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function CartPage() {
  return (
    <>
      <CartViewedTracker />
      <CartPageView />
    </>
  );
}
