import { formatCategoryName } from "../utils/formatCategoryName";
import { getSubcategory } from "../utils/subcategories";

const SUBTITLES: Record<string, string> = {
  clothing: "Hoodies, t-shirts et polos aux couleurs de la maison.",
  accessories: "Le quotidien en mission, version eXalt.",
  stationery: "Pour prendre des notes qui comptent.",
  "limited-edition": "Des pièces rares, en quantité limitée.",
};

const ShopBanner = ({ category, subcategory }: { category: string; subcategory?: string }) => {
  const sub = getSubcategory(subcategory);
  return (
    <div className="bg-gradient-to-r from-exaltNavy to-exaltNavyLight text-white rounded-3xl px-10 py-14 mx-5 mt-6 mb-10 max-sm:px-6 max-sm:py-10 max-[400px]:mx-3">
      <p className="text-exaltYellow text-sm font-semibold uppercase tracking-[0.2em] mb-2">
        Boutique
      </p>
      <h1 className="font-display text-5xl font-bold max-sm:text-3xl">
        {sub ? sub.label : category ? formatCategoryName(category) : "Toute la boutique"}
      </h1>
      <p className="text-white/80 mt-3">
        {sub ? "Notre sélection de vêtements eXalt." : category ? SUBTITLES[category] ?? "" : "Tous les goodies officiels eXalt, au même endroit."}
      </p>
    </div>
  );
};
export default ShopBanner;
