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
      {/* La ligne d'articles : défile au doigt si elle dépasse */}
      <ul className="grid grid-flow-col auto-cols-[minmax(5.25rem,1fr)] gap-5 overflow-x-auto snap-x pb-1 -mx-1 px-1">
        {items.map((p, i) => {
          const available = isAvailable(p);
          const checked = available && selected.includes(p.id);
          return (
            <li key={p.id} className="relative snap-start min-w-0">
              {i > 0 && (
                <span aria-hidden="true" className="absolute -left-[0.95rem] top-[2.6rem] text-xl font-light text-gray-400">
                  +
                </span>
              )}
              <label
                htmlFor={`look-${look.id}-${p.id}`}
                title={p.title}
                className={`flex flex-col gap-1 ${available ? "cursor-pointer" : "cursor-not-allowed"}`}
              >
                <span
                  className={`relative block aspect-square rounded-xl overflow-hidden bg-exaltCream border-2 transition-colors ${
                    checked ? "border-exaltNavy" : "border-transparent"
                  }`}
                >
                  <img
                    src={imageSrc(p.image)}
                    alt=""
                    className={`w-full h-full object-cover ${available ? "" : "grayscale opacity-50"} ${
                      available && !checked ? "opacity-50" : ""
                    }`}
                  />
                  <input
                    id={`look-${look.id}-${p.id}`}
                    type="checkbox"
                    checked={checked}
                    disabled={!available}
                    onChange={() => toggle(p.id)}
                    className="absolute top-1.5 left-1.5 w-[18px] h-[18px] accent-exaltNavy cursor-pointer disabled:cursor-not-allowed"
                  />
                  {p.id === currentId && (
                    <span className="absolute bottom-0 inset-x-0 bg-exaltPink text-white text-[10px] font-bold text-center py-0.5">
                      Cet article
                    </span>
                  )}
                </span>
                <span className={`text-xs font-semibold leading-tight line-clamp-2 ${available ? "text-exaltNavy" : "text-gray-400"}`}>
                  {p.title.replace(/^eXalt /, "")}
                </span>
                <span className={`text-xs font-bold ${available ? "text-exaltNavy" : "text-gray-400 line-through"}`}>
                  {p.price} €
                </span>
                {!available && <span className="text-[11px] leading-tight text-red-600">Rupture</span>}
              </label>
            </li>
          );
        })}
      </ul>

      {/* Récapitulatif et achat */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-exaltCream p-3">
        <p className="flex flex-col leading-tight">
          <span className="text-xs text-gray-500">
            {chosen.length} article{chosen.length > 1 ? "s" : ""}
          </span>
          <span className="font-display text-xl font-bold text-exaltNavy">{total} €</span>
        </p>
        {needsSize && (
          <select
            aria-label="Taille des vêtements du look"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="h-11 border border-gray-300 rounded-lg px-2 text-base bg-white outline-none focus:border-exaltNavy"
          >
            {SIZES.map((s) => (
              <option key={s.id} value={s.id}>
                Taille {s.value}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          onClick={addLook}
          disabled={chosen.length === 0}
          className="flex-1 min-w-[11rem] min-h-[44px] px-4 rounded-full bg-exaltNavy text-white text-sm font-semibold hover:bg-exaltPink transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-exaltPink"
        >
          {chosen.length === 0 ? "Sélectionnez un article" : "Ajouter le look au panier"}
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
    <section aria-labelledby="look-title" className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4 max-sm:p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="look-title" className="font-display text-exaltNavy text-lg font-bold">
          ✨ Complétez le look <span className="text-exaltPink">{active.name}</span>
        </h2>
        {looks.length > 1 && (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Choisir un look">
            {looks.map((l) => (
              <button
                key={l.id}
                type="button"
                aria-pressed={l.id === active.id}
                onClick={() => setActiveId(l.id)}
                className={`min-h-[36px] px-3 rounded-full border text-xs font-semibold transition-colors ${
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
      <p className="text-sm text-gray-600 -mt-1">{active.tagline}</p>
      <LookCard key={`${product.id}-${active.id}-${items.length}`} look={active} items={items} currentId={product.id} />
    </section>
  );
};

export default ShopTheLook;
