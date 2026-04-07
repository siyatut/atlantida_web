export type CatalogProductCategory = {
  id: string;
  name: string;
  slug: string;
};

export type CatalogProduct = {
  id: string;
  title: string;
  slug: string | null;
  price: string | null;
  regularPrice: string | null;
  salePrice: string | null;
  priceCurrencySuffix: string | null;
  category: string | null;
  categories: CatalogProductCategory[];
  image: string | null;
  images: string[];
  shortDescription: string | null;
  description: string | null;
  permalink: string | null;
};

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  count: number | null;
  parent: number;
  image: string | null;
};
