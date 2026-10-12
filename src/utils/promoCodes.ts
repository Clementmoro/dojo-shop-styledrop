// Codes promo actifs, mis à jour par l'équipe marketing.
// Clé : le code tel qu'il doit être saisi. Valeur : taux de remise.
export const ACTIVE_PROMO_CODES: Record<string, number> = {
  "BIENVENUE-10": 0.1,
};

export const EXPIRED_PROMO_CODES = ["EXALT2025"];

export const getPromoDiscountRate = (code: string): number | null => {
  return ACTIVE_PROMO_CODES[code.trim()] ?? null;
};

export const formatPrice = (amount: number) =>
  `${amount.toFixed(2).replace(".", ",")} €`;
