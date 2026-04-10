import { Link, useLocation } from "react-router-dom";
import webLogo from "../../assets/web_logo.png";

export default function Header() {
  const location = useLocation();

  function getLinkClassName(isActive: boolean): string {
    return `text-base font-medium leading-none transition-colors hover:text-[#4BADE8] ${
      isActive ? "text-[#4BADE8]" : "text-[#6B7487]"
    }`;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#DBE1E8] bg-white">
      <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-6 py-3 md:px-8">
        <Link to="/" className="flex w-[320px] items-center gap-3">
          <img
            src={webLogo}
            alt="Атлантида"
            className="-ml-10 h-12 w-12 shrink-0 object-contain"
          />

          <div className="min-w-0 leading-tight">
            <h1 className="text-2xl font-semibold leading-tight text-[#24497C]">
              Атлантида
            </h1>
            <p className="text-xs font-medium leading-tight text-[#6A768A]">
              Зоомагазин и аквариумистика
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className={getLinkClassName(location.pathname === "/" && location.hash === "")}>
            Главная
          </Link>
          <Link to="/catalog" className={getLinkClassName(location.pathname.startsWith("/catalog"))}>
            Каталог
          </Link>
          <Link to="/#about" className={getLinkClassName(location.pathname === "/" && location.hash === "#about")}>
            О нас
          </Link>
          <Link to="/reviews" className={getLinkClassName(location.pathname === "/reviews")}>
            Отзывы
          </Link>
          <Link
            to="/#contacts"
            className={getLinkClassName(location.pathname === "/" && location.hash === "#contacts")}
          >
            Контакты
          </Link>
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
