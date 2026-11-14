import { herbal } from './config';

export { herbal };
export const products = herbal.products;
export const categories = herbal.cats;

export const getProduct = (id: string) => herbal.products.find((p) => p.id === id);
export const getCategory = (slug: string) => herbal.cats.find((c) => c.slug === slug);

/** Case-insensitive match on name, description and category name. */
export function searchProducts(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const catName = (slug: string) => herbal.cats.find((c) => c.slug === slug)?.name ?? '';
  return herbal.products.filter((p) => `${p.name} ${p.desc} ${catName(p.cat)}`.toLowerCase().includes(q));
}
