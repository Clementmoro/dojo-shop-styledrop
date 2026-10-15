import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch } from "../hooks";
import { addProductToTheCart } from "../features/cart/cartSlice";
import { formatPrice } from "../utils/promoCodes";

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

const SearchBundle = ({ bundle }: { bundle: Product[] }) => {
  const dispatch = useAppDispatch();
  const total = bundle.reduce((sum, p) => sum + p.price, 0);

  const handleAddBundle = () => {
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
    toast.success("Le pack de 3 produits est dans ton panier");
  };

  return (
    <section className="mx-5 mt-16 rounded-3xl bg-exaltCream p-8 max-sm:p-5 max-[400px]:mx-3" aria-labelledby="bundle-title">
      <p className="text-xs font-bold uppercase tracking-wider text-exaltPink">Le pack qui va avec</p>
      <h2 id="bundle-title" className="mt-1 font-display text-2xl font-bold text-exaltNavy max-sm:text-xl">
        Complète ton {bundle[0].title.replace(/^eXalt /, "")}
      </h2>

      <div className="mt-6 grid grid-cols-3 gap-4 max-md:grid-cols-1">
        {bundle.map((p, i) => (
          <Link
            key={p.id}
            to={`/product/${p.id}`}
            className="group relative flex items-center gap-4 rounded-2xl bg-white p-3 md:flex-col md:items-stretch"
          >
            {i > 0 && (
              <span className="absolute -left-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-exaltNavy text-sm font-bold text-white md:flex">
                +
              </span>
            )}
            <div className="aspect-square w-20 flex-shrink-0 overflow-hidden rounded-xl bg-exaltCream md:w-full">
              <img src={imageSrc(p.image)} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="flex flex-1 items-start justify-between gap-2 md:px-1">
              <p className="text-sm font-semibold text-exaltNavy group-hover:text-exaltPink">{p.title}</p>
              <p className="whitespace-nowrap text-sm font-bold text-exaltNavy">{p.price} €</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-600">Les 3 produits</p>
          <p className="text-2xl font-bold text-exaltNavy">{formatPrice(total)}</p>
          <p className="text-xs text-gray-500">Ajoutés en taille M. Pour une autre taille, passe par la fiche du produit.</p>
        </div>
        <button
          type="button"
          onClick={handleAddBundle}
          className="h-12 rounded-full bg-exaltNavy px-8 font-semibold text-white transition-colors hover:bg-exaltPink max-sm:w-full"
        >
          Ajouter le pack au panier
        </button>
      </div>
    </section>
  );
};

export default SearchBundle;
