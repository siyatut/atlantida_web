import type { ComponentType, SVGProps } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BirdIcon from "../assets/icons_category/bird.svg?react";
import CatIcon from "../assets/icons_category/cat.svg?react";
import DogIcon from "../assets/icons_category/dog.svg?react";
import FishIcon from "../assets/icons_category/fish.svg?react";
import MouseIcon from "../assets/icons_category/mouse.svg?react";
import ReptileIcon from "../assets/icons_category/reptile.svg?react";
import { getCatalogCategories } from "../services/catalog.service";
import type { CatalogCategory } from "../types/catalog";

type CategoryIcon = ComponentType<SVGProps<SVGSVGElement>>;

type CategoryPresentation = {
  description: string;
  shortDescription: string;
  Icon: CategoryIcon;
};

type Benefit = {
  title: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return "Не удалось загрузить категории.";
}

function getCategoryDescription(description: string | null): string {
  if (!description) {
    return "Подберём всё необходимое для ухода, кормления и комфортной жизни питомца.";
  }

  const plainText = description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plainText !== "" ? plainText : "Подберём всё необходимое для ухода и заботы.";
}

const CATEGORY_PRESENTATION_BY_SLUG: Record<string, CategoryPresentation> = {
  rybki: {
    description: "Корма, оборудование и аксессуары для аквариумов и ухода.",
    shortDescription: "Рыбки, аквариумы и всё для них",
    Icon: FishIcon,
  },
  gryzuny: {
    description: "Корма, наполнители, клетки и всё для ежедневного ухода за грызунами.",
    shortDescription: "Хомяки, крысы, морские свинки",
    Icon: MouseIcon,
  },
  koshki: {
    description: "Корма, игрушки, наполнители и полезные аксессуары для комфортной жизни кошек.",
    shortDescription: "Всё необходимое для котов",
    Icon: CatIcon,
  },
  sobaki: {
    description:
      "Товары для прогулок, кормления, ухода и активной жизни вашего четвероногого друга.",
    shortDescription: "Товары для четвероногих друзей",
    Icon: DogIcon,
  },
  pticzy: {
    description:
      "Клетки, корма и аксессуары для птиц, чтобы ежедневный уход не доставлял хлопот.",
    shortDescription: "Корма, клетки и аксессуары",
    Icon: BirdIcon,
  },
  reptilii: {
    description: "Террариумы, освещение, корма и аксессуары для содержания рептилий.",
    shortDescription: "Террариумы, лампы и уход",
    Icon: ReptileIcon,
  },
};

function DeliveryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.8V12l2.8 2.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExpertsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path
        d="M8.5 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 18a4 4 0 0 1 8 0M11.5 18a4 4 0 0 1 8 0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AssortmentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path
        d="M7.5 8V6.8A2.8 2.8 0 0 1 10.3 4h3.4a2.8 2.8 0 0 1 2.8 2.8V8"
        strokeLinecap="round"
      />
      <path
        d="M5.5 8h13a1 1 0 0 1 1 1v8.2a1.8 1.8 0 0 1-1.8 1.8H6.3a1.8 1.8 0 0 1-1.8-1.8V9a1 1 0 0 1 1-1Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PriceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="12" cy="12" r="8" />
      <path
        d="M14.8 9.2c-.5-.8-1.5-1.2-2.8-1.2-1.7 0-2.8.8-2.8 2 0 1 .7 1.6 2.3 2l1 .3c1.6.4 2.4 1.1 2.4 2.2 0 1.4-1.2 2.3-3.1 2.3-1.4 0-2.5-.4-3.2-1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 7v10" strokeLinecap="round" />
    </svg>
  );
}

function ExperienceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="m7.5 12 3 3 6-6" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M12 4.5 6.5 6.7v4.9c0 3.5 2.1 6.7 5.5 8 3.4-1.3 5.5-4.5 5.5-8V6.7L12 4.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const BENEFITS: Benefit[] = [
  {
    title: "Большой ассортимент",
    description:
      "Товары для собак, кошек, грызунов, птиц, рептилий и рыбок — всё необходимое в одном магазине.",
    Icon: AssortmentIcon,
  },
  {
    title: "Аквариумы и оборудование",
    description:
      "В наличии аквариумы, грунт, растения, фильтры, нагреватели, освещение и другие товары для аквариумистики.",
    Icon: FishIcon,
  },
  {
    title: "Корма для животных",
    description:
      "Широкий выбор кормов для разных видов животных, пород и возрастов — для ежедневного рациона и заботы о здоровье.",
    Icon: PriceIcon,
  },
  {
    title: "Профессионалы своего дела",
    description:
      "Помогаем с выбором товаров и подсказываем по уходу, кормлению и содержанию питомцев.",
    Icon: ExpertsIcon,
  },
  {
    title: "Доступные цены",
    description:
      "Поддерживаем приятные цены и стараемся предлагать действительно выгодные решения.",
    Icon: DeliveryIcon,
  },
  {
    title: "11 лет опыта",
    description:
      "С 2015 года помогаем владельцам питомцев находить подходящие товары для комфортной и здоровой жизни животных.",
    Icon: ExperienceIcon,
  },
];

