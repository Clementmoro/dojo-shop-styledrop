// Livraison : 5 € sous 80 €, offerte dès 80 € (montant après remise)
export const SHIPPING_FEE = 5;
export const FREE_SHIPPING_THRESHOLD = 80;

export const getShippingFee = (amount: number): number => {
  if (amount <= 0) return 0;
  return amount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
};
