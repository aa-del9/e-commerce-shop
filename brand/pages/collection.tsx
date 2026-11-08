import { CollectionResults } from "@/components/collections/browse";
import type { BrowseResults } from "@/lib/collections/types";

interface CollectionPageViewProps {
  results: Promise<BrowseResults>;
}

// The collection header, toolbar and filters live in CollectionLayout; this is the product grid area.
export function CollectionPageView({ results }: CollectionPageViewProps) {
  return <CollectionResults results={results} />;
}
