const DEFAULT_STRAPI_API_URL = "http://localhost:1337";

function normalizeApiUrl(value: string | undefined): string {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return DEFAULT_STRAPI_API_URL;
  }

  return normalizedValue.replace(/\/+$/, "");
}

export const strapiApiUrl = normalizeApiUrl(import.meta.env.VITE_STRAPI_API_URL);
