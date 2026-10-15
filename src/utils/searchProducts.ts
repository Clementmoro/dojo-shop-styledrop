// Recherche bilingue français / espagnol.
// Le nom des produits est en anglais : on s'appuie sur un dictionnaire de
// synonymes, la catégorie traduite, puis la description (en français).

// Mot ou expression (sans accents, en minuscules) → identifiants produits.
const SYNONYMS: Record<string, string[]> = {
  // Casquettes
  casquette: ["5", "14"],
  gorra: ["5", "14"],
  gorro: ["5", "14"],
  // Sacs
  sac: ["6", "7", "18"],
  "sac a dos": ["7"],
  sacoche: ["18"],
  tote: ["6"],
  bolso: ["6", "18"],
  bolsa: ["6", "18"],
  mochila: ["7"],
  // Hoodies et sweats
  hoodie: ["1", "13"],
  hoody: ["1", "13"],
  hodie: ["1", "13"],
  capuche: ["1", "13"],
  "sweat a capuche": ["1", "13"],
  sweat: ["4", "1", "13"],
  sweatshirt: ["4", "1", "13"],
  pull: ["4", "1", "13"],
  sudadera: ["4", "1", "13"],
  "sudadera con capucha": ["1", "13"],
  capucha: ["1", "13"],
  jersey: ["4"],
  // T-shirts et polos
  "t shirt": ["2", "16"],
  tshirt: ["2", "16"],
  "tee shirt": ["2", "16"],
  teeshirt: ["2", "16"],
  camiseta: ["2", "16"],
  polo: ["3", "17"],
  // Mug
  tasse: ["11"],
  mug: ["11"],
  gourde: ["11"],
  thermos: ["11"],
  taza: ["11"],
  termo: ["11"],
  botella: ["11"],
  // Papeterie
  carnet: ["9", "15"],
  cahier: ["9", "15"],
  cuaderno: ["9", "15"],
  libreta: ["9", "15"],
  stylo: ["10"],
  boligrafo: ["10"],
  boli: ["10"],
  autocollant: ["12"],
  sticker: ["12"],
  pegatina: ["12"],
  // Housse ordinateur
  housse: ["8"],
  "housse ordinateur": ["8"],
  pochette: ["8"],
  funda: ["8"],
  "funda portatil": ["8"],
  portatil: ["8"],
  ordinateur: ["8", "7"],
  // Couleurs et éditions
  rose: ["14", "17"],
  rosa: ["14", "17"],
  pink: ["14", "17"],
};

// Catégorie → libellés anglais, français et espagnol.
const CATEGORY_TERMS: Record<string, string[]> = {
  clothing: ["clothing", "vetement", "vetements", "ropa"],
  accessories: ["accessories", "accessoire", "accessoires", "accesorio", "accesorios"],
  stationery: ["stationery", "papeterie", "papeleria"],
  "limited-edition": ["limited edition", "edition limitee", "editions limitees", "edicion limitada"],
};

const STOP_WORDS = new Set(["de", "du", "des", "la", "le", "les", "un", "une", "el", "los", "las", "con", "pour", "para", "et", "y"]);

export const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// "casquettes" → "casquette", "pegatinas" → "pegatina"
const singular = (word: string) =>
  word.length > 3 && /[sx]$/.test(word) ? word.slice(0, -1) : word;

const containsPhrase = (haystack: string, phrase: string) =>
  ` ${haystack} `.includes(` ${phrase} `);

export const searchProducts = (products: Product[], query: string): Product[] => {
  const raw = normalize(query);
  if (!raw) return products.filter((p) => !p.hidden);
  const words = raw.split(" ").filter((w) => !STOP_WORDS.has(w));
  const q = words.map(singular).join(" ");

  const scores = new Map<string, number>();
  const add = (id: string, points: number) =>
    scores.set(id, (scores.get(id) || 0) + points);

  // 1. Synonymes : une expression de plusieurs mots compte plus qu'un mot seul
  Object.entries(SYNONYMS).forEach(([key, ids]) => {
    if (containsPhrase(q, key) || containsPhrase(raw, key)) {
      const points = 3 + (key.split(" ").length - 1) * 3;
      ids.forEach((id) => add(id, points));
    }
  });

  const synonymFound = scores.size > 0;

  products.forEach((product) => {
    if (product.hidden) return;
    const title = normalize(product.title);
    const description = normalize(product.description || "");
    // 2. Nom du produit
    words.forEach((w) => {
      if (w.length >= 2 && (containsPhrase(title, w) || containsPhrase(title, singular(w)))) add(product.id, 3);
    });
    // 3. Catégorie
    (CATEGORY_TERMS[product.category] || []).forEach((term) => {
      if (containsPhrase(raw, term)) add(product.id, 2);
    });
    // 4. Description : en dernier recours, si aucun synonyme ne correspond
    if (!synonymFound) words.forEach((w) => {
      if (w.length >= 3 && (containsPhrase(description, w) || containsPhrase(description, singular(w)))) add(product.id, 1);
    });
  });

  return products
    .filter((p) => !p.hidden && (scores.get(p.id) || 0) > 0)
    .sort(
      (a, b) =>
        (scores.get(b.id) || 0) - (scores.get(a.id) || 0) ||
        b.popularity - a.popularity
    );
};

// Produits proposés quand la recherche ne trouve rien.
export const bestSellers = (products: Product[], count = 4) =>
  products
    .filter((p) => !p.hidden && p.stock > 0)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, count);
