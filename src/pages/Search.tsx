import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { HiOutlineMagnifyingGlass, HiXMark } from "react-icons/hi2";
import {
  ProductGrid,
  ProductGridWrapper,
  ShowingSearchPagination,
} from "../components";
import { useAppSelector } from "../hooks";

const SUGGESTIONS = ["Hoodie", "Casquette", "Sac à dos", "Carnet", "Mug", "Édition limitée"];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") ?? "";
  const [input, setInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState<number>(parseInt(searchParams.get("page") || "1"));
  const { totalProducts } = useAppSelector((state) => state.shop);
  const inputRef = useRef<HTMLInputElement>(null);

  // la recherche suit la frappe, avec un court délai pour ne pas clignoter
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = input.trim();
      if (next === query) return;
      setQuery(next);
      setCurrentPage(1);
      setSearchParams(next ? { query: next } : {}, { replace: true });
    }, 200);
    return () => clearTimeout(timer);
  }, [input, query, setSearchParams]);

  const applySuggestion = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-screen-2xl mx-auto pt-10">
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="px-5 max-[400px]:px-3"
      >
        <label htmlFor="search-input" className="sr-only">
          Rechercher un produit
        </label>
        <div className="relative">
          <HiOutlineMagnifyingGlass className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-exaltNavy" />
          <input
            ref={inputRef}
            id="search-input"
            type="search"
            autoFocus
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hoodie, casquette, carnet…"
            className="h-16 w-full rounded-full border border-gray-200 bg-white pl-14 pr-14 text-lg text-exaltNavy shadow-sm outline-none focus:border-exaltNavy focus:ring-2 focus:ring-exaltNavy/15 max-sm:text-base [&::-webkit-search-cancel-button]:appearance-none"
          />
          {input && (
            <button
              type="button"
              onClick={() => applySuggestion("")}
              className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 hover:bg-exaltCream hover:text-exaltNavy"
              aria-label="Effacer la recherche"
            >
              <HiXMark className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-gray-500">Populaires :</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => applySuggestion(s)}
              className="rounded-full border border-gray-200 px-3 py-1.5 text-exaltNavy hover:border-exaltNavy"
            >
              {s}
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm text-gray-600" aria-live="polite">
          {query
            ? `${totalProducts} résultat${totalProducts > 1 ? "s" : ""} pour « ${query} »`
            : `Tous nos produits (${totalProducts})`}
        </p>
      </form>

      {query && totalProducts === 0 ? (
        <div className="mx-5 mt-8 mb-24 rounded-3xl bg-exaltCream p-10 text-center max-[400px]:mx-3">
          <p className="text-lg font-semibold text-exaltNavy">Aucun produit ne correspond à « {query} ».</p>
          <p className="mt-2 text-gray-600">Essaie un autre mot, ou parcours la boutique par catégorie.</p>
          <Link
            to="/shop"
            className="mt-6 inline-flex h-12 items-center rounded-full bg-exaltNavy px-8 font-semibold text-white hover:bg-exaltPink"
          >
            Voir toute la boutique
          </Link>
        </div>
      ) : null}

      <ProductGridWrapper searchQuery={query} page={currentPage}>
        <ProductGrid />
      </ProductGridWrapper>

      {totalProducts > 0 && (
        <ShowingSearchPagination page={currentPage} query={query} setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
};
export default Search;
