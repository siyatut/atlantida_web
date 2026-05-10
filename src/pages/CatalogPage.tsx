import type { ComponentType, SVGProps } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useMatch, useSearchParams } from "react-router-dom";
import BirdIcon from "../assets/icons_category/bird.svg?react";
import CatIcon from "../assets/icons_category/cat.svg?react";
import DogIcon from "../assets/icons_category/dog.svg?react";
import FishIcon from "../assets/icons_category/fish.svg?react";
import MouseIcon from "../assets/icons_category/mouse.svg?react";
import ReptileIcon from "../assets/icons_category/reptile.svg?react";
import ProductCard from "../components/catalog/ProductCard";
import ProductGridControls from "../components/catalog/ProductGridControls";
import ProductGridPagination from "../components/catalog/ProductGridPagination";
import {
  getCachedCatalogCategories,
  getCachedCatalogProductsByCategory,
  getCatalogCategories,
  getCatalogProductsByCategory,
} from "../services/catalog.service";
import type { CatalogCategory, CatalogProduct } from "../types/catalog";
import { getFilteredAndSortedProducts, sanitizePriceInput } from "../utils/catalog-product-list";
import {
  resolveCatalogBackLabel,
  resolveCategoryDisplayTitle,
  getOptionalRouteLabel,
  getOptionalScrollPosition,
} from "../utils/catalog-navigation";
import {
  getCatalogPageParam,
  getCatalogPriceParam,
  getCatalogSortOrderParam,
  getNormalizedCatalogSearchParams,
} from "../utils/catalog-query";
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

type CategoryIcon = ComponentType<SVGProps<SVGSVGElement>>;

const PRODUCTS_PER_PAGE = 20;
const PRODUCT_ROW_TOP_GAP = 16;
const CATALOG_CONTENT_MIN_HEIGHT = "min-h-[600px]";

const CATEGORY_PRESENTATION_BY_SLUG: Record<string, { description: string; Icon: CategoryIcon }> = {
  rybki: {
    description: "Корма, аксессуары и все необходимое для ухода за аквариумными рыбками.",
    Icon: FishIcon,
  },
  gryzuny: {
    description: "Товары для грызунов: питание, наполнители, клетки и уход.",
    Icon: MouseIcon,
  },
  koshki: {
    description: "Подборка кормов, игрушек и аксессуаров для комфортной жизни.",
    Icon: CatIcon,
  },
  sobaki: {
    description: "Все для собак: корма, игрушки, товары для прогулок и ухода.",
    Icon: DogIcon,
  },
  pticzy: {
    description: "Клетки, корма и аксессуары для птиц и заботы о них каждый день.",
    Icon: BirdIcon,
  },
  reptilii: {
    description: "Террариумы, лампы, корма и аксессуары для содержания рептилий.",
    Icon: ReptileIcon,
  },
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return "Не удалось загрузить каталог.";
}

function getCategoryDescription(description: string | null): string {
  const plainText = getPlainTextFromHtml(description);

  if (!plainText) {
    return "Исследуйте подборку товаров в этой категории.";
  }

  return plainText;
}

function getSubcategoryLabel(count: number): string {
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "подкатегорий";
  }

  const lastDigit = count % 10;

  if (lastDigit === 1) {
    return "подкатегория";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "подкатегории";
  }

  return "подкатегорий";
}

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


