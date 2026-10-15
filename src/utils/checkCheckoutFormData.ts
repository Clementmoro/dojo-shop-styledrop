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
  gift?: { isGift: boolean; [k: string]: unknown };
}) => {
  const d = checkoutData.data;

  // Required fields
  if (!d?.emailAddress) { toast.error("L'adresse e-mail est obligatoire"); return false; }
  if (!d?.firstName)    { toast.error("Le prénom est obligatoire");    return false; }
  if (!d?.lastName)     { toast.error("Le nom est obligatoire");     return false; }
  if (!d?.address)      { toast.error("L'adresse est obligatoire");       return false; }
  if (!d?.city)         { toast.error("La ville est obligatoire");          return false; }
  if (!d?.country)      { toast.error("Le pays est obligatoire");       return false; }
  if (!d?.region)       { toast.error("La région est obligatoire");        return false; }
  if (!d?.postalCode)   { toast.error("Le code postal est obligatoire");   return false; }
  if (!d?.phone)        { toast.error("Le téléphone est obligatoire");         return false; }

  // Mode cadeau : coordonnées du destinataire obligatoires
  if (checkoutData.gift?.isGift) {
    if (!d?.giftMessage)       { toast.error("Le message cadeau est obligatoire"); return false; }
    if (!d?.giftRecipientName) { toast.error("Le nom du destinataire est obligatoire"); return false; }
    if (!d?.giftAddress)       { toast.error("L'adresse du destinataire est obligatoire"); return false; }
    if (!d?.giftCity)          { toast.error("La ville du destinataire est obligatoire"); return false; }
    if (!d?.giftPostalCode)    { toast.error("Le code postal du destinataire est obligatoire"); return false; }
  }

  // Payment : required

  // US1 : CB format validation
  const cardNum = (d?.cardNumber as string)?.replace(/\s/g, "");
  if (!cardNum) {
    toast.error("Le numéro de carte est obligatoire");
    return false;
  }
  if (!CARD_NUMBER_RE.test(cardNum)) {
    toast.error("Numéro de carte invalide : 16 chiffres requis");
    return false;
  }

  if (!d?.nameOnCard)   { toast.error("Le nom sur la carte est obligatoire");  return false; }

  const cvc = d?.cvc as string;
  if (!cvc) {
    toast.error("Le cryptogramme est obligatoire");
    return false;
  }
  if (!CVC_RE.test(cvc)) {
    toast.error("CVC invalide : 3 ou 4 chiffres requis");
    return false;
  }

  const expiry = d?.expirationDate as string;
  if (!expiry) {
    toast.error("La date d'expiration est obligatoire");
    return false;
  }
  if (!EXPIRY_RE.test(expiry)) {
    toast.error("Date d'expiration invalide : format MM/AA requis");
    return false;
  }

  // Cart
  if (checkoutData.products.length === 0) { toast.error("Ton panier est vide");    return false; }
  if (checkoutData.subtotal === 0)         { toast.error("Le sous-total ne peut pas être nul"); return false; }

  // US3 : apartment & company are optional: no validation

  return true;
};
