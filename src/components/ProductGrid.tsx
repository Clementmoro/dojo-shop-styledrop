import React from "react";
import ProductItem from "./ProductItem";
import MysteryProductItem from "./MysteryProductItem";

const ProductGrid = ({ products, showMystery }: { products?: Product[]; showMystery?: boolean }) => {
  return (
    <div
      id="gridTop"
      className="max-w-screen-2xl grid grid-cols-4 gap-x-6 gap-y-10 mx-auto mt-10 px-5 max-xl:grid-cols-3 max-md:grid-cols-2 max-md:gap-x-4 max-[400px]:px-3"
    >
      {showMystery && <MysteryProductItem />}
      {products &&
        products.map((product: Product) => (
          <ProductItem
            key={product.id}
            id={product.id}
            image={product.image}
            title={product.title}
            category={product.category}
            price={product.price}
            popularity={product.popularity}
            stock={product.stock}
          />
        ))}
    </div>
  );
};
// Memoize the component to prevent unnecessary re-renders because of React.cloneElement
export default React.memo(ProductGrid);
