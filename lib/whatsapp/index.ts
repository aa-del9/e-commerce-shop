import { brand } from "@/brand/config";

// wa.me takes the number without "+" or separators.
export function getWhatsAppUrl({
  message,
  number = brand.identity.whatsappNumber,
}: {
  message?: string;
  number?: string;
}): string {
  const url = new URL(`https://wa.me/${number.replace(/\D/g, "")}`);
  if (message) url.searchParams.set("text", message);
  return url.toString();
}

export function getProductWhatsAppMessage({ title, url }: { title: string; url: string }): string {
  return `Hi ${brand.identity.name}, I'm interested in "${title}": ${url}`;
}
