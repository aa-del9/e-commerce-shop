import type { Image } from "@/lib/media/types";
import type { ProductCard } from "@/lib/product/types";
import type { HOME_SECTION_TYPES, SIZE_CHART_UNITS } from "@/shopify/schema";

export interface Announcement {
  endsAt?: string;
  id: string;
  link?: string;
  startsAt?: string;
  text: string;
}

export interface FaqItem {
  answer: string;
  category: string;
  id: string;
  question: string;
  sortOrder: number;
}

export type SizeChartUnit = (typeof SIZE_CHART_UNITS)[number];

export interface SizeChart {
  columns: string[];
  name: string;
  note?: string;
  rows: string[][];
  unit?: SizeChartUnit;
}

export interface Lookbook {
  images: Image[];
  products: ProductCard[];
  title: string;
}

export type HomeSectionType = (typeof HOME_SECTION_TYPES)[number];

export interface HomeSection {
  body?: string;
  collection?: { handle: string; title: string };
  heading?: string;
  id: string;
  image: Image | null;
  link?: string;
  linkLabel?: string;
  lookbook?: Lookbook;
  sortOrder: number;
  type: HomeSectionType;
}

export interface ProductContent {
  badges: string[];
  care?: string;
  deliveryNote?: string;
  dispatchNote?: string;
  dropAt?: string;
  highlights: string[];
  materials?: string;
  modelInfo?: string;
  preorder: boolean;
  sizeChart: SizeChart | null;
}
