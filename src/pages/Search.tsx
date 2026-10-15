import { useEffect, useState } from "react";
import {
  Button,
  ProductGrid,
  ProductGridWrapper,
  ShowingSearchPagination,
} from "../components";
import { Form, useSearchParams } from "react-router-dom";
import customFetch from "../axios/custom";
import { bestSellers, searchProducts } from "../utils/searchProducts";

const Search = () => {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(searchParams.get("page") || "1")
  );
  const query = searchParams.get("query") || "";
  // Produits suggérés quand la recherche ne trouve rien (null = résultats trouvés)
  const [suggestions, setSuggestions] = useState<Product[] | null>(null);

  useEffect(() => {
    let active = true;
    if (!query.trim()) {
      setSuggestions(null);
      return;
    }
    customFetch("/products").then(({ data }) => {
      if (!active) return;
      setSuggestions(searchProducts(data, query).length === 0 ? bestSellers(data) : null);
    });
    return () => {
      active = false;
    };
  }, [query]);

  return (
    <div className="max-w-screen-2xl mx-auto">
      <Form
        method="post"
        className="flex items-center mt-24 px-5 max-[400px]:px-3"
      >
        <input
          type="text"
          placeholder="Rechercher un produit · Buscar un producto"
          className="border border-gray-300 focus:border-gray-400 h-12 text-xl px-3 w-full outline-none max-sm:text-lg"
          name="searchInput"
          defaultValue={query}
          key={query}
        />
        <div className="w-52 max-sm:w-40">
          <Button mode="primary" text="Rechercher" type="submit" />
        </div>
      </Form>

      {suggestions ? (
        <div className="mb-24">
          <div className="mx-5 mt-10 rounded-3xl bg-exaltCream p-8 text-center max-[400px]:mx-3">
            <p className="text-lg font-semibold text-exaltNavy">
              On n'a pas encore « {query} » dans la boutique.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Aún no tenemos este producto. Voici nos best-sellers, ils pourraient te plaire.
            </p>
          </div>
          <ProductGrid products={suggestions} />
        </div>
      ) : (
        <>
          <ProductGridWrapper searchQuery={query} page={currentPage}>
            <ProductGrid />
          </ProductGridWrapper>

          <ShowingSearchPagination page={currentPage} setCurrentPage={setCurrentPage} />
        </>
      )}
    </div>
  );
};
export default Search;
