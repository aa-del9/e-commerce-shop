import { formatMoney } from "@shopify/hydrogen";

import { brand } from "@/brand/config";
import { shopConfig } from "@/lib/config";
import type { Money } from "@/lib/money/types";

export function formatCurrencySymbol(
  currencyCode: string,
  locale: string = shopConfig.localization.locale,
): string {
  return formatMoney(
    { amount: "0", currencyCode },
    { currencyDisplay: brand.localization.currencyDisplay, locale },
  ).currencySymbol;
}

export function formatPrice(money: Money, locale: string = shopConfig.localization.locale): string {
  // "symbol" renders Rs 4,999 for PKR in en-PK; "code" renders PKR 4,999.
  return formatMoney(money, { currencyDisplay: brand.localization.currencyDisplay, locale })
    .localizedString;
}

// Shopify minor units follow each currency's ISO 4217 exponent, which Intl reports.
function currencyDigits(currencyCode: string): number {
  return (
    new Intl.NumberFormat("en", { currency: currencyCode, style: "currency" }).resolvedOptions()
      .maximumFractionDigits ?? 2
  );
}

export function fromMinorUnits(amount: number, currencyCode: string): Money {
  const digits = currencyDigits(currencyCode);
  return { amount: (amount / 10 ** digits).toFixed(digits), currencyCode };
}

export function toMinorUnits(amount: number, currencyCode: string): number {
  return Math.round(amount * 10 ** currencyDigits(currencyCode));
}
