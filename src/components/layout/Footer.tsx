import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCatalogCategories } from "../../services/catalog.service";
import type { CatalogCategory } from "../../types/catalog";

type FooterNavItem = {
  label: string;
  to?: string;
};

const COMPANY_LINKS: FooterNavItem[] = [
  { label: "О нас", to: "/about" },
  { label: "Отзывы" },
  { label: "Контакты", to: "/contact" },
  { label: "Избранное" },
];

function FooterLink({ item }: { item: FooterNavItem }) {
  if (!item.to) {
    return <span className="text-sm leading-6 text-white/55">{item.label}</span>;
  }

  return (
    <Link
      to={item.to}
      className="text-sm leading-6 text-white/72 transition-colors duration-200 hover:text-[#8BD0F4]"
    >
      {item.label}
    </Link>
  );
}

export default function Footer() {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const data = await getCatalogCategories();

        if (isMounted) {
          setCategories(data);
        }
      } catch (error) {
        console.error("[Footer] Failed to load catalog categories", error);
      }
    }

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const footerCatalogLinks = useMemo(() => {
    return categories
      .filter((category) => category.parent === 0)
      .sort((firstCategory, secondCategory) => {
        const firstCount = firstCategory.count ?? 0;
        const secondCount = secondCategory.count ?? 0;

        if (secondCount !== firstCount) {
          return secondCount - firstCount;
        }

        return firstCategory.name.localeCompare(secondCategory.name, "ru");
      })
      .slice(0, 6)
      .map((category) => ({
        label: category.name,
        to: `/catalog/category/${category.id}`,
      }));
  }, [categories]);

  const hasCatalogLinks = footerCatalogLinks.length > 0;

  return (
    <footer className="mt-16 bg-[#0E3A69] text-white" aria-label="Подвал сайта">
      <div className="mx-auto w-full max-w-[1240px] px-6 py-10 md:px-8 md:py-11">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8">
          <div className="max-w-[280px]">
            <h2 className="text-[22px] font-semibold leading-tight text-white">Атлантида</h2>
            <p className="mt-3 text-sm leading-6 text-white/68">
              Зоомагазин и аквариумистика
            </p>
          </div>

          <nav aria-labelledby="footer-catalog-title">
            <h3
              id="footer-catalog-title"
              className="text-sm font-semibold uppercase tracking-[0.08em] text-white/92"
            >
              Каталог
            </h3>
            <ul className="mt-4 space-y-2.5">
              {hasCatalogLinks ? (
                footerCatalogLinks.map((item) => (
                  <li key={item.to}>
                    <FooterLink item={item} />
                  </li>
                ))
              ) : (
                <li>
                  <FooterLink item={{ label: "Перейти в каталог", to: "/catalog" }} />
                </li>
              )}
            </ul>
          </nav>

          <nav aria-labelledby="footer-company-title">
            <h3
              id="footer-company-title"
              className="text-sm font-semibold uppercase tracking-[0.08em] text-white/92"
            >
              Компания
            </h3>
            <ul className="mt-4 space-y-2.5">
              {COMPANY_LINKS.map((item) => (
                <li key={item.label}>
                  <FooterLink item={item} />
                </li>
              ))}
            </ul>
          </nav>

          <address className="not-italic">
            <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-white/92">
              Контакты
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="tel:+79625046096"
                  className="text-sm leading-6 text-white/72 transition-colors duration-200 hover:text-[#8BD0F4]"
                >
                  +7 (962) 504-60-96
                </a>
              </li>
              <li>
                <a
                  href="mailto:gagin645@yandex.ru"
                  className="text-sm leading-6 text-white/72 transition-colors duration-200 hover:text-[#8BD0F4]"
                >
                  gagin645@yandex.ru
                </a>
              </li>
              <li className="text-sm leading-6 text-white/60">
                Нижний Новгород, ул. Коминтерна, 117
                <br />
                Универмаг "Сормовские Зори"
                <br />
                1 этаж, левое крыло
              </li>
            </ul>
          </address>
        </div>

        <div className="mt-8 border-t border-white/14 pt-4">
          <p className="text-center text-sm leading-6 text-white/58">
            © 2026 Атлантида. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
}
