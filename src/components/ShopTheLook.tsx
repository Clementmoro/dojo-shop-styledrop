import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { addProductToTheCart } from "../features/cart/cartSlice";
import { useAppDispatch } from "../hooks";
import { getLooksForProduct, Look } from "../data/looks";

const SIZES = [
  { id: "xs", value: "XS" },
  { id: "sm", value: "S" },
  { id: "m", value: "M" },
  { id: "lg", value: "L" },
  { id: "xl", value: "XL" },
  { id: "2xl", value: "2XL" },
];

const imageSrc = (image: string) =>
  image.startsWith("http") || image.startsWith("/") ? image : `/assets/${image}`;

// Les vêtements ont une taille, les accessoires et la papeterie non
const hasSize = (product: Product) => /hoodie|t-shirt|polo|sweatshirt/i.test(product.title);

const isAvailable = (product: Product) => (product.stock ?? 0) > 0;

const LookCard = ({
  look,
  items,
  currentId,
}: {
  look: Look;
  items: Product[];
  currentId: string;
}) => {
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState<string[]>(
    items.filter(isAvailable).map((p) => p.id)
  );
  const [size, setSize] = useState("m");

  const chosen = items.filter((p) => selected.includes(p.id) && isAvailable(p));
  const total = chosen.reduce((sum, p) => sum + p.price, 0);
  const needsSize = chosen.some(hasSize);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const addLook = () => {
    if (chosen.length === 0) return;
    chosen.forEach((p) => {
      const itemSize = hasSize(p) ? size : "";
      dispatch(
        addProductToTheCart({
          id: p.id + itemSize,
          image: p.image,
          title: p.title,
          category: p.category,
          price: p.price,
          quantity: 1,
          size: itemSize ? SIZES.find((s) => s.id === itemSize)?.value || itemSize : "",
          color: "",
          popularity: p.popularity,
          stock: p.stock,
        })
      );
    });
    toast.success(
      `Look « ${look.name} » ajouté au panier (${chosen.length} article${chosen.length > 1 ? "s" : ""})`
    );
  };

  return (
    <div className="grid grid-cols-[2fr_3fr] gap-8 rounded-3xl border border-gray-200 bg-white p-6 max-md:grid-cols-1 max-md:p-4 max-md:gap-4">
      {/* Mosaïque du look (tablette et ordinateur) */}
      <div className="grid grid-cols-2 gap-2 self-start max-md:hidden" aria-hidden="true">
        {items.slice(0, 4).map((p) => (
          <div key={p.id} className="aspect-square rounded-2xl bg-exaltCream overflow-hidden">
            <img
              src={imageSrc(p.image)}
              alt=""
              className={`w-full h-full object-cover ${isAvailable(p) ? "" : "opacity-50 grayscale"}`}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 min-w-0">
        <div>
          <h3 className="font-display text-2xl font-bold text-exaltNavy max-sm:text-xl">{look.name}</h3>
          <p className="text-gray-600 mt-1">{look.tagline}</p>
        </div>

        <ul className="flex flex-col divide-y divide-gray-100 border-y border-gray-100">
          {items.map((p) => {
            const available = isAvailable(p);
            const checked = available && selected.includes(p.id);
            return (
              <li key={p.id} className="flex items-center gap-3 py-2.5">
                <input
                  id={`look-${look.id}-${p.id}`}
                  type="checkbox"
                  checked={checked}
                  disabled={!available}
                  onChange={() => toggle(p.id)}
                  className="w-5 h-5 shrink-0 accent-exaltNavy cursor-pointer disabled:cursor-not-allowed"
                />
                <label
                  htmlFor={`look-${look.id}-${p.id}`}
                  className={`flex flex-1 min-w-0 items-center gap-3 min-h-[56px] ${
                    available ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
                >
                  <img
                    src={imageSrc(p.image)}
                    alt=""
                    className={`w-14 h-14 shrink-0 rounded-xl object-cover bg-exaltCream ${
                      available ? "" : "opacity-50 grayscale"
                    }`}
                  />
                  <span className="flex-1 min-w-0 flex flex-col">
                    <span className={`font-semibold leading-snug ${available ? "text-exaltNavy" : "text-gray-400"}`}>
                      {p.title}
                    </span>
                    <span className="text-sm">
                      {p.id === currentId && <span className="text-exaltPink font-semibold">Cet article · </span>}
                      {available ? (
                        <span className="text-gray-500">{hasSize(p) ? "Taille au choix" : "Taille unique"}</span>
                      ) : (
                        <span className="text-red-600">Rupture de stock, non inclus</span>
                      )}
                    </span>
                  </span>
                  <span className={`font-bold whitespace-nowrap ${available ? "text-exaltNavy" : "text-gray-400 line-through"}`}>
                    {p.price} €
                  </span>
                </label>
                {p.id !== currentId && (
                  <Link
                    to={`/product/${p.id}`}
                    className="text-sm text-exaltNavy underline underline-offset-2 hover:text-exaltPink shrink-0 max-sm:hidden"
                  >
                    Voir
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-end gap-4 justify-between">
          {needsSize ? (
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-exaltNavy">Taille des vêtements</span>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="min-h-[48px] min-w-[7rem] border border-gray-300 rounded-lg px-3 text-base bg-white outline-none focus:border-exaltNavy"
              >
                {SIZES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.value}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <span />
          )}
          <p className="text-right">
            <span className="block text-sm text-gray-500">
              {chosen.length} article{chosen.length > 1 ? "s" : ""}
            </span>
            <span className="font-display text-2xl font-bold text-exaltNavy">{total} €</span>
          </p>
        </div>

        <button
          type="button"
          onClick={addLook}
          disabled={chosen.length === 0}
          className="w-full min-h-[52px] rounded-full bg-exaltNavy text-white font-semibold hover:bg-exaltPink transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-exaltPink"
        >
          {chosen.length === 0 ? "Sélectionnez au moins un article" : `Ajouter le look au panier · ${total} €`}
        </button>
      </div>
    </div>
  );
};

// Bloc « Complétez le look » affiché sur la fiche produit
const ShopTheLook = ({ product, products }: { product: Product; products: Product[] }) => {
  const looks = useMemo(() => getLooksForProduct(product.id), [product.id]);
  const [activeId, setActiveId] = useState(looks[0]?.id);
  const active = looks.find((l) => l.id === activeId) || looks[0];

  if (!active || products.length === 0) return null;
  const items = active.productIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
  if (items.length < 2) return null;

  return (
    <section aria-labelledby="look-title" className="mt-24 max-md:mt-16 flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="look-title" className="font-display text-exaltNavy text-3xl font-bold max-sm:text-2xl">
            Complétez le look
          </h2>
          <p className="text-gray-600 mt-1">Les articles pensés pour aller ensemble, à ajouter en un clic.</p>
        </div>
        {looks.length > 1 && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Choisir un look">
            {looks.map((l) => (
              <button
                key={l.id}
                type="button"
                aria-pressed={l.id === active.id}
                onClick={() => setActiveId(l.id)}
                className={`min-h-[44px] px-4 rounded-full border text-sm font-semibold transition-colors ${
                  l.id === active.id
                    ? "bg-exaltNavy text-white border-exaltNavy"
                    : "border-gray-300 text-exaltNavy hover:border-exaltNavy"
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <LookCard key={`${product.id}-${active.id}-${items.length}`} look={active} items={items} currentId={product.id} />
    </section>
  );
};

export default ShopTheLook;
