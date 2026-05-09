import { strapiApiUrl } from "../config/catalog";

type ReviewPayload = {
  name: string;
  rating: number;
  message: string;
};

export type PublishedReview = {
  id: string;
  name: string;
  rating: number;
  message: string;
  createdAt: string;
};

const MONTHS = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
] as const;

function formatReviewDate(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export async function submitReview(payload: ReviewPayload): Promise<void> {
  const response = await fetch(`${strapiApiUrl}/api/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ data: payload }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Review submit failed: ${response.status} ${body}`);
  }
}

export async function getPublishedReviews(): Promise<PublishedReview[]> {
  const response = await fetch(
    `${strapiApiUrl}/api/reviews?sort=publishedAt:desc&pagination[pageSize]=20`,
    { headers: { Accept: "application/json" } },
  );

  if (!response.ok) {
    throw new Error(`Reviews fetch failed: ${response.status}`);
  }

  const json: unknown = await response.json();
  const items = Array.isArray((json as { data?: unknown }).data)
    ? (json as { data: unknown[] }).data
    : [];

  return items.flatMap((item) => {
    if (typeof item !== "object" || item === null) return [];
    const r = item as Record<string, unknown>;
    const id = String(r.documentId ?? r.id ?? "");
    const name = typeof r.name === "string" ? r.name : "";
    const rating = typeof r.rating === "number" ? r.rating : 0;
    const message = typeof r.message === "string" ? r.message : "";
    const publishedAt = typeof r.publishedAt === "string" ? r.publishedAt : "";
    if (!id || !name || !message) return [];
    return [{ id, name, rating, message, createdAt: formatReviewDate(publishedAt) }];
  });
}
