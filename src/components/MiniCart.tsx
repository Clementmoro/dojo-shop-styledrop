import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { HiOutlineShoppingBag, HiXMark } from "react-icons/hi2";
import { useAppSelector } from "../hooks";
import { formatPrice } from "../utils/promoCodes";
import { isFreeGift } from "../utils/surpriseGift";

// Panier en pop-up : s'ouvre au clic sur l'icône panier du header
const MiniCart = ({ className = "" }: { className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { productsInCart, subtotal } = useAppSelector((state) => state.cart);
  const cartCount = productsInCart.reduce(
    (sum, p) => sum + (p.quantity || 0),
    0,
  );

  // Referme la pop-up à chaque changement de page
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Referme la pop-up au clic en dehors ou avec Échap
  useEffect(() => {
    if (!isOpen) return;
    const handlePointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setIsOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  return (
    <div className={`relative flex items-center ${className}`} ref={ref}>
      <button
        type="button"
        aria-label="Panier"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="relative hover:text-exaltPink"
        onClick={() => setIsOpen((open) => !open)}
      >
        <HiOutlineShoppingBag className="text-2xl max-sm:text-xl" />
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-exaltPink text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Mon panier"
          className="absolute right-0 top-full mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden text-exaltNavy"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-semibold">
              Mon panier{cartCount > 0 ? ` (${cartCount})` : ""}
            </p>
            <button
              type="button"
              aria-label="Fermer le panier"
              className="text-gray-400 hover:text-exaltPink"
              onClick={() => setIsOpen(false)}
            >
              <HiXMark className="text-xl" />
            </button>
          </div>

          {productsInCart.length === 0 ? (
            <div className="flex flex-col items-center text-center gap-3 px-4 py-8">
              <HiOutlineShoppingBag
                className="text-4xl text-gray-300"
                aria-hidden="true"
              />
              <p className="font-semibold">Ton panier est vide</p>
              <p className="text-sm text-gray-500">
                Découvre nos goodies et ajoute tes coups de cœur.
              </p>
              <Link
                to="/shop"
                className="mt-1 h-10 px-5 rounded-full bg-exaltNavy hover:bg-exaltPink transition-colors text-white text-sm font-semibold flex items-center justify-center"
              >
                Découvrir la boutique
              </Link>
            </div>
          ) : (
            <>
              <ul className="max-h-[50vh] overflow-y-auto divide-y divide-gray-100">
                {productsInCart.map((product) => (
                  <li key={product.id} className="flex gap-3 px-4 py-3">
                    <img
                      src={
                        product.image.startsWith("http") ||
                        product.image.startsWith("/")
                          ? product.image
                          : `/assets/${product.image}`
                      }
                      alt={product.title}
                      className="h-14 w-14 flex-shrink-0 rounded-xl bg-exaltCream object-cover"
                    />
                    <div className="flex flex-1 min-w-0 flex-col">
                      <p className="text-sm font-semibold truncate">
                        {product.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {[product.color, product.size]
                          .filter(Boolean)
                          .join(" · ")}
                        {product.color || product.size ? " · " : ""}Qté{" "}
                        {product.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold whitespace-nowrap">
                      {isFreeGift(product)
                        ? "Offert"
                        : formatPrice(product.price * product.quantity)}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-4 border-t border-gray-100 flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <Link
                  to="/cart"
                  className="h-11 rounded-full bg-exaltNavy hover:bg-exaltPink transition-colors text-white text-sm font-semibold flex items-center justify-center"
                >
                  Voir mon panier
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
export default MiniCart;
