// Codes promo actifs, mis à jour par l'équipe marketing.
// Clé : le code tel qu'il doit être saisi. Valeur : taux de remise.
export const ACTIVE_PROMO_CODES: Record<string, number> = {
  "BIENVENUE-10": 0.1,
};

export const EXPIRED_PROMO_CODES = ["EXALT2025"];

// Tolère les variantes de saisie : majuscules/minuscules, espaces, tirets.
// « bienvenue10 », « Bienvenue 10 » et « BIENVENUE-10 » donnent le même code.
const normalizePromoCode = (code: string) =>
  code.toUpperCase().replace(/[\s-]/g, "");

export const findActivePromoCode = (code: string): string | null =>
  Object.keys(ACTIVE_PROMO_CODES).find(
    (key) => normalizePromoCode(key) === normalizePromoCode(code)
  ) ?? null;

export const isExpiredPromoCode = (code: string): boolean =>
  EXPIRED_PROMO_CODES.some(
    (key) => normalizePromoCode(key) === normalizePromoCode(code)
  );

export const getPromoDiscountRate = (code: string): number | null => {
  const key = findActivePromoCode(code);
  return key ? ACTIVE_PROMO_CODES[key] : null;
};

export const formatPrice = (amount: number) =>
  `${amount.toFixed(2).replace(".", ",")} €`;
