import { HiHeart, HiOutlineHeart } from "react-icons/hi2";
import toast from "react-hot-toast";
import { toggleFavorite, useFavorites } from "../utils/favorites";

// Petit cœur pour sauvegarder un produit dans « Mes favoris »
const FavoriteButton = ({ id, title, className = "" }: { id: string; title: string; className?: string }) => {
  const favorites = useFavorites();
  const saved = favorites.includes(id);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Retirer ${title} des favoris` : `Ajouter ${title} aux favoris`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(id);
        toast(saved ? "Retiré de vos favoris" : "Ajouté à vos favoris", { icon: saved ? "🤍" : "❤️", id: "favoris" });
      }}
      className={`w-10 h-10 flex items-center justify-center rounded-full bg-white/95 shadow-sm transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-exaltPink ${className}`}
    >
      {saved ? (
        <HiHeart className="text-xl text-exaltPink" aria-hidden="true" />
      ) : (
        <HiOutlineHeart className="text-xl text-exaltNavy" aria-hidden="true" />
      )}
    </button>
  );
};

export default FavoriteButton;
