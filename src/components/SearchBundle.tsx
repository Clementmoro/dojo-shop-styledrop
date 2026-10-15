import { Fragment, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch } from "../hooks";
import { addProductToTheCart, applyPromoCode } from "../features/cart/cartSlice";
import { formatPrice, getPromoDiscountRate } from "../utils/promoCodes";

// Catégories qui complètent le meilleur résultat de la recherche.
const COMPLEMENTS: Record<string, string[]> = {
  clothing: ["accessories", "stationery"],
  accessories: ["clothing", "stationery"],
  stationery: ["clothing", "accessories"],
  "limited-edition": ["accessories", "stationery"],
};

const DEFAULT_SIZE = "m";
const DEFAULT_COLOR = "black";

const imageSrc = (image: string) =>
  image.startsWith("http") || image.startsWith("/") ? image : `/assets/${image}`;

// Le pack : le meilleur résultat en stock + le produit le plus populaire
// de chacune des deux catégories complémentaires.
export const buildBundle = (results: Product[], allProducts: Product[]): Product[] | null => {
  const available = (p: Product) => !p.hidden && p.stock > 0;
  const anchor = results.find(available);
  if (!anchor) return null;
  const bundle = [anchor];
  (COMPLEMENTS[anchor.category] || []).forEach((category) => {
    const pick = allProducts
      .filter((p) => available(p) && p.category === category && !bundle.includes(p))
      .sort((a, b) => b.popularity - a.popularity)[0];
    if (pick) bundle.push(pick);
  });
  return bundle.length === 3 ? bundle : null;
};

const Sign = ({ children }: { children: ReactNode }) => (
  <span
    aria-hidden="true"
    className="flex h-9 w-9 flex-shrink-0 items-center justify-center self-center rounded-full bg-exaltNavy text-lg font-bold text-white"
  >
    {children}
  </span>
);

const BUNDLE_PROMO_CODE = "BIENVENUE-10";

const SearchBundle = ({ bundle }: { bundle: Product[] }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const total = bundle.reduce((sum, p) => sum + p.price, 0);
  // Le code affiché est celui que le site accepte réellement
  const promoRate = getPromoDiscountRate(BUNDLE_PROMO_CODE);
  const totalWithPromo = promoRate ? total * (1 - promoRate) : total;

  const addBundleToCart = () =>
    bundle.forEach((p) =>
      dispatch(
        addProductToTheCart({
          id: p.id + DEFAULT_SIZE + DEFAULT_COLOR,
          image: p.image,
          title: p.title,
          category: p.category,
          price: p.price,
          quantity: 1,
          size: DEFAULT_SIZE,
          color: DEFAULT_COLOR,
          popularity: p.popularity,
          stock: p.stock,
        })
      )
    );

  const handleBuyNow = () => {
    addBundleToCart();
    if (promoRate) dispatch(applyPromoCode({ code: BUNDLE_PROMO_CODE, rate: promoRate }));
    toast.success("Pack ajouté, code appliqué : direction le paiement");
    navigate("/checkout");
  };

  const handleAddOnly = () => {
    addBundleToCart();
    toast.success("Le pack de 3 produits est dans ton panier");
  };

  const handleCopy = () => {
    navigator.clipboard
      ?.writeText(BUNDLE_PROMO_CODE)
      .then(() => toast.success("Code copié"))
      .catch(() => toast(`Ton code : ${BUNDLE_PROMO_CODE}`));
  };

  return (
    <section className="mx-5 mt-16 rounded-3xl bg-exaltCream p-8 max-sm:p-5 max-[400px]:mx-3" aria-labelledby="bundle-title">
      <p className="text-xs font-bold uppercase tracking-wider text-exaltPink">Le pack qui va avec</p>
      <h2 id="bundle-title" className="mt-1 font-display text-2xl font-bold text-exaltNavy max-sm:text-xl">
        Complète ton {bundle[0].title.replace(/^eXalt /, "")}
      </h2>

      <div className="mt-6 grid gap-8 md:grid-cols-2 md:items-center">
        {/* Moitié gauche : produit + produit + produit = total */}
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_auto]">
          {bundle.map((p, i) => (
            <Fragment key={p.id}>
              {i > 0 && <Sign>+</Sign>}
              <Link to={`/product/${p.id}`} className="group flex min-w-0 flex-col gap-1">
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-white">
                  <img src={imageSrc(p.image)} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <p className="line-clamp-2 text-xs font-semibold text-exaltNavy group-hover:text-exaltPink">
                  {p.title.replace(/^eXalt /, "")}
                </p>
                <p className="text-xs font-bold text-exaltNavy">{formatPrice(p.price)}</p>
              </Link>
            </Fragment>
          ))}
          <div className="col-span-5 flex items-center justify-center gap-2 sm:col-span-2 sm:self-start sm:pt-[18%]">
            <Sign>=</Sign>
            <p className="whitespace-nowrap font-display text-2xl font-bold text-exaltNavy">{formatPrice(total)}</p>
          </div>
        </div>

        {/* Moitié droite : code promo + passage direct au paiement */}
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6">
          {promoRate && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-dashed border-exaltPink px-4 py-3">
              <div>
                <p className="text-xs text-gray-500">Ton code de bienvenue, -{Math.round(promoRate * 100)} %</p>
                <p className="font-mono text-lg font-bold tracking-wider text-exaltNavy">{BUNDLE_PROMO_CODE}</p>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="h-9 rounded-full border border-exaltNavy px-4 text-xs font-semibold text-exaltNavy transition-colors hover:bg-exaltNavy hover:text-white"
              >
                Copier
              </button>
            </div>
          )}

          <div className="flex items-baseline gap-3">
            {promoRate && <p className="text-base text-gray-400 line-through">{formatPrice(total)}</p>}
            <p className="font-display text-3xl font-bold text-exaltNavy">{formatPrice(totalWithPromo)}</p>
            <p className="text-xs text-gray-500">les 3 produits{promoRate ? ", code appliqué" : ""}</p>
          </div>

          <button
            type="button"
            onClick={handleBuyNow}
            className="h-14 w-full rounded-full bg-exaltPink px-6 text-base font-bold text-white transition-colors hover:bg-exaltNavy"
          >
            Je prends les 3 et je paie
          </button>
          <button
            type="button"
            onClick={handleAddOnly}
            className="text-sm font-semibold text-exaltNavy underline underline-offset-4 hover:text-exaltPink"
          >
            Ajouter au panier et continuer mes achats
          </button>
          <p className="text-xs text-gray-500">Ajoutés en taille M. Pour une autre taille, passe par la fiche du produit.</p>
        </div>
      </div>
    </section>
  );
};

export default SearchBundle;
