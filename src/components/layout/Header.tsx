export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-[#0E3A69] text-2xl">Атлантида</h1>
          <p className="text-[#586174] text-sm">
            Зоомагазин и аквариумистика
          </p>
        </div>

        <nav className="hidden md:flex gap-6 text-[#586174]">
          <span className="hover:text-[#00AEEF] cursor-pointer">Главная</span>
          <span className="hover:text-[#00AEEF] cursor-pointer">Каталог</span>
          <span className="hover:text-[#00AEEF] cursor-pointer">О нас</span>
          <span className="hover:text-[#00AEEF] cursor-pointer">Контакты</span>
        </nav>
      </div>
    </header>
  );
}