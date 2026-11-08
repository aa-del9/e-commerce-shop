import { BanknoteIcon, PackageIcon, RefreshCwIcon, TruckIcon } from "lucide-react";
import type { ReactNode } from "react";

import { brand } from "@/brand/config";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ProductContent } from "@/lib/store-content/types";

import { SizeChartDrawer } from "./size-chart-drawer";
import { WhatsAppProductContext } from "./whatsapp-product-context";

interface ProductInfoBlocksProps {
  content: ProductContent | undefined;
  path: string;
  title: string;
}

// Shown under the buy buttons: size chart, service notices, and product detail accordions.
export function ProductInfoBlocks({ content, path, title }: ProductInfoBlocksProps) {
  const { commerceCopy, features } = brand;
  const sizeChart = features.sizeChart ? content?.sizeChart : null;
  const notices: Array<{ icon: ReactNode; text: string }> = [];
  if (features.preorders && content?.preorder && content.dispatchNote) {
    notices.push({ icon: <PackageIcon />, text: content.dispatchNote });
  }
  if (features.deliveryNotice) {
    const delivery = content?.deliveryNote ?? commerceCopy.deliveryEstimate;
    if (delivery) notices.push({ icon: <TruckIcon />, text: delivery });
    if (commerceCopy.freeDeliveryMessage) {
      notices.push({ icon: <TruckIcon />, text: commerceCopy.freeDeliveryMessage });
    }
    if (commerceCopy.returnsSummary) {
      notices.push({ icon: <RefreshCwIcon />, text: commerceCopy.returnsSummary });
    }
  }
  if (features.codNotice && commerceCopy.codNotice) {
    notices.push({ icon: <BanknoteIcon />, text: commerceCopy.codNotice });
  }
  const details = features.productDetails
    ? [
        content?.highlights.length
          ? {
              body: (
                <ul className="grid list-disc gap-1 pl-5">
                  {content.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              ),
              title: "Highlights",
            }
          : null,
        content?.materials
          ? { body: <MultiLine text={content.materials} />, title: "Materials" }
          : null,
        content?.care ? { body: <MultiLine text={content.care} />, title: "Care" } : null,
      ].filter((item) => item !== null)
    : [];

  return (
    <>
      {features.whatsappButton ? <WhatsAppProductContext path={path} title={title} /> : null}
      {sizeChart || notices.length > 0 || details.length > 0 ? (
        <div className="grid gap-5" data-slot="product-info-blocks">
          {sizeChart ? <SizeChartDrawer chart={sizeChart} /> : null}
          {notices.length > 0 ? (
            <ul className="grid gap-2.5 rounded-lg border p-4 text-sm">
              {notices.map((notice) => (
                <li
                  className="flex items-start gap-2.5 [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0"
                  key={notice.text}
                >
                  {notice.icon}
                  <span>{notice.text}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {details.length > 0 ? (
            <Accordion className="border-t">
              {details.map((detail) => (
                <AccordionItem key={detail.title} value={detail.title}>
                  <AccordionTrigger>{detail.title}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {detail.body}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function MultiLine({ text }: { text: string }) {
  return <p className="whitespace-pre-line">{text}</p>;
}
