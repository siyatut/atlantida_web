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

let cachedCategories: CatalogCategory[] | null = null;
let categoriesPromise: Promise<CatalogCategory[]> | null = null;
const cachedProductsByCategory = new Map<number, CatalogProduct[]>();
const productsByCategoryPromises = new Map<number, Promise<CatalogProduct[]>>();
const cachedProductsById = new Map<string, CatalogProduct>();

export function warmCatalogProductCache(products: CatalogProduct[]): void {
  for (const product of products) {
    cachedProductsById.set(product.id, product);
  }
}

export async function getCatalogProducts(categoryId?: number): Promise<CatalogProduct[]> {
  if (catalogSource === "strapi") {
    return getStrapiCatalogProducts(categoryId);
  }

  const raw = await fetchWooProducts(categoryId);
  return raw.map(mapWooProduct);
}

export async function getCatalogCategories(): Promise<CatalogCategory[]> {
  if (cachedCategories) {
    return cachedCategories;
  }

  if (categoriesPromise) {
    return categoriesPromise;
  }

  const loadCategories = async () => {
    if (catalogSource === "strapi") {
      return getStrapiCatalogCategories();
    }

    const raw = await fetchWooCategories();
    return raw.map(mapWooCategory);
  };

  categoriesPromise = loadCategories()
    .then((categories) => {
      cachedCategories = categories;
      return categories;
    })
    .finally(() => {
      categoriesPromise = null;
    });

  return categoriesPromise;
}

export function getCachedCatalogCategories(): CatalogCategory[] | null {
  return cachedCategories;
}

export function getCachedCatalogProductsByCategory(categoryId: number): CatalogProduct[] | null {
  return cachedProductsByCategory.get(categoryId) ?? null;
}

export async function getCatalogCategoriesFresh(): Promise<CatalogCategory[]> {
  if (catalogSource === "strapi") {
    const categories = await getStrapiCatalogCategories();
    cachedCategories = categories;
    return categories;
  }

  const raw = await fetchWooCategories();
  const categories = raw.map(mapWooCategory);
  cachedCategories = categories;
  return categories;
}

export async function getCatalogProductsByCategory(categoryId: number): Promise<CatalogProduct[]> {
  const cachedProducts = cachedProductsByCategory.get(categoryId);

  if (cachedProducts) {
    return cachedProducts;
  }

  const pendingPromise = productsByCategoryPromises.get(categoryId);

  if (pendingPromise) {
    return pendingPromise;
  }

  const loadProducts = async () => {
    if (catalogSource === "strapi") {
      return getStrapiCatalogProductsByCategory(categoryId);
    }

    const raw = await fetchWooProductsByCategory(categoryId);
    return raw.map(mapWooProduct);
  };

  const nextPromise = loadProducts()
    .then((products) => {
      cachedProductsByCategory.set(categoryId, products);
      return products;
    })
    .finally(() => {
      productsByCategoryPromises.delete(categoryId);
    });

  productsByCategoryPromises.set(categoryId, nextPromise);
  return nextPromise;
}

export async function getCatalogProductsByCategoryFresh(categoryId: number): Promise<CatalogProduct[]> {
  if (catalogSource === "strapi") {
    const products = await getStrapiCatalogProductsByCategory(categoryId);
    cachedProductsByCategory.set(categoryId, products);
    return products;
  }

  const raw = await fetchWooProductsByCategory(categoryId);
  const products = raw.map(mapWooProduct);
  cachedProductsByCategory.set(categoryId, products);
  return products;
}

export function getCachedCatalogProductById(productId: number): CatalogProduct | null {
  const idStr = String(productId);
  for (const products of cachedProductsByCategory.values()) {
    const cached = products.find((p) => p.id === idStr);
    if (cached) return cached;
  }
  return cachedProductsById.get(idStr) ?? null;
}

export async function getCatalogProductById(productId: number): Promise<CatalogProduct | null> {
  const idStr = String(productId);
  for (const products of cachedProductsByCategory.values()) {
    const cached = products.find((p) => p.id === idStr);
    if (cached) return cached;
  }

  const individually = cachedProductsById.get(idStr);
  if (individually) return individually;

  let product: CatalogProduct | null = null;
  if (catalogSource === "strapi") {
    product = await getStrapiCatalogProductById(productId);
  } else {
    const raw = await fetchWooProductById(productId);
    product = raw ? mapWooProduct(raw) : null;
  }

  if (product) cachedProductsById.set(idStr, product);
  return product;
}
