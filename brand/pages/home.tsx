import { brand } from "@/brand/config";
import { DefaultHero, HomeSectionView } from "@/brand/sections/home/home-sections";
import { ProductsGrid } from "@/components/product/products-grid";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import type { HomeSection } from "@/lib/store-content/types";

// Content: "Home section" entries in Shopify admin → Content → Metaobjects, shown by sort order.
export function HomePageView({ sections }: { sections: HomeSection[] }) {
  if (sections.length === 0) {
    return (
      <Page className="pt-0">
        <Sections>
          <DefaultHero />
          <Container>
            <ProductsGrid
              collectionUrl="/collections/all"
              eagerCount={4}
              limit={8}
              title="Products"
            />
          </Container>
        </Sections>
      </Page>
    );
  }
  const [first] = sections;
  const hasHeading = first?.type === "hero" && !!first.heading;
  return (
    <Page className="pt-0">
      {hasHeading ? null : <h1 className="sr-only">{brand.identity.name}</h1>}
      <Sections>
        {sections.map((section, index) => (
          <HomeSectionView isFirst={index === 0} key={section.id} section={section} />
        ))}
      </Sections>
    </Page>
  );
}
