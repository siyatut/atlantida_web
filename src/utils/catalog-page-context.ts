type PersistedCatalogPageContext = {
  currentCategoryName: string | null;
  parentCategoryId: string | null;
  parentCategoryName: string | null;
  ancestorCategoryId: string | null;
  ancestorCategoryName: string | null;
};

const STORAGE_PREFIX = "catalog-page-context:";

function getStorageKey(categoryId: string): string {
  return `${STORAGE_PREFIX}${categoryId}`;
}

export function readPersistedCatalogPageContext(
  categoryId: string | undefined,
): PersistedCatalogPageContext | null {
  if (!categoryId || typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(getStorageKey(categoryId));

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as PersistedCatalogPageContext;
  } catch {
    return null;
  }
}

export function writePersistedCatalogPageContext(
  categoryId: string | undefined,
  value: PersistedCatalogPageContext,
): void {
  if (!categoryId || typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(getStorageKey(categoryId), JSON.stringify(value));
  } catch {
    // Ignore storage failures and keep runtime behavior intact.
  }
}
