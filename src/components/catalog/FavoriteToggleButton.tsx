import type { MouseEvent } from "react";
import type { CatalogProduct } from "../../types/catalog";
import { useFavorites } from "../../context/FavoritesContext";

type FavoriteToggleButtonProps = {
  product: CatalogProduct;
  variant?: "chip" | "icon";
};

export default function FavoriteToggleButton({
  product,
  variant = "chip",
}: FavoriteToggleButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const isActive = isFavorite(product.id);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    toggleFavorite(product);
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-label={isActive ? "Убрать из избранного" : "Добавить в избранное"}
        aria-pressed={isActive}
        className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border shadow-sm backdrop-blur-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9FD7F0] focus-visible:ring-offset-2 ${
          isActive
            ? "border-[#B9DDEB] bg-[#EAF6FB] text-[#2F84BF] hover:border-[#9DCFE3] hover:bg-[#DDF0FA]"
            : "border-[#E1E8EF] bg-white/95 text-[#7B889B] hover:border-[#C9DCE8] hover:bg-white hover:text-[#2F84BF]"
        }`}
      >
        <span aria-hidden="true" className="text-xl leading-none">
          {isActive ? "♥" : "♡"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isActive}
      className={`inline-flex shrink-0 items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9FD7F0] focus-visible:ring-offset-2 ${
        isActive
          ? "border-[#B9DDEB] bg-[#EAF6FB] text-[#2F84BF] hover:border-[#9DCFE3] hover:bg-[#DDF0FA]"
          : "border-[#C6DFEC] bg-white text-[#5E6B7B] hover:border-[#A9D3E7] hover:bg-[#F8FCFE] hover:text-[#2F84BF]"
      }`}
    >
      <span aria-hidden="true" className="text-base leading-none">
        {isActive ? "♥" : "♡"}
      </span>
      {isActive ? "В избранном" : "В избранное"}
    </button>
  );
}
