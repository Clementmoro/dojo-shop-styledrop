import {
  Button,
  Dropdown,
  ProductItem,
  QuantityInput,
  StandardSelectInput,
} from "../components";
import { Link, useParams } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { addProductToTheCart } from "../features/cart/cartSlice";
import { useAppDispatch } from "../hooks";
import WithSelectInputWrapper from "../utils/withSelectInputWrapper";
import { formatCategoryName } from "../utils/formatCategoryName";
import { formatPrice } from "../utils/promoCodes";
import toast from "react-hot-toast";

// Date de livraison estimée : aujourd'hui + 4 jours ouvrés
const getEstimatedDelivery = () => {
  const date = new Date();
  let businessDays = 0;
  while (businessDays < 4) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) businessDays++;
  }
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
};

// mêmes règles que le panier : TVA ajoutée au prix affiché + frais de livraison fixes
const CART_TAX_RATE = 0.2;
const CART_SHIPPING_FEE = 5;

// guide des tailles : mesures indicatives (à valider avec le fournisseur)
const SIZE_GUIDE = [
  { size: "XS", chest: "86 à 91", length: "66" },
  { size: "S", chest: "91 à 96", length: "69" },
  { size: "M", chest: "96 à 101", length: "72" },
  { size: "L", chest: "101 à 106", length: "74" },
  { size: "XL", chest: "106 à 111", length: "76" },
  { size: "XXL", chest: "111 à 116", length: "78" },
];

const imageSrc = (image?: string) =>
  image?.startsWith("http") || image?.startsWith("/") ? image : `/assets/${image}`;

const SingleProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [singleProduct, setSingleProduct] = useState<Product | null>(null);
  // options réelles du produit : taille et couleur viennent de la fiche
  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>("");
  // saisie libre pendant la frappe, ramenée entre 1 et le stock dès qu'on quitte le champ
  const [quantityInput, setQuantityInput] = useState<string>("1");
  const [activeImage, setActiveImage] = useState<number>(0);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);
  const [zoomOrigin, setZoomOrigin] = useState<string | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [isMainCtaVisible, setIsMainCtaVisible] = useState<boolean>(true);
  const mainCtaRef = useRef<HTMLDivElement>(null);
  const params = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  // defining HOC instances
  const SelectInputUpgrade = WithSelectInputWrapper(StandardSelectInput);

  useEffect(() => {
    const fetchSingleProduct = async () => {
      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();
      setSingleProduct(data);
    };

    const fetchProducts = async () => {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    };
    fetchSingleProduct();
    fetchProducts();
  }, [params.id]);

  const sizes = singleProduct?.sizes ?? [];
  const colors = singleProduct?.colors ?? [];

  // présélection : M pour les vêtements, sinon la seule option disponible
  useEffect(() => {
    const productSizes = singleProduct?.sizes ?? [];
    const productColors = singleProduct?.colors ?? [];
    setSize(productSizes.includes("M") ? "M" : productSizes[0] ?? "");
    setColor(productColors[0] ?? "");
    setQuantityInput("1");
    setActiveImage(0);
  }, [singleProduct]);

  // barre d'achat mobile : visible seulement quand le bouton principal est hors de l'écran
  useEffect(() => {
    const target = mainCtaRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) =>
      setIsMainCtaVisible(entry.isIntersecting)
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [singleProduct]);

  // fermeture des fenêtres (zoom, guide des tailles) avec Échap
  useEffect(() => {
    if (!isZoomOpen && !isSizeGuideOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsZoomOpen(false);
        setIsSizeGuideOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isZoomOpen, isSizeGuideOpen]);

  const images = singleProduct
    ? singleProduct.images?.length
      ? singleProduct.images
      : [singleProduct.image]
    : [];
  const currentImage = images[activeImage] ?? images[0];

  const isOutOfStock = (singleProduct?.stock ?? 1) === 0;
  const maxQuantity = Math.max(1, singleProduct?.stock ?? 1);
  const parsedQuantity = parseInt(quantityInput, 10);
  const quantity = Number.isNaN(parsedQuantity)
    ? 1
    : Math.min(Math.max(parsedQuantity, 1), maxQuantity);

  // alerte retour en stock (proto : gardée dans le navigateur, aucun e-mail envoyé)
  const STOCK_ALERTS_KEY = "stockAlerts";
  const readStockAlerts = (): Record<string, string> => {
    try {
      return JSON.parse(localStorage.getItem(STOCK_ALERTS_KEY) || "{}");
    } catch {
      return {};
    }
  };
  const [alertEmail, setAlertEmail] = useState<string>("");
  const [alertError, setAlertError] = useState<string | null>(null);
  const [isAlertSaved, setIsAlertSaved] = useState<boolean>(false);

  useEffect(() => {
    if (!singleProduct) return;
    const savedEmail = readStockAlerts()[singleProduct.id];
    let userEmail = "";
    try {
      userEmail = JSON.parse(localStorage.getItem("user") || "{}").email || "";
    } catch {
      userEmail = "";
    }
    setAlertEmail(savedEmail || userEmail);
    setIsAlertSaved(Boolean(savedEmail));
    setAlertError(null);
  }, [singleProduct]);

  const handleStockAlert = () => {
    if (!singleProduct) return;
    const email = alertEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAlertError("Indique une adresse e-mail valide, par exemple prenom@exalt.fr");
      return;
    }
    try {
      localStorage.setItem(
        STOCK_ALERTS_KEY,
        JSON.stringify({ ...readStockAlerts(), [singleProduct.id]: email })
      );
    } catch {
      // stockage indisponible : on confirme quand même pour le proto
    }
    setAlertEmail(email);
    setIsAlertSaved(true);
    toast.success("Alerte retour en stock activée");
  };

  // alternatives en stock : d'abord celles choisies pour ce produit, puis la même catégorie
  const inStockAlternatives = (() => {
    if (!singleProduct || !isOutOfStock) return [];
    const available = products.filter(
      (p) => p.id !== singleProduct.id && (p.stock ?? 0) > 0
    );
    const preferred = (singleProduct.alternatives ?? [])
      .map((id) => available.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
    const sameCategory = available.filter(
      (p) => p.category === singleProduct.category && !preferred.includes(p)
    );
    return [...preferred, ...sameCategory].slice(0, 3);
  })();
  // suggestions : produits en stock de la même catégorie, puis les plus populaires
  const similarProducts = (() => {
    if (!singleProduct) return [];
    const candidates = products
      .filter((p) => p.id !== singleProduct.id && (p.stock ?? 0) > 0)
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    const sameCategory = candidates.filter((p) => p.category === singleProduct.category);
    const others = candidates.filter((p) => p.category !== singleProduct.category);
    return [...sameCategory, ...others].slice(0, 3);
  })();

  // prix final tel que le panier le calculera : produit HT + TVA + livraison
  const priceExclTax = (singleProduct?.price ?? 0) * quantity;
  const taxAmount = priceExclTax * CART_TAX_RATE;
  const finalPrice = priceExclTax + taxAmount + CART_SHIPPING_FEE;
  const priceParts = [
    { key: "product", label: "Produit (HT)", amount: priceExclTax, color: "bg-exaltNavy", sign: "" },
    { key: "tax", label: "TVA 20 %", amount: taxAmount, color: "bg-exaltPink", sign: "+ " },
    { key: "shipping", label: "Livraison", amount: CART_SHIPPING_FEE, color: "bg-exaltYellow", sign: "+ " },
  ];

  const focusStockAlert = () => {
    const field = document.getElementById("stock-alert-email");
    field?.scrollIntoView({ behavior: "smooth", block: "center" });
    field?.focus({ preventScroll: true });
  };

  const isSecret = Boolean(singleProduct?.hidden);

  useEffect(() => {
    if (isSecret) {
      toast("🥚 Secret n°3 sur 3 : le produit fantôme", { id: "secret-3", duration: 6000 });
    }
  }, [isSecret]);

  const handleAddToCart = () => {
    if (!singleProduct) return;
    if (isOutOfStock) {
      toast.error("Ce produit est en rupture de stock");
      return;
    }
    dispatch(
      addProductToTheCart({
        id: singleProduct.id + size + color,
        image: singleProduct.image,
        title: singleProduct.title,
        category: singleProduct.category,
        price: singleProduct.price,
        quantity: Math.min(quantity, singleProduct.stock),
        size,
        color,
        popularity: singleProduct.popularity,
        stock: singleProduct.stock,
      })
    );
    toast.success("Produit ajouté au panier");
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-5 pt-8 max-[400px]:px-3 max-sm:pb-24">
      {isSecret && (
        <div className="mb-6 rounded-2xl bg-exaltYellow text-exaltNavy px-6 py-4 font-semibold">
          🥚 Tu as trouvé le produit fantôme. Il n'existe dans aucun menu : garde le secret jusqu'au débrief.
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-12 max-lg:grid-cols-1">
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              setZoomOrigin(null);
              setIsZoomOpen(true);
            }}
            className="relative rounded-3xl bg-exaltCream overflow-hidden cursor-zoom-in group"
            aria-label="Agrandir la photo"
          >
            <img
              src={imageSrc(currentImage)}
              alt={singleProduct?.title}
              className={`w-full h-full object-cover ${isSecret ? "gold-product" : ""}`}
            />
            <span className="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-exaltNavy shadow group-hover:bg-white">
              🔍 Agrandir
            </span>
          </button>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, idx) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={`h-20 w-20 rounded-xl overflow-hidden bg-exaltCream border-2 ${
                    idx === activeImage ? "border-exaltNavy" : "border-transparent"
                  }`}
                  aria-label={`Photo ${idx + 1}`}
                >
                  <img src={imageSrc(img)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="w-full flex flex-col gap-6 mt-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-exaltPink">
              {formatCategoryName(singleProduct?.category || "")}
            </p>
            <h1 className="font-display text-4xl font-bold text-exaltNavy">{singleProduct?.title}</h1>
            <p className="flex items-baseline gap-2 text-2xl font-bold text-exaltNavy">
              {singleProduct?.price} €
              {singleProduct && (
                <span className="rounded-full bg-exaltCream px-2 py-0.5 text-xs font-semibold tracking-wide text-exaltNavy/70">
                  HT
                </span>
              )}
            </p>
            {singleProduct?.description && (
              <p className="text-gray-600 leading-relaxed mt-2">{singleProduct.description}</p>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {sizes.length > 1 && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="product-size" className="text-sm font-semibold text-exaltNavy">
                    Taille
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="text-sm text-exaltPink underline underline-offset-2 hover:text-exaltNavy"
                  >
                    Guide des tailles
                  </button>
                </div>
                <SelectInputUpgrade
                  id="product-size"
                  selectList={sizes.map((s) => ({ id: s, value: s }))}
                  value={size}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSize(() => e.target.value)
                  }
                />
              </div>
            )}
            {sizes.length === 1 && (
              <p className="text-sm text-exaltNavy">
                <span className="font-semibold">Taille :</span> {sizes[0]}
              </p>
            )}

            {colors.length > 1 && (
              <div className="flex flex-col gap-1">
                <label htmlFor="product-color" className="text-sm font-semibold text-exaltNavy">
                  Couleur
                </label>
                <SelectInputUpgrade
                  id="product-color"
                  selectList={colors.map((c) => ({ id: c, value: c }))}
                  value={color}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setColor(() => e.target.value)
                  }
                />
              </div>
            )}
            {colors.length === 1 && (
              <p className="text-sm text-exaltNavy">
                <span className="font-semibold">Couleur :</span> {colors[0]}
              </p>
            )}

            <div className="flex flex-col gap-1">
              <label htmlFor="product-quantity" className="text-sm font-semibold text-exaltNavy">
                Quantité
              </label>
              <QuantityInput
                id="product-quantity"
                min={1}
                max={maxQuantity}
                inputMode="numeric"
                value={quantityInput}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuantityInput(e.target.value)
                }
                onBlur={() => setQuantityInput(String(quantity))}
              />
            </div>
          </div>
          {/* Stock indicator */}
          {singleProduct && (
            <div className="flex items-center gap-2">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                  Rupture de stock
                </span>
              ) : (singleProduct.stock ?? 99) <= 5 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />
                  Stock faible : {singleProduct.stock} restant{singleProduct.stock > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  En stock
                </span>
              )}
            </div>
          )}

          {inStockAlternatives.length > 0 && (
            <div className="rounded-2xl bg-exaltCream p-4 flex flex-col gap-3">
              <div>
                <p className="font-semibold text-exaltNavy">Disponible tout de suite</p>
                <p className="text-sm text-gray-600">
                  Ce produit est épuisé, mais ceux-ci sont en stock et expédiés sous 48 h.
                </p>
              </div>
              <ul className="flex flex-col gap-2">
                {inStockAlternatives.map((alt) => (
                  <li key={alt.id}>
                    <Link
                      to={`/product/${alt.id}`}
                      className="flex items-center gap-3 rounded-xl bg-white p-2 pr-4 hover:ring-2 hover:ring-exaltNavy transition"
                    >
                      <img
                        src={alt.image?.startsWith("http") || alt.image?.startsWith("/") ? alt.image : `/assets/${alt.image}`}
                        alt={alt.title}
                        className="h-14 w-14 rounded-lg object-cover bg-exaltCream flex-shrink-0"
                      />
                      <span className="flex-1 min-w-0 text-sm font-semibold text-exaltNavy">{alt.title}</span>
                      <span className="text-sm font-bold text-exaltNavy whitespace-nowrap">{alt.price} €</span>
                      <span className="text-sm font-semibold text-exaltPink whitespace-nowrap max-sm:hidden">Voir →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {singleProduct && !isOutOfStock && (
            <section
              aria-labelledby="price-breakdown-title"
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex flex-col gap-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 id="price-breakdown-title" className="text-sm font-semibold uppercase tracking-[0.15em] text-exaltNavy/70">
                  Ce que tu paieras
                </h2>
                <span className="text-xs text-gray-500">
                  pour {quantity} article{quantity > 1 ? "s" : ""}
                </span>
              </div>

              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-exaltCream" aria-hidden="true">
                {priceParts.map((part, idx) => (
                  <div
                    key={part.key}
                    className={`${part.color} h-full transition-all duration-500 ${idx > 0 ? "border-l-2 border-white" : ""}`}
                    style={{ width: `${(part.amount / finalPrice) * 100}%` }}
                  />
                ))}
              </div>

              <dl className="flex flex-col gap-2 text-sm">
                {priceParts.map((part) => (
                  <div key={part.key} className="flex items-center justify-between gap-3">
                    <dt className="flex items-center gap-2 text-gray-600">
                      <span className={`h-2.5 w-2.5 rounded-full ${part.color}`} aria-hidden="true" />
                      {part.label}
                    </dt>
                    <dd className="font-medium tabular-nums text-exaltNavy">
                      {part.sign}
                      {formatPrice(part.amount)}
                    </dd>
                  </div>
                ))}
                <div className="mt-1 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                  <dt className="font-semibold text-exaltNavy">Total à payer</dt>
                  <dd className="text-2xl font-bold tabular-nums text-exaltNavy">{formatPrice(finalPrice)}</dd>
                </div>
              </dl>
            </section>
          )}

          <div ref={mainCtaRef} className="flex flex-col gap-3">
            {isOutOfStock ? (
              isAlertSaved ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  <p className="font-semibold">C'est noté !</p>
                  <p>
                    On t'écrit à <span className="font-semibold">{alertEmail}</span> dès que ce
                    produit revient en stock.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <label htmlFor="stock-alert-email" className="text-sm font-semibold text-exaltNavy">
                    Prévenez-moi du retour en stock
                  </label>
                  <div className="flex gap-2 max-sm:flex-col">
                    <input
                      id="stock-alert-email"
                      type="email"
                      value={alertEmail}
                      onChange={(e) => {
                        setAlertEmail(e.target.value);
                        setAlertError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleStockAlert();
                      }}
                      placeholder="ton.email@exemple.com"
                      autoComplete="email"
                      className="flex-1 h-12 px-4 rounded-full border border-gray-300 text-exaltNavy focus:border-exaltNavy focus:ring-exaltNavy"
                    />
                    <Button
                      mode="primary"
                      text="Me prévenir"
                      onClick={handleStockAlert}
                      className="sm:w-auto sm:px-8"
                    />
                  </div>
                  {alertError && <p className="text-sm text-red-600">{alertError}</p>}
                </div>
              )
            ) : (
              <>
                <Button mode="primary" text="Ajouter au panier" onClick={handleAddToCart} />
                <p className="text-gray-500 text-sm text-right">
                  Livraison estimée le {getEstimatedDelivery()}
                </p>
              </>
            )}
          </div>
          <div>
            <Dropdown dropdownTitle="Détails du produit">
              {(singleProduct?.details ?? []).map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
              <span className="block mt-2">
                Produit officiel eXalt, marquage réalisé en France par notre atelier partenaire.
              </span>
            </Dropdown>

            <Dropdown dropdownTitle="Livraison et retours">
              Expédition sous 48 h, livraison en 3 à 5 jours ouvrés. Livraison offerte dès 80 € d'achat.
              Retours gratuits sous 30 jours.
            </Dropdown>
          </div>
        </div>
      </div>

      {/* similar products */}
      <div>
        <h2 className="font-display text-exaltNavy text-3xl font-bold mt-24 mb-2 max-sm:text-2xl">
          Vous aimerez aussi
        </h2>
        <div className="grid grid-cols-3 gap-6 mt-8 max-md:grid-cols-2 max-md:gap-4">
          {similarProducts.map((product: Product) => (
            <ProductItem
              key={product?.id}
              id={product?.id}
              image={product?.image}
              title={product?.title}
              category={product?.category}
              price={product?.price}
              popularity={product?.popularity}
              stock={product?.stock}
            />
          ))}
        </div>
      </div>

      {/* barre d'achat mobile */}
      {singleProduct && !isMainCtaVisible && (
        <div
          className="sm:hidden fixed inset-x-0 bottom-0 z-30 bg-white border-t border-gray-200 px-4 pt-3 flex items-center gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-exaltNavy truncate">{singleProduct.title}</p>
            <p className="text-sm font-bold text-exaltNavy">
              {isOutOfStock ? `${singleProduct.price} € HT` : `${formatPrice(finalPrice)} au total`}
              {size ? ` · ${size}` : ""}
            </p>
          </div>
          {isOutOfStock ? (
            isAlertSaved ? (
              <span className="text-sm font-semibold text-green-700">Alerte activée ✓</span>
            ) : (
              <Button mode="primary" text="Me prévenir" onClick={focusStockAlert} className="!w-auto px-6" />
            )
          ) : (
            <Button mode="primary" text="Ajouter au panier" onClick={handleAddToCart} className="!w-auto px-6" />
          )}
        </div>
      )}

      {/* photo agrandie */}
      {isZoomOpen && currentImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Photo agrandie"
          onClick={() => setIsZoomOpen(false)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 rounded-full bg-white/90 h-10 w-10 text-exaltNavy text-xl font-bold"
            onClick={() => setIsZoomOpen(false)}
            aria-label="Fermer"
          >
            ×
          </button>
          <div
            className="max-h-full max-w-3xl w-full overflow-hidden rounded-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageSrc(currentImage)}
              alt={singleProduct?.title}
              onClick={(e) => {
                if (zoomOrigin) {
                  setZoomOrigin(null);
                  return;
                }
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setZoomOrigin(`${x}% ${y}%`);
              }}
              className={`w-full h-auto transition-transform duration-200 ${
                zoomOrigin ? "scale-[2.2] cursor-zoom-out" : "cursor-zoom-in"
              }`}
              style={{ transformOrigin: zoomOrigin ?? "center" }}
            />
          </div>
          <p className="absolute bottom-6 inset-x-0 text-center text-sm text-white/80 pointer-events-none">
            Touche la photo pour zoomer sur un détail
          </p>
        </div>
      )}

      {/* guide des tailles */}
      {isSizeGuideOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-guide-title"
          onClick={() => setIsSizeGuideOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="size-guide-title" className="font-display text-2xl font-bold text-exaltNavy">
                Guide des tailles
              </h2>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="text-2xl leading-none text-gray-500 hover:text-exaltNavy"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Coupe unisexe. Mesure le tour de poitrine sous les bras. Entre deux tailles, prends la
              plus grande.
            </p>
            <table className="w-full text-sm text-exaltNavy">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="py-2 font-semibold">Taille</th>
                  <th className="py-2 font-semibold">Tour de poitrine (cm)</th>
                  <th className="py-2 font-semibold">Longueur (cm)</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_GUIDE.map((row) => (
                  <tr
                    key={row.size}
                    className={`border-b border-gray-100 ${row.size === size ? "bg-exaltCream font-semibold" : ""}`}
                  >
                    <td className="py-2">{row.size}</td>
                    <td className="py-2">{row.chest}</td>
                    <td className="py-2">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-500">Mesures indicatives, à 2 cm près.</p>
          </div>
        </div>
      )}
    </div>
  );
};
export default SingleProduct;
