import type { MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { CatalogProduct } from "../../types/catalog";
import { getCatalogProductImageSrc } from "../../utils/catalog-image";
import { getCatalogCardTitleParts } from "../../utils/catalog-title";
import { formatCatalogProductPrice } from "../../utils/price";
import FavoriteToggleButton from "./FavoriteToggleButton";

type ProductCardProps = {
  product: CatalogProduct;
  to: string;
  state?: unknown;
  formatTitleSuffix?: boolean;
};

function isPlainLeftClick(event: MouseEvent<HTMLAnchorElement>): boolean {
  return (
    event.button === 0 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey
  );
}

export default function ProductCard({
  product,
  to,
  state,
  formatTitleSuffix = false,
}: ProductCardProps) {
  const navigate = useNavigate();
  const { mainTitle, suffixPart } = formatTitleSuffix
    ? getCatalogCardTitleParts(product)
    : { mainTitle: product.title, suffixPart: null };
  const imageSrc = getCatalogProductImageSrc(product);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      event.defaultPrevented ||
      !isPlainLeftClick(event) ||
      !state ||
      typeof state !== "object" ||
      Array.isArray(state)
    ) {
      return;
    }

    event.preventDefault();
    navigate(to, {
      state: {
        ...state,
        backScrollY: window.scrollY,
        openedProductId: String(product.id),
      },
    });
  }

  return (
    <Link
      className="block h-full"
      to={to}
      state={state}
      onClick={handleClick}
      data-catalog-product-id={product.id}
    >
      <article className="flex h-full flex-col rounded-[22px] border border-[#C6DFEC] bg-[#F8FAFC] p-4 transition-colors hover:bg-white">
        <div className="relative mb-4 flex h-[220px] w-full items-center justify-center rounded-[18px] border border-[#E1E8EF] bg-white p-4">
          <FavoriteToggleButton product={product} variant="icon" />

          <img
            src={imageSrc}
            alt={product.title}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        </div>

        <div className="flex flex-1 flex-col">
          <h2 className="mb-3 min-h-[2.5rem] line-clamp-2 text-[15px] font-medium leading-[1.2] text-[#3F4A58] md:min-h-[2.9rem] md:text-base">
            <span>{mainTitle}</span>
            {suffixPart ? <span className="block">{suffixPart}</span> : null}
          </h2>
          <p className="mt-auto text-xl font-medium leading-snug text-[#4BADE8]">
            {formatCatalogProductPrice(product)}
          </p>
        </div>
      </article>
    </Link>
  );
}
