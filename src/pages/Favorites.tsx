import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HiOutlineHeart } from "react-icons/hi2";
import { ProductGrid } from "../components";
import customFetch from "../axios/custom";
import { useFavorites } from "../utils/favorites";

const Favorites = () => {
  const favorites = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    customFetch("/products").then((response) => {
      setProducts(response.data);
      setLoaded(true);
    });
  }, []);

  // Dans l'ordre d'ajout, le plus récent en premier
  const saved = favorites
    .map((id) => products.find((p) => p.id === id && !p.hidden))
    .filter((p): p is Product => Boolean(p));

  return (
    <div className="max-w-screen-2xl mx-auto pt-10 pb-24">
      <div className="px-5 max-[400px]:px-3">
        <h1 className="font-display text-4xl font-bold text-exaltNavy max-sm:text-3xl">Mes favoris</h1>
        {loaded && saved.length > 0 && (
          <p className="text-gray-600 mt-2">
            {saved.length} produit{saved.length > 1 ? "s" : ""} sauvegardé{saved.length > 1 ? "s" : ""}. Touchez le cœur pour en retirer un.
          </p>
        )}
      </div>

      {loaded && saved.length === 0 && (
        <div className="mx-5 mt-8 rounded-3xl bg-exaltCream px-6 py-12 flex flex-col items-center text-center gap-3 max-[400px]:mx-3">
          <HiOutlineHeart className="text-5xl text-exaltPink" aria-hidden="true" />
          <p className="font-display text-xl font-bold text-exaltNavy">Aucun favori pour l'instant</p>
          <p className="text-gray-600 max-w-md">
            Touchez le cœur sur un produit pour le retrouver ici plus tard.
          </p>
          <Link
            to="/shop"
            className="mt-2 inline-flex items-center min-h-[48px] px-8 rounded-full bg-exaltNavy text-white font-semibold hover:bg-exaltPink transition-colors"
          >
            Découvrir la boutique
          </Link>
        </div>
      )}

      {saved.length > 0 && <ProductGrid products={saved} />}
    </div>
  );
};
export default Favorites;
