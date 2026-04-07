import type { WooStoreCategory } from "../data-access/woocommerce/store-api";
import type { CatalogCategory } from "../types/catalog";

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

export function mapWooCategory(raw: WooStoreCategory): CatalogCategory {
  return {
    id: String(raw.id),
    name: raw.name ?? "",
    slug: raw.slug ?? "",
    description: getString(raw.description),
    count: typeof raw.count === "number" ? raw.count : null,
    parent: raw.parent ?? 0,
    image: raw.image?.src ?? null,
  };
}
