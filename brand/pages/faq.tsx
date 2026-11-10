import { brand } from "@/brand/config";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import type { FaqItem } from "@/lib/store-content/types";

// Content: "FAQ item" entries in Shopify admin → Content → Metaobjects, grouped by category.
export function FaqPageView({ items }: { items: FaqItem[] }) {
  const groups = Map.groupBy(items, (item) => item.category);
  return (
    <Page>
      <Container className="max-w-3xl">
        <Sections>
          <div className="grid gap-2.5">
            <h1 className="text-3xl sm:text-4xl md:text-5xl">Frequently asked questions</h1>
            <p className="text-muted-foreground">
              Can’t find an answer?{" "}
              <Link className="underline underline-offset-4" href="/contact">
                Contact {brand.identity.name}
              </Link>
              .
            </p>
          </div>
          {[...groups].map(([category, groupItems]) => (
            <section className="grid gap-2.5" key={category || "general"}>
              {category ? <h2 className="text-xl">{category}</h2> : null}
              <Accordion className="border-t">
                {groupItems.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent className="whitespace-pre-line text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </Sections>
      </Container>
    </Page>
  );
}
