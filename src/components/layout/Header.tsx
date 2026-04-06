import { NavLink } from "react-router-dom";

export default function Header() {
  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    `hover:text-[#00AEEF] ${isActive ? "text-[#00AEEF]" : ""}`;

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
          <NavLink to="/" className={linkClassName} end>
            Главная
          </NavLink>
          <NavLink to="/catalog" className={linkClassName}>
            Каталог
          </NavLink>
          <NavLink to="/about" className={linkClassName}>
            О нас
          </NavLink>
          <NavLink to="/contact" className={linkClassName}>
            Контакты
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
