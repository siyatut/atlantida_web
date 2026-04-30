import { catalogSource } from "../config/catalog";
import {
  fetchWooCategories,
  fetchWooProductById,
  fetchWooProducts,
  fetchWooProductsByCategory,
} from "../data-access/woocommerce/store-api";
import { mapWooCategory } from "../mapper/category.mapper";
import { mapWooProduct } from "../mapper/product.mapper";
import {
  getCatalogCategories as getStrapiCatalogCategories,
  getCatalogProductById as getStrapiCatalogProductById,
  getCatalogProducts as getStrapiCatalogProducts,
  getCatalogProductsByCategory as getStrapiCatalogProductsByCategory,
} from "./catalog.strapi.service";
import type { CatalogCategory, CatalogProduct } from "../types/catalog";

export async function getCatalogProducts(categoryId?: number): Promise<CatalogProduct[]> {
  if (catalogSource === "strapi") {
    return getStrapiCatalogProducts(categoryId);
  }

  const raw = await fetchWooProducts(categoryId);
  return raw.map(mapWooProduct);
}

export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  if (catalogSource === "strapi") {
    return getStrapiCatalogCategories();
  }

  const raw = await fetchWooCategories();
  return raw.map(mapWooCategory);
}

export async function getCatalogProductsByCategory(categoryId: number): Promise<CatalogProduct[]> {
  if (catalogSource === "strapi") {
    return getStrapiCatalogProductsByCategory(categoryId);
  }

  const raw = await fetchWooProductsByCategory(categoryId);
  return raw.map(mapWooProduct);
}

export async function getCatalogProductById(productId: number): Promise<CatalogProduct | null> {
  if (catalogSource === "strapi") {
    return getStrapiCatalogProductById(productId);
  }

  const raw = await fetchWooProductById(productId);
  return raw ? mapWooProduct(raw) : null;
}
