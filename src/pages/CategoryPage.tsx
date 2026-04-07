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
    <main className="px-6 py-12 md:px-8 md:py-16">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-10">
          <Link
            to={parentCategory ? `/catalog/category/${parentCategory.id}` : "/catalog"}
            className="inline-flex items-center gap-2 text-base font-medium text-[#4A9DD4] transition-colors hover:text-[#2F84BF]"
          >
            <span aria-hidden="true">‹</span>
            {parentCategory ? `Назад к категории «${parentCategory.name}»` : "Назад к каталогу"}
          </Link>
        </div>

        <h1 className="mb-2 text-3xl font-semibold leading-snug text-[#234579]">
          {activeCategory?.name ?? "Категория"}
        </h1>
        {activeCategory?.description ? (
          <p className="mb-10 line-clamp-2 text-base leading-snug text-[#6B778B]">
            {activeCategory.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()}
          </p>
        ) : (
          <div className="mb-10" />
        )}

        {isLoading ? <p className="text-base text-[#6B778B]">Загрузка категорий...</p> : null}
        {error ? <p className="text-base text-[#8E4C4C]">{error}</p> : null}

        {!isLoading && !error && childCategories.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {childCategories.map((category) => (
              <Link to={`/catalog/category/${category.id}`} key={category.id}>
                <article className="flex h-[150px] items-center justify-between rounded-3xl border border-[#D4DFEA] bg-[#F8FAFC] px-6 transition-colors hover:bg-white">
                  <div className="min-w-0">
                    <h2 className="mb-2 text-xl font-semibold leading-snug text-[#394452]">
                      {category.name}
                    </h2>
                    <p className="text-sm leading-snug text-[#79869A]">
                      {typeof category.count === "number" ? `${category.count} товаров` : "—"}
                    </p>
                  </div>
                  <span className="ml-4 text-3xl font-light text-[#A9DCEB]">›</span>
                </article>
              </Link>
            ))}
          </div>
        ) : null}

        {!isLoading && !error && childCategories.length === 0 && products.length === 0 ? (
          <p className="text-base text-[#6B778B]">В этой категории пока нет товаров.</p>
        ) : null}

        {!isLoading && !error && childCategories.length === 0 && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                <article className="relative overflow-hidden rounded-[22px] border border-[#C6DFEC] bg-[#F8FAFC] p-4 transition-colors hover:bg-white">
                  <button
                    type="button"
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl text-[#8792A3] shadow-sm"
                    aria-label="Добавить в избранное"
                  >
                    ♡
                  </button>

                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="mb-4 h-64 w-full rounded-xl object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="mb-4 h-64 w-full rounded-xl bg-[#EEF3F7]" />
                  )}

                  <h2 className="mb-2 text-base font-medium leading-snug text-[#3F4A58] md:text-lg">
                    {product.title}
                  </h2>
                  <p className="text-xl font-medium leading-snug text-[#4BADE8]">
                    {formatCatalogProductPrice(product)}
                  </p>
                </article>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default CategoryPage;
