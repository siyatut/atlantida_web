const REVIEWS = [
  {
    author: "Елена, Нижний Новгород",
    text: "Помогли подобрать аквариум и всё оборудование к нему. Очень спокойно объяснили, что действительно нужно, а без чего можно обойтись.",
  },
  {
    author: "Игорь, постоянный покупатель",
    text: "Покупаем здесь корма и товары для ухода уже не первый год. Удобно, что можно найти всё в одном месте.",
  },
  {
    author: "Анна и Боня",
    text: "Подсказали подходящий корм и аксессуары для кошки. Остались довольны и ассортиментом, и отношением.",
  },
];

export default function ReviewsPage() {
  return (
    <main className="bg-white px-6 py-12 md:px-8 md:py-16">
      <div className="mx-auto max-w-[1240px]">
        <h1 className="text-3xl font-semibold leading-snug text-[#234579]">Отзывы</h1>
        <p className="mt-3 max-w-[700px] text-base leading-7 text-[#6B778B]">
          Несколько откликов от клиентов, которые обращались к нам за товарами для питомцев и
          аквариумистики.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {REVIEWS.map((review) => (
            <article
              key={review.author}
              className="rounded-[24px] border border-[#BCE1F1] bg-[#F6FBFE] p-6"
            >
              <h2 className="text-lg font-semibold leading-snug text-[#394452]">{review.author}</h2>
              <p className="mt-4 text-base leading-7 text-[#6B778B]">{review.text}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
