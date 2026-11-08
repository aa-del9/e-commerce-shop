import { type ReactNode, Suspense } from "react";

import { Browse } from "@/components/collections/browse";
import { BrowseFallback } from "@/components/collections/toolbar";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import { Skeleton } from "@/components/ui/skeleton";
import { SEARCH_SORT_EXCLUDE } from "@/lib/collections";
import type { BrowseResults, BrowseState } from "@/lib/collections/types";
import { formatCount } from "@/lib/content";

interface SearchPageViewProps {
  queryPromise: Promise<string>;
  resultsPromise: Promise<BrowseResults>;
  statePromise: Promise<BrowseState>;
  tracker: ReactNode;
}

export function SearchPageView({
  queryPromise,
  resultsPromise,
  statePromise,
  tracker,
}: SearchPageViewProps) {
  return (
    <Page className="pt-2.5 md:pt-10">
      <Container>
        <Sections className="gap-5">
          {tracker}
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl">
              <Link href="/search">Search</Link>
              <Suspense fallback={null}>
                <SearchQueryLabel queryPromise={queryPromise} />
              </Suspense>
            </h1>
          </div>
          <Suspense fallback={<BrowseFallback resultCount={<Skeleton className="h-4 w-20" />} />}>
            <SearchBrowse
              queryPromise={queryPromise}
              resultsPromise={resultsPromise}
              statePromise={statePromise}
            />
          </Suspense>
        </Sections>
      </Container>
    </Page>
  );
}

async function SearchBrowse({
  queryPromise,
  resultsPromise,
  statePromise,
}: Omit<SearchPageViewProps, "tracker">) {
  const query = await queryPromise;

  // A new term rebuilds the browse store so stale filters never carry across searches.
  return (
    <Browse
      path="/search"
      resultCount={
        <Suspense fallback={<Skeleton className="h-4 w-20" />}>
          <SearchResultCount resultsPromise={resultsPromise} />
        </Suspense>
      }
      results={resultsPromise}
      sortExclude={SEARCH_SORT_EXCLUDE}
      state={statePromise}
      storeKey={`search:${query}`}
    />
  );
}

async function SearchQueryLabel({ queryPromise }: { queryPromise: Promise<string> }) {
  const query = await queryPromise;
  if (!query) return null;
  return ` for "${query}"`;
}

async function SearchResultCount({ resultsPromise }: { resultsPromise: Promise<BrowseResults> }) {
  const { total } = await resultsPromise;
  if (!total) return null;
  return formatCount(total, "Item");
}
