import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getCachedCatalogProductById, getCatalogProductById } from "../services/catalog.service";
import type { CatalogProduct } from "../types/catalog";
import HomeHashLink from "../components/navigation/HomeHashLink";
import { getCatalogProductImageSrc } from "../utils/catalog-image";
import { getCatalogCardTitleParts } from "../utils/catalog-title";
import { formatCatalogProductPrice, getCatalogProductNumericPrice } from "../utils/price";
import { markdownToHtml, sanitizeWooHtml } from "../utils/sanitize-html";

type ProductRouteState = {
  backPath?: string;
  backLabel?: string;
  categoryId?: string;
  backScrollY?: number | null;
  openedProductId?: string | null;
  backState?: {
    parentCategoryId?: string | null;
    parentCategoryName?: string | null;
    currentCategoryName?: string | null;
    ancestorCategoryId?: string | null;
    ancestorCategoryName?: string | null;
    backScrollY?: number | null;
    openedProductId?: string | null;
  };
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return "Не удалось загрузить товар.";
}

function hasHtmlMarkup(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function ProductDetailsPage() {
  const { productId } = useParams<{ productId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = (location.state ?? {}) as ProductRouteState;

  const parsedProductId = Number(productId);
  const isValidProductId = Number.isFinite(parsedProductId) && parsedProductId > 0;

  const [product, setProduct] = useState<CatalogProduct | null>(() =>
    isValidProductId ? getCachedCatalogProductById(parsedProductId) : null,
  );
  const [isLoading, setIsLoading] = useState(
    () => isValidProductId && getCachedCatalogProductById(parsedProductId) === null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isValidProductId) {
      setError("Некорректный идентификатор товара.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadProduct() {
      const hasCached = getCachedCatalogProductById(parsedProductId) !== null;
      if (!hasCached) {
        setIsLoading(true);
        setError(null);
      }

      try {
        const loadedProduct = await getCatalogProductById(parsedProductId);

        if (!isMounted) {
          return;
        }

        if (!loadedProduct) {
          setError("Товар не найден.");
          setProduct(null);
          return;
        }

        setProduct(loadedProduct);
      } catch (loadError) {
        console.error("[ProductDetailsPage] Failed to load product", loadError);

        if (isMounted) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      isMounted = false;
    };
  }, [isValidProductId, parsedProductId]);

  const descriptionContent = useMemo(() => {
    if (!product) {
      return null;
    }

    return product.description ?? product.shortDescription ?? null;
  }, [product]);

  const descriptionHasHtml = useMemo(() => {
    return descriptionContent ? hasHtmlMarkup(descriptionContent) : false;
  }, [descriptionContent]);

  const descriptionHtml = useMemo(() => {
    if (!descriptionContent) return null;
    const raw = descriptionHasHtml
      ? descriptionContent
      : markdownToHtml(descriptionContent);
    return sanitizeWooHtml(raw);
  }, [descriptionContent, descriptionHasHtml]);

  const titleParts = useMemo(() => {
    if (!product) {
      return null;
    }

    return getCatalogCardTitleParts(product);
  }, [product]);

  const imageSrc = useMemo(() => {
    return product ? getCatalogProductImageSrc(product) : null;
  }, [product]);

  const isPriceUnknown = useMemo(() => {
    if (!product) return false;
    const numericPrice = getCatalogProductNumericPrice(product);
    return numericPrice === null || numericPrice === 0;
  }, [product]);

  const explicitBackPath =
    typeof routeState.backPath === "string" && routeState.backPath.trim() !== ""
      ? routeState.backPath
      : null;

  const fallbackCategory = product?.categories[0] ?? null;

  const breadcrumbBackPath =
    explicitBackPath ?? (fallbackCategory ? `/catalog/category/${fallbackCategory.id}` : "/catalog");

  function handleBackNavigation() {
    const nextBackState =
      routeState.backState || routeState.backScrollY != null
        ? {
            ...(routeState.backState ?? {}),
            backScrollY:
              typeof routeState.backScrollY === "number" && Number.isFinite(routeState.backScrollY)
                ? routeState.backScrollY
                : null,
            openedProductId:
              typeof routeState.openedProductId === "string" && routeState.openedProductId.trim() !== ""
                ? routeState.openedProductId
                : null,
          }
        : undefined;

    navigate(breadcrumbBackPath, {
      state: nextBackState,
    });
  }

  return (
    <main className="px-6 py-12 md:px-8 md:py-16">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-10">
          <button
            type="button"
            onClick={handleBackNavigation}
            className="inline-flex items-center gap-2 text-base font-medium text-[#4A9DD4] transition-colors hover:text-[#2F84BF]"
          >
            <span aria-hidden="true">‹</span>
            Назад к списку товаров
          </button>
        </div>

        {error ? <p className="text-base text-[#8E4C4C]">{error}</p> : null}

        {!isLoading && !error && product ? (
          <article>
            <div className="grid items-start gap-10 lg:grid-cols-[minmax(320px,460px)_1fr]">
              <div>
                <div className="flex h-[420px] w-full items-center justify-center rounded-[24px] border border-[#DCE4EB] bg-white p-6 md:h-[560px] md:p-8">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={product.title}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
                      Изображение недоступно
                    </div>
                  )}
                </div>
              </div>

              <div className="max-w-[620px]">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="text-3xl font-semibold leading-snug text-[#234579]">
                      {product.title}
                    </h1>

                    {isPriceUnknown ? (
                      <HomeHashLink
                        hash="#contacts"
                        className="mt-4 inline-flex items-center gap-1 text-base font-medium text-[#4A9DD4] transition-colors hover:text-[#2F84BF]"
                      >
                        Уточнить цену в магазине <span aria-hidden="true">›</span>
                      </HomeHashLink>
                    ) : (
                      <>
                        <p className="mt-2 text-xl font-medium leading-snug text-[#4BADE8]">
                          {formatCatalogProductPrice(product)}
                        </p>
                        <HomeHashLink
                          hash="#contacts"
                          className="mt-2 block text-sm leading-6 text-[#234579] decoration-[#234579] hover:underline"
                        >
                          Наличие уточняйте в магазине
                        </HomeHashLink>
                      </>
                    )}
                  </div>

                </div>

                {descriptionContent ? (
                  <div className="mb-7 rounded-3xl bg-[#E2F2FA] p-6 md:p-8">
                    <h2 className="mb-3 text-xl font-medium leading-snug text-[#364250]">Описание</h2>
                    {descriptionHtml ? (
                      <div
                        className="max-w-none text-sm leading-7 text-[#647387] md:text-base [&_p]:my-3 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_ul]:my-4 [&_ol]:my-4 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mb-1 [&_a]:font-medium [&_a]:text-[#2F84BF] [&_a]:underline [&_a]:underline-offset-2"
                        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                      />
                    ) : (
                      <div className="whitespace-pre-line text-sm leading-7 text-[#647387] md:text-base">
                        {descriptionContent}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </article>
        ) : null}
      </div>
    </main>
  );
}

export default ProductDetailsPage;
