import { useEffect, useState } from "react";
import { HiChevronDown, HiXMark } from "react-icons/hi2";
import { Link } from "react-router-dom";
import { CLOTHING_SUBCATEGORIES } from "../utils/subcategories";

const itemClass =
  "py-3 border-b border-gray-100 text-exaltNavy font-medium hover:text-exaltPink w-full text-left";
const subItemClass = "py-2 text-sm text-gray-600 hover:text-exaltPink";

const SidebarMenu = ({
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (prev: boolean) => void;
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isClothingOpen, setIsClothingOpen] = useState(false);
  const close = () => setIsSidebarOpen(false);

  useEffect(() => {
    if (isSidebarOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300); // Match the transition duration
      return () => clearTimeout(timer);
    }
  }, [isSidebarOpen]);

  return (
    <>
      {(isSidebarOpen || isAnimating) && (
        <div
          className={
            isSidebarOpen
              ? "fixed top-0 left-0 w-64 z-50 h-full transition-transform duration-300 ease-in-out bg-white shadow-lg transform border-r border-gray-200 translate-x-0"
              : "fixed top-0 left-0 w-64 z-50 h-full transition-transform duration-300 ease-in-out bg-white shadow-lg transform border-r border-gray-200 -translate-x-full"
          }
        >
          <div className="flex justify-end mr-1 mt-1">
            <HiXMark
              className="text-3xl cursor-pointer"
              onClick={() => setIsSidebarOpen(false)}
            />
          </div>
          <div className="flex justify-center mt-2">
            <Link to="/" onClick={() => setIsSidebarOpen(false)}>
              <img
                src="https://images.prismic.io/exalt/ZlTQKaWtHYXtT1CW_HEADER_Logo.png?auto=format%2Ccompress&fit=max&w=256"
                alt="eXalt"
                className="h-8"
              />
            </Link>
          </div>
          <nav className="flex flex-col mt-7 px-4" aria-label="Menu principal">
            <Link to="/" onClick={close} className={itemClass}>
              Accueil
            </Link>
            <button
              type="button"
              onClick={() => setIsClothingOpen((open) => !open)}
              aria-expanded={isClothingOpen}
              className={`${itemClass} flex items-center justify-between`}
            >
              Vêtements
              <HiChevronDown
                className={`text-lg transition-transform ${isClothingOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
            {isClothingOpen && (
              <div className="flex flex-col pl-4 border-b border-gray-100 pb-2">
                <Link
                  to="/shop/clothing"
                  onClick={close}
                  className={subItemClass}
                >
                  Tous les vêtements
                </Link>
                {CLOTHING_SUBCATEGORIES.map((sub) => (
                  <Link
                    key={sub.slug}
                    to={`/shop?type=${sub.slug}`}
                    onClick={close}
                    className={subItemClass}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
            <Link to="/shop/accessories" onClick={close} className={itemClass}>
              Accessoires
            </Link>
            <Link to="/shop/stationery" onClick={close} className={itemClass}>
              Papeterie
            </Link>
            <Link
              to="/shop/limited-edition"
              onClick={close}
              className="py-3 border-b border-gray-100 font-semibold text-exaltPink hover:text-exaltNavy w-full text-left"
            >
              Édition limitée
            </Link>
          </nav>
        </div>
      )}
    </>
  );
};
export default SidebarMenu;
