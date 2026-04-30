export type CatalogSource = "woocommerce" | "strapi";

const DEFAULT_CATALOG_SOURCE: CatalogSource = "woocommerce";
const DEFAULT_STRAPI_API_URL = "http://localhost:1337";

function normalizeCatalogSource(value: string | undefined): CatalogSource {
  return value === "strapi" ? "strapi" : DEFAULT_CATALOG_SOURCE;
}

function normalizeApiUrl(value: string | undefined): string {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return DEFAULT_STRAPI_API_URL;
  }

  return normalizedValue.replace(/\/+$/, "");
}

export const catalogSource = normalizeCatalogSource(import.meta.env.VITE_CATALOG_SOURCE);
export const strapiApiUrl = normalizeApiUrl(import.meta.env.VITE_STRAPI_API_URL);
