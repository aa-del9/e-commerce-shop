import type { Metadata } from "next";

import { brand } from "@/brand/config";
import { HomePageView } from "@/brand/pages/home";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const title = brand.identity.name;
  const description = brand.seo.defaultDescription;
  return {
    title: { absolute: title },
    description,
    alternates: buildAlternates({ pathname: "/" }),
    openGraph: buildOpenGraph({
      title,
      description,
      url: "/",
      type: "website",
    }),
  };
}

export default function HomePage() {
  return <HomePageView />;
}
