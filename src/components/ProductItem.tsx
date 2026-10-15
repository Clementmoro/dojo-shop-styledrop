import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { formatCategoryName } from "../utils/formatCategoryName";
import { useAppDispatch } from "../hooks";
import { addProductToTheCart } from "../features/cart/cartSlice";

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
  const dispatch = useAppDispatch();

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    // Taille et couleur par défaut, comme sur la fiche produit
    const size = "xs";
    const color = "black";
    dispatch(
      addProductToTheCart({
        id: id + size + color,
        image,
        title,
        category,
        price,
        quantity: 1,
        size,
        color,
        popularity,
        stock,
      })
    );
    toast.success("Produit ajouté au panier");
  };

  return (
    <div className="flex h-full flex-col gap-3">
    <Link to={`/product/${id}`} className="group flex flex-col gap-3">
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
        <p className="text-base font-bold text-exaltNavy whitespace-nowrap">{price} € <span className="text-xs font-medium text-gray-500">TTC</span></p>
      </div>
    </Link>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className="mx-1 mt-auto h-10 rounded-full bg-exaltNavy text-sm font-semibold text-white transition-colors hover:bg-exaltPink disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
      >
        {isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
      </button>
    </div>
  );
};
export default ProductItem;
