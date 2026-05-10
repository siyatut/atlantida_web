import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { warmCatalogProductCache } from "../services/catalog.service";
import type { CatalogProduct } from "../types/catalog";

const FAVORITES_STORAGE_KEY = "atlantida.favorite-products";

type FavoritesContextValue = {
  favoriteProducts: CatalogProduct[];
  favoriteProductIds: string[];
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: CatalogProduct) => void;
  removeFavorite: (productId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function readFavoritesFromStorage(): CatalogProduct[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawFavorites = window.localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (!rawFavorites) {
      return [];
    }

    const parsedFavorites = JSON.parse(rawFavorites);

    if (!Array.isArray(parsedFavorites)) {
      return [];
    }

    return parsedFavorites.filter(
      (favorite): favorite is CatalogProduct =>
        typeof favorite === "object" &&
        favorite !== null &&
        "id" in favorite &&
        typeof favorite.id === "string",
    );
  } catch (error) {
    console.error("[FavoritesContext] Failed to read favorites", error);
    return [];
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteProducts, setFavoriteProducts] = useState<CatalogProduct[]>(() => {
    const products = readFavoritesFromStorage();
    warmCatalogProductCache(products);
    return products;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteProducts));
    } catch (error) {
      console.error("[FavoritesContext] Failed to persist favorites", error);
    }
  }, [favoriteProducts]);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== FAVORITES_STORAGE_KEY) {
        return;
      }

      setFavoriteProducts(readFavoritesFromStorage());
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const favoriteProductsById = useMemo(() => {
    return favoriteProducts.reduce<Record<string, CatalogProduct>>((accumulator, product) => {
      accumulator[product.id] = product;
      return accumulator;
    }, {});
  }, [favoriteProducts]);

  const favoriteProductIds = useMemo(() => Object.keys(favoriteProductsById), [favoriteProductsById]);

  function toggleFavorite(product: CatalogProduct) {
    setFavoriteProducts((currentFavorites) => {
      const isExistingFavorite = currentFavorites.some(
        (favoriteProduct) => favoriteProduct.id === product.id,
      );

      if (isExistingFavorite) {
        return currentFavorites.filter((favoriteProduct) => favoriteProduct.id !== product.id);
      }

      return [product, ...currentFavorites];
    });
  }

  function removeFavorite(productId: string) {
    setFavoriteProducts((currentFavorites) =>
      currentFavorites.filter((favoriteProduct) => favoriteProduct.id !== productId),
    );
  }

  function isFavorite(productId: string) {
    return productId in favoriteProductsById;
  }

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteProducts,
      favoriteProductIds,
      isFavorite,
      toggleFavorite,
      removeFavorite,
    }),
    [favoriteProductIds, favoriteProducts, favoriteProductsById],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }

  return context;
}
