import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getCatalogProductById } from "../services/catalog.service";
import type { CatalogProduct } from "../types/catalog";
import { formatCatalogProductPrice } from "../utils/price";
import { sanitizeWooHtml } from "../utils/sanitize-html";

type ProductRouteState = {
  backPath?: string;
  backLabel?: string;
  categoryId?: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return "Не удалось загрузить товар.";
}

function getStockLabel(product: CatalogProduct): string | null {
  if (product.stockStatus) {
    if (product.stockStatus === "instock") {
      return "В наличии";
    }
    if (product.stockStatus === "outofstock") {
      return "Нет в наличии";
    }
    return product.stockStatus;
  }

  if (product.isInStock === true) {
    return "В наличии";
  }
  if (product.isInStock === false) {
    return "Нет в наличии";
  }

  return null;
}

function ProductDetailsPage() {
  const { productId } = useParams<{ productId: string }>();
  const location = useLocation();
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

  const stockLabel = useMemo(() => (product ? getStockLabel(product) : null), [product]);

  const fallbackCategory = product?.categories[0] ?? null;
  const breadcrumbBackPath =
    routeState.backPath ??
    (fallbackCategory ? `/catalog/category/${fallbackCategory.id}` : "/catalog");

  return (
    <main className="px-6 py-12 md:px-8 md:py-16">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-10">
          <Link
            to={breadcrumbBackPath}
            className="inline-flex items-center gap-2 text-base font-medium text-[#4A9DD4] transition-colors hover:text-[#2F84BF]"
          >
            <span aria-hidden="true">‹</span>
            Назад к списку товаров
          </Link>
        </div>

        {isLoading ? <p className="text-base text-[#6B778B]">Загрузка товара...</p> : null}
        {error ? <p className="text-base text-[#8E4C4C]">{error}</p> : null}

        {!isLoading && !error && product ? (
          <article>
            <div className="grid items-start gap-10 lg:grid-cols-[minmax(320px,460px)_1fr]">
              <div>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="h-[420px] w-full rounded-[24px] border border-[#DCE4EB] bg-white object-cover md:h-[560px]"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-[420px] items-center justify-center rounded-[24px] border border-[#DCE4EB] bg-white text-sm text-slate-500 md:h-[560px]">
                    Изображение недоступно
                  </div>
                )}
              </div>

              <div className="max-w-[620px]">
                <h1 className="mb-4 text-3xl font-semibold leading-snug text-[#234579]">
                  {product.title}
                </h1>
                <p className="mb-5 text-xl font-medium leading-snug text-[#4BADE8]">
                  {formatCatalogProductPrice(product)}
                </p>
                {stockLabel ? (
                  <p className="mb-7 inline-flex rounded-2xl bg-[#D8F0DD] px-4 py-2 text-sm font-medium text-[#3E8A57]">
                    ✓ {stockLabel}
                  </p>
                ) : null}

                {descriptionHtml ? (
                  <div className="mb-7 rounded-3xl bg-[#E2F2FA] p-6 md:p-8">
                    <h2 className="mb-3 text-xl font-medium leading-snug text-[#364250]">Описание</h2>
                    <div
                      className="prose prose-sm max-w-none text-sm leading-snug text-[#647387] md:text-base"
                      dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                    />
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-4">
                  <button
                    type="button"
                    className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-2xl bg-[#ED4748] px-6 py-4 text-base font-medium text-white shadow-sm"
                  >
                    ♡ В избранном
                  </button>
                  <button
                    type="button"
                    className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-2xl bg-[#3E9AD4] px-6 py-4 text-base font-medium text-white shadow-sm"
                  >
                    ☐ Заказать
                  </button>
                </div>
              </div>
            </div>
          </article>
        ) : null}
      </div>
    </main>
  );
}

export default ProductDetailsPage;
