import { fetchWooCategories, fetchWooProducts } from "../data-access/woocommerce/store-api";
import { mapWooCategory } from "../mapper/category.mapper";
import { mapWooProduct } from "../mapper/product.mapper";
import type { CatalogCategory, CatalogProduct } from "../types/catalog";

export async function getCatalogProducts(categoryId?: number): Promise<CatalogProduct[]> {
  const raw = await fetchWooProducts(categoryId);
  return raw.map(mapWooProduct);
}

export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  const raw = await fetchWooCategories();
  return raw.map(mapWooCategory);
}