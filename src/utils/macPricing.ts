// Gag assumé : sur Mac, tous les prix sont doublés, et un bandeau le signale clairement.
export const MAC_PRICE_MULTIPLIER = 2;

export const isMacUser = (() => {
  if (typeof navigator === "undefined") return false;
  const platform = (navigator as any).userAgentData?.platform || navigator.platform || "";
  return /mac/i.test(platform) || /Macintosh/.test(navigator.userAgent);
})();

export const applyMacPricing = <T,>(data: T): T => {
  if (!isMacUser) return data;
  const bump = (p: any) => (p && typeof p.price === "number" ? { ...p, price: p.price * MAC_PRICE_MULTIPLIER } : p);
  return (Array.isArray(data) ? data.map(bump) : bump(data)) as T;
};
