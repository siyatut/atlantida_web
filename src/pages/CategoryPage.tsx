import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import ProductGridControls from "../components/catalog/ProductGridControls";
import ProductGridPagination from "../components/catalog/ProductGridPagination";
import ProductCard from "../components/catalog/ProductCard";
import {
  getCachedCatalogCategories,
  getCachedCatalogProductsByCategory,
  getCatalogCategories,
  getCatalogProductsByCategory,
} from "../services/catalog.service";
import type { CatalogCategory, CatalogProduct } from "../types/catalog";
import { getFilteredAndSortedProducts, sanitizePriceInput } from "../utils/catalog-product-list";
import {
  getCatalogPageParam,
  getCatalogPriceParam,
  getNormalizedCatalogSearchParams,
  getCatalogSortOrderParam,
} from "../utils/catalog-query";
import {
  getOptionalRouteLabel,
  getOptionalScrollPosition,
  resolveCatalogBackLabel,
  resolveCategoryDisplayTitle,
} from "../utils/catalog-navigation";
import {
  readPersistedCatalogPageContext,
  writePersistedCatalogPageContext,
} from "../utils/catalog-page-context";
import { getStickyHeaderHeight } from "../utils/hash-scroll";
import { getPlainTextFromHtml } from "../utils/text";

type CategoryRouteState = {
  parentCategoryId?: string | null;
  parentCategoryName?: string | null;
  currentCategoryName?: string | null;
  ancestorCategoryId?: string | null;
  ancestorCategoryName?: string | null;
  backScrollY?: number | null;
  openedProductId?: string | null;
};

