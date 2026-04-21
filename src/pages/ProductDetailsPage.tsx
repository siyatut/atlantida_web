import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import FavoriteToggleButton from "../components/catalog/FavoriteToggleButton";
import { getCatalogProductById } from "../services/catalog.service";
import type { CatalogProduct } from "../types/catalog";
import { getCatalogCardTitleParts } from "../utils/catalog-title";
import { formatCatalogProductPrice } from "../utils/price";
import { sanitizeWooHtml } from "../utils/sanitize-html";

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

function ProductDetailsPage() {
  const { productId } = useParams<{ productId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = (location.state ?? {}) as ProductRouteState;

  const parsedProductId = Number(productId);
  const isValidProductId = Number.isFinite(parsedProductId) && parsedProductId > 0;

  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isValidProductId) {
      setError("Некорректный идентификатор товара.");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadProduct() {
      setIsLoading(true);
      setError(null);

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

  const descriptionHtml = useMemo(() => {
    if (!product) {
      return null;
    }

    return sanitizeWooHtml(product.shortDescription ?? product.description);
  }, [product]);

  const titleParts = useMemo(() => {
    if (!product) {
      return null;
    }

    return getCatalogCardTitleParts(product);
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

        {isLoading ? <p className="text-base text-[#6B778B]">Загрузка товара...</p> : null}
        {error ? <p className="text-base text-[#8E4C4C]">{error}</p> : null}

        {!isLoading && !error && product ? (
          <article>
            <div className="grid items-start gap-10 lg:grid-cols-[minmax(320px,460px)_1fr]">
              <div>
                <div className="flex h-[420px] w-full items-center justify-center rounded-[24px] border border-[#DCE4EB] bg-white p-6 md:h-[560px] md:p-8">
                  {product.image ? (
                    <img
                      src={product.image}
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
                      <span>{titleParts?.mainTitle ?? product.title}</span>
                      {titleParts?.suffixPart ? <span className="block">{titleParts.suffixPart}</span> : null}
                    </h1>

                    <p className="mt-4 text-xl font-medium leading-snug text-[#4BADE8]">
                      {formatCatalogProductPrice(product)}
                    </p>
                  </div>

                  <FavoriteToggleButton product={product} />
                </div>

                {descriptionHtml ? (
                  <div className="mb-7 rounded-3xl bg-[#E2F2FA] p-6 md:p-8">
                    <h2 className="mb-3 text-xl font-medium leading-snug text-[#364250]">Описание</h2>
                    <div
                      className="max-w-none text-sm leading-7 text-[#647387] md:text-base [&_p]:mb-3 [&_p:last-child]:mb-0 [&_br]:hidden [&_ul]:my-3 [&_ol]:my-3 [&_li]:mb-1"
                      dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                    />
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
