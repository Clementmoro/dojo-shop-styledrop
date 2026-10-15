import React, { ReactElement, useEffect, useState } from "react";
import customFetch from "../axios/custom";
import { useAppDispatch } from "../hooks";
import {
  setShowingProducts,
  setTotalProducts,
} from "../features/shop/shopSlice";
import { searchScore } from "../utils/searchProducts";

export const PRODUCTS_PER_PAGE = 9;

const ProductGridWrapper = ({
  searchQuery,
  sortCriteria,
  category,
  page,
  limit,
  children,
}: {
  searchQuery?: string;
  sortCriteria?: string;
  category?: string;
  page?: number;
  limit?: number;
  children:
    | ReactElement<{ products: Product[] }>
    | ReactElement<{ products: Product[] }>[];
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const dispatch = useAppDispatch();

  // relancé à chaque changement de catégorie, de recherche, de tri ou de page
  useEffect(() => {
    let isCurrent = true;

    const loadProducts = async () => {
      const response = await customFetch("/products");
      const allProducts: Product[] = await response.data;
      const query = (searchQuery ?? "").trim();

      let selected = allProducts
        .filter((product) => !product.hidden)
        .filter((product) => !category || product.category === category)
        .map((product) => ({ product, score: query ? searchScore(product, query) : 1 }))
        .filter(({ score }) => score > 0);

      // tri : pertinence de la recherche par défaut, sinon le critère choisi
      if (sortCriteria === "price-asc") {
        selected.sort((a, b) => a.product.price - b.product.price);
      } else if (sortCriteria === "price-desc") {
        selected.sort((a, b) => b.product.price - a.product.price);
      } else if (sortCriteria === "popularity") {
        selected.sort((a, b) => b.product.popularity - a.product.popularity);
      } else if (query) {
        selected = selected.sort((a, b) => b.score - a.score);
      }

      const sorted = selected.map(({ product }) => product);
      const visible = limit
        ? sorted.slice(0, limit)
        : page
        ? sorted.slice(0, page * PRODUCTS_PER_PAGE)
        : sorted;

      if (!isCurrent) return;
      setProducts(visible);
      setIsLoaded(true);
      dispatch(setTotalProducts(sorted.length));
      dispatch(setShowingProducts(visible.length));
    };

    loadProducts();
    return () => {
      isCurrent = false;
    };
  }, [searchQuery, sortCriteria, category, page, limit, dispatch]);

  if (!isLoaded) return null;

  // Clone the children and pass the products as props to the children
  return React.Children.map(children, (child) =>
    React.isValidElement(child) ? React.cloneElement(child, { products }) : null
  );
};
export default ProductGridWrapper;
