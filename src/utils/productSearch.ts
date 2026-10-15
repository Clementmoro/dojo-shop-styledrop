// Recherche produits tolérante : français, pluriels, accents et petites fautes de frappe

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// Expressions de plusieurs mots, remplacées avant le découpage en mots
const PHRASES: [string, string][] = [
  ["sac a dos", "backpack"],
  ["sweat a capuche", "hoodie"],
  ["sweat capuche", "hoodie"],
  ["housse ordinateur", "laptop sleeve"],
  ["housse pc", "laptop sleeve"],
  ["tee shirt", "tshirt"],
  ["t shirt", "tshirt"],
];

// Mots français (ou variantes courantes) et leurs équivalents dans le catalogue
const SYNONYMS: Record<string, string[]> = {
  casquette: ["cap"],
  chapeau: ["cap"],
  sac: ["bag", "backpack", "tote"],
  cartable: ["backpack"],
  pull: ["sweatshirt", "hoodie"],
  sweat: ["sweatshirt", "hoodie"],
  capuche: ["hoodie"],
  hoody: ["hoodie"],
  tshirt: ["t shirt"],
  tee: ["t shirt"],
  polo: ["polo"],
  gourde: ["mug"],
  tasse: ["mug"],
  bouteille: ["mug"],
  thermos: ["mug"],
  carnet: ["notebook"],
  cahier: ["notebook"],
  stylo: ["pen"],
  autocollant: ["sticker"],
  housse: ["sleeve"],
  pochette: ["sleeve"],
  ordinateur: ["laptop"],
  pc: ["laptop"],
  rose: ["pink"],
  bleu: ["navy"],
  marine: ["navy"],
  dore: ["gold"],
  or: ["gold"],
  vetement: ["clothing"],
  accessoire: ["accessories"],
  papeterie: ["stationery"],
  collector: ["limited edition"],
  limitee: ["limited edition"],
};

const STOPWORDS = new Set(["a", "au", "aux", "de", "des", "du", "d", "la", "le", "les", "l", "un", "une", "et", "en", "pour", "avec", "exalt"]);

const singular = (word: string) => (word.length > 3 && word.endsWith("s") ? word.slice(0, -1) : word);

// Distance d'édition entre deux mots (nombre de lettres à changer)
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

const queryTerms = (query: string) => {
  let text = normalize(query);
  PHRASES.forEach(([phrase, replacement]) => {
    text = text.replace(new RegExp(`\\b${phrase}\\b`, "g"), replacement);
  });
  return text
    .split(" ")
    .filter((word) => word && !STOPWORDS.has(word))
    .map((word) => {
      const base = singular(word);
      return Array.from(new Set([word, base, ...(SYNONYMS[word] || []), ...(SYNONYMS[base] || [])]));
    });
};

const termMatches = (variants: string[], haystack: string, words: string[]) =>
  variants.some((v) => {
    if (` ${haystack} `.includes(` ${v}`)) return true;
    if (v.length < 4) return false;
    const tolerance = v.length >= 7 ? 2 : 1;
    return words.some((w) => Math.abs(w.length - v.length) <= tolerance && distance(w, v) <= tolerance);
  });

export interface SearchResult {
  exact: Product[]; // produits qui correspondent à tous les mots
  close: Product[]; // produits qui correspondent à une partie des mots
  suggestions: Product[]; // les plus populaires, quand rien ne correspond
}

export const searchProducts = (products: Product[], query: string): SearchResult => {
  const visible = products.filter((p) => !p.hidden);
  const terms = queryTerms(query);
  const popular = [...visible]
    .filter((p) => (p.stock ?? 0) > 0)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 8);

  if (terms.length === 0) return { exact: visible, close: [], suggestions: [] };

  const scored = visible.map((p) => {
    const haystack = normalize(`${p.title} ${p.category.replace("-", " ")}`);
    const words = haystack.split(" ");
    const score = terms.filter((variants) => termMatches(variants, haystack, words)).length;
    return { p, score };
  });

  const byPopularity = (a: { p: Product }, b: { p: Product }) => b.p.popularity - a.p.popularity;
  const exact = scored.filter((s) => s.score === terms.length).sort(byPopularity).map((s) => s.p);
  const close = exact.length
    ? []
    : scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score || byPopularity(a, b)).map((s) => s.p);

  return { exact, close, suggestions: exact.length || close.length ? [] : popular };
};
