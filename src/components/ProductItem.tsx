import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { formatCategoryName } from "../utils/formatCategoryName";
import { addProductToTheCart } from "../features/cart/cartSlice";
import { useAppDispatch } from "../hooks";

// Ajout rapide : taille M et couleur noire par défaut pour les vêtements
const QUICK_ADD_SIZE = "m";
const QUICK_ADD_COLOR = "black";

const ProductItem = ({
  id,
  image,
  title,
  category,
  price,
  popularity,
  stock,
  showQuickAdd = false,
}: {
  id: string;
  image: string;
  title: string;
  category: string;
  price: number;
  popularity: number;
  stock: number;
  showQuickAdd?: boolean;
}) => {
  const isOutOfStock = stock === 0;
  const isLimited = category === "limited-edition";
  const dispatch = useAppDispatch();

  const handleQuickAdd = () => {
    if (isOutOfStock) return;
    const size = category === "clothing" ? QUICK_ADD_SIZE : "";
    dispatch(
      addProductToTheCart({
        id: id + size + QUICK_ADD_COLOR,
        image,
        title,
        category,
        price,
        quantity: 1,
        size,
        color: QUICK_ADD_COLOR,
        popularity,
        stock,
      }),
    );
    toast.success(`${title} ajouté au panier`);
  };

  return (
    <div className="flex flex-col gap-3">
      <Link to={`/product/${id}`} className="group flex flex-col gap-3">
        <div className="relative aspect-square rounded-2xl bg-exaltCream overflow-hidden">
          <img
            src={
              image.startsWith("http") || image.startsWith("/")
                ? image
                : `/assets/${image}`
            }
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
            <p className="text-sm text-gray-500">
              {formatCategoryName(category)}
            </p>
          </div>
          <p className="text-base font-bold text-exaltNavy whitespace-nowrap">
            {price} €
          </p>
        </div>
      </Link>
      {showQuickAdd && (
        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={isOutOfStock}
          className="mx-1 h-10 rounded-full border border-exaltNavy text-exaltNavy text-sm font-semibold flex items-center justify-center gap-2 transition-colors hover:bg-exaltNavy hover:text-white disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed"
        >
          <HiOutlineShoppingBag className="text-lg" aria-hidden="true" />
          {isOutOfStock ? "Indisponible" : "Ajout rapide"}
        </button>
      )}
    </div>
  );
};
export default ProductItem;
