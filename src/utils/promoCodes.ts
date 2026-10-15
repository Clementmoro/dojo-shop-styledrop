// Codes promo actifs, mis à jour par l'équipe marketing.
// Clé : le nom officiel du code.
// Une remise progressive grimpe de `step` à chaque article en plus, jusqu'à `max`.
type PromoRule = { base: number; step?: number; max?: number };

export const ACTIVE_PROMO_CODES: Record<string, PromoRule> = {
  // Offre de bienvenue : -10 % pour 1 article, +5 % par article en plus, plafond -30 %
  "BIENVENUE-10": { base: 0.1, step: 0.05, max: 0.3 },
};

export const WELCOME_CODE = "BIENVENUE-10";

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

// Taux de remise d'un code pour un panier de `itemCount` articles.
export const getPromoDiscountRate = (code: string, itemCount = 1): number | null => {
  const official = findActivePromoCode(code);
  if (!official) return null;
  const { base, step = 0, max = base } = ACTIVE_PROMO_CODES[official];
  const rate = base + step * Math.max(0, itemCount - 1);
  // arrondi pour éviter 0.15000000000000002
  return Math.round(Math.min(rate, max) * 100) / 100;
};

export const formatPrice = (amount: number) =>
  `${amount.toFixed(2).replace(".", ",")} €`;
