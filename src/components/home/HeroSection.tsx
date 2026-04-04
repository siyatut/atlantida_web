export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-[#007FAF] to-[#00AEEF] py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl">
          <h2 className="text-white text-5xl mb-6">
            Всё для ваших любимых питомцев
          </h2>
          <p className="text-white/90 text-xl mb-8">
            Профессиональная аквариумистика и товары для всех видов животных
          </p>

          <div className="flex gap-4">
            <button className="bg-white text-[#007FAF] px-8 py-4 rounded-2xl hover:bg-[#E6F7FB] transition-all">
              Смотреть каталог
            </button>

            <button className="bg-white/20 text-white px-8 py-4 rounded-2xl border border-white hover:bg-white/30 transition-all">
              Связаться с нами
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}