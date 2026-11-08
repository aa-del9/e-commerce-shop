import { brand } from "@/brand/config";
import { ProductsGrid } from "@/components/product/products-grid";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";

export function HomePageView() {
  return (
    <Page className="pt-0">
      <Sections>
        <section className="grid grid-cols-1">
          <div className="col-start-1 row-start-1 hidden md:block md:aspect-4/1" />
          <div className="relative col-start-1 row-start-1 flex items-center justify-center px-5 py-10 lg:px-10">
            <div className="flex flex-col items-center text-center gap-2.5">
              <h1 className="text-display-mobile md:text-display max-w-3xl text-foreground">
                {brand.identity.name}
              </h1>
              <p className="text-sm md:text-base max-w-xl text-muted-foreground">
                {brand.identity.tagline}
              </p>
            </div>
          </div>
        </section>
        <Container>
          <ProductsGrid
            title="Products"
            eagerCount={4}
            limit={8}
            collectionUrl="/collections/all"
          />
        </Container>
      </Sections>
    </Page>
  );
}
