import { useEffect, useState } from "react";
import { fetchWooProducts } from "../data-access/woocommerce/store-api";

type WooProduct = Awaited<ReturnType<typeof fetchWooProducts>>[number];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return "Не удалось загрузить товары.";
}

function CatalogPage() {
  const [products, setProducts] = useState<WooProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProducts() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchWooProducts();

        if (isMounted) {
          setProducts(data);
        }
      } catch (loadError) {
        console.error("[CatalogPage] Failed to load products", loadError);

        if (isMounted) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="px-4 py-10">
      {isLoading ? <p>Загрузка товаров...</p> : null}

      {error ? <p>{error}</p> : null}

      {!isLoading && !error ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const image = product.images?.[0]?.src;
            const price = product.prices?.price;
            const currency = product.prices?.currency_suffix ?? "";

            return (
              <article key={product.id} className="rounded border p-4">
                {image ? (
                  <img
                    src={image}
                    alt={product.name}
                    className="mb-4 h-48 w-full object-cover"
                    loading="lazy"
                  />
                ) : null}

                <h2 className="mb-2 text-lg font-semibold">{product.name}</h2>
                <p>{price ? `${price}${currency}` : "Цена не указана"}</p>
              </article>
            );
          })}
        </div>
      ) : null}
    </main>
  );
}

export default CatalogPage;
