import { Link } from "react-router-dom";

export default function FavoritesPage() {
  return (
    <main className="bg-white px-6 py-12 md:px-8 md:py-16">
      <div className="mx-auto max-w-[1240px]">
        <h1 className="text-3xl font-semibold leading-snug text-[#234579]">Избранное</h1>
        <p className="mt-3 max-w-[700px] text-base leading-7 text-[#6B778B]">
          Здесь будут храниться товары, которые вы решите сохранить для быстрого поиска.
        </p>

        <section className="mt-10 rounded-[28px] border border-[#BCE1F1] bg-[#F6FBFE] p-8">
          <h2 className="text-2xl font-semibold leading-snug text-[#394452]">Список пока пуст</h2>
          <p className="mt-4 max-w-[620px] text-base leading-7 text-[#6B778B]">
            Вы ещё не добавили товары в избранное. Перейдите в каталог, чтобы сохранить интересующие позиции.
          </p>
          <Link
            to="/catalog"
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#2F84BF] px-6 py-3.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[#256EAC] hover:scale-[1.02]"
          >
            Открыть каталог
          </Link>
        </section>
      </div>
    </main>
  );
}
