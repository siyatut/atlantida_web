export type CatalogProduct = {
  id: string;
  title: string;
  price: string | null;
  category: string | null;
  image: string | null;
  description: string | null;
  permalink: string | null;
};

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  parent: number;
};