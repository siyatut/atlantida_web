import { strapiApiUrl } from "../config/catalog";
import type { CatalogCategory, CatalogProduct, CatalogProductCategory } from "../types/catalog";
import { decodeHtmlEntities } from "../utils/text";

type StrapiQueryValue = string | number | boolean | undefined;

type StrapiEntity = {
  id?: number | string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
};

type StrapiPagination = {
  page?: number;
  pageCount?: number;
  pageSize?: number;
  total?: number;
};

type StrapiListResponse<T> = {
  data?: T[];
  meta?: {
    pagination?: StrapiPagination;
  };
};

type StrapiSingleResponse<T> = {
  data?: T | null;
};

type NormalizedPriceSet = {
  price: string | null;
  regularPrice: string | null;
  salePrice: string | null;
  minorUnit: number | null;
};

type StrapiRequestErrorOptions = {
  message: string;
  status: number;
  statusText: string;
  url: string;
};

const STRAPI_MAIN_CATEGORIES_PATH = "/api/main-categories";
const STRAPI_SUBCATEGORIES_PATH = "/api/subcategories";
const STRAPI_PRODUCTS_PATH = "/api/products";
const STRAPI_SUBCATEGORY_POPULATE_QUERY: Record<string, StrapiQueryValue> = {
  "populate[mainCategory]": true,
  "populate[parent]": true,
  "populate[children]": true,
};
const STRAPI_PRODUCT_POPULATE_QUERY: Record<string, StrapiQueryValue> = {
  "populate[categories]": true,
  "populate[images]": true,
  "populate[image]": true,
  "populate[cover]": true,
  "populate[thumbnail]": true,
};

class StrapiRequestError extends Error {
  status: number;
  statusText: string;
  url: string;

