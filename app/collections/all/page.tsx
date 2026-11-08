import type { Metadata } from "next";

import { CollectionPageView } from "@/brand/pages/collection";
import {
  CollectionBrowseBoundary,
  SearchParamsProbe,
} from "@/components/collections/collection-page";
import { getAllProductsMetadata, getAllProductsResults } from "@/lib/collections/server";

export async function generateMetadata(): Promise<Metadata> {
  return getAllProductsMetadata();
}

export default function AllProductsPage({ searchParams }: PageProps<"/collections/all">) {
  return (
    <CollectionBrowseBoundary>
      <CollectionPageView results={getAllProductsResults()} />
      <SearchParamsProbe searchParams={searchParams} />
    </CollectionBrowseBoundary>
  );
}
