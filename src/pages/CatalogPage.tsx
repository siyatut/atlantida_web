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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim() !== "") {
    return error.message;
  }

  return "Не удалось загрузить категории.";
}

function getCategoryDescription(description: string | null): string {
  if (!description) {
    return "Исследуйте подборку товаров в этой категории.";
  }

  const plainText = description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plainText !== "" ? plainText : "Исследуйте подборку товаров в этой категории.";
}

function getSubcategoryLabel(count: number): string {
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "подкатегорий";
  }

  const lastDigit = count % 10;

  if (lastDigit === 1) {
    return "подкатегория";
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return "подкатегории";
  }

  return "подкатегорий";
}

type CategoryIcon = ComponentType<SVGProps<SVGSVGElement>>;

const CATEGORY_PRESENTATION_BY_SLUG: Record<string, { description: string; Icon: CategoryIcon }> = {
  rybki: {
    description: "Корма, аксессуары и все необходимое для ухода за аквариумными рыбками.",
    Icon: FishIcon,
  },
  gryzuny: {
    description: "Товары для грызунов: питание, наполнители, клетки и уход.",
    Icon: MouseIcon,
  },
  koshki: {
    description: "Подборка кормов, игрушек и аксессуаров для комфортной жизни.",
    Icon: CatIcon,
  },
  sobaki: {
    description: "Все для собак: корма, игрушки, товары для прогулок и ухода.",
    Icon: DogIcon,
  },
  pticzy: {
    description: "Клетки, корма и аксессуары для птиц и заботы о них каждый день.",
    Icon: BirdIcon,
  },
  reptilii: {
    description: "Террариумы, лампы, корма и аксессуары для содержания рептилий.",
    Icon: ReptileIcon,
  },
};

function CatalogPage() {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const childCountByParentId = useMemo(() => {
    return categories.reduce<Record<string, number>>((accumulator, category) => {
      if (category.parent > 0) {
        const parentId = String(category.parent);
        accumulator[parentId] = (accumulator[parentId] ?? 0) + 1;
      }

      return accumulator;
    }, {});
  }, [categories]);

  const rootCategories = useMemo(
    () => categories.filter((category) => category.parent === 0),
    [categories],
  );

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
        console.error("[CatalogPage] Failed to load categories", loadError);

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

  return (
    <main className="px-6 py-12 md:px-8 md:py-16">
      <div className="mx-auto max-w-[1240px]">
        <h1 className="mb-3 text-3xl font-semibold leading-snug text-[#234579]">Каталог товаров</h1>
        <p className="mb-10 text-base leading-snug text-[#6B778B]">
          Выберите категорию для просмотра товаров
        </p>

        {isLoading ? <p className="text-base text-[#6B778B]">Загрузка категорий...</p> : null}

        {error ? <p className="text-base text-[#8E4C4C]">{error}</p> : null}

        {!isLoading && !error ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {rootCategories.map((category) => {
            const childCount = childCountByParentId[category.id] ?? 0;
            const presentation = CATEGORY_PRESENTATION_BY_SLUG[category.slug];
            const description = presentation?.description ?? getCategoryDescription(category.description);
            const Icon = presentation?.Icon;

            return (
              <Link to={`/catalog/category/${category.id}`} key={category.id}>
                <article className="group flex h-[180px] items-start gap-4 rounded-[24px] border border-[#BCE1F1] bg-[#F6F9FC] p-6 transition-all duration-300 hover:bg-white hover:shadow-sm">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#CBEAF6] text-2xl text-[#2F84BF] transition-colors duration-300 group-hover:text-[#1E6FA8]">
                    {Icon ? <Icon className="h-8 w-8 transition-all duration-300 group-hover:scale-110" /> : null}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between self-stretch">
                    <div>
                      <h2 className="mb-2 text-xl font-semibold leading-snug text-[#394452]">
                        {category.name}
                      </h2>
                      <p className="line-clamp-3 text-sm leading-snug text-[#68758A]">
                        {description}
                      </p>
                    </div>
                    <p className="pt-2 text-sm font-medium text-[#4BADE8]">
                      {childCount} {getSubcategoryLabel(childCount)} →
                    </p>
                  </div>
                </article>
              </Link>
            );
          })}
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default CatalogPage;
