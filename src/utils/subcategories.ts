// Sous-catégories du rayon Vêtements, déduites du nom des produits
export const CLOTHING_SUBCATEGORIES: { slug: string; label: string; keywords: string[] }[] = [
  { slug: "t-shirts", label: "T-shirts", keywords: ["t-shirt"] },
  { slug: "sweats", label: "Sweats & hoodies", keywords: ["sweatshirt", "hoodie"] },
  { slug: "polos", label: "Polos", keywords: ["polo"] },
  { slug: "casquettes", label: "Casquettes", keywords: ["cap"] },
];

export const getSubcategory = (slug?: string | null) =>
  CLOTHING_SUBCATEGORIES.find((sub) => sub.slug === slug);

export const matchesSubcategory = (title: string, slug: string) => {
  const sub = getSubcategory(slug);
  if (!sub) return true;
  const words = title.toLowerCase().split(/[^a-z0-9-]+/);
  return sub.keywords.some((keyword) => words.includes(keyword));
};
