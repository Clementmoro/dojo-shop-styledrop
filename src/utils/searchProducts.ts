// Recherche tolérante : sans accents, en français ou en anglais, avec les fautes de frappe courantes
const STOP_WORDS = new Set(["a", "au", "aux", "de", "des", "du", "en", "et", "la", "le", "les", "l", "d", "un", "une", "pour", "avec"]);

// mots que les clients tapent, et les mots du catalogue qui leur correspondent
const SYNONYMS: Record<string, string[]> = {
  casquette: ["cap"],
  casquettes: ["cap"],
  sac: ["bag", "backpack", "tote"],
  sacs: ["bag", "backpack", "tote"],
  dos: ["backpack"],
  capuche: ["hoodie"],
  hoody: ["hoodie"],
  hodie: ["hoodie"],
  sweat: ["sweatshirt", "hoodie"],
  pull: ["sweatshirt", "hoodie"],
  gourde: ["mug"],
  tasse: ["mug"],
  carnet: ["notebook"],
  cahier: ["notebook"],
  stylo: ["pen"],
  stylos: ["pen"],
  autocollant: ["sticker"],
  autocollants: ["sticker"],
  housse: ["sleeve"],
  ordinateur: ["laptop", "sleeve"],
  rose: ["pink"],
  tshirt: ["t-shirt"],
  tee: ["t-shirt"],
  vetement: ["clothing"],
  vetements: ["clothing"],
  accessoire: ["accessories"],
  accessoires: ["accessories"],
  papeterie: ["stationery"],
  limitee: ["limited"],
};

const CATEGORY_WORDS: Record<string, string> = {
  clothing: "vetements vetement",
  accessories: "accessoires accessoire",
  stationery: "papeterie",
  "limited-edition": "edition limitee drop",
};

export const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]+/g, " ")
    .trim();

const distance = (a: string, b: string) => {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
};

// les fautes de frappe ne sont tolérées que sur le nom du produit, pour éviter les faux résultats
const wordMatches = (term: string, words: string[], allowTypos: boolean) =>
  words.some((word) => {
    if (word.startsWith(term) || (term.length >= 4 && word.includes(term))) return true;
    if (allowTypos && term.length >= 4) {
      return distance(term, word.slice(0, term.length + 1)) <= (term.length >= 7 ? 2 : 1);
    }
    return false;
  });

// score > 0 si le produit correspond à tous les mots de la recherche
export const searchScore = (product: Product, query: string) => {
  const terms = normalizeText(query)
    .split(/\s+/)
    .flatMap((t) => t.split("-"))
    .filter((t) => t && !STOP_WORDS.has(t));
  if (terms.length === 0) return 1;

  // mots entiers ("t-shirt") et leurs morceaux ("t", "shirt")
  const toWords = (text: string) => {
    const normalized = normalizeText(text);
    return [...normalized.split(/\s+/), ...normalized.split(/[\s-]+/)];
  };
  const title = toWords(product.title);
  const rest = toWords(
    [product.description ?? "", CATEGORY_WORDS[product.category] ?? "", product.category].join(" ")
  );

  // un synonyme doit correspondre à un mot entier (ou son pluriel)
  const synonymMatches = (synonym: string, words: string[]) =>
    words.some((word) => word === synonym || word === `${synonym}s`);

  let score = 0;
  for (const term of terms) {
    const synonyms = SYNONYMS[term] ?? [];
    if (wordMatches(term, title, true) || synonyms.some((v) => synonymMatches(v, title))) score += 3;
    else if (wordMatches(term, rest, false) || synonyms.some((v) => synonymMatches(v, rest))) score += 1;
    else return 0;
  }
  return score;
};
