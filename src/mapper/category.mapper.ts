import type { WooStoreCategory } from "../data-access/woocommerce/store-api";
import type { CatalogCategory } from "../types/catalog";

export function mapWooCategory(raw: WooStoreCategory): CatalogCategory {
  return {
    id: String(raw.id),
    name: raw.name ?? "",
    slug: raw.slug ?? "",
    parent: raw.parent ?? 0,
    image: raw.image?.src ?? null,
  };
}
