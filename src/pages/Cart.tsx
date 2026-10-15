import { useState } from "react";
import { HiCheck as CheckIcon, HiXMark as XMarkIcon } from "react-icons/hi2";
import { useAppDispatch, useAppSelector } from "../hooks";
import { Link } from "react-router-dom";
import {
  applyPromoCode,
  removePromoCode,
  removeProductFromTheCart,
  updateProductQuantity,
} from "../features/cart/cartSlice";
import toast from "react-hot-toast";
import {
  WELCOME_CODE,
  findActivePromoCode,
  formatPrice,
  getPromoDiscountRate,
  isExpiredPromoCode,
} from "../utils/promoCodes";

const pct = (rate: number) => `-${Math.round(rate * 100)} %`;

const SHIPPING_FEE = 5;
const TAX_RATE = 0.2;

const Cart = () => {
  const { productsInCart, subtotal, promoCode, discountRate } = useAppSelector(
    (state) => state.cart
  );
  const dispatch = useAppDispatch();
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);

  const discount = subtotal * discountRate;
  const taxableAmount = subtotal - discount;
  const tax = taxableAmount * TAX_RATE;
  const shipping = subtotal === 0 ? 0 : SHIPPING_FEE;
  const total = subtotal === 0 ? 0 : taxableAmount + tax + shipping;
  // Économie réelle sur le total payé : la remise plus la TVA qu'elle évite
  const savings = discount * (1 + TAX_RATE);

  const itemCount = productsInCart.reduce((acc, product) => acc + product.quantity, 0);
  // Offre de bienvenue progressive : taux actuel et taux avec 1 article de plus
  const welcomeApplied = promoCode === WELCOME_CODE;
  const welcomeNow = getPromoDiscountRate(WELCOME_CODE, itemCount) ?? 0;
  const welcomeNext = getPromoDiscountRate(WELCOME_CODE, itemCount + 1) ?? 0;
  const showWelcomeOffer = itemCount > 0 && (!promoCode || welcomeApplied);

  const applyCode = (input: string) => {
    if (!input.trim()) return;
    if (isExpiredPromoCode(input)) {
      setPromoError("Code expiré");
      return;
    }
    const code = findActivePromoCode(input);
    const rate = code ? getPromoDiscountRate(code, itemCount) : null;
    if (code === null || rate === null) {
      setPromoError("Ce code n'existe pas. Vérifie l'orthographe.");
      return;
    }
    dispatch(applyPromoCode({ code, rate }));
    setPromoError(null);
    setPromoInput("");
    toast.success(`Code ${code} : ${pct(rate)} appliqué`);
  };

  const handleApplyPromo = () => applyCode(promoInput);

  return (
    <div className="mx-auto max-w-screen-2xl px-5 max-[400px]:px-3">
      <div className="pb-24 pt-12">
        <h1 className="font-display text-4xl font-bold text-exaltNavy max-sm:text-3xl">Mon panier</h1>

        {productsInCart.length === 0 ? (
          <div className="mt-12 rounded-3xl bg-exaltCream p-12 text-center">
            <p className="text-lg text-exaltNavy">Ton panier est vide pour l'instant.</p>
            <Link
              to="/shop"
              className="inline-flex mt-6 bg-exaltNavy hover:bg-exaltPink transition-colors text-white font-semibold rounded-full h-12 px-8 items-center"
            >
              Découvrir la boutique
            </Link>
          </div>
        ) : (
          <form className="mt-10 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
            <section aria-labelledby="cart-heading" className="lg:col-span-7">
              <h2 id="cart-heading" className="sr-only">
                Articles du panier
              </h2>

              <ul role="list" className="divide-y divide-gray-100 border-b border-t border-gray-100">
                {productsInCart.map((product) => (
                  <li key={product.id} className="flex py-6 sm:py-8">
                    <div className="flex-shrink-0 rounded-2xl bg-exaltCream overflow-hidden">
                      <img
                        src={product.image?.startsWith("http") || product.image?.startsWith("/") ? product.image : `/assets/${product.image}`}
                        alt={product.title}
                        className="h-24 w-24 object-cover object-center sm:h-36 sm:w-36"
                      />
                    </div>

                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                      <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                        <div>
                          <h3 className="text-base font-semibold text-exaltNavy">{product.title}</h3>
                          <div className="mt-1 flex text-sm text-gray-500">
                            <p>{product.color}</p>
                            {product.size ? (
                              <p className="ml-4 border-l border-gray-200 pl-4">{product.size}</p>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm font-semibold text-exaltNavy">{product.price} €</p>
                        </div>

                        <div className="mt-4 sm:mt-0 sm:pr-9 text-sm">
                          <label htmlFor={`quantity-${product.id}`} className="mr-2 text-gray-600">
                            Quantité
                          </label>
                          <input
                            type="number"
                            id={`quantity-${product.id}`}
                            className="w-16 h-9 rounded-lg border-gray-300 text-center"
                            value={product?.quantity}
                            onChange={(e) => {
                              dispatch(
                                updateProductQuantity({
                                  id: product?.id,
                                  quantity: parseInt(e.target.value),
                                })
                              );
                            }}
                          />

                          <div className="absolute right-0 top-0">
                            <button
                              type="button"
                              className="-m-2 inline-flex p-2 text-gray-400 hover:text-exaltPink"
                              onClick={() => {
                                dispatch(removeProductFromTheCart({ id: product?.id }));
                                toast.error("Produit retiré du panier");
                              }}
                            >
                              <span className="sr-only">Retirer</span>
                              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className="mt-4 flex space-x-2 text-sm text-gray-600">
                        {product?.stock ? (
                          <CheckIcon className="h-5 w-5 flex-shrink-0 text-green-500" aria-hidden="true" />
                        ) : (
                          <XMarkIcon className="h-5 w-5 flex-shrink-0 text-red-600" aria-hidden="true" />
                        )}
                        <span>{product?.stock ? "En stock" : "Rupture de stock"}</span>
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Order summary */}
            <section
              aria-labelledby="summary-heading"
              className="mt-12 rounded-3xl bg-exaltCream px-6 py-8 lg:col-span-5 lg:mt-0 lg:p-8"
            >
              <h2 id="summary-heading" className="text-lg font-semibold text-exaltNavy">
                Récapitulatif
              </h2>

              {showWelcomeOffer && (
                <div className="mt-4 rounded-2xl border-2 border-dashed border-exaltPink bg-white px-4 py-3 text-sm text-exaltNavy">
                  {welcomeNext > welcomeNow ? (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p>
                        🎁 {welcomeApplied ? (
                          <>Tu profites de <strong>{pct(welcomeNow)}</strong>. </>
                        ) : (
                          <>Avec le code <strong className="font-mono">{WELCOME_CODE}</strong> : <strong>{pct(welcomeNow)}</strong> tout de suite. </>
                        )}
                        Ajoute <strong>1 article de plus</strong> et passe à <strong>{pct(welcomeNext)}</strong> sur toute ta commande.
                      </p>
                      {welcomeApplied ? (
                        <Link to="/shop" className="font-semibold text-exaltPink underline underline-offset-2">
                          Voir la boutique
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => applyCode(WELCOME_CODE)}
                          className="h-9 rounded-full bg-exaltPink px-4 text-xs font-semibold text-white transition-colors hover:bg-exaltNavy"
                        >
                          Appliquer
                        </button>
                      )}
                    </div>
                  ) : welcomeApplied ? (
                    <p>🎉 Tu as atteint la remise maximale : <strong>{pct(welcomeNow)}</strong> sur toute ta commande.</p>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p>🎁 Avec le code <strong className="font-mono">{WELCOME_CODE}</strong> : <strong>{pct(welcomeNow)}</strong> sur toute ta commande.</p>
                      <button
                        type="button"
                        onClick={() => applyCode(WELCOME_CODE)}
                        className="h-9 rounded-full bg-exaltPink px-4 text-xs font-semibold text-white transition-colors hover:bg-exaltNavy"
                      >
                        Appliquer
                      </button>
                    </div>
                  )}
                </div>
              )}

              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-gray-600">Sous-total</dt>
                  <dd className="font-medium text-exaltNavy">{formatPrice(subtotal)}</dd>
                </div>
                {promoCode && (
                  <div className="flex items-center justify-between text-green-700">
                    <dt className="flex items-center gap-2">
                      Code {promoCode} ({pct(discountRate)})
                      <button
                        type="button"
                        className="text-xs underline text-gray-500"
                        onClick={() => dispatch(removePromoCode())}
                      >
                        retirer
                      </button>
                    </dt>
                    <dd className="font-medium">-{formatPrice(discount)}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-gray-600">Livraison</dt>
                  <dd className="font-medium text-exaltNavy">{formatPrice(shipping)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-gray-600">TVA (20 %)</dt>
                  <dd className="font-medium text-exaltNavy">{formatPrice(tax)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-semibold text-exaltNavy">Total</dt>
                  <dd className="text-base font-bold text-exaltNavy">{formatPrice(total)}</dd>
                </div>
              </dl>

              {promoCode && savings > 0 && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-green-50 px-4 py-3 text-green-800">
                  <p className="text-sm">
                    💸 Tu économises <strong>{formatPrice(savings)}</strong> sur ton total
                  </p>
                  <span className="whitespace-nowrap rounded-full bg-green-700 px-3 py-1 text-xs font-bold text-white">
                    {pct(discountRate)} sur tes articles
                  </span>
                </div>
              )}

              {!promoCode && (
                <div className="mt-6">
                  <label htmlFor="promo" className="text-sm font-medium text-exaltNavy">
                    Code promo
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      id="promo"
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        setPromoError(null);
                      }}
                      placeholder="Ton code"
                      className="flex-1 h-11 rounded-full border-gray-300 px-4 text-sm focus:border-exaltNavy focus:ring-exaltNavy"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="h-11 px-5 rounded-full border border-exaltNavy text-exaltNavy text-sm font-semibold hover:bg-exaltNavy hover:text-white transition-colors"
                    >
                      Appliquer
                    </button>
                  </div>
                  {promoError && <p className="mt-2 text-sm text-red-600">{promoError}</p>}
                </div>
              )}

              <div className="mt-6">
                <Link
                  to="/checkout"
                  className="bg-exaltNavy hover:bg-exaltPink transition-colors text-white font-semibold rounded-full w-full h-12 flex items-center justify-center"
                >
                  Passer commande
                </Link>
              </div>
            </section>
          </form>
        )}
      </div>
    </div>
  );
};
export default Cart;
