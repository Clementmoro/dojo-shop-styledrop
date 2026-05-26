import toast from "react-hot-toast";

const CARD_NUMBER_RE = /^\d{16}$/;
const CVC_RE = /^\d{3,4}$/;
const EXPIRY_RE = /^(0[1-9]|1[0-2])\/\d{2}$/;

export const checkCheckoutFormData = (checkoutData: {
  data: {
    [k: string]: FormDataEntryValue;
  };
  products: ProductInCart[];
  subtotal: number;
}) => {
  const d = checkoutData.data;

  // Required fields
  if (!d?.emailAddress) { toast.error("Email address is required"); return false; }
  if (!d?.firstName)    { toast.error("First name is required");    return false; }
  if (!d?.lastName)     { toast.error("Last name is required");     return false; }
  if (!d?.address)      { toast.error("Address is required");       return false; }
  if (!d?.city)         { toast.error("City is required");          return false; }
  if (!d?.country)      { toast.error("Country is required");       return false; }
  if (!d?.postalCode)   { toast.error("Postal code is required");   return false; }
  if (!d?.region)       { toast.error("Region is required");        return false; }
  if (!d?.phone)        { toast.error("Phone is required");         return false; }

  // Payment — required
  if (!d?.nameOnCard)   { toast.error("Name on card is required");  return false; }

  // US1 — CB format validation
  const cardNum = (d?.cardNumber as string)?.replace(/\s/g, "");
  if (!cardNum) {
    toast.error("Card number is required");
    return false;
  }
  if (!CARD_NUMBER_RE.test(cardNum)) {
    toast.error("Numéro de carte invalide — 16 chiffres requis");
    return false;
  }

  const cvc = d?.cvc as string;
  if (!cvc) {
    toast.error("CVC is required");
    return false;
  }
  if (!CVC_RE.test(cvc)) {
    toast.error("CVC invalide — 3 ou 4 chiffres requis");
    return false;
  }

  const expiry = d?.expirationDate as string;
  if (!expiry) {
    toast.error("Expiration date is required");
    return false;
  }
  if (!EXPIRY_RE.test(expiry)) {
    toast.error("Date d'expiration invalide — format MM/AA requis");
    return false;
  }

  // Cart
  if (checkoutData.products.length === 0) { toast.error("Your cart is empty");    return false; }
  if (checkoutData.subtotal === 0)         { toast.error("Subtotal cannot be 0"); return false; }

  // US3 — apartment & company are optional: no validation

  return true;
};
