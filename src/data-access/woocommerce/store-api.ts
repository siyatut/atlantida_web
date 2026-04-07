const API_BASE = "/api/wp-json/wc/store/v1";

type StoreApiQueryValue = string | number | boolean | undefined;
type WooStoreProduct = {
  id: number;
  name?: string;
  price?: string;
  regular_price?: string;
  sale_price?: string;
  prices?: {
    price?: string;
    currency_suffix?: string;
  };
  short_description?: string;
  description?: string;
  permalink?: string;
  images?: Array<{
    src?: string;
  }>;
  categories?: Array<{
    slug?: string;
  }>;
};
type WooStoreCategory = {
  id: number;
  name?: string;
  slug?: string;
  parent?: number;
};

function buildStoreApiErrorMessage(baseMessage: string, responseBody?: string): string {
  if (!responseBody) {
    return baseMessage;
  }

  try {
    const parsedBody = JSON.parse(responseBody) as { message?: unknown; code?: unknown };
    const details =
      typeof parsedBody.message === "string"
        ? parsedBody.message
        : typeof parsedBody.code === "string"
          ? parsedBody.code
          : responseBody;

    return `${baseMessage}. ${details}`;
  } catch {
    return `${baseMessage}. ${responseBody}`;
  }
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
    console.error("[Woo Store API] Request failed", {
      url: url.toString(),
      status: response.status,
      statusText: response.statusText,
      responseBody,
    });

    throw new Error(
      buildStoreApiErrorMessage(
        `Woo Store API request failed: ${response.status} ${response.statusText}`,
        responseBody,
      ),
    );
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

export async function fetchWooCategories(): Promise<WooStoreCategory[]> {
  return fetchStoreApi<WooStoreCategory[]>("/products/categories", {
    hide_empty: true,
    per_page: 100,
  });
}
