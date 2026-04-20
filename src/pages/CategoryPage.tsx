import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import ProductGridControls from "../components/catalog/ProductGridControls";
import ProductGridPagination from "../components/catalog/ProductGridPagination";
import ProductCard from "../components/catalog/ProductCard";
import { getCatalogCategories, getCatalogProductsByCategory } from "../services/catalog.service";
import type { CatalogCategory, CatalogProduct } from "../types/catalog";
import { getFilteredAndSortedProducts, sanitizePriceInput } from "../utils/catalog-product-list";
import {
  getCatalogPageParam,
  getCatalogPriceParam,
  getNormalizedCatalogSearchParams,
  getCatalogSortOrderParam,
} from "../utils/catalog-query";
import { getPlainTextFromHtml } from "../utils/text";

type CategoryRouteState = {
  parentCategoryId?: string | null;
  parentCategoryName?: string | null;
  currentCategoryName?: string | null;
  ancestorCategoryId?: string | null;
  ancestorCategoryName?: string | null;
};

function getProductsLabel(count: number): string {
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "товаров";
  }

  const lastDigit = count % 10;

  if (lastDigit === 1) {
    return "товар";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "товара";
  }

  return "товаров";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return "Не удалось загрузить категории.";
}

function CategoryPage() {
  const PRODUCTS_PER_PAGE = 20;
  const { categoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const routeState = (location.state ?? {}) as CategoryRouteState;

  const parsedCategoryId = Number(categoryId);
  const isValidCategoryId = Number.isFinite(parsedCategoryId) && parsedCategoryId > 0;

  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const catalogSectionRef = useRef<HTMLDivElement | null>(null);
  const hasMountedPageRef = useRef(false);

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

  const sortOrder = useMemo(() => getCatalogSortOrderParam(searchParams), [searchParams]);
  const minPrice = useMemo(() => getCatalogPriceParam(searchParams, "minPrice"), [searchParams]);
  const maxPrice = useMemo(() => getCatalogPriceParam(searchParams, "maxPrice"), [searchParams]);

  const visibleProducts = useMemo(() => {
    return getFilteredAndSortedProducts(products, minPrice, maxPrice, sortOrder);
  }, [maxPrice, minPrice, products, sortOrder]);

  const categoryDescription = useMemo(() => {
    return getPlainTextFromHtml(activeCategory?.description ?? null);
  }, [activeCategory?.description]);
  const pageFromSearchParams = useMemo(() => getCatalogPageParam(searchParams), [searchParams]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(visibleProducts.length / PRODUCTS_PER_PAGE)),
    [visibleProducts.length],
  );

  const currentPage = useMemo(() => {
    return Math.min(pageFromSearchParams, totalPages);
  }, [pageFromSearchParams, totalPages]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return visibleProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [currentPage, totalPages, visibleProducts]);

  useEffect(() => {
    const normalizedSearchParams = getNormalizedCatalogSearchParams(searchParams);

    if (normalizedSearchParams.toString() !== searchParams.toString()) {
      setSearchParams(normalizedSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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

  useEffect(() => {
    if (pageFromSearchParams <= totalPages) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);

    if (totalPages <= 1) {
      nextSearchParams.delete("page");
    } else {
      nextSearchParams.set("page", String(totalPages));
    }

    setSearchParams(nextSearchParams, { replace: true });
  }, [pageFromSearchParams, searchParams, setSearchParams, totalPages]);

  useEffect(() => {
    if (!hasMountedPageRef.current) {
      hasMountedPageRef.current = true;
      return;
    }

    catalogSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [currentPage]);

  function updateCatalogSearchParams(
    update: (nextSearchParams: URLSearchParams) => void,
    replace = true,
  ) {
    const nextSearchParams = new URLSearchParams(searchParams);
    update(nextSearchParams);
    setSearchParams(nextSearchParams, replace ? { replace: true } : undefined);
  }

  function handleSortOrderChange(value: "default" | "asc" | "desc") {
    updateCatalogSearchParams((nextSearchParams) => {
      if (value === "default") {
        nextSearchParams.delete("sort");
      } else {
        nextSearchParams.set("sort", value);
      }

      nextSearchParams.delete("page");
    });
  }

  function handleMinPriceChange(value: string) {
    const sanitizedValue = sanitizePriceInput(value);

    updateCatalogSearchParams((nextSearchParams) => {
      if (sanitizedValue === "") {
        nextSearchParams.delete("minPrice");
      } else {
        nextSearchParams.set("minPrice", sanitizedValue);
      }

      nextSearchParams.delete("page");
    });
  }

  function handleMaxPriceChange(value: string) {
    const sanitizedValue = sanitizePriceInput(value);

    updateCatalogSearchParams((nextSearchParams) => {
      if (sanitizedValue === "") {
        nextSearchParams.delete("maxPrice");
      } else {
        nextSearchParams.set("maxPrice", sanitizedValue);
      }

      nextSearchParams.delete("page");
    });
  }

  function resetControls() {
    updateCatalogSearchParams((nextSearchParams) => {
      nextSearchParams.delete("sort");
      nextSearchParams.delete("minPrice");
      nextSearchParams.delete("maxPrice");
      nextSearchParams.delete("page");
    });
  }

  function handlePageChange(page: number) {
    const normalizedPage = Math.max(1, Math.min(page, totalPages));

    updateCatalogSearchParams(
      (nextSearchParams) => {
        if (normalizedPage <= 1) {
          nextSearchParams.delete("page");
        } else {
          nextSearchParams.set("page", String(normalizedPage));
        }
      },
      false,
    );
  }

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

        <div ref={catalogSectionRef} className="scroll-mt-28">
          <h1 className="mb-2 text-3xl font-semibold leading-snug text-[#234579]">
            {resolvedCurrentCategoryName}
          </h1>

          {categoryDescription ? (
            <p className="mb-10 line-clamp-2 text-base leading-snug text-[#6B778B]">
              {categoryDescription}
            </p>
          ) : (
            <div className="mb-10" />
          )}
        </div>

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
          <>
            <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0 flex-1">
                <ProductGridControls
                  sortOrder={sortOrder}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  onSortOrderChange={handleSortOrderChange}
                  onMinPriceChange={handleMinPriceChange}
                  onMaxPriceChange={handleMaxPriceChange}
                  onReset={resetControls}
                />
              </div>
              <p className="text-sm leading-snug text-[#7B899C] lg:pb-3 lg:text-right">
                {paginatedProducts.length} {getProductsLabel(paginatedProducts.length)}
              </p>
            </div>

            {visibleProducts.length === 0 ? (
              <p className="mt-8 text-base leading-snug text-[#6B778B]">
                По выбранным параметрам товары не найдены
              </p>
            ) : (
              <>
                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      formatTitleSuffix
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
                <ProductGridPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </>
        ) : null}
      </div>
    </main>
  );
}

export default CategoryPage;
