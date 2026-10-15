import { useRef, useState } from "react";
import {
  TbArrowLeft,
  TbArrowRight,
  TbBuildingBank,
  TbBrandPaypal,
  TbCheck,
  TbCircleCheck,
  TbCreditCard,
  TbGift,
  TbLock,
  TbMail,
  TbMapPin,
  TbPencil,
  TbShieldLock,
  TbTrash,
  TbUser,
} from "react-icons/tb";
import { IconType } from "react-icons";
import { DeliveryMap } from "../components";
import { useAppDispatch, useAppSelector } from "../hooks";
import { removeProductFromTheCart } from "../features/cart/cartSlice";
import customFetch from "../axios/custom";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { checkCheckoutFormData } from "../utils/checkCheckoutFormData";
import { formatPrice } from "../utils/promoCodes";

const paymentMethods: { id: string; title: string; icon: IconType }[] = [
  { id: "credit-card", title: "Carte bancaire", icon: TbCreditCard },
  { id: "paypal", title: "PayPal", icon: TbBrandPaypal },
  { id: "etransfer", title: "Virement", icon: TbBuildingBank },
];

const COUNTRIES_EUROPE = [
  "France", "Belgique", "Suisse", "Luxembourg", "Allemagne", "Espagne",
  "Italie", "Pays-Bas", "Portugal", "Royaume-Uni",
];
const COUNTRIES_OTHER = ["United States", "Canada", "Mexico"];

// champs à remplir par étape (mêmes champs obligatoires qu'avant)
const CONTACT_FIELDS = ["emailAddress", "firstName", "lastName", "address", "city", "country", "postalCode", "region", "phone"];
const GIFT_FIELDS = ["giftMessage", "giftRecipientName", "giftAddress", "giftCity", "giftPostalCode", "giftCountry"];
const PAYMENT_FIELDS = ["cardNumber", "nameOnCard", "expirationDate", "cvc"];

const STEPS: { id: number; label: string; hint: string; icon: IconType }[] = [
  { id: 1, label: "Coordonnées", hint: "Contact et livraison", icon: TbUser },
  { id: 2, label: "Paiement", hint: "Moyen de paiement", icon: TbCreditCard },
  { id: 3, label: "Confirmation", hint: "Après la commande", icon: TbCircleCheck },
];

const inputCls =
  "block w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm text-exaltNavy placeholder:text-gray-400 focus:border-exaltNavy focus:outline-none focus:ring-2 focus:ring-exaltNavy/15";

