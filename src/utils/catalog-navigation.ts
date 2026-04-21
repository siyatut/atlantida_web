type ResolveCategoryTitleOptions = {
  explicitTitle: string | null;
  loadedTitle: string | null;
  isLoading: boolean;
  fallbackTitle: string;
};

type ResolveCatalogBackLabelOptions = {
  explicitParentName: string | null;
  loadedParentName: string | null;
  isLoading: boolean;
};

export function getOptionalRouteLabel(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

export function getOptionalScrollPosition(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function resolveCategoryDisplayTitle({
  explicitTitle,
  loadedTitle,
  isLoading,
  fallbackTitle,
}: ResolveCategoryTitleOptions): string {
  if (explicitTitle) {
    return explicitTitle;
  }

  if (loadedTitle) {
    return loadedTitle;
  }

  return isLoading ? "\u00A0" : fallbackTitle;
}

export function resolveCatalogBackLabel({
  explicitParentName,
  loadedParentName,
  isLoading,
}: ResolveCatalogBackLabelOptions): string | null {
  if (explicitParentName === "Каталог") {
    return "Назад к каталогу";
  }

  if (explicitParentName) {
    return `Назад к категории «${explicitParentName}»`;
  }

  if (loadedParentName) {
    return `Назад к категории «${loadedParentName}»`;
  }

  return isLoading ? null : "Назад к каталогу";
}
