// Codes promo actifs, mis à jour par l'équipe marketing.
// Clé : le code tel qu'il doit être saisi. Valeur : taux de remise.
export const ACTIVE_PROMO_CODES: Record<string, number> = {
  "BIENVENUE-10": 0.1,
};

export const EXPIRED_PROMO_CODES = ["EXALT2025"];

// Tolère les variantes de saisie : majuscules/minuscules, espaces, tirets.
// « bienvenue10 », « BIENVENUE 10 » et « BIENVENUE-10 » sont donc acceptés.
const normalizePromoCode = (code: string) =>
  code.toUpperCase().replace(/[\s-]/g, "");

export const getPromoDiscountRate = (code: string): number | null => {
  const wanted = normalizePromoCode(code);
  const match = Object.keys(ACTIVE_PROMO_CODES).find(
    (key) => normalizePromoCode(key) === wanted
  );
  return match ? ACTIVE_PROMO_CODES[match] : null;
};

export const formatPrice = (amount: number) =>
  `${amount.toFixed(2).replace(".", ",")} €`;
