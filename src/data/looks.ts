// Looks complets proposés sur les fiches produit (ids du catalogue)
export interface Look {
  id: string;
  name: string;
  tagline: string;
  productIds: string[];
}

export const LOOKS: Look[] = [
  {
    id: "lundi-en-mission",
    name: "Lundi en mission",
    tagline: "Le look sobre pour arriver chez le client, ordinateur sous le bras.",
    productIds: ["3", "7", "8", "9"],
  },
  {
    id: "week-end-exalt",
    name: "Week-end eXalt",
    tagline: "Hoodie, t-shirt et casquette : le confort aux couleurs de la maison.",
    productIds: ["1", "2", "5", "6"],
  },
  {
    id: "pink-edition",
    name: "Pink Edition",
    tagline: "Toute la touche rose de la boutique, de la tête au tote bag.",
    productIds: ["17", "14", "6", "12"],
  },
  {
    id: "seminaire",
    name: "Séminaire",
    tagline: "De la plénière à la pause café, tout ce qu'il faut pour la journée.",
    productIds: ["4", "18", "11", "10", "9"],
  },
  {
    id: "collector",
    name: "Collector",
    tagline: "Les pièces en édition limitée, pour ceux qui les veulent toutes.",
    productIds: ["13", "16", "15"],
  },
];

export const getLooksForProduct = (productId: string) =>
  LOOKS.filter((look) => look.productIds.includes(productId));
