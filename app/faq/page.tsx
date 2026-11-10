import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { brand } from "@/brand/config";
import { FaqPageView } from "@/brand/pages/faq";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";
import { getFaqItems } from "@/lib/store-content/server";

export const metadata: Metadata = {
  alternates: buildAlternates({ pathname: "/faq" }),
  description: `Answers to common questions about ordering from ${brand.identity.name}.`,
  openGraph: buildOpenGraph({ title: "FAQ", type: "website", url: "/faq" }),
  title: "FAQ",
};

export default async function FaqPage() {
  if (!brand.features.faqPage) notFound();
  const items = await getFaqItems();
  return <FaqPageView items={items} />;
}
