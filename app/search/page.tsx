import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchPageView } from "@/brand/pages/search";
import { SearchViewedTracker } from "@/components/analytics/trackers";
import { readBrowseState } from "@/lib/collections/server";
import { fetchSearchResults } from "@/lib/search/server";
import { buildAlternates, buildOpenGraph } from "@/lib/seo";

type SearchParams = Record<string, string | string[] | undefined>;

function getParam(searchParams: SearchParams, key: string): string | undefined {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const query = getParam(resolvedSearchParams, "q") ?? "";
  const hasQuery = query.length > 0;
  const title = hasQuery ? `Search results for "${query}"` : "Search";
  const description = hasQuery
    ? `Find products matching "${query}"`
    : "Search for products in our store";
  return {
    title,
    description,
    alternates: buildAlternates({
      pathname: "/search",
      searchParams: resolvedSearchParams,
    }),
    openGraph: buildOpenGraph({
      title,
      description,
      url: "/search",
      type: "website",
    }),
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-default.png"],
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  // Don't await searchParams here — it would force the route fully dynamic.
  const statePromise = readBrowseState(searchParams);
  const queryPromise = searchParams.then((resolved) => getParam(resolved, "q") ?? "");
  const resultsPromise = searchParams.then((resolved) =>
    fetchSearchResults({ query: getParam(resolved, "q"), statePromise }),
  );
  return (
    <SearchPageView
      queryPromise={queryPromise}
      resultsPromise={resultsPromise}
      statePromise={statePromise}
      tracker={
        <Suspense fallback={null}>
          <SearchAnalyticsTracker queryPromise={queryPromise} />
        </Suspense>
      }
    />
  );
}

async function SearchAnalyticsTracker({ queryPromise }: { queryPromise: Promise<string> }) {
  return <SearchViewedTracker searchTerm={await queryPromise} />;
}
