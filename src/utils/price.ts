import type { CatalogProduct } from "../types/catalog";

export function formatCatalogProductPrice(product: CatalogProduct): string {
  if (!product.price) {
    return "Цена не указана";
  }

  const minorUnit = product.priceCurrencyMinorUnit ?? 0;
  const numericPrice = Number(product.price);

  if (!Number.isFinite(numericPrice)) {
    const prefix = product.priceCurrencyPrefix ?? "";
    const suffix = product.priceCurrencySuffix ?? "";
    return `${prefix}${product.price}${suffix}`.trim() || "Цена не указана";
  }

  const value = numericPrice / 10 ** minorUnit;
  const locale = "ru-RU";

  if (product.priceCurrencyCode) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: product.priceCurrencyCode,
      minimumFractionDigits: minorUnit,
      maximumFractionDigits: minorUnit,
    }).format(value);
  }

  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: minorUnit,
    maximumFractionDigits: minorUnit,
  }).format(value);

  const symbol = product.priceCurrencySymbol ?? "";
  const prefix = product.priceCurrencyPrefix ?? "";
  const suffix = product.priceCurrencySuffix ?? "";

  return `${prefix}${symbol}${formattedNumber}${suffix}`.trim();
}
