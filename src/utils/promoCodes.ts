// Codes promo actifs, mis à jour par l'équipe marketing.
// Clé : le code tel qu'il doit être saisi. Valeur : taux de remise.
export const ACTIVE_PROMO_CODES: Record<string, number> = {
  "BIENVENUE-10": 0.1,
};

export const EXPIRED_PROMO_CODES = ["EXALT2025"];

// "bienvenue10", "BIENVENUE 10" ou "Bienvenue-10" désignent le même code
export const normalizePromoCode = (code: string) => code.toUpperCase().replace(/[\s_-]/g, "");

const findCode = (codes: string[], input: string) =>
  codes.find((code) => normalizePromoCode(code) === normalizePromoCode(input));

export const isExpiredPromoCode = (code: string) => Boolean(findCode(EXPIRED_PROMO_CODES, code));

// renvoie le code officiel et son taux, ou null s'il n'existe pas
export const findActivePromoCode = (code: string): { code: string; rate: number } | null => {
  const match = findCode(Object.keys(ACTIVE_PROMO_CODES), code);
  return match ? { code: match, rate: ACTIVE_PROMO_CODES[match] } : null;
};

export const getPromoDiscountRate = (code: string): number | null => {
  return findActivePromoCode(code)?.rate ?? null;
};

export const formatPrice = (amount: number) =>
  `${amount.toFixed(2).replace(".", ",")} €`;
