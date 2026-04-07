import {
  fetchWooCategories,
  fetchWooProductById,
  fetchWooProducts,
  fetchWooProductsByCategory,
} from "../data-access/woocommerce/store-api";
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

export async function getCatalogProductsByCategory(categoryId: number): Promise<CatalogProduct[]> {
  const raw = await fetchWooProductsByCategory(categoryId);
  return raw.map(mapWooProduct);
}

export async function getCatalogProductById(productId: number): Promise<CatalogProduct | null> {
  const raw = await fetchWooProductById(productId);
  return raw ? mapWooProduct(raw) : null;
}
