import type { CatalogProduct } from "../types/catalog";

export function getCatalogProductNumericPrice(product: CatalogProduct): number | null {
  if (!product.price) {
    return null;
  }

  const minorUnit = product.priceCurrencyMinorUnit ?? 0;
  const numericPrice = Number(product.price);

  if (!Number.isFinite(numericPrice)) {
    return null;
  }

  return numericPrice / 10 ** minorUnit;
}

export function formatCatalogProductPrice(product: CatalogProduct): string {
  const numericPrice = getCatalogProductNumericPrice(product);

  if (numericPrice === null) {
    if (!product.price) {
      return "Цена не указана";
    }

    const prefix = product.priceCurrencyPrefix ?? "";
    const suffix = product.priceCurrencySuffix ?? "";
    return `${prefix}${product.price}${suffix}`.trim() || "Цена не указана";
  }

  const minorUnit = product.priceCurrencyMinorUnit ?? 0;
  const locale = "ru-RU";

  if (product.priceCurrencyCode) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: product.priceCurrencyCode,
      minimumFractionDigits: minorUnit,
      maximumFractionDigits: minorUnit,
    }).format(numericPrice);
  }

  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: minorUnit,
    maximumFractionDigits: minorUnit,
  }).format(numericPrice);

  const symbol = product.priceCurrencySymbol ?? "";
  const prefix = product.priceCurrencyPrefix ?? "";
  const suffix = product.priceCurrencySuffix ?? "";

  return `${prefix}${symbol}${formattedNumber}${suffix}`.trim();
}
