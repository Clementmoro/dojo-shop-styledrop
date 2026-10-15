import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../hooks";
import { addProductToTheCart } from "../features/cart/cartSlice";
import { SURPRISE_ID, SURPRISE_IMAGE, SURPRISE_PRICE, buildSurpriseCartItem, pickSurpriseProduct } from "../utils/surprise";

// Carte « Produit mystère » de la liste produits : le vrai produit reste caché jusqu'à la fin du paiement
const MysteryProductItem = () => {
  const dispatch = useAppDispatch();
  const alreadyInCart = useAppSelector((state) =>
    state.cart.productsInCart.some((product) => product.id === SURPRISE_ID)
  );

  const handleAddToCart = async () => {
    if (alreadyInCart) return;
    try {
      const response = await fetch("/api/products");
      const catalog = (await response.json()) as Product[];
      const product = pickSurpriseProduct(catalog);
      if (!product) {
        toast.error("Plus de produit mystère disponible pour le moment");
        return;
      }
      dispatch(addProductToTheCart(buildSurpriseCartItem(product)));
      toast.success("🎁 Produit mystère ajouté ! Il sera dévoilé à la fin du paiement");
    } catch {
      toast.error("Oups, réessaie dans un instant.");
    }
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-exaltPink to-exaltNavy">
        <img src={SURPRISE_IMAGE} alt="Produit mystère" className="h-full w-full object-cover" />
        <span className="absolute left-3 top-3 rounded-full bg-exaltYellow px-2.5 py-1 text-xs font-bold text-exaltNavy">
          Mystère
        </span>
      </div>
      <div className="flex items-start justify-between gap-3 px-1">
        <div>
          <h2 className="text-base font-semibold text-exaltNavy">Produit mystère</h2>
          <p className="text-sm text-gray-500">Dévoilé à la fin du paiement</p>
        </div>
        <p className="whitespace-nowrap text-base font-bold text-exaltNavy">
          {SURPRISE_PRICE} € <span className="text-xs font-medium text-gray-500">TTC</span>
        </p>
      </div>
      <div className="mx-1 mt-auto flex flex-col gap-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={alreadyInCart}
          className="h-8 w-full whitespace-nowrap rounded-full bg-exaltPink px-3 text-xs font-semibold text-white transition-colors hover:bg-exaltNavy disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
        >
          {alreadyInCart ? "Déjà dans ton panier" : "Ajouter au panier"}
        </button>
        <p className="flex h-8 items-center justify-center text-center text-xs text-gray-500">
          Un goodie en stock, d'une valeur de 20 € à 75 €
        </p>
      </div>
    </div>
  );
};
export default MysteryProductItem;
