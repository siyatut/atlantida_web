import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCatalogCategories } from "../services/catalog.service";
import type { CatalogCategory } from "../types/catalog";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return "Не удалось загрузить категории.";
}

function getCategoryDescription(description: string | null): string {
  if (!description) {
    return "Исследуйте подборку товаров в этой категории.";
  }

  const plainText = description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plainText !== "" ? plainText : "Исследуйте подборку товаров в этой категории.";
}

function CatalogPage() {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const childCountByParentId = useMemo(() => {
    return categories.reduce<Record<string, number>>((accumulator, category) => {
      if (category.parent > 0) {
        const parentId = String(category.parent);
        accumulator[parentId] = (accumulator[parentId] ?? 0) + 1;
      }

      return accumulator;
    }, {});
  }, [categories]);

  const rootCategories = useMemo(
    () => categories.filter((category) => category.parent === 0),
    [categories],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getCatalogCategories();

        if (isMounted) {
          setCategories(data);
        }
      } catch (loadError) {
        console.error("[CatalogPage] Failed to load categories", loadError);

        if (isMounted) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="px-4 py-10">
      {isLoading ? <p>Загрузка категорий...</p> : null}

      {error ? <p>{error}</p> : null}

      {!isLoading && !error ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rootCategories.map((category) => {
            const childCount = childCountByParentId[category.id] ?? 0;
            const description = getCategoryDescription(category.description);

            return (
              <Link to={`/catalog/category/${category.id}`} key={category.id}>
                <article className="rounded border p-4 transition-colors hover:bg-[#F1FCFF]">
                  <h2 className="mb-2 text-lg font-semibold">{category.name}</h2>
                  <p className="mb-4 text-sm text-slate-700">{description}</p>
                  <p className="text-sm font-medium text-slate-900">
                    Подкатегорий: {childCount}
                  </p>
                </article>
              </Link>
            );
          })}
        </div>
      ) : null}
    </main>
  );
}

export default CatalogPage;
