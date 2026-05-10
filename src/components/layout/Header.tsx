import type { MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import webLogo from "../../assets/web_logo.png";
import HomeHashLink from "../navigation/HomeHashLink";

export default function Header() {
  const location = useLocation();

  function handleHomeClick(event: MouseEvent<HTMLAnchorElement>) {
    if (location.pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function getLinkClassName(isActive: boolean): string {
    return `text-base font-medium leading-none transition-colors hover:text-[#4BADE8] ${
      isActive ? "text-[#4BADE8]" : "text-[#6B7487]"
    }`;
  }

  return (
    <header data-site-header className="sticky top-0 z-50 border-b border-[#DBE1E8] bg-white">
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
          <Link to="/" onClick={handleHomeClick} className={getLinkClassName(location.pathname === "/" && location.hash === "")}>
            Главная
          </Link>
          <Link to="/catalog" className={getLinkClassName(location.pathname.startsWith("/catalog"))}>
            Каталог
          </Link>
          <HomeHashLink
            hash="#about"
            className={getLinkClassName(location.pathname === "/" && location.hash === "#about")}
          >
            О нас
          </HomeHashLink>
          <Link to="/reviews" className={getLinkClassName(location.pathname === "/reviews")}>
            Отзывы
          </Link>
          <HomeHashLink
            hash="#contacts"
            className={getLinkClassName(location.pathname === "/" && location.hash === "#contacts")}
          >
            Контакты
          </HomeHashLink>
        </nav>

        <div className="hidden items-center gap-4 text-[#2F84BF] md:flex">
          <Link
            to="/favorites"
            aria-label="Избранное"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DDF0FA] text-[20px] leading-none text-[#2F84BF] transition-all duration-200 hover:scale-[1.04] hover:bg-[#CDE8F6] hover:text-[#256EAC]"
          >
            ♡
          </Link>
          <a
            href="tel:+79625046096"
            className="text-sm font-medium leading-none text-[#2F84BF] transition-colors duration-200 hover:text-[#256EAC] hover:underline underline-offset-4"
          >
            +7 (962) 504-60-96
          </a>
        </div>
      </div>
    </header>
  );
}
