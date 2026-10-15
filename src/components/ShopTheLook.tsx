import { useMemo, useState } from "react";
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
    <div className="flex flex-col gap-3">
      <p className="text-gray-600">
        <span className="font-semibold text-exaltNavy">{look.name}</span> · {look.tagline}
      </p>
      <div className="grid grid-cols-[1fr_17rem] gap-6 items-stretch max-lg:grid-cols-1 max-lg:gap-4">
        {/* La ligne d'articles : défile au doigt sur petit écran */}
        <ul className="flex items-stretch gap-6 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 min-w-0">
          {items.map((p, i) => {
            const available = isAvailable(p);
            const checked = available && selected.includes(p.id);
            return (
              <li key={p.id} className="relative flex snap-start shrink-0 lg:shrink lg:flex-1 lg:basis-0 lg:min-w-0">
                {i > 0 && (
                  <span aria-hidden="true" className="absolute -left-[1.1rem] top-1/2 -translate-y-1/2 text-2xl font-light text-gray-400">
                    +
                  </span>
                )}
                <label
                  htmlFor={`look-${look.id}-${p.id}`}
                  className={`relative flex flex-col gap-2 w-36 sm:w-40 lg:w-full h-full rounded-2xl border-2 p-2 transition-colors ${
                    checked ? "border-exaltNavy bg-white" : "border-gray-200 bg-gray-50"
                  } ${available ? "cursor-pointer" : "cursor-not-allowed"}`}
                >
                  <input
                    id={`look-${look.id}-${p.id}`}
                    type="checkbox"
                    checked={checked}
                    disabled={!available}
                    onChange={() => toggle(p.id)}
                    className="absolute top-3 left-3 z-10 w-5 h-5 accent-exaltNavy cursor-pointer disabled:cursor-not-allowed"
                  />
                  <span className="aspect-square rounded-xl bg-exaltCream overflow-hidden">
                    <img
                      src={imageSrc(p.image)}
                      alt=""
                      className={`w-full h-full object-cover ${available ? "" : "opacity-50 grayscale"} ${
                        available && !checked ? "opacity-60" : ""
                      }`}
                    />
                  </span>
                  <span className="flex flex-col gap-0.5 px-1 pb-1 min-w-0">
                    <span className={`text-sm font-semibold leading-snug ${available ? "text-exaltNavy" : "text-gray-400"}`}>
                      {p.title}
                    </span>
                    <span className="text-sm">
                      <span className={`font-bold ${available ? "text-exaltNavy" : "text-gray-400 line-through"}`}>
                        {p.price} €
                      </span>
                      {p.id === currentId && <span className="text-exaltPink font-semibold"> · Cet article</span>}
                    </span>
                    {!available && <span className="text-xs text-red-600">Rupture, non inclus</span>}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        {/* Récapitulatif et achat */}
        <div className="flex flex-col justify-end gap-3 rounded-2xl bg-exaltCream p-4 max-lg:flex-row max-lg:flex-wrap max-lg:items-end">
          <p className="max-lg:flex-1">
            <span className="block text-sm text-gray-500">
              {chosen.length} article{chosen.length > 1 ? "s" : ""}
            </span>
            <span className="font-display text-2xl font-bold text-exaltNavy">{total} €</span>
          </p>
          {needsSize && (
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
          )}
          <button
            type="button"
            onClick={addLook}
            disabled={chosen.length === 0}
            className="w-full min-h-[52px] px-4 rounded-full bg-exaltNavy text-white font-semibold hover:bg-exaltPink transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-exaltPink"
          >
            {chosen.length === 0 ? "Sélectionnez un article" : "Ajouter le look au panier"}
          </button>
        </div>
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
    <section aria-labelledby="look-title" className="mt-12 max-md:mt-8 flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="look-title" className="font-display text-exaltNavy text-2xl font-bold max-sm:text-xl">
            Complétez le look
          </h2>
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
