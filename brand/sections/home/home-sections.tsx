import Image from "next/image";
import { Suspense } from "react";

import { brand } from "@/brand/config";
import { ProductCard } from "@/components/product-card/product-card";
import { ProductsGrid, ProductsGridSkeleton } from "@/components/product/products-grid";
import { Container } from "@/components/ui/container";
import { Link } from "@/components/ui/link";
import { getCollectionResults } from "@/lib/collections/server";
import type { Image as ImageData } from "@/lib/media/types";
import type { ProductCard as ProductCardData } from "@/lib/product/types";
import type { HomeSection } from "@/lib/store-content/types";

// One component per `home_section` type. Each renders nothing when its content is missing.
export function HomeSectionView({ isFirst, section }: { isFirst: boolean; section: HomeSection }) {
  switch (section.type) {
    case "hero":
      return <HeroSection isFirst={isFirst} section={section} />;
    case "featured_collection":
      return <FeaturedCollectionSection section={section} />;
    case "product_grid":
      return (
        <Container>
          <ProductsGrid
            collectionUrl={section.link ?? "/collections/all"}
            eagerCount={isFirst ? 4 : 0}
            limit={8}
            title={section.heading ?? "Products"}
          />
        </Container>
      );
    case "image_text":
      return <ImageTextSection isFirst={isFirst} section={section} />;
    case "lookbook":
      return <LookbookSection section={section} />;
  }
}

// Shown when the store has no home sections yet: the store name and its newest products.
export function DefaultHero() {
  return (
    <section className="grid grid-cols-1">
      <div className="col-start-1 row-start-1 hidden md:block md:aspect-4/1" />
      <div className="relative col-start-1 row-start-1 flex items-center justify-center px-5 py-10 lg:px-10">
        <div className="flex flex-col items-center text-center gap-2.5">
          <h1 className="text-display-mobile md:text-display max-w-3xl text-foreground">
            {brand.identity.name}
          </h1>
          {brand.identity.tagline ? (
            <p className="text-sm md:text-base max-w-xl text-muted-foreground">
              {brand.identity.tagline}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function SectionLink({ href, label }: { href?: string; label?: string }) {
  if (!href) return null;
  return (
    <Link
      className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      href={href}
    >
      {label ?? "Shop now"}
    </Link>
  );
}

function SectionImage({
  className,
  image,
  isFirst,
}: {
  className?: string;
  image: ImageData;
  isFirst: boolean;
}) {
  return (
    <Image
      alt={image.altText}
      className={className}
      fetchPriority={isFirst ? "high" : undefined}
      height={image.height || 1080}
      loading={isFirst ? "eager" : "lazy"}
      preload={isFirst}
      sizes="100vw"
      src={image.url}
      width={image.width || 1920}
    />
  );
}

function HeroSection({ isFirst, section }: { isFirst: boolean; section: HomeSection }) {
  const Heading = isFirst ? "h1" : "h2";
  if (!section.image) {
    return (
      <section className="flex flex-col items-center gap-5 px-5 py-16 text-center lg:px-10">
        <Heading className="text-display-mobile md:text-display max-w-3xl">
          {section.heading}
        </Heading>
        {section.body ? <p className="max-w-xl text-muted-foreground">{section.body}</p> : null}
        <SectionLink href={section.link} label={section.linkLabel} />
      </section>
    );
  }
  return (
    <section className="relative grid grid-cols-1">
      <SectionImage
        className="col-start-1 row-start-1 aspect-4/5 w-full object-cover md:aspect-21/9"
        image={section.image}
        isFirst={isFirst}
      />
      {section.heading || section.body || section.link ? (
        <div className="col-start-1 row-start-1 flex items-end bg-linear-to-t from-overlay/50 to-transparent p-5 lg:p-10">
          <div className="grid max-w-xl gap-2.5 text-background">
            {section.heading ? (
              <Heading className="text-display-mobile md:text-display">{section.heading}</Heading>
            ) : null}
            {section.body ? <p className="text-sm md:text-base">{section.body}</p> : null}
            {section.link ? (
              <div className="pt-2.5">
                <SectionLink href={section.link} label={section.linkLabel} />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ImageTextSection({ isFirst, section }: { isFirst: boolean; section: HomeSection }) {
  if (!section.image) return null;
  return (
    <Container>
      <section className="grid items-center gap-5 md:grid-cols-2 md:gap-10">
        <SectionImage
          className="aspect-square w-full object-cover"
          image={section.image}
          isFirst={isFirst}
        />
        <div className="grid gap-2.5">
          {section.heading ? <h2 className="text-2xl sm:text-3xl">{section.heading}</h2> : null}
          {section.body ? (
            <p className="whitespace-pre-line text-muted-foreground">{section.body}</p>
          ) : null}
          {section.link ? (
            <div className="pt-2.5">
              <SectionLink href={section.link} label={section.linkLabel} />
            </div>
          ) : null}
        </div>
      </section>
    </Container>
  );
}

function ProductCardGrid({ products }: { products: ProductCardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          loading="lazy"
          outOfStockText="Out of Stock"
          product={product}
          quickShopText="Choose"
        />
      ))}
    </div>
  );
}

function SectionHeader({ href, title }: { href?: string; title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-2xl sm:text-3xl">{title}</h2>
      {href ? (
        <Link
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          href={href}
        >
          View All
        </Link>
      ) : null}
    </div>
  );
}

function FeaturedCollectionSection({ section }: { section: HomeSection }) {
  if (!section.collection) return null;
  const href = `/collections/${section.collection.handle}`;
  return (
    <Container>
      <div className="grid gap-4">
        <SectionHeader href={href} title={section.heading ?? section.collection.title} />
        <Suspense fallback={<ProductsGridSkeleton count={4} />}>
          <FeaturedCollectionProducts handle={section.collection.handle} />
        </Suspense>
      </div>
    </Container>
  );
}

async function FeaturedCollectionProducts({ handle }: { handle: string }) {
  const { products } = await getCollectionResults({ handle }).catch(() => ({ products: [] }));
  if (products.length === 0) return null;
  return <ProductCardGrid products={products.slice(0, 8)} />;
}

function LookbookSection({ section }: { section: HomeSection }) {
  const lookbook = section.lookbook;
  if (!lookbook) return null;
  return (
    <Container>
      <div className="grid gap-4">
        <SectionHeader href={section.link} title={section.heading ?? lookbook.title} />
        {lookbook.images.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
            {lookbook.images.map((image) => (
              <SectionImage
                className="aspect-3/4 w-full object-cover"
                image={image}
                isFirst={false}
                key={image.url}
              />
            ))}
          </div>
        ) : null}
        {lookbook.products.length > 0 ? <ProductCardGrid products={lookbook.products} /> : null}
      </div>
    </Container>
  );
}