export default function CatalogPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const routeState = (location.state ?? {}) as CategoryRouteState;
  const categoryMatch = useMatch("/catalog/category/:categoryId");
  const categoryProductsMatch = useMatch("/catalog/category/:categoryId/products");
  const categoryId = categoryProductsMatch?.params.categoryId ?? categoryMatch?.params.categoryId;
  const persistedPageContext = readPersistedCatalogPageContext(categoryId);

  const parsedCategoryId = Number(categoryId);
  const isCategoryRoute = typeof categoryId === "string";
  const isValidCategoryId = !isCategoryRoute || (Number.isFinite(parsedCategoryId) && parsedCategoryId > 0);

  const [categories, setCategories] = useState<CatalogCategory[]>(() => getCachedCatalogCategories() ?? []);
  const [resolvedCategoryId, setResolvedCategoryId] = useState<number | null>(() => {
    if (!isCategoryRoute || !Number.isFinite(parsedCategoryId) || parsedCategoryId <= 0) return null;
    const initialCategories = getCachedCatalogCategories() ?? [];
    if (initialCategories.some((c) => c.parent === parsedCategoryId)) return parsedCategoryId;
    if (getCachedCatalogProductsByCategory(parsedCategoryId) !== null) return parsedCategoryId;
    return null;
  });
  const [resolvedProducts, setResolvedProducts] = useState<CatalogProduct[]>(() => {
    if (!isCategoryRoute || !Number.isFinite(parsedCategoryId) || parsedCategoryId <= 0) return [];
    const initialCategories = getCachedCatalogCategories() ?? [];
    if (initialCategories.some((c) => c.parent === parsedCategoryId)) return [];
    return getCachedCatalogProductsByCategory(parsedCategoryId) ?? [];
  });
  const [isInitialLoading, setIsInitialLoading] = useState(categories.length === 0);
  const [isGridLoading, setIsGridLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasRestoredScrollRef = useRef(false);
  const lastResolvedCategoryIdRef = useRef<number | null>(null);

  // Sync state immediately when URL changes within the mounted catalog component.
  // Called during render so React discards the stale frame and re-renders synchronously.
  if (!isInitialLoading) {
    if (isCategoryRoute && isValidCategoryId && resolvedCategoryId !== parsedCategoryId) {
      const hasChildren = categories.some((c) => c.parent === parsedCategoryId);
      if (hasChildren) {
        setResolvedCategoryId(parsedCategoryId);
        if (resolvedProducts.length > 0) setResolvedProducts([]);
      } else {
        const cached = getCachedCatalogProductsByCategory(parsedCategoryId);
        if (cached !== null) {
          setResolvedCategoryId(parsedCategoryId);
          setResolvedProducts(cached);
        }
      }
    } else if (!isCategoryRoute && resolvedCategoryId !== null) {
      setResolvedCategoryId(null);
      if (resolvedProducts.length > 0) setResolvedProducts([]);
    }
  }

  const currentCategoryId = isCategoryRoute ? parsedCategoryId : null;
  const displayedCategoryId = resolvedCategoryId ?? currentCategoryId;

  const rootCategories = useMemo(
    () => categories.filter((category) => category.parent === 0),
    [categories],
  );

  const childCountByParentId = useMemo(() => {
    return categories.reduce<Record<string, number>>((accumulator, category) => {
      if (category.parent > 0) {
        const parentId = String(category.parent);
        accumulator[parentId] = (accumulator[parentId] ?? 0) + 1;
      }

      return accumulator;
    }, {});
  }, [categories]);

  const activeCategory = useMemo(() => {
    if (displayedCategoryId === null) {
      return null;
    }

    return categories.find((category) => category.id === String(displayedCategoryId)) ?? null;
  }, [categories, displayedCategoryId]);

  const childCategories = useMemo(() => {
    if (displayedCategoryId === null) {
      return rootCategories;
    }

    return categories.filter((category) => category.parent === displayedCategoryId);
  }, [categories, displayedCategoryId, rootCategories]);

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

  const pageFromSearchParams = useMemo(() => getCatalogPageParam(searchParams), [searchParams]);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(visibleProducts.length / PRODUCTS_PER_PAGE)),
    [visibleProducts.length],
  );
  const currentPage = useMemo(
    () => Math.min(pageFromSearchParams, totalPages),
    [pageFromSearchParams, totalPages],
  );
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return visibleProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [currentPage, visibleProducts]);

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

  const isLoading = isInitialLoading || isGridLoading;
  const isRootView = displayedCategoryId === null;
  const loadedCurrentCategoryName = activeCategory?.name ?? null;
  const loadedParentCategoryName = parentCategory?.name ?? null;
  const isContentResolvedForCurrentRoute = displayedCategoryId === currentCategoryId;

  const pageTitle = isRootView
    ? "Каталог товаров"
    : resolveCategoryDisplayTitle({
        explicitTitle: explicitCurrentCategoryName,
        loadedTitle: loadedCurrentCategoryName,
        isLoading,
        fallbackTitle: "Категория",
      });

  const pageDescription = useMemo(() => {
    if (isRootView) {
      return "Выберите категорию для просмотра товаров";
    }

    return getPlainTextFromHtml(activeCategory?.description ?? null);
  }, [activeCategory?.description, isRootView]);

  const backPath = explicitParentCategoryId
    ? `/catalog/category/${explicitParentCategoryId}`
    : parentCategory
      ? `/catalog/category/${parentCategory.id}`
      : "/catalog";

  const backLabel = isRootView
    ? null
    : resolveCatalogBackLabel({
        explicitParentName: explicitParentCategoryName,
        loadedParentName: loadedParentCategoryName,
        isLoading,
      });

  const currentPath = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    const normalizedSearchParams = getNormalizedCatalogSearchParams(searchParams);

    if (normalizedSearchParams.toString() !== searchParams.toString()) {
      setSearchParams(normalizedSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

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
        setError(null);
      } catch (loadError) {
        console.error("[CatalogPage] Failed to load categories", loadError);

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

    if (!isCategoryRoute) {
      setResolvedCategoryId(null);
      setResolvedProducts([]);
      setError(null);
      setIsGridLoading(false);
      return;
    }

    if (!isValidCategoryId) {
      setError("Некорректный идентификатор категории.");
      setIsGridLoading(false);
      return;
    }

    const selectedCategory = categories.find((category) => category.id === String(parsedCategoryId));

    if (!selectedCategory) {
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
    const shouldKeepCurrentContent =
      lastResolvedCategoryIdRef.current !== null || resolvedProducts.length > 0 || childCategories.length > 0;

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
        console.error("[CatalogPage] Failed to load category products", loadError);

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
  }, [
    categories,
    childCategories.length,
    isCategoryRoute,
    isInitialLoading,
    isValidCategoryId,
    parsedCategoryId,
    resolvedProducts.length,
  ]);

  useEffect(() => {
    if (!isCategoryRoute) {
      return;
    }

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
    isCategoryRoute,
    loadedCurrentCategoryName,
    loadedParentCategoryName,
  ]);

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
    if (isCategoryRoute || isInitialLoading) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        behavior: "auto",
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isCategoryRoute, isInitialLoading]);

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
    <main className="px-6 py-12 pb-20 md:px-8 md:py-16 md:pb-24">
      <div className="mx-auto max-w-[1240px]">
        {backLabel ? (
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
              className="inline-flex min-h-6 items-center gap-2 text-base font-medium text-[#4A9DD4] transition-colors hover:text-[#2F84BF]"
            >
              <span aria-hidden="true">‹</span>
              {backLabel}
            </Link>
          </div>
        ) : null}

        <section className={CATALOG_CONTENT_MIN_HEIGHT}>
          <div>
            <h1 className="mb-3 text-3xl font-semibold leading-snug text-[#234579]">{pageTitle}</h1>
            {pageDescription ? (
              <p className="mb-10 text-base leading-snug text-[#6B778B]">{pageDescription}</p>
            ) : (
              <div className="mb-10" />
            )}
          </div>

          {isInitialLoading ? <div className="absolute inset-0 z-10 bg-[#E7F5FB]/35" /> : null}
          {error ? <p className="text-base text-[#8E4C4C]">{error}</p> : null}

          {!isInitialLoading && !error && !isCategoryRoute ? (
            <div className="relative">
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {rootCategories.map((category) => {
                  const childCount = childCountByParentId[category.id] ?? 0;
                  const presentation = CATEGORY_PRESENTATION_BY_SLUG[category.slug];
                  const description =
                    presentation?.description ?? getCategoryDescription(category.description);
                  const Icon = presentation?.Icon;

                  return (
                    <Link
                      to={`/catalog/category/${category.id}`}
                      key={category.id}
                      state={{
                        parentCategoryId: null,
                        parentCategoryName: "Каталог",
                        currentCategoryName: category.name,
                      }}
                    >
                      <article className="group flex h-[180px] items-start gap-4 rounded-[24px] border border-[#BCE1F1] bg-[#F6F9FC] p-6 transition-all duration-300 hover:bg-white hover:shadow-sm">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#CBEAF6] text-2xl text-[#2F84BF] transition-colors duration-300 group-hover:text-[#1E6FA8]">
                          {Icon ? (
                            <Icon className="h-8 w-8 transition-all duration-300 group-hover:scale-110" />
                          ) : null}
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
                          <div>
                            <h2 className="mb-2 text-xl font-semibold leading-snug text-[#394452]">
                              {category.name}
                            </h2>
                            <p className="line-clamp-3 text-sm leading-snug text-[#68758A]">
                              {description}
                            </p>
                          </div>
                          <p className="pt-2 text-sm font-medium text-[#4BADE8]">
                            {childCount} {getSubcategoryLabel(childCount)} →
                          </p>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
              {isGridLoading ? (
                <div className="absolute inset-0 z-10 rounded-[24px] bg-[#E7F5FB]/35" />
              ) : null}
            </div>
          ) : null}

          {!isInitialLoading && !error && isCategoryRoute && childCategories.length > 0 ? (
            <div className="relative">
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {childCategories.map((category) => (
                  <Link
                    to={`/catalog/category/${category.id}`}
                    key={category.id}
                    state={{
                      parentCategoryId: String(displayedCategoryId),
                      parentCategoryName: pageTitle,
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
                <div className="absolute inset-0 z-10 rounded-[24px] bg-[#E7F5FB]/35" />
              ) : null}
            </div>
          ) : null}

          {!isInitialLoading &&
          !error &&
          isCategoryRoute &&
          childCategories.length === 0 &&
          isContentResolvedForCurrentRoute &&
          resolvedProducts.length === 0 &&
          !isGridLoading ? (
            <p className="text-base text-[#6B778B]">В этой категории пока нет товаров.</p>
          ) : null}

          {!isInitialLoading &&
          !error &&
          isCategoryRoute &&
          childCategories.length === 0 &&
          resolvedProducts.length > 0 ? (
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
                            backLabel: pageTitle,
                            backState: {
                              parentCategoryId: explicitParentCategoryId,
                              parentCategoryName: explicitParentCategoryName,
                              currentCategoryName: pageTitle,
                              ancestorCategoryId: explicitAncestorCategoryId,
                              ancestorCategoryName: explicitAncestorCategoryName,
                            },
                            categoryId: String(displayedCategoryId),
                          }}
                        />
                      ))}
                    </div>
                    {isGridLoading ? (
                      <div className="absolute inset-0 z-10 rounded-[24px] bg-[#E7F5FB]/35" />
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
          isCategoryRoute &&
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
        </section>
      </div>
    </main>
  );
}
