// Produit surprise offert avec chaque commande, révélé après le paiement.

const PENDING_KEY = "exalt-surprise-pending";
const REVEALED_KEY = "exalt-surprise";

// Les petits goodies qui peuvent être tirés au sort
const SURPRISE_MAX_PRICE = 15;

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // stockage bloqué : la surprise sera simplement perdue au rafraîchissement
  }
};

// Appelé quand la commande est validée
export const markSurprisePending = () => write(PENDING_KEY, "1");

// Lit et consomme le drapeau : la surprise ne se joue qu'une fois par commande
export const takeSurprisePending = () => {
  const pending = read(PENDING_KEY) === "1";
  write(PENDING_KEY, null);
  return pending;
};

export const pickSurprise = (products: Product[]): Product | null => {
  const pool = products.filter(
    (p) => !p.hidden && p.stock > 0 && p.price <= SURPRISE_MAX_PRICE
  );
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
};

export const saveRevealedSurprise = (product: Product) =>
  write(REVEALED_KEY, JSON.stringify(product));

export const getRevealedSurprise = (): Product | null => {
  try {
    return JSON.parse(read(REVEALED_KEY) || "null");
  } catch {
    return null;
  }
};
