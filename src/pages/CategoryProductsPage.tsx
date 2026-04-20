import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import ProductCard from "../components/catalog/ProductCard";
import { getCatalogCategories, getCatalogProductsByCategory } from "../services/catalog.service";
import type { CatalogCategory, CatalogProduct } from "../types/catalog";
import { isAquariumCategoryBranch } from "../utils/aquarium-products";

type CategoryProductsRouteState = {
  parentCategoryId?: string;
  parentCategoryName?: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return "Не удалось загрузить товары категории.";
}

function CategoryProductsPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  const routeState = (location.state ?? {}) as CategoryProductsRouteState;
  const parsedCategoryId = Number(categoryId);
  const isValidCategoryId = Number.isFinite(parsedCategoryId) && parsedCategoryId > 0;

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeCategory = useMemo(() => {
    if (!isValidCategoryId) {
      return null;
    }

    return categories.find((category) => category.id === String(parsedCategoryId)) ?? null;
  }, [categories, isValidCategoryId, parsedCategoryId]);

  const parentCategoryId = useMemo(() => {
    if (routeState.parentCategoryId && Number.isFinite(Number(routeState.parentCategoryId))) {
      return routeState.parentCategoryId;
    }

    if (activeCategory && activeCategory.parent > 0) {
      return String(activeCategory.parent);
    }

    return null;
  }, [activeCategory, routeState.parentCategoryId]);

  const parentCategoryName = useMemo(() => {
    if (routeState.parentCategoryName && routeState.parentCategoryName.trim() !== "") {
      return routeState.parentCategoryName;
    }

    if (!parentCategoryId) {
      return "Каталог";
    }

    const parentCategory = categories.find((category) => category.id === parentCategoryId);
    return parentCategory?.name ?? "Категория";
  }, [categories, parentCategoryId, routeState.parentCategoryName]);

  const shouldSplitAquariumTitles = useMemo(() => {
    return isAquariumCategoryBranch(activeCategory?.id, categories);
  }, [activeCategory?.id, categories]);

  useEffect(() => {
    if (!isValidCategoryId) {
      setError("Некорректный идентификатор категории.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        const [loadedProducts, loadedCategories] = await Promise.all([
          getCatalogProductsByCategory(parsedCategoryId),
          getCatalogCategories(),
        ]);

        if (isMounted) {
          setProducts(loadedProducts);
          setCategories(loadedCategories);

          const hasSelectedCategory = loadedCategories.some(
            (category) => category.id === String(parsedCategoryId),
          );
          if (!hasSelectedCategory) {
            setError("Категория не найдена.");
          }
        }
      } catch (loadError) {
        console.error("[CategoryProductsPage] Failed to load data", loadError);

        if (isMounted) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [isValidCategoryId, parsedCategoryId]);

  return (
    <main className="px-4 py-10">
      <div className="mb-6">
        <Link
          to={parentCategoryId ? `/catalog/category/${parentCategoryId}` : "/catalog"}
          className="text-sm text-slate-700 hover:text-slate-900"
        >
          ← {parentCategoryId ? parentCategoryName : "Каталог"}
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-semibold">{activeCategory?.name ?? "Товары категории"}</h1>

      {isLoading ? <p>Загрузка товаров...</p> : null}
      {error ? <p>{error}</p> : null}

      {!isLoading && !error && products.length === 0 ? <p>В этой подкатегории пока нет товаров.</p> : null}

      {!isLoading && !error && products.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              splitAquariumVolume={shouldSplitAquariumTitles}
              to={`/catalog/product/${product.id}`}
              state={{
                backPath: `/catalog/category/${categoryId}/products`,
                backLabel: activeCategory?.name ?? "Товары категории",
                categoryId,
              }}
            />
          ))}
        </div>
      ) : null}
    </main>
  );
}

export default CategoryProductsPage;
