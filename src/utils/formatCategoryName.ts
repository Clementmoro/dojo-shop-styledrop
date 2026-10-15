const CATEGORY_LABELS: Record<string, string> = {
  clothing: "Vêtements",
  accessories: "Accessoires",
  stationery: "Papeterie",
  "limited-edition": "Édition limitée",
  surprise: "Surprise",
};

export const formatCategoryName = (category: string) => {
  if (CATEGORY_LABELS[category]) return CATEGORY_LABELS[category];
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