  constructor(options: StrapiRequestErrorOptions) {
    super(options.message);
    this.name = "StrapiRequestError";
    this.status = options.status;
    this.statusText = options.statusText;
    this.url = options.url;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function getFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function getEntityRecord(entity: unknown): Record<string, unknown> | null {
  if (!isRecord(entity)) {
    return null;
  }

  if (isRecord(entity.attributes)) {
    return entity.attributes;
  }

  return entity;
}

function getEntityId(entity: unknown): number | string | null {
  if (!isRecord(entity)) {
    return null;
  }

  const value = entity.id ?? entity.documentId;
  if (typeof value === "number" || typeof value === "string") {
    return value;
  }

  return null;
}

function unwrapRelationValue(value: unknown): unknown {
  if (!isRecord(value) || !("data" in value)) {
    return value;
  }

  return value.data;
}

function getRelationEntities(value: unknown): StrapiEntity[] {
  const unwrapped = unwrapRelationValue(value);

  if (Array.isArray(unwrapped)) {
    return unwrapped.filter(isRecord) as StrapiEntity[];
  }

  if (isRecord(unwrapped)) {
    return [unwrapped as StrapiEntity];
  }

  return [];
}

function getRelationEntity(value: unknown): StrapiEntity | null {
  const entities = getRelationEntities(value);
  return entities[0] ?? null;
}

function getRelationId(value: unknown): number | null {
  const entityId = getEntityId(getRelationEntity(value));
  return typeof entityId === "number" ? entityId : entityId ? Number(entityId) : null;
}

function stripHtmlTags(value: string): string {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeMediaUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return `${strapiApiUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

function extractMediaUrls(value: unknown): string[] {
  const entities = getRelationEntities(value);
  const urls = new Set<string>();

  for (const entity of entities) {
    const record = getEntityRecord(entity);
    const directUrl = normalizeMediaUrl(getString(record?.url));

    if (directUrl) {
      urls.add(directUrl);
    }

    const formats = record?.formats;
    if (isRecord(formats)) {
      for (const formatValue of Object.values(formats)) {
        if (!isRecord(formatValue)) {
          continue;
        }

        const formatUrl = normalizeMediaUrl(getString(formatValue.url));
        if (formatUrl) {
          urls.add(formatUrl);
        }
      }
    }
  }

  return Array.from(urls);
}

function parseDecimalInput(value: unknown): { value: bigint; scale: number } | null {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const normalized = String(value).trim().replace(",", ".");
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    return null;
  }

  const [wholePart, fractionalPart = ""] = normalized.split(".");
  return {
    value: BigInt(`${wholePart}${fractionalPart}`),
    scale: fractionalPart.length,
  };
}

function getMaxPriceScale(...values: unknown[]): number | null {
  let maxScale: number | null = null;

  for (const value of values) {
    const parsed = parseDecimalInput(value);
    if (!parsed) {
      continue;
    }

    maxScale = maxScale === null ? parsed.scale : Math.max(maxScale, parsed.scale);
  }

  return maxScale;
}

function normalizePriceValue(value: unknown, scale: number | null): string | null {
  const parsed = parseDecimalInput(value);
  if (!parsed) {
    return null;
  }

  const targetScale = scale ?? parsed.scale;
  const multiplier = BigInt(10) ** BigInt(targetScale - parsed.scale);
  return (parsed.value * multiplier).toString();
}

function normalizePriceSet(productRecord: Record<string, unknown>): NormalizedPriceSet {
  const priceValue =
    productRecord.price ??
    productRecord.currentPrice ??
    productRecord.priceValue ??
    productRecord.amount ??
    null;
  const regularPriceValue = productRecord.regularPrice ?? productRecord.basePrice ?? null;
  const salePriceValue = productRecord.salePrice ?? productRecord.discountPrice ?? null;
  const scale = getMaxPriceScale(priceValue, regularPriceValue, salePriceValue);

  return {
    price: normalizePriceValue(priceValue, scale),
    regularPrice: normalizePriceValue(regularPriceValue, scale),
    salePrice: normalizePriceValue(salePriceValue, scale),
    minorUnit: scale,
  };
}

function getCategorySummary(rawCategory: unknown): CatalogProductCategory | null {
  const record = getEntityRecord(rawCategory);
  const categoryId = getEntityId(rawCategory);
  const categoryName = getString(record?.name) ?? getString(record?.title);
  const categorySlug = getString(record?.slug);

  if (categoryId === null || !categoryName || !categorySlug) {
    return null;
  }

  return {
    id: String(categoryId),
    name: decodeHtmlEntities(categoryName),
    slug: categorySlug,
  };
}

function getCategoryName(record: Record<string, unknown>): string | null {
  return getString(record.title) ?? getString(record.name);
}

function getCategoryImage(record: Record<string, unknown>): string | null {
  const imageUrls = extractMediaUrls(record.image ?? record.images ?? record.photo ?? null);
  return imageUrls[0] ?? null;
}

function mapStrapiMainCategory(rawCategory: unknown, childCount: number): CatalogCategory | null {
  const record = getEntityRecord(rawCategory);
  const categoryId = getEntityId(rawCategory);
  const categoryName = record ? getCategoryName(record) : null;
  const categorySlug = record ? getString(record.slug) : null;
  const isActive = record ? getBoolean(record.isActive) : null;

  if (!record || categoryId === null || !categoryName || !categorySlug || isActive === false) {
    return null;
  }

  return {
    id: String(categoryId),
    name: decodeHtmlEntities(categoryName),
    slug: categorySlug,
    description: getString(record.description),
    count: childCount,
    parent: 0,
    image: getCategoryImage(record),
  };
}

function mapStrapiSubcategory(rawCategory: unknown): CatalogCategory | null {
  const record = getEntityRecord(rawCategory);
  const categoryId = getEntityId(rawCategory);
  const categoryName = record ? getCategoryName(record) : null;
  const categorySlug = record ? getString(record.slug) : null;

  if (!record || categoryId === null || !categoryName || !categorySlug) {
    return null;
  }

  const mainCategoryId = getRelationId(record.mainCategory);
  const parentSubcategoryId = getRelationId(record.parent);
  const resolvedParentId = parentSubcategoryId ?? mainCategoryId;

  if (resolvedParentId === null) {
    return null;
  }

  return {
    id: String(categoryId),
    name: decodeHtmlEntities(categoryName),
    slug: categorySlug,
    description: getString(record.description),
    count: null,
    parent: resolvedParentId,
    image: getCategoryImage(record),
  };
}

function sortCategoriesByOrder<T extends StrapiEntity>(categories: T[]): T[] {
  return [...categories].sort((firstCategory, secondCategory) => {
    const firstRecord = getEntityRecord(firstCategory);
    const secondRecord = getEntityRecord(secondCategory);
    const firstOrder = getFiniteNumber(firstRecord?.sortOrder) ?? Number.MAX_SAFE_INTEGER;
    const secondOrder = getFiniteNumber(secondRecord?.sortOrder) ?? Number.MAX_SAFE_INTEGER;

    if (firstOrder !== secondOrder) {
      return firstOrder - secondOrder;
    }

    const firstName = getCategoryName(firstRecord ?? {}) ?? "";
    const secondName = getCategoryName(secondRecord ?? {}) ?? "";
    return firstName.localeCompare(secondName, "ru");
  });
}

function buildTopLevelSubcategoryCounts(rawSubcategories: StrapiEntity[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const rawSubcategory of rawSubcategories) {
    const record = getEntityRecord(rawSubcategory);

    if (!record || getRelationId(record.parent) !== null) {
      continue;
    }

    const mainCategoryId = getRelationId(record.mainCategory);

    if (mainCategoryId === null) {
      continue;
    }

    const key = String(mainCategoryId);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
}

function mapStrapiProduct(rawProduct: unknown): CatalogProduct | null {
  const record = getEntityRecord(rawProduct);
  const productId = getEntityId(rawProduct);

  if (!record || productId === null) {
    return null;
  }

  const categories = getRelationEntities(record.categories)
    .map(getCategorySummary)
    .filter((category): category is CatalogProductCategory => category !== null);
  const imageUrls = extractMediaUrls(
    record.images ?? record.image ?? record.cover ?? record.thumbnail ?? null,
  );
  const normalizedPrices = normalizePriceSet(record);
  const rawDescription = getString(record.description);
  const rawShortDescription =
    getString(record.shortDescription) ?? getString(record.short_description) ?? getString(record.excerpt);
  const priceCurrencyCode = getString(record.priceCurrencyCode) ?? getString(record.currencyCode) ?? "RUB";
  const priceCurrencySymbol =
    getString(record.priceCurrencySymbol) ?? getString(record.currencySymbol) ?? "₽";
  const priceCurrencyPrefix =
    getString(record.priceCurrencyPrefix) ??
    getString(record.currencyPrefix) ??
    (priceCurrencyCode === "RUB" ? "" : null);
  const priceCurrencySuffix =
    getString(record.priceCurrencySuffix) ??
    getString(record.currencySuffix) ??
    (priceCurrencyCode === "RUB" ? "" : null);
  const inStockValue = getBoolean(record.isInStock) ?? getBoolean(record.inStock);
  const normalizedShortDescription =
    rawShortDescription ??
    (rawDescription && rawDescription.includes("<") ? stripHtmlTags(rawDescription) : rawDescription);

  return {
    id: String(productId),
    title: decodeHtmlEntities(getString(record.title) ?? getString(record.name) ?? "Товар"),
    slug: getString(record.slug),
    isInStock: inStockValue,
    stockStatus:
      getString(record.stockStatus) ??
      getString(record.stock_status) ??
      (inStockValue === null ? null : inStockValue ? "instock" : "outofstock"),
    lowStockRemaining: getFiniteNumber(record.lowStockRemaining),
    price: normalizedPrices.price,
    regularPrice: normalizedPrices.regularPrice,
    salePrice: normalizedPrices.salePrice,
    priceCurrencyCode,
    priceCurrencySymbol,
    priceCurrencyMinorUnit: normalizedPrices.minorUnit,
    priceCurrencyPrefix,
    priceCurrencySuffix,
    category: categories[0]?.slug ?? null,
    categories,
    image: imageUrls[0] ?? null,
    images: imageUrls,
    shortDescription: normalizedShortDescription,
    description: rawDescription ?? rawShortDescription,
    permalink: getString(record.permalink) ?? null,
  };
}

function buildStrapiQuery(query?: Record<string, StrapiQueryValue>): string {
  if (!query) {
    return "";
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

function parseStrapiErrorMessage(payload: unknown, fallbackBody: string): string {
  if (!isRecord(payload)) {
    return fallbackBody;
  }

  const errorRecord = isRecord(payload.error) ? payload.error : payload;
  const message = getString(errorRecord.message);
  const details = getString(errorRecord.details);

  return [message, details].filter(Boolean).join(". ") || fallbackBody;
}

async function fetchStrapi<T>(path: string, query?: Record<string, StrapiQueryValue>): Promise<T> {
  const requestUrl = `${strapiApiUrl}${path}${buildStrapiQuery(query)}`;

  let response: Response;

  try {
    response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  } catch (error) {
    console.error("[Strapi Catalog API] Network error", {
      url: requestUrl,
      error,
    });

    throw new Error(`Strapi catalog API network error for ${requestUrl}`, { cause: error });
  }

  const responseBody = await response.text();

  if (!response.ok) {
    let parsedPayload: unknown = null;

    try {
      parsedPayload = responseBody ? (JSON.parse(responseBody) as unknown) : null;
    } catch {
      parsedPayload = null;
    }

    const details = parseStrapiErrorMessage(parsedPayload, responseBody);

    console.error("[Strapi Catalog API] Request failed", {
      url: requestUrl,
      status: response.status,
      statusText: response.statusText,
      responseBody,
    });

    throw new StrapiRequestError({
      message: `Strapi catalog API request failed: ${response.status} ${response.statusText}${details ? `. ${details}` : ""}`,
      status: response.status,
      statusText: response.statusText,
      url: requestUrl,
    });
  }

  try {
    return JSON.parse(responseBody) as T;
  } catch (error) {
    console.error("[Strapi Catalog API] Invalid JSON response", {
      url: requestUrl,
      responseBody,
      error,
    });

    throw new Error(`Strapi catalog API returned invalid JSON for ${requestUrl}`, { cause: error });
  }
}

async function fetchAllStrapiCollection<T extends StrapiEntity>(
  path: string,
  query?: Record<string, StrapiQueryValue>,
): Promise<T[]> {
  const pageSize = 100;
  const initialResponse = await fetchStrapi<StrapiListResponse<T>>(path, {
    "pagination[page]": 1,
    "pagination[pageSize]": pageSize,
    ...query,
  });

  const initialData = Array.isArray(initialResponse.data) ? initialResponse.data : [];
  const pageCount = initialResponse.meta?.pagination?.pageCount ?? 1;

  if (pageCount <= 1) {
    return initialData;
  }

  const remainingPages = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) =>
      fetchStrapi<StrapiListResponse<T>>(path, {
        "pagination[page]": index + 2,
        "pagination[pageSize]": pageSize,
        ...query,
      }),
    ),
  );

  return initialData.concat(
    remainingPages.flatMap((response) => (Array.isArray(response.data) ? response.data : [])),
  );
}

async function fetchStrapiProducts(): Promise<CatalogProduct[]> {
  const rawProducts = await fetchAllStrapiCollection<StrapiEntity>(
    STRAPI_PRODUCTS_PATH,
    STRAPI_PRODUCT_POPULATE_QUERY,
  );

  return rawProducts
    .map(mapStrapiProduct)
    .filter((product): product is CatalogProduct => product !== null);
}

async function fetchStrapiCategories(): Promise<CatalogCategory[]> {
  const [rawMainCategories, rawSubcategories] = await Promise.all([
    fetchAllStrapiCollection<StrapiEntity>(STRAPI_MAIN_CATEGORIES_PATH),
    fetchAllStrapiCollection<StrapiEntity>(STRAPI_SUBCATEGORIES_PATH, {
      ...STRAPI_SUBCATEGORY_POPULATE_QUERY,
      "pagination[pageSize]": 100,
    }),
  ]);
  const topLevelSubcategoryCounts = buildTopLevelSubcategoryCounts(rawSubcategories);
  const mainCategories = sortCategoriesByOrder(rawMainCategories)
    .map((category) =>
      mapStrapiMainCategory(category, topLevelSubcategoryCounts.get(String(getEntityId(category))) ?? 0),
    )
    .filter((category): category is CatalogCategory => category !== null);
  const subcategories = sortCategoriesByOrder(rawSubcategories)
    .map(mapStrapiSubcategory)
    .filter((category): category is CatalogCategory => category !== null);

  return mainCategories.concat(subcategories);
}

export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  return fetchStrapiCategories();
}

export async function getCatalogProductsByCategory(categoryId: number): Promise<CatalogProduct[]> {
  const products = await fetchStrapiProducts();

  return products.filter((product) =>
    product.categories.some((category) => Number(category.id) === categoryId),
  );
}

export async function getCatalogProducts(categoryId?: number): Promise<CatalogProduct[]> {
  if (typeof categoryId === "number") {
    return getCatalogProductsByCategory(categoryId);
  }

  return fetchStrapiProducts();
}

export async function getCatalogProductById(productId: number): Promise<CatalogProduct | null> {
  try {
    const response = await fetchStrapi<StrapiSingleResponse<StrapiEntity>>(
      `${STRAPI_PRODUCTS_PATH}/${productId}`,
      {
        ...STRAPI_PRODUCT_POPULATE_QUERY,
      },
    );

    if (!response.data) {
      return null;
    }

    return mapStrapiProduct(response.data);
  } catch (error) {
    if (error instanceof StrapiRequestError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
