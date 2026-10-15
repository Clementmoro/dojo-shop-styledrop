// Codes promo actifs, mis à jour par l'équipe marketing.
// Clé : le nom officiel du code. Valeur : taux de remise.
export const ACTIVE_PROMO_CODES: Record<string, number> = {
  "BIENVENUE-10": 0.1,
  BIENVENUE15: 0.15,
};

// Nombre minimum d'articles (quantités comprises) pour utiliser un code.
export const PROMO_MIN_ITEMS: Record<string, number> = {
  BIENVENUE15: 2,
};

export const EXPIRED_PROMO_CODES = ["EXALT2025"];

// "bienvenue 10", "Bienvenue10", "BIENVENUE_10" → "BIENVENUE10"
const normalizeCode = (code: string) =>
  code.toUpperCase().replace(/[^A-Z0-9]/g, "");

// Retrouve le nom officiel d'un code, quelle que soit la façon de l'écrire.
export const findActivePromoCode = (input: string): string | null =>
  Object.keys(ACTIVE_PROMO_CODES).find(
    (code) => normalizeCode(code) === normalizeCode(input)
  ) ?? null;

export const isExpiredPromoCode = (input: string) =>
  EXPIRED_PROMO_CODES.some((code) => normalizeCode(code) === normalizeCode(input));

export const getPromoDiscountRate = (code: string): number | null => {
  const official = findActivePromoCode(code);
  return official ? ACTIVE_PROMO_CODES[official] : null;
};

export const getPromoMinItems = (code: string) => {
  const official = findActivePromoCode(code);
  return official ? PROMO_MIN_ITEMS[official] ?? 0 : 0;
};

export const formatPrice = (amount: number) =>
  `${amount.toFixed(2).replace(".", ",")} €`;
