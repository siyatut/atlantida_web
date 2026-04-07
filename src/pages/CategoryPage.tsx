import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCatalogCategories } from "../services/catalog.service";
import type { CatalogCategory } from "../types/catalog";

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
        const loadedCategories = await getCatalogCategories();

        if (isMounted) {
          setCategories(loadedCategories);

          const hasSelectedCategory = loadedCategories.some(
            (category) => category.id === String(parsedCategoryId),
          );
          if (!hasSelectedCategory) {
            setError("Категория не найдена.");
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
        <Link to="/catalog" className="text-sm text-slate-700 hover:text-slate-900">
          ← Все категории
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-semibold">
        {activeCategory?.name ?? "Категория"}
      </h1>

      {isLoading ? <p>Загрузка категорий...</p> : null}
      {error ? <p>{error}</p> : null}

      {!isLoading && !error && childCategories.length === 0 ? (
        <p>В этой категории пока нет подкатегорий.</p>
      ) : null}

      {!isLoading && !error && childCategories.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {childCategories.map((category) => (
            <Link to={`/catalog/category/${category.id}/products`} key={category.id}>
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
    </main>
  );
}

export default CategoryPage;
