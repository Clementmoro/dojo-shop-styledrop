import { useEffect, useMemo, useState } from "react";
import {
  Button,
  ProductGrid,
  ProductGridWrapper,
  ShowingSearchPagination,
} from "../components";
import SearchBundle, { buildBundle } from "../components/SearchBundle";
import { Form, useNavigate, useSearchParams } from "react-router-dom";
import customFetch from "../axios/custom";
import { bestSellers, searchProducts } from "../utils/searchProducts";

const MAX_SUGGESTIONS = 5;

const imageSrc = (image: string) =>
  image.startsWith("http") || image.startsWith("/") ? image : `/assets/${image}`;

const Search = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("query") || "";
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.get("page") || "1")
  );
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Saisie en cours et suggestions pendant la frappe
  const [typed, setTyped] = useState(query);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  useEffect(() => {
    customFetch("/products").then(({ data }) => setAllProducts(data));
  }, []);

  // Nouvelle recherche : on repart de la première page
  useEffect(() => {
    setTyped(query);
    setShowSuggestions(false);
    setCurrentPage(parseInt(searchParams.get("page") || "1"));
  }, [searchParams]);

  const results = useMemo(
    () => (query.trim() ? searchProducts(allProducts, query) : []),
    [allProducts, query]
  );
  const loaded = allProducts.length > 0;
  const noResult = loaded && query.trim() !== "" && results.length === 0;
  const bundle = useMemo(() => buildBundle(results, allProducts), [results, allProducts]);

  const suggestions = useMemo(
    () =>
      typed.trim().length >= 2
        ? searchProducts(allProducts, typed).slice(0, MAX_SUGGESTIONS)
        : [],
    [allProducts, typed]
  );
  const suggestionsOpen = showSuggestions && suggestions.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestionsOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      navigate(`/product/${suggestions[highlighted].id}`);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="max-w-screen-2xl mx-auto">
      <Form
        method="post"
        className="flex items-start mt-24 px-5 max-[400px]:px-3"
      >
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Rechercher un produit · Buscar un producto"
            className="border border-gray-300 focus:border-gray-400 h-12 text-xl px-3 w-full outline-none max-sm:text-lg"
            name="searchInput"
            autoComplete="off"
            role="combobox"
            aria-expanded={suggestionsOpen}
            aria-controls="search-suggestions"
            aria-autocomplete="list"
            value={typed}
            onChange={(e) => {
              setTyped(e.target.value);
              setShowSuggestions(true);
              setHighlighted(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setShowSuggestions(false)}
            onKeyDown={handleKeyDown}
          />
          {suggestionsOpen && (
            <ul
              id="search-suggestions"
              role="listbox"
              className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg"
            >
              {suggestions.map((p, i) => (
                <li
                  key={p.id}
                  role="option"
                  aria-selected={i === highlighted}
                  // mousedown plutôt que click : le champ perd le focus après
                  onMouseDown={(e) => {
                    e.preventDefault();
                    navigate(`/product/${p.id}`);
                  }}
                  onMouseEnter={() => setHighlighted(i)}
                  className={`flex cursor-pointer items-center gap-3 px-3 py-2 ${
                    i === highlighted ? "bg-exaltCream" : ""
                  }`}
                >
                  <img
                    src={imageSrc(p.image)}
                    alt=""
                    className={`h-12 w-12 flex-shrink-0 rounded-lg bg-exaltCream object-cover ${
                      p.stock === 0 ? "opacity-50 grayscale" : ""
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-exaltNavy">{p.title}</p>
                    {p.stock === 0 && <p className="text-xs text-red-600">Rupture de stock</p>}
                  </div>
                  <p className="whitespace-nowrap text-sm font-bold text-exaltNavy">{p.price} €</p>
                </li>
              ))}
              <li className="border-t border-gray-100 px-3 py-2 text-xs text-gray-500">
                Entrée pour voir tous les résultats
              </li>
            </ul>
          )}
        </div>
        <div className="w-52 max-sm:w-40">
          <Button mode="primary" text="Rechercher" type="submit" />
        </div>
      </Form>

      {noResult ? (
        <div className="mb-24">
          <div className="mx-5 mt-10 rounded-3xl bg-exaltCream p-8 text-center max-[400px]:mx-3">
            <p className="text-lg font-semibold text-exaltNavy">
              On n'a pas encore « {query} » dans la boutique.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Aún no tenemos este producto. Voici nos best-sellers, ils pourraient te plaire.
            </p>
          </div>
          <ProductGrid products={bestSellers(allProducts)} />
        </div>
      ) : (
        <>
          <ProductGridWrapper searchQuery={query} page={currentPage}>
            <ProductGrid />
          </ProductGridWrapper>

          {bundle && <SearchBundle bundle={bundle} />}

          <ShowingSearchPagination page={currentPage} setCurrentPage={setCurrentPage} />
        </>
      )}
    </div>
  );
};
export default Search;
