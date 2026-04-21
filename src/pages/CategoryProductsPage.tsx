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
import {
  getOptionalRouteLabel,
  getOptionalScrollPosition,
  resolveCategoryDisplayTitle,
} from "../utils/catalog-navigation";
import {
  readPersistedCatalogPageContext,
  writePersistedCatalogPageContext,
} from "../utils/catalog-page-context";
import { getStickyHeaderHeight } from "../utils/hash-scroll";
import { getPlainTextFromHtml } from "../utils/text";

type CategoryProductsRouteState = {
  parentCategoryId?: string | null;
  parentCategoryName?: string | null;
  currentCategoryName?: string | null;
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

  return "Не удалось загрузить товары категории.";
}

function CategoryProductsPage() {
  const PRODUCTS_PER_PAGE = 20;
  const { categoryId } = useParams<{ categoryId: string }>();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const routeState = (location.state ?? {}) as CategoryProductsRouteState;
  const persistedPageContext = readPersistedCatalogPageContext(categoryId);
  const parsedCategoryId = Number(categoryId);
  const isValidCategoryId = Number.isFinite(parsedCategoryId) && parsedCategoryId > 0;

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const catalogSectionRef = useRef<HTMLDivElement | null>(null);
  const hasMountedPageRef = useRef(false);
  const hasRestoredScrollRef = useRef(false);

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

    if (persistedPageContext?.parentCategoryId) {
      return persistedPageContext.parentCategoryId;
    }

    if (activeCategory && activeCategory.parent > 0) {
      return String(activeCategory.parent);
    }

    return null;
  }, [activeCategory, persistedPageContext?.parentCategoryId, routeState.parentCategoryId]);

  const explicitParentCategoryName =
    getOptionalRouteLabel(routeState.parentCategoryName) ??
    persistedPageContext?.parentCategoryName ??
    null;
  const explicitCurrentCategoryName =
    getOptionalRouteLabel(routeState.currentCategoryName) ??
    persistedPageContext?.currentCategoryName ??
    null;
  const parentCategoryName = useMemo(() => {
    if (explicitParentCategoryName) {
      return explicitParentCategoryName;
    }

    if (!parentCategoryId) {
      return null;
    }

    const parentCategory = categories.find((category) => category.id === parentCategoryId);
    return parentCategory?.name ?? null;
  }, [categories, explicitParentCategoryName, parentCategoryId]);
  const backScrollY = getOptionalScrollPosition(routeState.backScrollY);
  const openedProductId = getOptionalRouteLabel(routeState.openedProductId);

  const resolvedCategoryTitle = resolveCategoryDisplayTitle({
    explicitTitle: explicitCurrentCategoryName,
    loadedTitle: activeCategory?.name ?? null,
    isLoading: isCategoriesLoading,
    fallbackTitle: "Товары категории",
  });
  const currentPath = `${location.pathname}${location.search}${location.hash}`;
  const backLinkLabel = parentCategoryName ?? (isCategoriesLoading ? null : "Каталог");

  useEffect(() => {
    writePersistedCatalogPageContext(categoryId, {
      currentCategoryName: activeCategory?.name ?? explicitCurrentCategoryName,
      parentCategoryId: parentCategoryId ?? persistedPageContext?.parentCategoryId ?? null,
      parentCategoryName: parentCategoryName ?? null,
      ancestorCategoryId: persistedPageContext?.ancestorCategoryId ?? null,
      ancestorCategoryName: persistedPageContext?.ancestorCategoryName ?? null,
    });
  }, [
    activeCategory?.name,
    categoryId,
    explicitCurrentCategoryName,
    parentCategoryId,
    parentCategoryName,
    persistedPageContext?.ancestorCategoryId,
    persistedPageContext?.ancestorCategoryName,
    persistedPageContext?.parentCategoryId,
  ]);

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

  useEffect(() => {
    if (!isValidCategoryId) {
      setError("Некорректный идентификатор категории.");
      setIsProductsLoading(false);
      setIsCategoriesLoading(false);
      return;
    }

    let isMounted = true;

    async function loadProducts() {
      setIsProductsLoading(true);
      setError(null);

      try {
        const loadedProducts = await getCatalogProductsByCategory(parsedCategoryId);

        if (isMounted) {
          setProducts(loadedProducts);
        }
      } catch (loadError) {
        console.error("[CategoryProductsPage] Failed to load products", loadError);

        if (isMounted) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (isMounted) {
          setIsProductsLoading(false);
        }
      }
    }

    async function loadCategories() {
      setIsCategoriesLoading(true);

      try {
        const loadedCategories = await getCatalogCategories();

        if (!isMounted) {
          return;
        }

        setCategories(loadedCategories);

        const hasSelectedCategory = loadedCategories.some(
          (category) => category.id === String(parsedCategoryId),
        );

        if (!hasSelectedCategory) {
          setError("Категория не найдена.");
        }
      } catch (loadError) {
        console.error("[CategoryProductsPage] Failed to load categories", loadError);
      } finally {
        if (isMounted) {
          setIsCategoriesLoading(false);
        }
      }
    }

    void loadProducts();
    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, [isValidCategoryId, parsedCategoryId]);

  useEffect(() => {
    if (isProductsLoading) {
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
  }, [isProductsLoading, pageFromSearchParams, searchParams, setSearchParams, totalPages]);

  useEffect(() => {
    if (hasRestoredScrollRef.current || isProductsLoading) {
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
  }, [backScrollY, isProductsLoading, openedProductId]);

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
    <main className="px-4 py-10">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-6">
          {backLinkLabel ? (
            <Link
              to={parentCategoryId ? `/catalog/category/${parentCategoryId}` : "/catalog"}
              className="text-sm text-slate-700 hover:text-slate-900"
            >
              ← {backLinkLabel}
            </Link>
          ) : (
            <div className="h-5" aria-hidden="true" />
          )}
        </div>

        <div ref={catalogSectionRef} className="min-w-0 scroll-mt-28">
          <h1 className="text-2xl font-semibold text-[#234579]">
            {resolvedCategoryTitle}
          </h1>
          {categoryDescription ? (
            <p className="mt-2 max-w-[720px] text-base leading-snug text-[#6B778B]">
              {categoryDescription}
            </p>
          ) : null}
        </div>

        {!isProductsLoading && !error && products.length > 0 ? (
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
        ) : null}

        {isProductsLoading ? <p className="mt-6">Загрузка товаров...</p> : null}
        {error ? <p className="mt-6">{error}</p> : null}

        {!isProductsLoading && !error && products.length === 0 ? (
          <p className="mt-6">В этой подкатегории пока нет товаров.</p>
        ) : null}

        {!isProductsLoading && !error && products.length > 0 ? (
          <>
            {visibleProducts.length === 0 ? (
              <p className="mt-8 text-base leading-snug text-[#6B778B]">
                По выбранным параметрам товары не найдены
              </p>
            ) : (
              <>
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      formatTitleSuffix
                      to={`/catalog/product/${product.id}`}
                      state={{
                        backPath: currentPath,
                        backLabel: resolvedCategoryTitle,
                        backState: {
                          parentCategoryId,
                          parentCategoryName,
                        },
                        categoryId,
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

export default CategoryProductsPage;
