import type { CatalogCategory } from "../types/catalog";

type RawWooCategory = {
  id: number;
  name?: string;
  slug?: string;
  parent?: number;
};

export function mapWooCategory(raw: RawWooCategory): CatalogCategory {
  return {
    id: String(raw.id),
    name: raw.name ?? "",
    slug: raw.slug ?? "",
    parent: raw.parent ?? 0,
  };
}