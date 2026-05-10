const CATALOG_SCROLL_KEY = "atlantida.catalog-scroll";

type CatalogScrollTarget = {
  categoryPath: string;
  productId: string;
};

export function saveCatalogScrollTarget(categoryPath: string, productId: string): void {
  try {
    sessionStorage.setItem(CATALOG_SCROLL_KEY, JSON.stringify({ categoryPath, productId } satisfies CatalogScrollTarget));
  } catch {
    // sessionStorage might be unavailable; scroll restoration is non-critical
  }
}

export function readCatalogScrollTarget(currentPath: string): string | null {
  try {
    const raw = sessionStorage.getItem(CATALOG_SCROLL_KEY);
    if (!raw) return null;
    const { categoryPath, productId } = JSON.parse(raw) as CatalogScrollTarget;
    return categoryPath === currentPath ? productId : null;
  } catch {
    return null;
  }
}

export function clearCatalogScrollTarget(): void {
  try {
    sessionStorage.removeItem(CATALOG_SCROLL_KEY);
  } catch {
    // non-critical
  }
}

export function hasPendingCatalogScrollTarget(): boolean {
  try {
    return sessionStorage.getItem(CATALOG_SCROLL_KEY) !== null;
  } catch {
    return false;
  }
}
