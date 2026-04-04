const API_BASE = "https://atlantida52.ru/wp-json/wc/store/v1";

export async function fetchWooProducts(categoryId?: number) {
  const url = new URL(`${API_BASE}/products`);

  if (categoryId) {
    url.searchParams.set("category", String(categoryId));
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: "Basic ТВОЙ_ТОКЕН_ИЛИ_ЧЕРЕЗ_PROXY",
    },
  });

  if (!response.ok) {
    throw new Error("Не удалось загрузить товары");
  }

  return response.json();
}

export async function fetchWooCategories() {
  const url = new URL(`${API_BASE}/products/categories`);
  url.searchParams.set("hide_empty", "true");
  url.searchParams.set("per_page", "100");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: "Basic ТВОЙ_ТОКЕН_ИЛИ_ЧЕРЕЗ_PROXY",
    },
  });

  if (!response.ok) {
    throw new Error("Не удалось загрузить категории");
  }

  return response.json();
}