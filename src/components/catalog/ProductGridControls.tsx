type ProductGridControlsProps = {
  sortOrder: "default" | "asc" | "desc";
  minPrice: string;
  maxPrice: string;
  onSortOrderChange: (value: "default" | "asc" | "desc") => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onReset: () => void;
};

export default function ProductGridControls({
  sortOrder,
  minPrice,
  maxPrice,
  onSortOrderChange,
  onMinPriceChange,
  onMaxPriceChange,
  onReset,
}: ProductGridControlsProps) {
  return (
    <section>
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-[220px] flex-1 md:max-w-[320px]">
          <label htmlFor="catalog-sort-order" className="mb-2 block text-sm font-medium text-[#394452]">
            Сортировка
          </label>
          <div className="relative">
            <select
              id="catalog-sort-order"
              value={sortOrder}
              onChange={(event) => onSortOrderChange(event.target.value as "default" | "asc" | "desc")}
              className="w-full appearance-none rounded-2xl border border-[#CBE3F1] bg-white px-4 py-3 pr-14 text-sm text-[#394452] outline-none transition-all duration-200 focus:border-[#7FC4E7] focus:ring-2 focus:ring-[#7FC4E7]/40"
            >
              <option value="default">По умолчанию</option>
              <option value="asc">По названию: А–Я / A–Z</option>
              <option value="desc">По названию: Я–А / Z–A</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-[#7B899C]">
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="h-4 w-4"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6.5L8 10L12 6.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>

        <div className="min-w-[220px] flex-1 md:max-w-[320px]">
          <label className="mb-2 block text-sm font-medium text-[#394452]">Цена</label>
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="text"
              inputMode="numeric"
              value={minPrice}
              onChange={(event) => onMinPriceChange(event.target.value)}
              placeholder="От"
              className="w-full rounded-2xl border border-[#CBE3F1] bg-white px-4 py-3 text-sm text-[#394452] outline-none transition-all duration-200 placeholder:text-[#9AA7BA] focus:border-[#7FC4E7] focus:ring-2 focus:ring-[#7FC4E7]/40"
            />
            <input
              type="text"
              inputMode="numeric"
              value={maxPrice}
              onChange={(event) => onMaxPriceChange(event.target.value)}
              placeholder="До"
              className="w-full rounded-2xl border border-[#CBE3F1] bg-white px-4 py-3 text-sm text-[#394452] outline-none transition-all duration-200 placeholder:text-[#9AA7BA] focus:border-[#7FC4E7] focus:ring-2 focus:ring-[#7FC4E7]/40"
            />
          </div>
        </div>

        <div className="flex items-center">
          <button
            type="button"
            onClick={onReset}
            className="pb-3 text-sm font-medium text-[#4BADE8] transition-colors duration-200 hover:text-[#2F84BF]"
          >
            Сбросить
          </button>
        </div>
      </div>
    </section>
  );
}
