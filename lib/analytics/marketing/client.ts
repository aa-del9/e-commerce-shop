"use client";

import type { AnalyticsCart, StorefrontAnalyticsDestination } from "@shopify/hydrogen";

import {
  createEventId,
  type MarketingConfig,
  type MarketingEvent,
  toAddToCartEvent,
  toGa4Args,
  toInitiateCheckoutEvent,
  toMetaPixelArgs,
  toViewContentEvent,
} from "@/lib/analytics/marketing";

type Queue = ((...args: unknown[]) => void) & { queue?: unknown[][] };

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: Queue & { callMethod?: (...args: unknown[]) => void; loaded?: boolean; version?: string };
    gtag?: (...args: unknown[]) => void;
  }
}

// Cart summaries mark their checkout button with this attribute; Hydrogen's bus has no checkout event.
export const INITIATE_CHECKOUT_ATTRIBUTE = "data-analytics-initiate-checkout";

function injectScript(src: string) {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

// Scripts load on the first delivered event, which the bus only sends once consent allows tracking.
function loadMetaPixel(pixelId: string) {
  if (window.fbq) return;
  const fbq: NonNullable<Window["fbq"]> = (...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue?.push(args);
  };
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  injectScript("https://connect.facebook.net/en_US/fbevents.js");
  fbq("init", pixelId);
}

function loadGa4(measurementId: string) {
  if (window.gtag) return;
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // gtag.js reads the `arguments` object itself, not an array copy.
    // oxlint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };
  injectScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`);
  window.gtag("js", new Date());
  // Page views are sent from the bus on every client navigation instead.
  window.gtag("config", measurementId, { send_page_view: false });
}

export function createMarketingDestination(
  config: MarketingConfig,
): StorefrontAnalyticsDestination {
  return {
    name: "base-marketing",
    setup({ subscribe }) {
      let latestCart: AnalyticsCart | null = null;
      let isDelivering = false;

      const send = (event: MarketingEvent | null) => {
        if (!event) return;
        isDelivering = true;
        if (config.metaPixelId) {
          loadMetaPixel(config.metaPixelId);
          window.fbq?.(...toMetaPixelArgs(event));
        }
        if (config.ga4MeasurementId) {
          loadGa4(config.ga4MeasurementId);
          window.gtag?.(...toGa4Args(event));
        }
      };

      const unsubscribers = [
        subscribe("page_viewed", () =>
          send({ eventId: createEventId(), items: [], name: "PageView" }),
        ),
        subscribe("product_viewed", (payload) =>
          send(toViewContentEvent(payload, createEventId())),
        ),
        subscribe("product_added_to_cart", (payload) => {
          latestCart = payload.cart;
          send(toAddToCartEvent(payload, createEventId()));
        }),
        subscribe("cart_updated", (payload) => {
          latestCart = payload.cart;
        }),
        subscribe("cart_viewed", (payload) => {
          latestCart = payload.cart;
        }),
      ];

      // Only fires after the bus has delivered an event, so checkout tracking follows the same consent.
      const onClick = (clickEvent: MouseEvent) => {
        if (!isDelivering) return;
        const target = clickEvent.target instanceof Element ? clickEvent.target : null;
        if (!target?.closest(`[${INITIATE_CHECKOUT_ATTRIBUTE}]`)) return;
        send(toInitiateCheckoutEvent(latestCart, createEventId()));
      };
      document.addEventListener("click", onClick, { capture: true });

      return () => {
        for (const unsubscribe of unsubscribers) unsubscribe();
        document.removeEventListener("click", onClick, { capture: true });
      };
    },
  };
}
