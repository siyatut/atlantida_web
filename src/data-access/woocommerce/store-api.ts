const API_BASE = "/api/wp-json/wc/store/v1";

type StoreApiQueryValue = string | number | boolean | undefined;
type StoreApiErrorPayload = {
  message?: unknown;
  code?: unknown;
};

class WooStoreApiRequestError extends Error {
  status: number;
  statusText: string;
  url: string;
  code?: string;

  constructor(params: {
    message: string;
    status: number;
    statusText: string;
    url: string;
    code?: string;
  }) {
    super(params.message);
    this.name = "WooStoreApiRequestError";
    this.status = params.status;
    this.statusText = params.statusText;
    this.url = params.url;
    this.code = params.code;
  }
}

export type WooStoreImage = {
  id?: number;
  src?: string;
  thumbnail?: string;
  srcset?: string;
  sizes?: string;
  name?: string;
  alt?: string;
};

export type WooStoreProductPriceRange = {
  min_amount?: string;
  max_amount?: string;
};

export type WooStoreProductPrices = {
  currency_code?: string;
  currency_symbol?: string;
  currency_minor_unit?: number;
  currency_decimal_separator?: string;
  currency_thousand_separator?: string;
  currency_prefix?: string;
  currency_suffix?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  price_range?: WooStoreProductPriceRange | null;
};

export type WooStoreProductCategory = {
  id: number;
  name?: string;
  slug?: string;
  link?: string;
};

export type WooStoreProduct = {
  id: number;
  name?: string;
  slug?: string;
  is_in_stock?: boolean;
  stock_status?: string;
  low_stock_remaining?: number | null;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  prices?: WooStoreProductPrices;
  short_description?: string;
  description?: string;
  permalink?: string;
  images?: WooStoreImage[];
  categories?: WooStoreProductCategory[];
};

export type WooStoreCategory = {
  id: number;
  name?: string;
  slug?: string;
  description?: string;
  count?: number;
  parent?: number;
  image?: WooStoreImage | null;
};

function parseStoreApiErrorPayload(responseBody?: string): StoreApiErrorPayload | null {
  if (!responseBody || responseBody.trim() === "") {
    return null;
  }
  try {
    return JSON.parse(responseBody) as StoreApiErrorPayload;
  } catch {
    return null;
  }
}

function buildStoreApiErrorMessage(baseMessage: string, responseBody?: string): string {
  if (!responseBody) {
    return baseMessage;
  }

  const payload = parseStoreApiErrorPayload(responseBody);
  if (!payload) {
    return `${baseMessage}. ${responseBody}`;
  }

  const details =
    typeof payload.message === "string"
      ? payload.message
      : typeof payload.code === "string"
        ? payload.code
        : responseBody;

  return `${baseMessage}. ${details}`;
}

function isWooStoreApiRequestError(error: unknown): error is WooStoreApiRequestError {
  return error instanceof WooStoreApiRequestError;
}

function shouldUseSingleProductFallback(error: unknown): boolean {
  if (!isWooStoreApiRequestError(error)) {
    return false;
  }

  if (error.status === 404) {
    return true;
  }

  return error.status === 400 && error.code === "rest_no_route";
}

async function fetchStoreApi<T>(path: string, query?: Record<string, StoreApiQueryValue>): Promise<T> {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  let response: Response;

  try {
    response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
  } catch (error) {
    console.error("[Woo Store API] Network error", {
      url: url.toString(),
      error,
    });

    throw new Error(`Woo Store API network error for ${url.toString()}`, { cause: error });
  }

  const responseBody = await response.text();

  if (!response.ok) {
    const errorPayload = parseStoreApiErrorPayload(responseBody);
    const errorCode = typeof errorPayload?.code === "string" ? errorPayload.code : undefined;

    console.error("[Woo Store API] Request failed", {
      url: url.toString(),
      status: response.status,
      statusText: response.statusText,
      responseBody,
    });

    throw new WooStoreApiRequestError({
      message: buildStoreApiErrorMessage(
        `Woo Store API request failed: ${response.status} ${response.statusText}`,
        responseBody,
      ),
      status: response.status,
      statusText: response.statusText,
      url: url.toString(),
      code: errorCode,
    });
  }

  try {
    return JSON.parse(responseBody) as T;
  } catch (error) {
    console.error("[Woo Store API] Invalid JSON response", {
      url: url.toString(),
      status: response.status,
      statusText: response.statusText,
      responseBody,
      error,
    });

    throw new Error(`Woo Store API returned invalid JSON for ${url.toString()}`, { cause: error });
  }
}

export async function fetchWooProducts(categoryId?: number): Promise<WooStoreProduct[]> {
  return fetchStoreApi<WooStoreProduct[]>("/products", {
    category: categoryId,
    per_page: 100,
  });
}

export async function fetchWooProductsByCategory(categoryId: number): Promise<WooStoreProduct[]> {
  return fetchWooProducts(categoryId);
}

export async function fetchWooCategories(): Promise<WooStoreCategory[]> {
  return fetchStoreApi<WooStoreCategory[]>("/products/categories", {
    hide_empty: true,
    per_page: 100,
  });
}

export async function fetchWooProductById(productId: number): Promise<WooStoreProduct | null> {
  try {
    return await fetchStoreApi<WooStoreProduct>(`/products/${productId}`);
  } catch (error) {
    if (!shouldUseSingleProductFallback(error)) {
      throw error;
    }
  }

  const fallbackProducts = await fetchStoreApi<WooStoreProduct[]>("/products", {
    include: productId,
    per_page: 1,
  });

  return fallbackProducts.find((product) => product.id === productId) ?? null;
}
