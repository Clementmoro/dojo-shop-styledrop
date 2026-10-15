import { useEffect, useMemo, useRef, useState } from "react";
import { Form, Link, useNavigate, useSearchParams } from "react-router-dom";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { ProductGrid } from "../components";
import customFetch from "../axios/custom";
import { searchProducts } from "../utils/productSearch";

const imageSrc = (image: string) =>
  image.startsWith("http") || image.startsWith("/") ? image : `/assets/${image}`;

const SUGGESTED_QUERIES = ["hoodie", "casquette", "sac", "carnet", "mug"];

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("query") || "").trim();
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    customFetch("/products").then((response) => {
      setProducts(response.data);
      setLoaded(true);
    });
  }, []);

  const result = useMemo(() => searchProducts(products, query), [products, query]);

  // Suggestions pendant la frappe
  const navigate = useNavigate();
  const [text, setText] = useState(query);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setText(query);
    setOpen(false);
  }, [query]);
  const suggestions = useMemo(() => {
    if (text.trim().length < 2) return [];
    const r = searchProducts(products, text);
    return (r.exact.length ? r.exact : r.close).slice(0, 4);
  }, [products, text]);
  const showSuggestions = open && suggestions.length > 0;

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const goTo = (product: Product) => {
    setOpen(false);
    navigate(`/product/${product.id}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      goTo(suggestions[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };
  const shown = result.exact.length ? result.exact : result.close;

  return (
    <div className="max-w-screen-2xl mx-auto pb-24">
      <Form method="get" action="/search" role="search" className="flex items-center gap-3 mt-16 px-5 max-sm:mt-8 max-[400px]:px-3">
        <label htmlFor="search-input" className="sr-only">
          Rechercher un produit
        </label>
        <div className="relative flex-1" ref={boxRef}>
          <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400" aria-hidden="true" />
          <input
            id="search-input"
            type="search"
            name="query"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={showSuggestions}
            aria-controls="search-suggestions"
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `suggestion-${suggestions[active]?.id}` : undefined}
            placeholder="Hoodie, casquette, carnet…"
            autoComplete="off"
            enterKeyHint="search"
            className="w-full h-12 rounded-full border border-gray-300 pl-12 pr-4 text-base text-exaltNavy outline-none focus:border-exaltNavy focus:ring-2 focus:ring-exaltNavy/20"
          />
          {showSuggestions && (
            <ul
              id="search-suggestions"
              role="listbox"
              aria-label="Suggestions de produits"
              className="absolute z-30 left-0 right-0 top-full mt-2 rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden"
            >
              {suggestions.map((p, i) => (
                <li
                  key={p.id}
                  id={`suggestion-${p.id}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    goTo(p);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={`flex items-center gap-3 px-3 py-2 min-h-[60px] cursor-pointer ${
                    i === active ? "bg-exaltCream" : ""
                  }`}
                >
                  <img
                    src={imageSrc(p.image)}
                    alt=""
                    className={`w-11 h-11 shrink-0 rounded-lg object-cover bg-exaltCream ${p.stock > 0 ? "" : "grayscale opacity-60"}`}
                  />
                  <span className="flex-1 min-w-0 flex flex-col">
                    <span className="font-semibold text-exaltNavy leading-snug line-clamp-2">{p.title.replace(/^eXalt /, "")}</span>
                    <span className={`text-xs ${p.stock > 0 ? "text-gray-500" : "text-red-600"}`}>
                      {p.stock > 0 ? "En stock" : "Rupture de stock"}
                    </span>
                  </span>
                  <span className="font-bold text-exaltNavy whitespace-nowrap">{p.price} €</span>
                </li>
              ))}
              <li role="presentation" className="border-t border-gray-100">
                <button
                  type="submit"
                  className="w-full text-left px-4 py-3 text-sm font-semibold text-exaltNavy hover:bg-exaltCream"
                >
                  Voir tous les résultats pour « {text.trim()} »
                </button>
              </li>
            </ul>
          )}
        </div>
        <button
          type="submit"
          className="h-12 px-6 rounded-full bg-exaltNavy text-white font-semibold hover:bg-exaltPink transition-colors max-sm:px-4"
        >
          Rechercher
        </button>
      </Form>

      <div className="px-5 mt-8 max-[400px]:px-3 flex flex-col gap-2" aria-live="polite">
        {loaded && query && result.exact.length > 0 && (
          <h1 className="font-display text-2xl font-bold text-exaltNavy">
            {result.exact.length} produit{result.exact.length > 1 ? "s" : ""} pour « {query} »
          </h1>
        )}
        {loaded && query && result.exact.length === 0 && (
          <>
            <h1 className="font-display text-2xl font-bold text-exaltNavy">
              Aucun produit ne correspond exactement à « {query} »
            </h1>
            <p className="text-gray-600">
              {result.close.length > 0
                ? "Voici les produits les plus proches de votre recherche."
                : "Voici nos produits les plus populaires, disponibles tout de suite."}
            </p>
          </>
        )}
        {loaded && !query && (
          <h1 className="font-display text-2xl font-bold text-exaltNavy">Tout le catalogue</h1>
        )}
        {loaded && (result.suggestions.length > 0 || !query) && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-sm text-gray-500">Essayez :</span>
            {SUGGESTED_QUERIES.map((q) => (
              <Link
                key={q}
                to={`/search?query=${encodeURIComponent(q)}`}
                className="min-h-[36px] inline-flex items-center px-4 rounded-full border border-gray-300 text-sm font-semibold text-exaltNavy hover:border-exaltNavy"
              >
                {q}
              </Link>
            ))}
          </div>
        )}
      </div>

      {loaded && <ProductGrid products={shown.length ? shown : result.suggestions} />}
    </div>
  );
};
export default Search;