const PRODUCT_ROW_TOP_GAP = 16;

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
  const persistedPageContext = readPersistedCatalogPageContext(categoryId);

  const parsedCategoryId = Number(categoryId);
  const isValidCategoryId = Number.isFinite(parsedCategoryId) && parsedCategoryId > 0;

  const [categories, setCategories] = useState<CatalogCategory[]>(() => getCachedCatalogCategories() ?? []);
  const [resolvedCategoryId, setResolvedCategoryId] = useState<number | null>(null);
  const [resolvedProducts, setResolvedProducts] = useState<CatalogProduct[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(categories.length === 0);
  const [isGridLoading, setIsGridLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const catalogSectionRef = useRef<HTMLDivElement | null>(null);
  const hasMountedPageRef = useRef(false);
  const hasRestoredScrollRef = useRef(false);
  const lastResolvedCategoryIdRef = useRef<number | null>(null);

  const activeCategoryId = resolvedCategoryId ?? parsedCategoryId;

  const activeCategory = useMemo(() => {
    if (!Number.isFinite(activeCategoryId) || activeCategoryId <= 0) {
      return null;
    }

    return categories.find((category) => category.id === String(activeCategoryId)) ?? null;
  }, [activeCategoryId, categories]);

  const childCategories = useMemo(() => {
    if (!Number.isFinite(activeCategoryId) || activeCategoryId <= 0) {
      return [];
    }

    return categories.filter((category) => category.parent === activeCategoryId);
  }, [activeCategoryId, categories]);

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
    return getFilteredAndSortedProducts(resolvedProducts, minPrice, maxPrice, sortOrder);
  }, [maxPrice, minPrice, resolvedProducts, sortOrder]);

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
    getOptionalRouteLabel(routeState.parentCategoryId) ?? persistedPageContext?.parentCategoryId ?? null;
  const explicitParentCategoryName =
    getOptionalRouteLabel(routeState.parentCategoryName) ??
    persistedPageContext?.parentCategoryName ??
    null;
  const explicitCurrentCategoryName =
    getOptionalRouteLabel(routeState.currentCategoryName) ??
    persistedPageContext?.currentCategoryName ??
    null;
  const explicitAncestorCategoryId =
    getOptionalRouteLabel(routeState.ancestorCategoryId) ??
    persistedPageContext?.ancestorCategoryId ??
    null;
  const explicitAncestorCategoryName =
    getOptionalRouteLabel(routeState.ancestorCategoryName) ??
    persistedPageContext?.ancestorCategoryName ??
    null;
  const backScrollY = getOptionalScrollPosition(routeState.backScrollY);
  const openedProductId = getOptionalRouteLabel(routeState.openedProductId);

  const loadedCurrentCategoryName = activeCategory?.name ?? null;
  const loadedParentCategoryName = parentCategory?.name ?? null;
  const isContentResolvedForCurrentRoute = resolvedCategoryId === parsedCategoryId;
  const isLoading = isInitialLoading || isGridLoading;

  const resolvedCurrentCategoryName = resolveCategoryDisplayTitle({
    explicitTitle: explicitCurrentCategoryName,
    loadedTitle: loadedCurrentCategoryName,
    isLoading,
    fallbackTitle: "Категория",
  });

  const currentPath = `${location.pathname}${location.search}${location.hash}`;

  const backPath =
    explicitParentCategoryId
      ? `/catalog/category/${explicitParentCategoryId}`
      : parentCategory
        ? `/catalog/category/${parentCategory.id}`
        : "/catalog";

  const backLabel = resolveCatalogBackLabel({
    explicitParentName: explicitParentCategoryName,
    loadedParentName: loadedParentCategoryName,
    isLoading,
  });

  useEffect(() => {
    writePersistedCatalogPageContext(categoryId, {
      currentCategoryName: loadedCurrentCategoryName ?? explicitCurrentCategoryName,
      parentCategoryId: explicitParentCategoryId,
      parentCategoryName: loadedParentCategoryName ?? explicitParentCategoryName,
      ancestorCategoryId: explicitAncestorCategoryId,
      ancestorCategoryName: explicitAncestorCategoryName,
    });
  }, [
    categoryId,
    explicitAncestorCategoryId,
    explicitAncestorCategoryName,
    explicitCurrentCategoryName,
    explicitParentCategoryId,
    explicitParentCategoryName,
    loadedCurrentCategoryName,
    loadedParentCategoryName,
  ]);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      if (categories.length > 0) {
        setIsInitialLoading(false);
        return;
      }

      try {
        const loadedCategories = await getCatalogCategories();

        if (!isMounted) {
          return;
        }

        setCategories(loadedCategories);
      } catch (loadError) {
        console.error("[CategoryPage] Failed to load categories", loadError);

        if (isMounted) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (isMounted) {
          setIsInitialLoading(false);
        }
      }
    }

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, [categories.length]);

  useEffect(() => {
    if (isInitialLoading) {
      return;
    }

    if (!isValidCategoryId) {
      setResolvedCategoryId(null);
      setResolvedProducts([]);
      setError("Некорректный идентификатор категории.");
      setIsGridLoading(false);
      return;
    }

    const selectedCategory = categories.find((category) => category.id === String(parsedCategoryId));

    if (!selectedCategory) {
      setResolvedCategoryId(null);
      setResolvedProducts([]);
      setError("Категория не найдена.");
      setIsGridLoading(false);
      return;
    }

    const selectedCategoryChildren = categories.filter((category) => category.parent === parsedCategoryId);

    if (selectedCategoryChildren.length > 0) {
      setResolvedCategoryId(parsedCategoryId);
      setResolvedProducts([]);
      setError(null);
      setIsGridLoading(false);
      lastResolvedCategoryIdRef.current = parsedCategoryId;
      return;
    }

    const cachedProducts = getCachedCatalogProductsByCategory(parsedCategoryId);

    if (cachedProducts) {
      setResolvedCategoryId(parsedCategoryId);
      setResolvedProducts(cachedProducts);
      setError(null);
      setIsGridLoading(false);
      lastResolvedCategoryIdRef.current = parsedCategoryId;
      return;
    }

    let isMounted = true;
    const shouldKeepCurrentContent = lastResolvedCategoryIdRef.current !== null;

    if (!shouldKeepCurrentContent) {
      setResolvedCategoryId(parsedCategoryId);
      setResolvedProducts([]);
    }

    setError(null);
    setIsGridLoading(true);

    async function loadProducts() {
      try {
        const loadedProducts = await getCatalogProductsByCategory(parsedCategoryId);

        if (!isMounted) {
          return;
        }

        setResolvedCategoryId(parsedCategoryId);
        setResolvedProducts(loadedProducts);
        lastResolvedCategoryIdRef.current = parsedCategoryId;
      } catch (loadError) {
        console.error("[CategoryPage] Failed to load category products", loadError);

        if (isMounted) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (isMounted) {
          setIsGridLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, [categories, isInitialLoading, isValidCategoryId, parsedCategoryId]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

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
  }, [isLoading, pageFromSearchParams, searchParams, setSearchParams, totalPages]);

  useEffect(() => {
    if (hasRestoredScrollRef.current || isLoading) {
      return;
    }

    hasRestoredScrollRef.current = true;
    const frameId = window.requestAnimationFrame(() => {
      if (openedProductId) {
        const productCard = document.querySelector<HTMLElement>(
          `[data-catalog-product-id="${openedProductId}"]`,
        );

        if (productCard) {
          const top =
            productCard.getBoundingClientRect().top +
            window.scrollY -
            getStickyHeaderHeight() -
            PRODUCT_ROW_TOP_GAP;

          window.scrollTo({
            top: Math.max(top, 0),
            behavior: "auto",
          });
          return;
        }
      }

      if (backScrollY !== null) {
        window.scrollTo({
          top: Math.max(backScrollY, 0),
          behavior: "auto",
        });
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [backScrollY, isLoading, openedProductId]);

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
          {backLabel ? (
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
          ) : (
            <div className="h-6" aria-hidden="true" />
          )}
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

        {isInitialLoading ? <p className="text-base text-[#6B778B]">Загрузка товаров...</p> : null}
        {error ? <p className="text-base text-[#8E4C4C]">{error}</p> : null}

        {!isInitialLoading && !error && childCategories.length > 0 ? (
          <div className="relative">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {childCategories.map((category) => (
                <Link
                  to={`/catalog/category/${category.id}`}
                  key={category.id}
                  state={{
                    parentCategoryId: String(activeCategoryId),
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
            {isGridLoading ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[24px] bg-[#E7F5FB]/70 backdrop-blur-[1px]">
                <div className="rounded-full border border-[#BCE1F1] bg-white/90 px-4 py-2 text-sm font-medium text-[#4A9DD4]">
                  Загрузка...
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {!isInitialLoading &&
        !error &&
        childCategories.length === 0 &&
        isContentResolvedForCurrentRoute &&
        resolvedProducts.length === 0 &&
        !isGridLoading ? (
          <p className="text-base text-[#6B778B]">В этой категории пока нет товаров.</p>
        ) : null}

        {!isInitialLoading && !error && childCategories.length === 0 && resolvedProducts.length > 0 ? (
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
                <div className="relative mt-8">
                  <div
                    className={`grid grid-cols-1 gap-6 transition-opacity duration-200 sm:grid-cols-2 lg:grid-cols-4 ${
                      isGridLoading ? "pointer-events-none opacity-70" : ""
                    }`}
                  >
                    {paginatedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        formatTitleSuffix
                        to={`/catalog/product/${product.id}`}
                        state={{
                          backPath: currentPath,
                          backLabel: resolvedCurrentCategoryName,
                          backState: {
                            parentCategoryId: explicitParentCategoryId,
                            parentCategoryName: explicitParentCategoryName,
                            currentCategoryName: resolvedCurrentCategoryName,
                            ancestorCategoryId: explicitAncestorCategoryId,
                            ancestorCategoryName: explicitAncestorCategoryName,
                          },
                          categoryId: String(activeCategoryId),
                        }}
                      />
                    ))}
                  </div>
                  {isGridLoading ? (
                    <div className="absolute inset-0 z-10 flex items-start justify-center rounded-[24px] bg-[#E7F5FB]/35 pt-6">
                      <div className="rounded-full border border-[#BCE1F1] bg-white/92 px-4 py-2 text-sm font-medium text-[#4A9DD4] shadow-sm">
                        Обновляем каталог...
                      </div>
                    </div>
                  ) : null}
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

        {!isInitialLoading &&
        !error &&
        childCategories.length === 0 &&
        resolvedProducts.length === 0 &&
        isGridLoading ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[320px] animate-pulse rounded-[24px] border border-[#D4DFEA] bg-[#F8FAFC]"
              />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default CategoryPage;
