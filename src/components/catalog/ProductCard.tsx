import { Link } from "react-router-dom";
import type { CatalogProduct } from "../../types/catalog";
import { formatCatalogProductPrice } from "../../utils/price";
import FavoriteToggleButton from "./FavoriteToggleButton";

type ProductCardProps = {
  product: CatalogProduct;
  to: string;
  state?: unknown;
};

export default function ProductCard({ product, to, state }: ProductCardProps) {
  return (
    <Link className="block h-full" to={to} state={state}>
      <article className="flex h-full flex-col rounded-[22px] border border-[#C6DFEC] bg-[#F8FAFC] p-4 transition-colors hover:bg-white">
        <div className="relative mb-4 flex h-[220px] w-full items-center justify-center rounded-[18px] border border-[#E1E8EF] bg-white p-4">
          <FavoriteToggleButton product={product} variant="icon" />

          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="max-h-full max-w-full object-contain"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-[#8C97A8]">
              Изображение недоступно
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col">
          <h2 className="mb-3 line-clamp-2 text-base font-medium leading-snug text-[#3F4A58] md:text-lg">
            {product.title}
          </h2>
          <p className="mt-auto text-xl font-medium leading-snug text-[#4BADE8]">
            {formatCatalogProductPrice(product)}
          </p>
        </div>
      </article>
    </Link>
  );
}
