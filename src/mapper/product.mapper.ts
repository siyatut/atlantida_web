import type { WooStoreProduct } from "../data-access/woocommerce/store-api";
import type { CatalogProduct } from "../types/catalog";

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

export function mapWooProduct(raw: WooStoreProduct): CatalogProduct {
  const images = raw.images ?? [];
  const categories = raw.categories ?? [];
  const prices = raw.prices;

  return {
    id: String(raw.id),
    title: raw.name ?? "Товар",
    slug: getString(raw.slug),
    price:
      getString(prices?.price) ??
      getString(raw.price) ??
      getString(prices?.regular_price) ??
      getString(raw.regular_price) ??
      getString(prices?.sale_price) ??
      getString(raw.sale_price),
    regularPrice: getString(prices?.regular_price) ?? getString(raw.regular_price),
    salePrice: getString(prices?.sale_price) ?? getString(raw.sale_price),
    priceCurrencySuffix: getString(prices?.currency_suffix),
    category: categories.length > 0 ? getString(categories[0]?.slug) : null,
    categories: categories.map((category) => ({
      id: String(category.id),
      name: category.name ?? "",
      slug: category.slug ?? "",
    })),
    image: images.length > 0 ? getString(images[0]?.src) : null,
    images: images.map((image) => image.src).filter((src): src is string => getString(src) !== null),
    shortDescription: getString(raw.short_description),
    description: getString(raw.description) ?? getString(raw.short_description),
    permalink: getString(raw.permalink),
  };
}
