// Règles de prix de la boutique : les prix affichés sont TTC (TVA 20 % incluse),
// la livraison coûte 5 € et devient offerte dès 80 € d'achat (après remise).
export const TAX_RATE = 0.2;
export const SHIPPING_FEE = 5;
export const FREE_SHIPPING_THRESHOLD = 80;

export const computeCartTotals = (subtotal: number, discountRate = 0) => {
  const discount = subtotal * discountRate;
  const productsTotal = subtotal - discount;
  const shipping = subtotal === 0 || productsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = productsTotal + shipping;
  // TVA déjà comprise dans le total
  const includedTax = total - total / (1 + TAX_RATE);
  const missingForFreeShipping = subtotal === 0 ? 0 : Math.max(0, FREE_SHIPPING_THRESHOLD - productsTotal);
  return { discount, productsTotal, shipping, total, includedTax, missingForFreeShipping };
};
