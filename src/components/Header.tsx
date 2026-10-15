import {
  HiBars3,
  HiOutlineHeart,
  HiOutlineUser,
  HiOutlineMagnifyingGlass,
  HiOutlineShoppingBag,
} from "react-icons/hi2";
import { Link, NavLink } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";
import AnnouncementBar from "./AnnouncementBar";
import { useState } from "react";
import { useAppSelector } from "../hooks";
import { useFavorites } from "../utils/favorites";

const NAV_LINKS = [
  { to: "/shop", label: "Tout voir" },
  { to: "/shop/clothing", label: "Vêtements" },
  { to: "/shop/accessories", label: "Accessoires" },
  { to: "/shop/stationery", label: "Papeterie" },
  { to: "/shop/limited-edition", label: "Édition limitée" },
];

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { productsInCart } = useAppSelector((state) => state.cart);
  const favoritesCount = useFavorites().length;
  const cartCount = productsInCart.reduce((sum, p) => sum + (p.quantity || 0), 0);

  return (
    <>
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <AnnouncementBar />
        <header className="max-w-screen-2xl flex justify-between items-center py-4 px-5 mx-auto max-[400px]:px-3">
          <div className="flex items-center gap-8">
            <HiBars3
              className="text-2xl cursor-pointer text-exaltNavy lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            />
            <Link to="/" className="flex items-center">
              <img
                src="https://images.prismic.io/exalt/ZlTQKaWtHYXtT1CW_HEADER_Logo.png?auto=format%2Ccompress&fit=max&w=256"
                alt="eXalt"
                className="h-7 max-sm:h-6"
              />
            </Link>
            <nav className="flex gap-6 max-lg:hidden">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors hover:text-exaltPink ${
                      isActive ? "text-exaltPink" : "text-exaltNavy"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex gap-5 items-center text-exaltNavy max-sm:gap-3">
            <Link to="/search" aria-label="Rechercher" className="hover:text-exaltPink">
              <HiOutlineMagnifyingGlass className="text-2xl max-sm:text-xl" />
            </Link>
            <Link to="/favoris" aria-label={`Mes favoris (${favoritesCount})`} className="relative hover:text-exaltPink">
              <HiOutlineHeart className="text-2xl max-sm:text-xl" />
              {favoritesCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-exaltPink text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </Link>
            <Link to="/login" aria-label="Mon compte" className="hover:text-exaltPink">
              <HiOutlineUser className="text-2xl max-sm:text-xl" />
            </Link>
            <Link to="/cart" aria-label="Panier" className="relative hover:text-exaltPink">
              <HiOutlineShoppingBag className="text-2xl max-sm:text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-exaltPink text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </header>
      </div>
      <SidebarMenu isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
    </>
  );
};
export default Header;
