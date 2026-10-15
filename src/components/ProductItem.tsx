import { useState } from "react";
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
  // Choix de taille seulement pour les vêtements (mêmes tailles que la fiche produit)
  const hasSize = category === "clothing" || /hoodie|t-shirt|polo|sweat/i.test(title);
  const [size, setSize] = useState("xs");

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    // Couleur par défaut, comme sur la fiche produit
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
    toast.success(hasSize ? `Ajouté au panier en taille ${size.toUpperCase()}` : "Produit ajouté au panier");
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
      <div className="mx-1 mt-auto flex flex-col gap-2 sm:flex-row sm:items-center">
        {hasSize && !isOutOfStock && (
          <select
            aria-label={`Taille pour ${title}`}
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="h-8 w-full flex-shrink-0 rounded-full sm:w-20 border-gray-300 py-0 pl-3 pr-7 text-xs font-medium text-exaltNavy focus:border-exaltNavy focus:ring-exaltNavy"
          >
            <option value="xs">XS</option>
            <option value="sm">SM</option>
            <option value="m">M</option>
            <option value="lg">LG</option>
            <option value="xl">XL</option>
            <option value="2xl">2XL</option>
          </select>
        )}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="h-8 min-w-0 w-full whitespace-nowrap sm:w-auto sm:flex-1 rounded-full bg-exaltNavy px-3 text-xs font-semibold text-white transition-colors hover:bg-exaltPink disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
        >
          {isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
        </button>
      </div>
    </div>
  );
};
export default ProductItem;
