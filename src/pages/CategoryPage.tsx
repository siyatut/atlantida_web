import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCatalogCategories, getCatalogProductsByCategory } from "../services/catalog.service";
import type { CatalogCategory, CatalogProduct } from "../types/catalog";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return "Не удалось загрузить товары категории.";
}

function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
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

      try {
        const [loadedProducts, loadedCategories] = await Promise.all([
          getCatalogProductsByCategory(parsedCategoryId),
          getCatalogCategories(),
        ]);

        if (isMounted) {
          setProducts(loadedProducts);
          setCategories(loadedCategories);
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
        <Link to="/catalog" className="text-sm text-slate-700 hover:text-slate-900">
          ← Все категории
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-semibold">
        {activeCategory?.name ?? "Категория"}
      </h1>

      {isLoading ? <p>Загрузка товаров...</p> : null}
      {error ? <p>{error}</p> : null}

      {!isLoading && !error && products.length === 0 ? <p>В этой категории пока нет товаров.</p> : null}

      {!isLoading && !error && products.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="rounded border p-4">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className="mb-4 h-48 w-full object-cover"
                  loading="lazy"
                />
              ) : null}

              <h2 className="mb-2 text-lg font-semibold">{product.title}</h2>
              <p>
                {product.price ? `${product.price}${product.priceCurrencySuffix ?? ""}` : "Цена не указана"}
              </p>
            </article>
          ))}
        </div>
      ) : null}
    </main>
  );
}

export default CategoryPage;
