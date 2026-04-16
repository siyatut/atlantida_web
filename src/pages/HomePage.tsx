import type { ComponentType, SVGProps } from "react";
import { Link } from "react-router-dom";
import CatIcon from "../assets/icons_category/cat.svg?react";
import FishIcon from "../assets/icons_category/fish.svg?react";
import HomeHashLink from "../components/navigation/HomeHashLink";

type AboutHighlight = {
  title: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

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

function DeliveryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path
        d="M3.5 7.5A1.5 1.5 0 0 1 5 6h9.5A1.5 1.5 0 0 1 16 7.5v7A1.5 1.5 0 0 1 14.5 16H5A1.5 1.5 0 0 1 3.5 14.5v-7Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 9.5h2.3a1.5 1.5 0 0 1 1.2.6l1.4 1.9c.2.3.3.6.3 1v1.5A1.5 1.5 0 0 1 19.7 16H16V9.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="16.5" r="1.5" />
      <circle cx="18" cy="16.5" r="1.5" />
    </svg>
  );
}

const ABOUT_HIGHLIGHTS: AboutHighlight[] = [
  {
    title: "12 лет опыта",
    description:
      "С 2014 года помогаем владельцам питомцев подбирать товары для ежедневного ухода и комфортной жизни животных.",
    Icon: ExperienceIcon,
  },
  {
    title: "Большой ассортимент",
    description:
      "В одном месте собраны корма, аксессуары, товары для ухода и всё необходимое для аквариумистики.",
    Icon: AssortmentIcon,
  },
  {
    title: "Бесплатная доставка",
    description:
      "При покупке аквариума от 10 000 ₽ бесплатно доставим заказ до вашего дома.",
    Icon: DeliveryIcon,
  },
  {
    title: "Консультации по выбору",
    description:
      "Подскажем по рациону, уходу за питомцем и оснащению аквариума, если нужно подобрать подходящее решение.",
    Icon: ExpertsIcon,
  },
];

