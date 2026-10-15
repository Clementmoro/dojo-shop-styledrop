import { useEffect, useState } from "react";
import { HiCheck as CheckIcon, HiXMark as XMarkIcon } from "react-icons/hi2";
import { useAppDispatch, useAppSelector } from "../hooks";
import { Link } from "react-router-dom";
import {
  addProductToTheCart,
  applyPromoCode,
  removePromoCode,
  removeProductFromTheCart,
  updateProductQuantity,
} from "../features/cart/cartSlice";
import toast from "react-hot-toast";
import {
  EXPIRED_PROMO_CODES,
  formatPrice,
  getPromoDiscountRate,
} from "../utils/promoCodes";
import { FREE_SHIPPING_THRESHOLD, getShippingFee } from "../utils/shipping";

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
  // Les prix du catalogue sont TTC : la TVA est incluse, affichée pour information
  const tax = taxableAmount - taxableAmount / (1 + TAX_RATE);
  const shipping = getShippingFee(taxableAmount);
  const total = subtotal === 0 ? 0 : taxableAmount + shipping;
  const missingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - taxableAmount);
  const freeShippingProgress = Math.min(100, (taxableAmount / FREE_SHIPPING_THRESHOLD) * 100);

  // Suggestion : le produit le moins cher qui fait atteindre la livraison offerte
  const [catalog, setCatalog] = useState<Product[]>([]);
  useEffect(() => {
    fetch("/api/products")
      .then((response) => response.json())
      .then((data: Product[]) => setCatalog(data))
      .catch(() => setCatalog([]));
  }, []);
  const cartTitles = productsInCart.map((product) => product.title);
  const candidates = catalog.filter(
    (product) =>
      !product.hidden &&
      product.stock > 0 &&
      product.price < FREE_SHIPPING_THRESHOLD &&
      !cartTitles.includes(product.title)
  );
  // 3 suggestions max : uniquement les produits qui font passer le panier à 81 € ou plus, du moins cher au plus cher
  const SUGGESTION_TARGET = 81;
  const suggestedProducts =
    missingForFreeShipping > 0
      ? candidates
          .filter((product) => taxableAmount + product.price >= SUGGESTION_TARGET)
          .sort((a, b) => a.price - b.price)
          .slice(0, 3)
      : [];

  const handleAddSuggestion = (product: Product) => {
    // Taille et couleur par défaut, comme sur la fiche produit
    const size = "xs";
    const color = "black";
    dispatch(
      addProductToTheCart({
        id: product.id + size + color,
        image: product.image,
        title: product.title,
        category: product.category,
        price: product.price,
        quantity: 1,
        size,
        color,
        popularity: product.popularity,
        stock: product.stock,
      })
    );
    toast.success(`${product.title} ajouté au panier`);
  };

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    if (EXPIRED_PROMO_CODES.includes(promoInput.trim())) {
      setPromoError("Code expiré");
      return;
    }
    const rate = getPromoDiscountRate(promoInput);
    if (rate === null) {
      setPromoError("Code invalide");
      return;
    }
    dispatch(applyPromoCode({ code: promoInput.trim(), rate }));
    setPromoError(null);
    setPromoInput("");
    toast.success(`-${rate * 100} % appliqué`);
  };

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

              {/* Jauge livraison offerte */}
              <div className="mt-4 rounded-2xl bg-white px-4 py-3">
                <p className="text-sm font-medium text-exaltNavy">
                  {missingForFreeShipping > 0 ? (
                    <>
                      Plus que <span className="font-bold text-exaltPink">{formatPrice(missingForFreeShipping)}</span> pour la livraison offerte 🚚
                    </>
                  ) : (
                    <span className="text-green-700">Livraison offerte ✓</span>
                  )}
                </p>
                <div
                  className="mt-2 h-2 w-full rounded-full bg-gray-200 overflow-hidden"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={FREE_SHIPPING_THRESHOLD}
                  aria-valuenow={Math.min(taxableAmount, FREE_SHIPPING_THRESHOLD)}
                  aria-label="Progression vers la livraison offerte"
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${missingForFreeShipping > 0 ? "bg-exaltPink" : "bg-green-600"}`}
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>

                {suggestedProducts.length > 0 && (
                  <div className="mt-3 border-t border-gray-100 pt-3">
                    <p className="text-xs font-medium text-gray-500">Complète ton panier</p>
                    <ul className="-mx-1 mt-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
                      {suggestedProducts.map((product) => (
                        <li
                          key={product.id}
                          className="flex w-36 flex-shrink-0 snap-start flex-col rounded-2xl border border-gray-100 bg-white p-2"
                        >
                          <Link to={`/product/${product.id}`}>
                            <img
                              src={product.image.startsWith("http") || product.image.startsWith("/") ? product.image : `/assets/${product.image}`}
                              alt={product.title}
                              className="h-24 w-full rounded-xl bg-exaltCream object-cover"
                            />
                            <p className="mt-2 line-clamp-2 text-xs font-semibold text-exaltNavy">{product.title}</p>
                          </Link>
                          <p className="mt-1 text-sm font-bold text-exaltNavy">{formatPrice(product.price)}</p>
                          {product.price >= missingForFreeShipping && (
                            <p className="text-[11px] font-medium text-green-700">Livraison offerte</p>
                          )}
                          <button
                            type="button"
                            onClick={() => handleAddSuggestion(product)}
                            className="mt-auto pt-2"
                          >
                            <span className="block w-full rounded-full bg-exaltNavy px-3 py-2 text-xs font-semibold text-white hover:bg-exaltPink transition-colors">
                              + Ajouter
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-gray-600">Sous-total</dt>
                  <dd className="font-medium text-exaltNavy">{formatPrice(subtotal)}</dd>
                </div>
                {promoCode && (
                  <div className="flex items-center justify-between text-green-700">
                    <dt className="flex items-center gap-2">
                      Code {promoCode}
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
                  <dd className="font-medium text-exaltNavy">{shipping === 0 ? "Offerte" : formatPrice(shipping)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-semibold text-exaltNavy">Total TTC</dt>
                  <dd className="text-base font-bold text-exaltNavy">{formatPrice(total)}</dd>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <dt>dont TVA (20 %)</dt>
                  <dd>{formatPrice(tax)}</dd>
                </div>
              </dl>

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
