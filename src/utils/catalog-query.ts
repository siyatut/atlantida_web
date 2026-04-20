import { sanitizePriceInput, type ProductSortOrder } from "./catalog-product-list";

const ALLOWED_SORT_ORDERS = new Set<ProductSortOrder>(["default", "asc", "desc"]);
const ALLOWED_CATALOG_QUERY_PARAMS = new Set(["page", "sort", "minPrice", "maxPrice"]);

export function getCatalogPageParam(searchParams: URLSearchParams): number {
  const rawPage = Number(searchParams.get("page"));

  if (!Number.isInteger(rawPage) || rawPage < 1) {
    return 1;
  }

  return rawPage;
}

export function getCatalogSortOrderParam(searchParams: URLSearchParams): ProductSortOrder {
  const rawSortOrder = searchParams.get("sort");

  if (!rawSortOrder || !ALLOWED_SORT_ORDERS.has(rawSortOrder as ProductSortOrder)) {
    return "default";
  }

  return rawSortOrder as ProductSortOrder;
}

export function getCatalogPriceParam(
  searchParams: URLSearchParams,
  key: "minPrice" | "maxPrice",
): string {
  return sanitizePriceInput(searchParams.get(key) ?? "");
}

export function getNormalizedCatalogSearchParams(searchParams: URLSearchParams): URLSearchParams {
  const normalizedSearchParams = new URLSearchParams();

  for (const [key, value] of searchParams.entries()) {
    if (!ALLOWED_CATALOG_QUERY_PARAMS.has(key)) {
      continue;
    }

    normalizedSearchParams.append(key, value);
  }

  return normalizedSearchParams;
}