const Field = ({
  id,
  label,
  optional,
  className,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
    <label htmlFor={id} className="text-sm font-medium text-exaltNavy">
      {label}
      {optional && <span className="ml-1 font-normal text-gray-400">(facultatif)</span>}
    </label>
    {children}
  </div>
);

const SectionTitle = ({ icon: Icon, title, subtitle }: { icon: IconType; title: string; subtitle?: string }) => (
  <div className="flex items-center gap-3">
    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-exaltCream text-exaltNavy">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
    <div>
      <h2 className="text-lg font-semibold text-exaltNavy">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  </div>
);

const Checkout = () => {
  const { productsInCart, subtotal, promoCode, discountRate } = useAppSelector((state) => state.cart);
  const discount = subtotal * discountRate;
  const taxableAmount = subtotal - discount;
  const shipping = subtotal ? 5 : 0;
  const tax = subtotal ? taxableAmount / 5 : 0;
  const total = subtotal ? taxableAmount + shipping + tax : 0;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const tunnelRef = useRef<HTMLDivElement>(null);
  const [isGift, setIsGift] = useState(false);
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<Record<string, string>>({ country: "France", giftCountry: "France" });

  // lecture des champs à chaque saisie, pour la progression et la carte
  const syncValues = () => {
    if (!formRef.current) return;
    const data = Object.fromEntries(new FormData(formRef.current)) as Record<string, string>;
    setValues(data);
  };
  const isFilled = (fields: string[]) => fields.every((f) => (values[f] ?? "").toString().trim() !== "");
  const contactDone = isFilled(CONTACT_FIELDS) && (!isGift || isFilled(GIFT_FIELDS));
  const paymentDone = isFilled(PAYMENT_FIELDS);

  const goToStep = (target: number) => {
    setStep(target);
    tunnelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const focusFirstEmpty = (fields: string[]) => {
    const name = fields.find((f) => (values[f] ?? "").toString().trim() === "");
    if (!name || !formRef.current) return;
    const el = formRef.current.elements.namedItem(name) as HTMLElement | null;
    setTimeout(() => el?.focus(), 50);
  };

  const continueToPayment = () => {
    syncValues();
    if (!contactDone) {
      toast.error("Il manque des informations dans tes coordonnées");
      focusFirstEmpty(isGift ? [...CONTACT_FIELDS, ...GIFT_FIELDS] : CONTACT_FIELDS);
      return;
    }
    goToStep(2);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step === 1) {
      continueToPayment();
      return;
    }
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    if (!contactDone) {
      toast.error("Complète d'abord tes coordonnées");
      goToStep(1);
      focusFirstEmpty(isGift ? [...CONTACT_FIELDS, ...GIFT_FIELDS] : CONTACT_FIELDS);
      return;
    }

    const gift = isGift
      ? {
          isGift: true,
          giftMessage: data.giftMessage as string,
          giftRecipientName: data.giftRecipientName as string,
          giftAddress: data.giftAddress as string,
          giftCity: data.giftCity as string,
          giftPostalCode: data.giftPostalCode as string,
          giftCountry: (data.giftCountry as string) || "France",
        }
      : { isGift: false };

    const checkoutData = {
      data,
      products: productsInCart,
      subtotal: subtotal,
      gift,
    };

    if (!checkCheckoutFormData(checkoutData)) return;

    let response;
    if (JSON.parse(localStorage.getItem("user") || "{}").email) {
      response = await customFetch.post("/orders", {
        ...checkoutData,
        user: {
          email: JSON.parse(localStorage.getItem("user") || "{}").email,
          id: JSON.parse(localStorage.getItem("user") || "{}").id,
        },
        orderStatus: "Processing",
        orderDate: new Date().toISOString(),
      });
    } else {
      response = await customFetch.post("/orders", {
        ...checkoutData,
        orderStatus: "Processing",
        orderDate: new Date().toLocaleDateString(),
      });
    }

    if (response.status === 201) {
      toast.success("Commande validée, merci !");
      navigate("/order-confirmation");
    } else {
      toast.error("Oups, une erreur est survenue. Réessaie dans un instant.");
    }
  };

  // la carte suit l'adresse du destinataire en mode cadeau
  const mapDestination = isGift
    ? { postalCode: values.giftPostalCode ?? "", city: values.giftCity ?? "", country: values.giftCountry || "France" }
    : { postalCode: values.postalCode ?? "", city: values.city ?? "", country: values.country || "France" };

  const stepStatus = (id: number) => {
    if (id === step) return "current";
    if ((id === 1 && contactDone) || (id === 2 && paymentDone)) return "done";
    return "todo";
  };
  const progress = step === 1 ? (contactDone ? 50 : 25) : paymentDone ? 100 : 75;

  return (
    <div className="mx-auto max-w-screen-2xl px-5 pb-24 pt-10 max-[400px]:px-3">
      <h1 className="font-display text-4xl font-bold text-exaltNavy max-sm:text-3xl">Commande</h1>

      {/* ── Progression cliquable ── */}
      <nav aria-label="Étapes de la commande" className="mt-8 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
        <ol className="grid grid-cols-3 gap-2">
          {STEPS.map(({ id, label, hint, icon: Icon }) => {
            const status = stepStatus(id);
            const isConfirmation = id === 3;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => goToStep(id)}
                  disabled={isConfirmation}
                  aria-current={status === "current" ? "step" : undefined}
                  className={`flex w-full items-center gap-3 rounded-2xl p-2 text-left transition-colors max-sm:flex-col max-sm:gap-1.5 max-sm:text-center ${
                    isConfirmation ? "cursor-not-allowed" : "hover:bg-exaltCream"
                  } ${status === "current" ? "bg-exaltCream" : ""}`}
                >
                  <span
                    className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                      status === "current"
                        ? "bg-exaltNavy text-white ring-4 ring-exaltNavy/15"
                        : status === "done"
                        ? "bg-green-600 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {status === "done" ? <TbCheck className="h-5 w-5" aria-hidden="true" /> : <Icon className="h-5 w-5" aria-hidden="true" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400 max-sm:hidden">
                      Étape {id}
                    </span>
                    <span className={`block text-sm font-semibold ${status === "todo" ? "text-gray-400" : "text-exaltNavy"}`}>
                      {label}
                    </span>
                    <span className="block text-xs text-gray-500 max-sm:hidden">
                      {status === "done" && !isConfirmation ? "Complété, modifiable" : hint}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100" aria-hidden="true">
          <div className="h-full rounded-full bg-exaltNavy transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </nav>

      <form
        ref={formRef}
        noValidate
        onSubmit={handleCheckoutSubmit}
        onInput={syncValues}
        onChange={syncValues}
        className="mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-10"
      >
        <div ref={tunnelRef} className="scroll-mt-24 lg:col-span-7">
          {/* ── Étape 1 : coordonnées ── */}
          <section className={step === 1 ? "flex flex-col gap-6" : "hidden"}>
            <div className="flex flex-col gap-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <SectionTitle icon={TbMail} title="Contact" subtitle="Pour t'envoyer la confirmation et le suivi" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id="email-address" label="Adresse e-mail" className="sm:col-span-2">
                  <input type="email" id="email-address" name="emailAddress" autoComplete="email" placeholder="prenom@exemple.com" className={inputCls} />
                </Field>
                <Field id="first-name" label="Prénom">
                  <input type="text" id="first-name" name="firstName" autoComplete="given-name" className={inputCls} />
                </Field>
                <Field id="last-name" label="Nom">
                  <input type="text" id="last-name" name="lastName" autoComplete="family-name" className={inputCls} />
                </Field>
                <Field id="phone" label="Téléphone" className="sm:col-span-2">
                  <input type="tel" id="phone" name="phone" autoComplete="tel" placeholder="06 12 34 56 78" className={inputCls} />
                </Field>
              </div>
            </div>

            <div className="flex flex-col gap-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <SectionTitle icon={TbMapPin} title="Adresse de livraison" subtitle="Où doit-on t'envoyer ton colis ?" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field id="address" label="Adresse" className="sm:col-span-2">
                  <input type="text" id="address" name="address" autoComplete="street-address" placeholder="12 rue de la Paix" className={inputCls} />
                </Field>
                <Field id="apartment" label="Appartement, étage" optional>
                  <input type="text" id="apartment" name="apartment" className={inputCls} />
                </Field>
                <Field id="company" label="Société" optional>
                  <input type="text" id="company" name="company" autoComplete="organization" className={inputCls} />
                </Field>
                <Field id="postal-code" label="Code postal">
                  <input type="text" id="postal-code" name="postalCode" autoComplete="postal-code" inputMode="numeric" className={inputCls} />
                </Field>
                <Field id="city" label="Ville">
                  <input type="text" id="city" name="city" autoComplete="address-level2" className={inputCls} />
                </Field>
                <Field id="region" label="Région">
                  <input type="text" id="region" name="region" autoComplete="address-level1" className={inputCls} />
                </Field>
                <Field id="country" label="Pays">
                  <select id="country" name="country" autoComplete="country-name" defaultValue="France" className={inputCls}>
                    <optgroup label="Europe">
                      {COUNTRIES_EUROPE.map((c) => <option key={c}>{c}</option>)}
                    </optgroup>
                    <optgroup label="Autres">
                      {COUNTRIES_OTHER.map((c) => <option key={c}>{c}</option>)}
                    </optgroup>
                  </select>
                </Field>
              </div>

              {!isGift && <DeliveryMap destination={mapDestination} />}
            </div>

            {/* Mode cadeau */}
            <div className="flex flex-col gap-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <label htmlFor="gift-mode" className="flex cursor-pointer items-start gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-pink-50 text-exaltPink">
                  <TbGift className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="flex-1">
                  <span className="block text-lg font-semibold text-exaltNavy">C'est un cadeau</span>
                  <span className="block text-sm text-gray-500">
                    Le prix sera masqué sur le bon de livraison. Tu peux ajouter un message et une adresse de livraison différente.
                  </span>
                </span>
                <input
                  id="gift-mode"
                  name="giftMode"
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="mt-2 h-5 w-5 rounded border-gray-300 text-exaltPink focus:ring-exaltPink"
                />
              </label>

              {isGift && (
                <div className="grid grid-cols-1 gap-4 rounded-2xl bg-pink-50/60 p-4 sm:grid-cols-2">
                  <Field id="gift-message" label="Message cadeau" className="sm:col-span-2">
                    <textarea
                      id="gift-message"
                      name="giftMessage"
                      rows={3}
                      maxLength={300}
                      placeholder="Joyeux anniversaire ! J'espère que ce cadeau te plaira..."
                      className={`${inputCls} h-auto py-3 resize-none`}
                    />
                  </Field>
                  <Field id="gift-recipient-name" label="Nom du destinataire" className="sm:col-span-2">
                    <input type="text" id="gift-recipient-name" name="giftRecipientName" className={inputCls} />
                  </Field>
                  <Field id="gift-address" label="Adresse" className="sm:col-span-2">
                    <input type="text" id="gift-address" name="giftAddress" className={inputCls} />
                  </Field>
                  <Field id="gift-postal-code" label="Code postal">
                    <input type="text" id="gift-postal-code" name="giftPostalCode" inputMode="numeric" className={inputCls} />
                  </Field>
                  <Field id="gift-city" label="Ville">
                    <input type="text" id="gift-city" name="giftCity" className={inputCls} />
                  </Field>
                  <Field id="gift-country" label="Pays" className="sm:col-span-2">
                    <input type="text" id="gift-country" name="giftCountry" defaultValue="France" className={inputCls} />
                  </Field>
                  <div className="sm:col-span-2">
                    <DeliveryMap destination={mapDestination} />
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={continueToPayment}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-exaltNavy text-base font-semibold text-white transition-colors hover:bg-exaltPink"
            >
              Continuer vers le paiement
              <TbArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </section>

          {/* ── Étape 2 : paiement ── */}
          <section className={step === 2 ? "flex flex-col gap-6" : "hidden"}>
            {/* rappel des coordonnées, modifiable */}
            <div className="flex items-start gap-3 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-50 text-green-700">
                <TbMapPin className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold text-exaltNavy">
                  Livraison à {isGift ? values.giftRecipientName : `${values.firstName ?? ""} ${values.lastName ?? ""}`}
                </p>
                <p className="text-gray-600">
                  {isGift
                    ? `${values.giftAddress ?? ""}, ${values.giftPostalCode ?? ""} ${values.giftCity ?? ""}`
                    : `${values.address ?? ""}, ${values.postalCode ?? ""} ${values.city ?? ""}`}
                </p>
                <p className="text-gray-500">{values.emailAddress}</p>
              </div>
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="flex items-center gap-1 text-sm font-semibold text-exaltPink hover:text-exaltNavy"
              >
                <TbPencil className="h-4 w-4" aria-hidden="true" />
                Modifier
              </button>
            </div>

            <div className="flex flex-col gap-5 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <SectionTitle icon={TbCreditCard} title="Paiement" subtitle="Choisis ton moyen de paiement" />

              <fieldset>
                <legend className="sr-only">Moyen de paiement</legend>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map(({ id, title, icon: Icon }, idx) => (
                    <label
                      key={id}
                      htmlFor={id}
                      className="flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border border-gray-200 p-3 text-center text-sm font-medium text-exaltNavy transition-colors has-[:checked]:border-exaltNavy has-[:checked]:bg-exaltCream has-[:checked]:ring-2 has-[:checked]:ring-exaltNavy/15"
                    >
                      <input id={id} name="paymentType" type="radio" value={id} defaultChecked={idx === 0} className="sr-only" />
                      <Icon className="h-6 w-6" aria-hidden="true" />
                      {title}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid grid-cols-4 gap-4">
                <Field id="card-number" label="Numéro de carte" className="col-span-4">
                  <input type="text" id="card-number" name="cardNumber" autoComplete="cc-number" inputMode="numeric" placeholder="1234 5678 9012 3456" className={inputCls} />
                </Field>
                <Field id="name-on-card" label="Nom sur la carte" className="col-span-4">
                  <input type="text" id="name-on-card" name="nameOnCard" autoComplete="cc-name" className={inputCls} />
                </Field>
                <Field id="expiration-date" label="Expiration (MM/AA)" className="col-span-2">
                  <input type="text" id="expiration-date" name="expirationDate" autoComplete="cc-exp" placeholder="MM/AA" className={inputCls} />
                </Field>
                <Field id="cvc" label="Cryptogramme" className="col-span-2">
                  <input type="text" id="cvc" name="cvc" autoComplete="csc" inputMode="numeric" placeholder="123" className={inputCls} />
                </Field>
              </div>
            </div>

            {/* bouton de commande, juste sous le paiement */}
            <div className="flex flex-col gap-3 rounded-3xl bg-exaltNavy p-5 text-white sm:p-6">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-white/70">Total à payer</span>
                <span className="text-2xl font-bold tabular-nums">{formatPrice(total)}</span>
              </div>
              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-exaltYellow text-base font-bold text-exaltNavy transition-colors hover:bg-white"
              >
                <TbLock className="h-5 w-5" aria-hidden="true" />
                Passer la commande
              </button>
              <p className="flex items-center justify-center gap-1.5 text-xs text-white/70">
                <TbShieldLock className="h-4 w-4" aria-hidden="true" />
                Paiement sécurisé
              </p>
            </div>

            <button
              type="button"
              onClick={() => goToStep(1)}
              className="flex items-center justify-center gap-2 text-sm font-semibold text-exaltNavy hover:text-exaltPink"
            >
              <TbArrowLeft className="h-4 w-4" aria-hidden="true" />
              Retour aux coordonnées
            </button>
          </section>
        </div>

        {/* ── Récapitulatif ── */}
        <aside className="mt-10 lg:sticky lg:top-24 lg:col-span-5 lg:mt-0">
          <div className="rounded-3xl bg-exaltCream p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-exaltNavy">Récapitulatif</h2>

            <ul role="list" className="mt-4 divide-y divide-gray-200/70">
              {productsInCart.map((product) => (
                <li key={product?.id} className="flex gap-4 py-4">
                  <img
                    src={product?.image?.startsWith("http") || product?.image?.startsWith("/") ? product.image : `/assets/${product?.image}`}
                    alt={product?.title}
                    className="h-16 w-16 flex-shrink-0 rounded-xl bg-white object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-exaltNavy">{product?.title}</h3>
                      <button
                        type="button"
                        className="-m-1 p-1 text-gray-400 hover:text-exaltPink"
                        onClick={() => dispatch(removeProductFromTheCart({ id: product?.id }))}
                      >
                        <span className="sr-only">Retirer</span>
                        <TbTrash className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {[product?.color, product?.size].filter(Boolean).join(" · ")}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-1 text-sm">
                      <span className="text-gray-500">Quantité : {product?.quantity}</span>
                      <span className="font-semibold text-exaltNavy">{product?.price} €</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {isGift && (
              <p className="mt-2 flex items-center gap-2 rounded-xl bg-exaltPink px-3 py-2 text-sm font-medium text-white">
                <TbGift className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                Mode cadeau : les prix seront masqués sur le bon de livraison.
              </p>
            )}

            <dl className="mt-4 flex flex-col gap-2.5 border-t border-gray-200/70 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Sous-total</dt>
                <dd className="font-medium text-exaltNavy">{formatPrice(subtotal)}</dd>
              </div>
              {promoCode && (
                <div className="flex justify-between text-green-700">
                  <dt>Code {promoCode}</dt>
                  <dd className="font-medium">-{formatPrice(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-600">Livraison</dt>
                <dd className="font-medium text-exaltNavy">{formatPrice(shipping)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">TVA (20 %)</dt>
                <dd className="font-medium text-exaltNavy">{formatPrice(tax)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-gray-200/70 pt-3">
                <dt className="font-semibold text-exaltNavy">Total</dt>
                <dd className="text-xl font-bold text-exaltNavy">{formatPrice(total)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </form>
    </div>
  );
};
export default Checkout;