export default function HomePage() {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getCatalogCategories();

        if (isMounted) {
          setCategories(data);
        }
      } catch (loadError) {
        console.error("[HomePage] Failed to load categories", loadError);

        if (isMounted) {
          setError(getErrorMessage(loadError));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const rootCategories = useMemo(() => {
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
      .slice(0, 6);
  }, [categories]);

  return (
    <main className="bg-white pb-20 md:pb-24">
      <section className="px-6 pb-10 pt-10 md:px-8 md:pb-14 md:pt-14">
        <div className="mx-auto grid max-w-[1240px] gap-8 overflow-hidden rounded-[32px] border border-[#B8DEF2] bg-gradient-to-br from-[#EEF8FD] via-[#E1F2FB] to-[#D3EAF7] px-7 py-8 shadow-[0_10px_30px_rgba(36,73,124,0.06)] md:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] md:px-10 md:py-11">
          <div className="max-w-[640px]">
            <h1 className="text-4xl font-semibold leading-tight text-[#234579] md:text-[46px]">
              Всё для комфортной жизни ваших питомцев
            </h1>

            <p className="mt-5 max-w-[580px] text-base leading-7 text-[#68758A] md:text-lg">
              Зоомагазин «Атлантида» уже 11 лет помогает подбирать корма, аквариумы, оборудование,
              аксессуары и товары для ухода.
            </p>

            <p className="mt-4 max-w-[580px] text-base leading-7 text-[#68758A]">
              При покупке аквариума от 10 000 ₽ действует бесплатная доставка.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/catalog"
                className="inline-flex items-center justify-center rounded-2xl bg-[#2F84BF] px-6 py-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#256EAC]"
              >
                Перейти в каталог
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center rounded-2xl border border-[#B7DBEE] bg-white/80 px-6 py-3.5 text-sm font-medium text-[#2C5C8E] transition-colors duration-200 hover:bg-white"
              >
                Связаться с нами
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            <article className="rounded-[26px] border border-[#C7E7F4] bg-white/90 p-5">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D7EEF9] text-[#2F84BF]">
                <FishIcon className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-semibold leading-snug text-[#394452]">Аквариумистика</h2>
              <p className="mt-2 text-sm leading-6 text-[#68758A]">
                Аквариумы, оборудование, грунт, растения и всё необходимое для запуска и ухода.
              </p>
            </article>

            <article className="rounded-[26px] border border-[#C7E7F4] bg-white/90 p-5">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D7EEF9] text-[#2F84BF]">
                <CatIcon className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-semibold leading-snug text-[#394452]">
                Товары для всех ваших любимцев
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#68758A]">
                Корма, лакомства, наполнители, клетки, миски, поводки, игрушки и сопутствующие товары.
              </p>
            </article>

            <article className="rounded-[26px] border border-[#C7E7F4] bg-white/90 p-5 sm:col-span-2 md:col-span-1 lg:col-span-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold leading-snug text-[#394452]">
                    Поможем подобрать нужное
                  </h2>
                  <p className="mt-2 max-w-[440px] text-sm leading-6 text-[#68758A]">
                    Подскажем по рациону, уходу за питомцем и оснащению аквариума.
                  </p>
                </div>
                <Link
                  to="/about"
                  className="inline-flex items-center text-sm font-medium text-[#4BADE8] transition-colors duration-200 hover:text-[#2F84BF]"
                >
                  Подробнее о магазине →
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-[#E7F5FB] px-6 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold leading-snug text-[#234579]">
              Категории товаров
            </h2>
            <p className="mx-auto mt-3 max-w-[620px] text-base leading-7 text-[#6B778B]">
              Выберите нужное направление и перейдите к актуальным категориям магазина.
            </p>
          </div>

          {isLoading ? (
            <p className="text-center text-base text-[#6B778B]">Загрузка категорий...</p>
          ) : null}
          {error ? <p className="text-center text-base text-[#8E4C4C]">{error}</p> : null}

          {!isLoading && !error ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {rootCategories.map((category) => {
                const presentation = CATEGORY_PRESENTATION_BY_SLUG[category.slug];
                const Icon = presentation?.Icon;

                return (
                  <Link
                    key={category.id}
                    to={`/catalog/category/${category.id}`}
                    state={{
                      parentCategoryId: null,
                      parentCategoryName: "Каталог",
                      currentCategoryName: category.name,
                    }}
                  >
                    <article className="group flex h-full min-h-[220px] flex-col items-center rounded-[24px] border border-[#BCE1F1] bg-[#FDFEFE] px-6 py-7 text-center transition-all duration-300 hover:bg-white hover:shadow-sm">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#CBEAF6] text-[#2F84BF] transition-colors duration-300 group-hover:text-[#1E6FA8]">
                        {Icon ? (
                          <Icon className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
                        ) : null}
                      </div>
                      <h3 className="mt-5 text-xl font-semibold leading-snug text-[#394452]">
                        {category.name}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-[#68758A]">
                        {presentation?.shortDescription ??
                          getCategoryDescription(category.description)}
                      </p>
                      <span className="mt-5 text-sm font-medium text-[#4BADE8]">
                        Смотреть товары →
                      </span>
                    </article>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      <section className="bg-white px-6 pb-0 pt-12 md:px-8 md:pt-16">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-semibold leading-snug text-[#234579]">
              Почему выбирают нас
            </h2>
            <p className="mx-auto mt-3 max-w-[660px] text-base leading-7 text-[#6B778B]">
              Предлагаем большой выбор зоотоваров и товаров для аквариумистики, которые помогают
              сделать жизнь питомцев комфортнее.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {BENEFITS.map(({ title, description, Icon }) => (
              <article
                key={title}
                className="flex h-full flex-col rounded-[24px] border border-[#BCE1F1] bg-[#EAF7FD] px-6 py-5"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4297D1] text-white shadow-[0_8px_16px_rgba(47,132,191,0.2)]">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="mt-5 min-h-[40px]">
                  <h3 className="text-lg font-semibold leading-snug text-[#394452] md:text-[22px]">
                    {title}
                  </h3>
                </div>
                <p className="mt-2 text-base leading-7 text-[#6B778B]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
