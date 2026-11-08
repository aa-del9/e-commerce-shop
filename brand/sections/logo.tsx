import { brand } from "@/brand/config";

// Text wordmark by default. To use an image, import it from brand/assets and render next/image with `unoptimized`.
export function BrandLogo() {
  return (
    <span className="text-xl leading-4 font-medium tracking-tight">{brand.identity.name}</span>
  );
}
