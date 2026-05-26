import { Link } from "react-router-dom";
import { formatCategoryName } from "../utils/formatCategoryName";

const ProductItem = ({
  id,
  image,
  title,
  category,
  price,
  popularity: _popularity,
  stock,
}: {
  id: string;
  image: string;
  title: string;
  category: string;
  price: number;
  popularity: number;
  stock: number;
}) => {
  const isOutOfStock = stock === 0;

  return (
    <div className="w-[400px] flex flex-col gap-2 justify-center max-md:w-[300px]">
      <Link
        to={`/product/${id}`}
        className="relative w-full h-[300px] max-md:h-[200px] overflow-hidden"
      >
        <img
          src={image.startsWith("http") || image.startsWith("/") ? image : `/assets/${image}`}
          alt={title}
          className={`w-full h-full object-cover ${isOutOfStock ? "opacity-50 grayscale" : ""}`}
        />
        {isOutOfStock && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Rupture de stock
          </span>
        )}
      </Link>
      <Link
        to={`/product/${id}`}
        className="text-black text-center text-3xl tracking-[1.02px] max-md:text-2xl"
      >
        <h2>{title}</h2>
      </Link>
      <p className="text-secondaryBrown text-lg tracking-wide text-center max-md:text-base">
        {formatCategoryName(category)}
      </p>
      <p className="text-black text-2xl text-center font-bold max-md:text-xl">
        {price}€
      </p>
      <div className="w-full flex flex-col gap-1">
        <Link
          to={`/product/${id}`}
          className="text-white bg-secondaryBrown text-center text-xl font-normal tracking-[0.6px] leading-[72px] w-full h-12 flex items-center justify-center max-md:text-base"
        >
          View product
        </Link>
        <Link
          to={`/product/${id}`}
          className="bg-white text-black text-center text-xl border border-[rgba(0,0,0,0.40)] font-normal tracking-[0.6px] leading-[72px] w-full h-12 flex items-center justify-center max-md:text-base"
        >
          Learn more
        </Link>
      </div>
    </div>
  );
};
export default ProductItem;
