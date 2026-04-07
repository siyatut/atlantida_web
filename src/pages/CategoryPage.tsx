import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCatalogCategories, getCatalogProductsByCategory } from "../services/catalog.service";
import type { CatalogCategory, CatalogProduct } from "../types/catalog";
import { formatCatalogProductPrice } from "../utils/price";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return "Не удалось загрузить категории.";
}

function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const parsedCategoryId = Number(categoryId);
  const isValidCategoryId = Number.isFinite(parsedCategoryId) && parsedCategoryId > 0;

  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeCategory = useMemo(() => {
    if (!isValidCategoryId) {
      return null;
    }

    return categories.find((category) => category.id === String(parsedCategoryId)) ?? null;
  }, [categories, isValidCategoryId, parsedCategoryId]);

  const childCategories = useMemo(() => {
    if (!isValidCategoryId) {
      return [];
    }

    return categories.filter((category) => category.parent === parsedCategoryId);
  }, [categories, isValidCategoryId, parsedCategoryId]);

  const parentCategory = useMemo(() => {
    if (!activeCategory || activeCategory.parent === 0) {
      return null;
    }

    return categories.find((category) => category.id === String(activeCategory.parent)) ?? null;
  }, [activeCategory, categories]);

  useEffect(() => {
    if (!isValidCategoryId) {
      setError("Некорректный идентификатор категории.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadCategoryData() {
      setIsLoading(true);
      setError(null);
      setProducts([]);

      try {
        const loadedCategories = await getCatalogCategories();

        if (isMounted) {
          setCategories(loadedCategories);

          const selectedCategory = loadedCategories.find(
            (category) => category.id === String(parsedCategoryId),
          );
          if (!selectedCategory) {
            setError("Категория не найдена.");
            return;
          }

          const selectedCategoryChildren = loadedCategories.filter(
            (category) => category.parent === parsedCategoryId,
          );

          if (selectedCategoryChildren.length === 0) {
            const loadedProducts = await getCatalogProductsByCategory(parsedCategoryId);
            if (isMounted) {
              setProducts(loadedProducts);
            }
          }
        }
      } catch (loadError) {
        console.error("[CategoryPage] Failed to load category data", loadError);

        if (isMounted) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCategoryData();

    return () => {
      isMounted = false;
    };
  }, [isValidCategoryId, parsedCategoryId]);

  return (
    <main className="px-4 py-10">
      <div className="mb-6">
        <Link
          to={parentCategory ? `/catalog/category/${parentCategory.id}` : "/catalog"}
          className="text-sm text-slate-700 hover:text-slate-900"
        >
          ← {parentCategory ? parentCategory.name : "Все категории"}
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-semibold">
        {activeCategory?.name ?? "Категория"}
      </h1>

      {isLoading ? <p>Загрузка категорий...</p> : null}
      {error ? <p>{error}</p> : null}

      {!isLoading && !error && childCategories.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {childCategories.map((category) => (
            <Link
              to={`/catalog/category/${category.id}`}
              key={category.id}
            >
              <article className="rounded border p-4 transition-colors hover:bg-[#F1FCFF]">
                <h2 className="mb-2 text-lg font-semibold">{category.name}</h2>
                <p className="text-sm text-slate-700">
                  Товаров: {typeof category.count === "number" ? category.count : "—"}
                </p>
              </article>
            </Link>
          ))}
        </div>
      ) : null}

      {!isLoading && !error && childCategories.length === 0 && products.length === 0 ? (
        <p>В этой категории пока нет товаров.</p>
      ) : null}

      {!isLoading && !error && childCategories.length === 0 && products.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/catalog/product/${product.id}`}
              state={{
                backPath: `/catalog/category/${parsedCategoryId}`,
                backLabel: activeCategory?.name ?? "Категория",
                categoryId: String(parsedCategoryId),
              }}
            >
              <article className="rounded border p-4 transition-colors hover:bg-[#F1FCFF]">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="mb-4 h-48 w-full object-cover"
                    loading="lazy"
                  />
                ) : null}

                <h2 className="mb-2 text-lg font-semibold">{product.title}</h2>
                <p>{formatCatalogProductPrice(product)}</p>
              </article>
            </Link>
          ))}
        </div>
      ) : null}
    </main>
  );
}

export default CategoryPage;
