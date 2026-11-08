import { brand } from "@/brand/config";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/datetime";
import type { ProductContent } from "@/lib/store-content/types";

import { DropCountdown } from "./drop-countdown";

// Shown under the price: badges, preorder label, drop countdown, model info. Empty data renders nothing.
export function ProductHeaderBlocks({ content }: { content: ProductContent | undefined }) {
  if (!content) return null;
  const { features } = brand;
  const badges = features.badges ? content.badges : [];
  const isPreorder = features.preorders && content.preorder;
  const dropAt = features.preorders ? content.dropAt : undefined;
  const modelInfo = features.modelInfo ? content.modelInfo : undefined;
  if (badges.length === 0 && !isPreorder && !dropAt && !modelInfo) return null;

  return (
    <div className="grid gap-2.5 pt-2.5" data-slot="product-header-blocks">
      {badges.length > 0 || isPreorder ? (
        <ul className="flex flex-wrap gap-1.5" aria-label="Product labels">
          {isPreorder ? (
            <li>
              <Badge>Preorder</Badge>
            </li>
          ) : null}
          {badges.map((badge) => (
            <li key={badge}>
              <Badge variant="outline">{badge}</Badge>
            </li>
          ))}
        </ul>
      ) : null}
      {dropAt ? <DropCountdown dropAt={dropAt} formattedDropAt={formatDateTime(dropAt)} /> : null}
      {modelInfo ? <p className="text-sm text-muted-foreground">{modelInfo}</p> : null}
    </div>
  );
}
