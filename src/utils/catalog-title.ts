import type { CatalogCategory, CatalogProduct, CatalogProductCategory } from "../types/catalog";

const AQUARIUM_CATEGORY_PATTERN = /(аквари|akvar|aquar)/i;
const TITLE_SIZE_SUFFIX_PATTERN =
  /^(.*\S)\s+(\d+(?:[.,]\d+)?\s*(?:литр(?:ов|а)?|л|ml|мл|g|гр|kg|кг))$/iu;

function matchesAquariumCategory(value: string): boolean {
  return AQUARIUM_CATEGORY_PATTERN.test(value.trim());
}

function isAquariumCategoryLike(
  category: Pick<CatalogCategory, "name" | "slug"> | Pick<CatalogProductCategory, "name" | "slug">,
): boolean {
  return matchesAquariumCategory(category.slug) || matchesAquariumCategory(category.name);
}

export function getCatalogCardTitleParts(
  product: CatalogProduct,
): { mainTitle: string; suffixPart: string | null } {
  const normalizedTitle = product.title.trim();
  const isAquariumProduct = product.categories.some((category) => isAquariumCategoryLike(category));

  if (!isAquariumProduct) {
    return {
      mainTitle: product.title,
      suffixPart: null,
    };
  }

  const match = normalizedTitle.match(TITLE_SIZE_SUFFIX_PATTERN);

  if (!match) {
    return {
      mainTitle: product.title,
      suffixPart: null,
    };
  }

  return {
    mainTitle: match[1],
    suffixPart: match[2],
  };
}
