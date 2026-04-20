import type { CatalogCategory, CatalogProduct, CatalogProductCategory } from "../types/catalog";

const AQUARIUM_CATEGORY_PATTERN = /(аквари|akvar|aquar)/i;
const AQUARIUM_VOLUME_SUFFIX_PATTERN = /^(.*\S)\s+(\d+\s+литр(?:ов|а)?)$/iu;

function matchesAquariumCategory(value: string): boolean {
  return AQUARIUM_CATEGORY_PATTERN.test(value.trim());
}

export function isAquariumCategoryLike(
  category: Pick<CatalogCategory, "name" | "slug"> | Pick<CatalogProductCategory, "name" | "slug">,
): boolean {
  return matchesAquariumCategory(category.slug) || matchesAquariumCategory(category.name);
}

export function isAquariumCategoryBranch(
  categoryId: string | null | undefined,
  categories: CatalogCategory[],
): boolean {
  if (!categoryId) {
    return false;
  }

  const categoryById = new Map(categories.map((category) => [category.id, category]));
  let currentCategory = categoryById.get(categoryId) ?? null;

  while (currentCategory) {
    if (isAquariumCategoryLike(currentCategory)) {
      return true;
    }

    currentCategory =
      currentCategory.parent > 0 ? categoryById.get(String(currentCategory.parent)) ?? null : null;
  }

  return false;
}

export function getAquariumTitleParts(
  product: CatalogProduct,
): { mainTitle: string; volumePart: string | null } {
  const isAquariumProduct = product.categories.some((category) => isAquariumCategoryLike(category));

  if (!isAquariumProduct) {
    return {
      mainTitle: product.title,
      volumePart: null,
    };
  }

  const match = product.title.trim().match(AQUARIUM_VOLUME_SUFFIX_PATTERN);

  if (!match) {
    return {
      mainTitle: product.title,
      volumePart: null,
    };
  }

  return {
    mainTitle: match[1],
    volumePart: match[2],
  };
}
