import { Link } from "react-router-dom";
import ProductCard from "../components/catalog/ProductCard";
import { useFavorites } from "../context/FavoritesContext";

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

export default function FavoritesPage() {
  const { favoriteProducts } = useFavorites();

  return (
    <main className="bg-white px-6 py-12 md:px-8 md:py-16">
      <div className="mx-auto max-w-[1240px]">
        <h1 className="text-3xl font-semibold leading-snug text-[#234579]">Избранное</h1>
        <p className="mt-3 max-w-[700px] text-base leading-7 text-[#6B778B]">
          Здесь собраны товары, которые вы сохранили для быстрого возвращения и сравнения.
        </p>

        {favoriteProducts.length > 0 ? (
          <section className="mt-10">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold leading-snug text-[#394452]">
                Сохранённые товары
              </h2>
              <p className="text-sm font-medium text-[#6B778B]">
                {favoriteProducts.length} {getProductsLabel(favoriteProducts.length)}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {favoriteProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  to={`/catalog/product/${product.id}`}
                  state={{ backPath: "/favorites", backLabel: "Избранное" }}
                />
              ))}
            </div>
          </section>
        ) : (
          <section className="mt-10 rounded-[28px] border border-[#BCE1F1] bg-[#F6FBFE] p-8">
            <h2 className="text-2xl font-semibold leading-snug text-[#394452]">Список пока пуст</h2>
            <p className="mt-4 max-w-[620px] text-base leading-7 text-[#6B778B]">
              Вы ещё не добавили товары в избранное. Перейдите в каталог, чтобы сохранить интересующие позиции и вернуться к ним позже.
            </p>
            <Link
              to="/catalog"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#2F84BF] px-6 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[#256EAC] hover:scale-[1.02]"
            >
              Открыть каталог
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
