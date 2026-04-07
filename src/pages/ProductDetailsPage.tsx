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
    (fallbackCategory ? `/catalog/category/${fallbackCategory.id}/products` : "/catalog");
  const breadcrumbBackLabel =
    routeState.backLabel ?? (fallbackCategory ? fallbackCategory.name : "Каталог");

  return (
    <main className="px-4 py-10">
      <div className="mb-6">
        <Link to={breadcrumbBackPath} className="text-sm text-slate-700 hover:text-slate-900">
          ← {breadcrumbBackLabel}
        </Link>
      </div>

      {isLoading ? <p>Загрузка товара...</p> : null}
      {error ? <p>{error}</p> : null}

      {!isLoading && !error && product ? (
        <article className="rounded border p-4 sm:p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className="h-72 w-full rounded object-cover sm:h-96"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-72 items-center justify-center rounded border border-dashed text-sm text-slate-500 sm:h-96">
                  Изображение недоступно
                </div>
              )}
            </div>

            <div>
              <h1 className="mb-3 text-2xl font-semibold">{product.title}</h1>
              <p className="mb-4 text-xl font-medium">{formatCatalogProductPrice(product)}</p>
              {stockLabel ? <p className="mb-4 text-sm text-slate-700">Статус: {stockLabel}</p> : null}
              {descriptionHtml ? (
                <div
                  className="prose prose-sm max-w-none text-slate-700"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              ) : null}
            </div>
          </div>
        </article>
      ) : null}
    </main>
  );
}

export default ProductDetailsPage;
