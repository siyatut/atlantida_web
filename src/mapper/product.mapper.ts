import type { CatalogProduct } from "../types/catalog";

type RawWooProduct = {
  id: number;
  name?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  short_description?: string;
  description?: string;
  permalink?: string;
  images?: Array<{
    src?: string;
  }>;
  categories?: Array<{
    slug?: string;
  }>;
};

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

export function mapWooProduct(raw: RawWooProduct): CatalogProduct {
  const images = raw.images ?? [];
  const categories = raw.categories ?? [];

  return {
    id: String(raw.id),
    title: raw.name ?? "Товар",
    price:
      getString(raw.price) ??
      getString(raw.regular_price) ??
      getString(raw.sale_price),
    category: categories.length > 0 ? getString(categories[0]?.slug) : null,
    image: images.length > 0 ? getString(images[0]?.src) : null,
    description:
      getString(raw.short_description) ?? getString(raw.description),
    permalink: getString(raw.permalink),
  };
}