import { NavLink } from "react-router-dom";

export default function Header() {
  const linkClassName = ({ isActive }: { isActive: boolean }) =>
    `text-base font-medium leading-none transition-colors hover:text-[#4BADE8] ${
      isActive ? "text-[#4BADE8]" : "text-[#6B7487]"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-[#DBE1E8] bg-white">
      <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-6 py-3">
        <div className="leading-tight">
          <h1 className="text-2xl font-semibold leading-tight text-[#24497C]">Атлантида</h1>
          <p className="text-xs font-medium leading-tight text-[#6A768A]">
            Зоомагазин и аквариумистика
          </p>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
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

        <div className="hidden items-center gap-4 text-[#2F84BF] md:flex">
          <span className="flex h-8 w-8 items-center justify-center text-lg leading-none">♡</span>
          <span className="flex h-8 w-8 items-center justify-center text-lg leading-none">📞</span>
          <span className="text-sm font-medium leading-none">+7 (800) 123-45-67</span>
        </div>
      </div>
    </header>
  );
}
