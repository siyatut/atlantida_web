import type { CatalogProduct } from "../types/catalog";

export const PRODUCT_IMAGE_PLACEHOLDER_SRC = "/placeholder-product.png";

export function getCatalogProductImageSrc(product: CatalogProduct): string {
  const primaryImage = typeof product.image === "string" && product.image.trim() !== "" ? product.image : null;
  const galleryImage =
    product.images.find((image) => typeof image === "string" && image.trim() !== "") ?? null;

  return primaryImage ?? galleryImage ?? PRODUCT_IMAGE_PLACEHOLDER_SRC;
}
