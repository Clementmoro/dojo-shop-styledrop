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
  const isLimited = category === "limited-edition";

  return (
    <Link
      to={`/product/${id}${isOutOfStock ? "#liste-attente" : ""}`}
      className="group flex flex-col gap-3"
    >
      <div className="relative aspect-square rounded-2xl bg-exaltCream overflow-hidden">
        <img
          src={image.startsWith("http") || image.startsWith("/") ? image : `/assets/${image}`}
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isOutOfStock ? "opacity-50 grayscale" : ""
          }`}
        />
        {isOutOfStock && (
          <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            Rupture de stock
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute bottom-3 inset-x-3 flex items-center justify-center gap-1.5 min-h-[40px] rounded-full bg-white/95 text-exaltNavy text-sm font-semibold shadow-sm transition-colors group-hover:bg-exaltNavy group-hover:text-white">
            🔔 Me prévenir
          </span>
        )}
        {!isOutOfStock && isLimited && (
          <span className="absolute top-3 left-3 bg-exaltYellow text-exaltNavy text-xs font-bold px-2.5 py-1 rounded-full">
            Édition limitée
          </span>
        )}
      </div>
      <div className="flex justify-between items-start gap-3 px-1">
        <div>
          <h2 className="text-base font-semibold text-exaltNavy group-hover:text-exaltPink transition-colors">
            {title}
          </h2>
          <p className="text-sm text-gray-500">{formatCategoryName(category)}</p>
        </div>
        <p className="text-base font-bold text-exaltNavy whitespace-nowrap">{price} €</p>
      </div>
    </Link>
  );
};
export default ProductItem;
