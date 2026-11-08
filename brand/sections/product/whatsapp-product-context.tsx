"use client";

import { useRegisterWhatsAppProduct } from "@/lib/whatsapp/client";

// Lets the floating WhatsApp button prefill the product title and link on product pages.
export function WhatsAppProductContext({ path, title }: { path: string; title: string }) {
  useRegisterWhatsAppProduct({ path, title });
  return null;
}
