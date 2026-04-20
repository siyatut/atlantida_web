import type { ProductSortOrder } from "./catalog-product-list";

type PersistedCatalogFilters = {
  sortOrder: ProductSortOrder;
  minPrice: string;
  maxPrice: string;
};

function getCatalogFiltersStorageKey(categoryId: string): string {
  return `catalogFilters:${categoryId}`;
}

export function loadPersistedCatalogFilters(categoryId: string): PersistedCatalogFilters | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(getCatalogFiltersStorageKey(categoryId));

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<PersistedCatalogFilters>;

    if (parsed.sortOrder !== "default" && parsed.sortOrder !== "asc" && parsed.sortOrder !== "desc") {
      return null;
    }

    return {
      sortOrder: parsed.sortOrder,
      minPrice: typeof parsed.minPrice === "string" ? parsed.minPrice : "",
      maxPrice: typeof parsed.maxPrice === "string" ? parsed.maxPrice : "",
    };
  } catch {
    return null;
  }
}

export function persistCatalogFilters(
  categoryId: string,
  sortOrder: ProductSortOrder,
  minPrice: string,
  maxPrice: string,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const value: PersistedCatalogFilters = {
    sortOrder,
    minPrice,
    maxPrice,
  };

  window.localStorage.setItem(getCatalogFiltersStorageKey(categoryId), JSON.stringify(value));
}