export default function HomePage() {
  return (
    <main className="bg-white pb-20 md:pb-24">
      <section className="px-6 pb-14 pt-16 md:px-8 md:pb-20 md:pt-[96px]">
        <div className="mx-auto grid max-w-[1240px] gap-8 overflow-hidden rounded-[32px] border border-[#B8DEF2] bg-gradient-to-br from-[#EEF8FD] via-[#E1F2FB] to-[#D3EAF7] px-7 py-8 shadow-[0_10px_30px_rgba(36,73,124,0.06)] md:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] md:px-10 md:py-11">
          <div className="max-w-[640px]">
            <h1 className="text-4xl font-semibold leading-tight text-[#234579] md:text-[46px]">
              Всё для комфортной жизни ваших питомцев
            </h1>

            <p className="mt-5 max-w-[580px] text-base leading-7 text-[#68758A] md:text-lg">
              Зоомагазин «Атлантида» уже 12 лет помогает подбирать корма, аквариумы, оборудование,
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
              <HomeHashLink
                hash="#contacts"
                className="inline-flex items-center justify-center rounded-2xl border border-[#B7DBEE] bg-white/80 px-6 py-3.5 text-sm font-medium text-[#2C5C8E] transition-colors duration-200 hover:bg-white"
              >
                Связаться с нами
              </HomeHashLink>
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
                <HomeHashLink
                  hash="#about"
                  className="inline-flex items-center text-sm font-medium text-[#4BADE8] transition-colors duration-200 hover:text-[#2F84BF]"
                >
                  Подробнее о магазине →
                </HomeHashLink>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="bg-white px-6 pb-16 pt-14 md:px-8 md:pb-20 md:pt-[72px]"
      >
        <div className="mx-auto grid max-w-[1240px] gap-10 md:grid-cols-[minmax(0,540px)_minmax(320px,1fr)] xl:gap-14">
          <div className="flex max-w-[520px] flex-col items-start">
            <h2 className="text-3xl font-semibold leading-snug text-[#234579]">О магазине</h2>
            <p className="mt-4 w-full text-base leading-7 text-[#6B778B]">
              «Атлантида» — магазин для тех, кто заботится о питомцах каждый день. Мы работаем с
              2014 года и помогаем подбирать товары для рыбок, кошек, собак, птиц, грызунов и
              рептилий.
            </p>
            <p className="mt-4 w-full text-base leading-7 text-[#6B778B]">
              У нас можно найти как повседневные товары для ухода и кормления, так и всё
              необходимое для аквариумистики: оборудование, декор, рыбок, растения и
              расходные материалы.
            </p>
            <p className="mt-4 w-full text-base leading-7 text-[#6B778B]">
              Нам важно, чтобы выбор был понятным, а консультации действительно помогали.
            </p>
            <p className="mt-8 w-full border-l-4 border-[#8CCDEA] bg-[#F6FBFE] px-4 py-3 text-sm leading-6 text-[#2C5C8E]">
              Собрали всё самое важное, чтобы вам было легко и спокойно заботиться о питомцах.
            </p>
            <Link
              to="/reviews"
              className="mt-5 inline-flex items-center text-sm font-medium text-[#4BADE8] transition-colors duration-200 hover:text-[#2F84BF]"
            >
              Смотреть отзывы →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {ABOUT_HIGHLIGHTS.map(({ title, description, Icon }) => (
              <article
                key={title}
                className="flex h-full flex-col rounded-[24px] border border-[#BCE1F1] bg-[#EAF7FD] px-5 pb-6 pt-5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#4297D1] text-white shadow-[0_8px_16px_rgba(47,132,191,0.2)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-semibold leading-snug text-[#394452]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#68758A]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contacts" className="bg-white px-6 pb-14 pt-12 md:px-8 md:pb-16 md:pt-14">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold leading-snug text-[#234579]">Контакты</h2>
            <p className="mx-auto mt-3 max-w-[660px] text-base leading-7 text-[#6B778B]">
              Если нужна консультация, напишите нам через форму или свяжитесь напрямую.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_380px]">
            <section className="rounded-[28px] border border-[#BCE1F1] bg-[#F6FBFE] p-5 md:p-6">
              <h3 className="text-2xl font-semibold leading-snug text-[#394452]">Напишите нам</h3>
              <p className="mt-3 max-w-[560px] text-base leading-7 text-[#6B778B]">
                Оставьте сообщение, и мы свяжемся с вами по вопросам ассортимента, аквариумистики,
                доставки и подбора товаров.
              </p>

              <form className="mt-6 grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-[#5B6880]">Имя</span>
                  <input
                    type="text"
                    placeholder="Как к вам обращаться"
                    className="rounded-2xl border border-[#CBE3F1] bg-white px-4 py-2.5 text-sm text-[#394452] outline-none transition-colors placeholder:text-[#9AA7BA] focus:border-[#7FC4E7]"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-[#5B6880]">Телефон</span>
                  <input
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    className="rounded-2xl border border-[#CBE3F1] bg-white px-4 py-2.5 text-sm text-[#394452] outline-none transition-colors placeholder:text-[#9AA7BA] focus:border-[#7FC4E7]"
                  />
                </label>
                <label className="flex flex-col gap-1.5 md:col-span-2">
                  <span className="text-sm font-medium text-[#5B6880]">E-mail</span>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="rounded-2xl border border-[#CBE3F1] bg-white px-4 py-2.5 text-sm text-[#394452] outline-none transition-colors placeholder:text-[#9AA7BA] focus:border-[#7FC4E7]"
                  />
                </label>
                <label className="flex flex-col gap-1.5 md:col-span-2">
                  <span className="text-sm font-medium text-[#5B6880]">Сообщение</span>
                  <textarea
                    placeholder="Расскажите, что вы ищете или по какому вопросу хотите получить консультацию"
                    rows={4}
                    className="resize-none rounded-2xl border border-[#CBE3F1] bg-white px-4 py-2.5 text-sm leading-6 text-[#394452] outline-none transition-colors placeholder:text-[#9AA7BA] focus:border-[#7FC4E7]"
                  />
                </label>
                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-2xl bg-[#2F84BF] px-6 py-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#256EAC]"
                  >
                    Отправить сообщение
                  </button>
                </div>
              </form>
            </section>

            <aside className="rounded-[28px] border border-[#BCE1F1] bg-[#EAF7FD] p-5 md:p-6">
              <h3 className="text-2xl font-semibold leading-snug text-[#394452]">Как связаться</h3>
              <ul className="mt-6 space-y-5">
                <li>
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#4A9ED5]">
                    Телефон
                  </p>
                  <a
                    href="tel:+79625046096"
                    className="mt-2 inline-block text-lg font-medium text-[#2C5C8E] transition-colors hover:text-[#2F84BF]"
                  >
                    +7 (962) 504-60-96
                  </a>
                </li>
                <li>
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#4A9ED5]">
                    E-mail
                  </p>
                  <a
                    href="mailto:gagin645@yandex.ru"
                    className="mt-2 inline-block text-lg font-medium text-[#2C5C8E] transition-colors hover:text-[#2F84BF]"
                  >
                    gagin645@yandex.ru
                  </a>
                </li>
                <li>
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#4A9ED5]">
                    Адрес
                  </p>
                  <p className="mt-2 text-base leading-7 text-[#6B778B]">
                    Нижний Новгород, ул. Коминтерна, 117
                    <br />
                    Универмаг "Сормовские Зори"
                    <br />
                    1 этаж, левое крыло
                  </p>
                </li>
                <li>
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[#4A9ED5]">
                    Режим работы
                  </p>
                  <p className="mt-2 text-base leading-7 text-[#6B778B]">
                    Ежедневно
                    <br />
                    с 10:00 до 21:00
                  </p>
                </li>
              </ul>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
