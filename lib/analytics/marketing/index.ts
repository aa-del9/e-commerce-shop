import type {
  AnalyticsCart,
  AnalyticsCartLine,
  CartLineUpdatePayload,
  ProductViewPayload,
} from "@shopify/hydrogen";

// One event shape fans out to every marketing destination, so Meta and GA4 share the same event_id.
export interface MarketingEvent {
  currency?: string;
  eventId: string;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  name: "AddToCart" | "InitiateCheckout" | "PageView" | "ViewContent";
  value?: number;
}

export interface MarketingConfig {
  ga4MeasurementId?: string;
  metaPixelId?: string;
}

export function createEventId(): string {
  return crypto.randomUUID();
}

// Shopify GIDs end in the numeric ID that Meta catalogs and GA4 item IDs expect.
export function toNumericId(gid: string): string {
  return gid.split("/").pop() ?? gid;
}

function sum(items: MarketingEvent["items"]): number {
  return (
    Math.round(items.reduce((total, item) => total + item.price * item.quantity, 0) * 100) / 100
  );
}

function cartLines(cart: AnalyticsCart | null | undefined): AnalyticsCartLine[] {
  if (!cart) return [];
  return cart.lines.nodes ?? cart.lines.edges?.map(({ node }) => node) ?? [];
}

export function toViewContentEvent(
  payload: ProductViewPayload,
  eventId: string,
): MarketingEvent | null {
  const [product] = payload.products;
  if (!product) return null;
  const items = [
    {
      id: toNumericId(product.variantId || product.id),
      name: product.title,
      price: Number(product.price.amount),
      quantity: product.quantity || 1,
    },
  ];
  return {
    currency: product.price.currencyCode,
    eventId,
    items,
    name: "ViewContent",
    value: sum(items),
  };
}

// Only quantity increases count as AddToCart; Hydrogen publishes the line before and after the change.
export function toAddToCartEvent(
  payload: Pick<CartLineUpdatePayload, "currentLine" | "prevLine">,
  eventId: string,
): MarketingEvent | null {
  const line = payload.currentLine;
  if (!line) return null;
  const added = line.quantity - (payload.prevLine?.quantity ?? 0);
  if (added <= 0) return null;
  const items = [
    {
      id: toNumericId(line.merchandise.id),
      name: line.merchandise.product.title,
      price: Number(line.merchandise.price.amount),
      quantity: added,
    },
  ];
  return {
    currency: line.merchandise.price.currencyCode,
    eventId,
    items,
    name: "AddToCart",
    value: sum(items),
  };
}

export function toInitiateCheckoutEvent(
  cart: AnalyticsCart | null | undefined,
  eventId: string,
): MarketingEvent {
  const lines = cartLines(cart);
  const items = lines.map((line) => ({
    id: toNumericId(line.merchandise.id),
    name: line.merchandise.product.title,
    price: Number(line.merchandise.price.amount),
    quantity: line.quantity,
  }));
  return {
    currency: cart?.cost?.totalAmount?.currencyCode ?? lines[0]?.merchandise.price.currencyCode,
    eventId,
    items,
    name: "InitiateCheckout",
    value: items.length > 0 ? sum(items) : undefined,
  };
}

export function toMetaPixelArgs(
  event: MarketingEvent,
): [command: "track", name: string, params: Record<string, unknown>, options: { eventID: string }] {
  const params: Record<string, unknown> =
    event.name === "PageView"
      ? {}
      : {
          content_ids: event.items.map((item) => item.id),
          content_type: "product",
          contents: event.items.map((item) => ({ id: item.id, quantity: item.quantity })),
          currency: event.currency,
          num_items: event.items.reduce((total, item) => total + item.quantity, 0),
          value: event.value,
        };
  return ["track", event.name, params, { eventID: event.eventId }];
}

const GA4_EVENT_NAMES: Record<MarketingEvent["name"], string> = {
  AddToCart: "add_to_cart",
  InitiateCheckout: "begin_checkout",
  PageView: "page_view",
  ViewContent: "view_item",
};

export function toGa4Args(
  event: MarketingEvent,
): [command: "event", name: string, params: Record<string, unknown>] {
  const params: Record<string, unknown> =
    event.name === "PageView"
      ? { event_id: event.eventId }
      : {
          currency: event.currency,
          event_id: event.eventId,
          items: event.items.map((item) => ({
            item_id: item.id,
            item_name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          value: event.value,
        };
  return ["event", GA4_EVENT_NAMES[event.name], params];
}
