import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { formatCategoryName } from "../utils/formatCategoryName";
import { addProductToTheCart } from "../features/cart/cartSlice";
import { useAppDispatch } from "../hooks";
import FavoriteButton from "./FavoriteButton";

// Les vêtements demandent une taille : ils passent par la fiche produit
const hasSize = (title: string) => /hoodie|t-shirt|polo|sweatshirt/i.test(title);

const ProductItem = ({
  id,
  image,
  title,
  category,
  price,
  popularity,
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
  const canQuickAdd = !isOutOfStock && !hasSize(title);
  const dispatch = useAppDispatch();
  const [added, setAdded] = useState(false);

  const quickAdd = () => {
    dispatch(
      addProductToTheCart({ id, image, title, category, price, quantity: 1, size: "", color: "", popularity, stock })
    );
    toast.success(`${title} ajouté au panier`);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const href = `/product/${id}${isOutOfStock ? "#liste-attente" : ""}`;

  return (
    <div className="group flex flex-col gap-3">
      <div className="relative aspect-square rounded-2xl bg-exaltCream overflow-hidden">
        <Link to={href} tabIndex={-1} aria-hidden="true" className="block w-full h-full">
          <img
            src={image.startsWith("http") || image.startsWith("/") ? image : `/assets/${image}`}
            alt=""
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
        </Link>
        <FavoriteButton id={id} title={title} className="absolute top-3 right-3" />
        {canQuickAdd && (
          <button
            type="button"
            onClick={quickAdd}
            aria-label={`Ajouter ${title} au panier`}
            className={`absolute bottom-3 right-3 min-h-[40px] px-4 rounded-full text-sm font-semibold shadow-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-exaltPink ${
              added ? "bg-green-600 text-white" : "bg-exaltNavy text-white hover:bg-exaltPink"
            }`}
          >
            {added ? "✓ Ajouté" : "+ Ajouter"}
          </button>
        )}
      </div>
      <Link to={href} className="flex justify-between items-start gap-3 px-1">
        <div>
          <h2 className="text-base font-semibold text-exaltNavy group-hover:text-exaltPink transition-colors">
            {title}
          </h2>
          <p className="text-sm text-gray-500">{formatCategoryName(category)}</p>
        </div>
        <p className="text-base font-bold text-exaltNavy whitespace-nowrap">{price} €</p>
      </Link>
    </div>
  );
};
export default ProductItem;
