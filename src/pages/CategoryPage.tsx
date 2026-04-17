import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import ProductCard from "../components/catalog/ProductCard";
import { getCatalogCategories, getCatalogProductsByCategory } from "../services/catalog.service";
import type { CatalogCategory, CatalogProduct } from "../types/catalog";

type CategoryRouteState = {
  parentCategoryId?: string | null;
  parentCategoryName?: string | null;
  currentCategoryName?: string | null;
  ancestorCategoryId?: string | null;
  ancestorCategoryName?: string | null;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return "Не удалось загрузить категории.";
}

function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  const routeState = (location.state ?? {}) as CategoryRouteState;

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

  const explicitParentCategoryId =
    typeof routeState.parentCategoryId === "string" && routeState.parentCategoryId.trim() !== ""
      ? routeState.parentCategoryId
      : null;

  const explicitParentCategoryName =
    typeof routeState.parentCategoryName === "string" && routeState.parentCategoryName.trim() !== ""
      ? routeState.parentCategoryName
      : null;

  const explicitCurrentCategoryName =
    typeof routeState.currentCategoryName === "string" && routeState.currentCategoryName.trim() !== ""
      ? routeState.currentCategoryName
      : null;

  const explicitAncestorCategoryId =
    typeof routeState.ancestorCategoryId === "string" && routeState.ancestorCategoryId.trim() !== ""
      ? routeState.ancestorCategoryId
      : null;

  const explicitAncestorCategoryName =
    typeof routeState.ancestorCategoryName === "string" &&
    routeState.ancestorCategoryName.trim() !== ""
      ? routeState.ancestorCategoryName
      : null;

  const resolvedCurrentCategoryName =
    explicitCurrentCategoryName ?? activeCategory?.name ?? "Категория";

  const backPath =
    explicitParentCategoryId
      ? `/catalog/category/${explicitParentCategoryId}`
      : parentCategory
        ? `/catalog/category/${parentCategory.id}`
        : "/catalog";

  const backLabel =
    explicitParentCategoryName === "Каталог"
      ? "Назад к каталогу"
      : explicitParentCategoryName
        ? `Назад к категории «${explicitParentCategoryName}»`
        : parentCategory
          ? `Назад к категории «${parentCategory.name}»`
          : "Назад к каталогу";

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

        if (!isMounted) {
          return;
        }

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
            to={backPath}
            state={
              explicitParentCategoryId
                ? {
                    parentCategoryId: explicitAncestorCategoryId,
                    parentCategoryName: explicitAncestorCategoryName ?? "Каталог",
                    currentCategoryName: explicitParentCategoryName,
                    ancestorCategoryId: null,
                    ancestorCategoryName: null,
                  }
                : undefined
            }
            className="inline-flex items-center gap-2 text-base font-medium text-[#4A9DD4] transition-colors hover:text-[#2F84BF]"
          >
            <span aria-hidden="true">‹</span>
            {backLabel}
          </Link>
        </div>

        <h1 className="mb-2 text-3xl font-semibold leading-snug text-[#234579]">
          {resolvedCurrentCategoryName}
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
              <Link
                to={`/catalog/category/${category.id}`}
                key={category.id}
                state={{
                  parentCategoryId: String(parsedCategoryId),
                  parentCategoryName: resolvedCurrentCategoryName,
                  currentCategoryName: category.name,
                  ancestorCategoryId: explicitParentCategoryId,
                  ancestorCategoryName: explicitParentCategoryName,
                }}
              >
                <article className="flex h-[132px] items-center justify-between rounded-[24px] border border-[#D4DFEA] bg-[#F8FAFC] px-5 transition-colors hover:bg-white">
                  <div className="min-w-0">
                    <h2 className="mb-1.5 text-lg font-semibold leading-snug text-[#394452]">
                      {category.name}
                    </h2>
                    <p className="text-[13px] leading-snug text-[#79869A]">
                      {typeof category.count === "number" ? `${category.count} товаров` : "—"}
                    </p>
                  </div>
                  <span className="ml-3 text-[28px] font-light text-[#A9DCEB]">›</span>
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
              <ProductCard
                key={product.id}
                product={product}
                to={`/catalog/product/${product.id}`}
                state={{
                  backPath: `/catalog/category/${parsedCategoryId}`,
                  backLabel: resolvedCurrentCategoryName,
                  backState: {
                    parentCategoryId: explicitParentCategoryId,
                    parentCategoryName: explicitParentCategoryName,
                    currentCategoryName: resolvedCurrentCategoryName,
                    ancestorCategoryId: explicitAncestorCategoryId,
                    ancestorCategoryName: explicitAncestorCategoryName,
                  },
                  categoryId: String(parsedCategoryId),
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default CategoryPage;
