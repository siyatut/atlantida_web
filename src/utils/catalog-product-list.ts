import type { CatalogProduct } from "../types/catalog";
import { getCatalogProductNumericPrice } from "./price";

export type ProductSortOrder = "default" | "asc" | "desc";

export function sanitizePriceInput(value: string): string {
  return value.replace(/\D+/g, "");
}

export function getProductsLabel(count: number): string {
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "товаров";
  }

  const lastDigit = count % 10;

  if (lastDigit === 1) {
    return "товар";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "товара";
  }

  return "товаров";
}

export function getFilteredAndSortedProducts(
  products: CatalogProduct[],
  minPriceInput: string,
  maxPriceInput: string,
  sortOrder: ProductSortOrder,
): CatalogProduct[] {
  const minPrice = minPriceInput !== "" ? Number(minPriceInput) : null;
  const maxPrice = maxPriceInput !== "" ? Number(maxPriceInput) : null;

  const filteredProducts = products.filter((product) => {
    const numericPrice = getCatalogProductNumericPrice(product);

    if (numericPrice === null) {
      return minPrice === null && maxPrice === null;
    }

    if (minPrice !== null && numericPrice < minPrice) {
      return false;
    }

    if (maxPrice !== null && numericPrice > maxPrice) {
      return false;
    }

    return true;
  });

  if (sortOrder === "default") {
    return filteredProducts;
  }

  return [...filteredProducts].sort((firstProduct, secondProduct) => {
    const comparison = firstProduct.title.localeCompare(secondProduct.title, "ru", {
      sensitivity: "base",
    });

    return sortOrder === "asc" ? comparison : -comparison;
  });
}
