type ProductGridPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function ProductGridPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ProductGridPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Пагинация товаров">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#CBE3F1] bg-white px-4 text-sm font-medium text-[#394452] transition-all duration-200 hover:border-[#7FC4E7] hover:text-[#2F84BF] disabled:cursor-not-allowed disabled:border-[#DCE7F0] disabled:text-[#9AA7BA]"
      >
        Назад
      </button>

      {pageNumbers.map((pageNumber) => {
        const isActive = pageNumber === currentPage;

        return (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            aria-current={isActive ? "page" : undefined}
            className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-2xl border px-4 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "border-[#7FC4E7] bg-[#EAF6FC] text-[#2F84BF]"
                : "border-[#CBE3F1] bg-white text-[#394452] hover:border-[#7FC4E7] hover:text-[#2F84BF]"
            }`}
          >
            {pageNumber}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#CBE3F1] bg-white px-4 text-sm font-medium text-[#394452] transition-all duration-200 hover:border-[#7FC4E7] hover:text-[#2F84BF] disabled:cursor-not-allowed disabled:border-[#DCE7F0] disabled:text-[#9AA7BA]"
      >
        Вперёд
      </button>
    </nav>
  );
}
