import { useEffect, useMemo, useState } from "react";
import { Form, Link, useSearchParams } from "react-router-dom";
import { HiOutlineMagnifyingGlass } from "react-icons/hi2";
import { ProductGrid } from "../components";
import customFetch from "../axios/custom";
import { searchProducts } from "../utils/productSearch";

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
  const shown = result.exact.length ? result.exact : result.close;

  return (
    <div className="max-w-screen-2xl mx-auto pb-24">
      <Form method="get" action="/search" role="search" className="flex items-center gap-3 mt-16 px-5 max-sm:mt-8 max-[400px]:px-3">
        <label htmlFor="search-input" className="sr-only">
          Rechercher un produit
        </label>
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400" aria-hidden="true" />
          <input
            key={query}
            id="search-input"
            type="search"
            name="query"
            defaultValue={query}
            placeholder="Hoodie, casquette, carnet…"
            autoComplete="off"
            enterKeyHint="search"
            className="w-full h-12 rounded-full border border-gray-300 pl-12 pr-4 text-base text-exaltNavy outline-none focus:border-exaltNavy focus:ring-2 focus:ring-exaltNavy/20"
          />
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
