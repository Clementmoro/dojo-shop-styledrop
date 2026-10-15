import {
  HiBars3,
  HiOutlineUser,
  HiOutlineMagnifyingGlass,
  HiOutlineShoppingBag,
  HiXMark,
} from "react-icons/hi2";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AnnouncementBar from "./AnnouncementBar";
import SidebarMenu from "./SidebarMenu";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useAppSelector } from "../hooks";
import { setLoginStatus } from "../features/auth/authSlice";
import { store } from "../store";

const NAV_LINKS = [
  { to: "/shop", label: "Tout voir" },
  { to: "/shop/clothing", label: "Vêtements" },
  { to: "/shop/accessories", label: "Accessoires" },
  { to: "/shop/stationery", label: "Papeterie" },
  { to: "/shop/limited-edition", label: "Édition limitée" },
];

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { productsInCart } = useAppSelector((state) => state.cart);
  const { loginStatus } = useAppSelector((state) => state.auth);
  const cartCount = productsInCart.reduce(
    (sum, p) => sum + (p.quantity || 0),
    0,
  );
  const navigate = useNavigate();
  const location = useLocation();

  // Referme la recherche et le menu profil à chaque changement de page
  useEffect(() => {
    setIsSearchOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  // Mobile : referme la recherche quand l'utilisateur touche en dehors ou appuie sur Échap
  useEffect(() => {
    if (!isSearchOpen) return;
    const handlePointer = (e: PointerEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsSearchOpen(false);
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isSearchOpen]);

  // Referme le menu profil au clic en dehors
  useEffect(() => {
    if (!isProfileOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isProfileOpen]);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const query = searchValue.trim();
    if (!query) return;
    navigate(`/search?query=${encodeURIComponent(query)}`);
    setSearchValue("");
    setIsSearchOpen(false);
  };

  const logout = () => {
    toast.error("Tu es déconnecté");
    localStorage.removeItem("user");
    store.dispatch(setLoginStatus(false));
    setIsProfileOpen(false);
    navigate("/login");
  };

  const dropdownItemClass =
    "block w-full text-left px-4 py-3 text-sm font-medium text-exaltNavy hover:bg-exaltCream hover:text-exaltPink";

  return (
    <>
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <AnnouncementBar />
        <header className="max-w-screen-2xl flex justify-between items-center py-4 px-5 mx-auto max-[400px]:px-3">
          <div className="flex shrink-0 items-center gap-8 max-lg:gap-4">
            <button
              type="button"
              aria-label="Ouvrir le menu"
              className="lg:hidden text-exaltNavy"
              onClick={() => setIsSidebarOpen(true)}
            >
              <HiBars3 className="text-2xl" />
            </button>
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
          <div className="flex gap-5 items-center text-exaltNavy max-sm:gap-3 max-lg:flex-1 max-lg:min-w-0 max-lg:justify-end max-lg:ml-3">
            {/* Desktop : la loupe mène à la page Recherche */}
            <Link
              to="/search"
              aria-label="Rechercher"
              className="hover:text-exaltPink max-lg:hidden"
            >
              <HiOutlineMagnifyingGlass className="text-2xl max-sm:text-xl" />
            </Link>
            {/* Mobile : la loupe déplie le champ de recherche vers la gauche */}
            <div
              ref={searchRef}
              className="flex flex-1 min-w-0 items-center justify-end lg:hidden"
            >
              <form
                onSubmit={handleSearch}
                role="search"
                aria-hidden={!isSearchOpen}
                className={`flex-1 min-w-0 overflow-hidden transition-[max-width,opacity,margin] duration-300 ease-out motion-reduce:transition-none ${
                  isSearchOpen
                    ? "max-w-[18rem] opacity-100 mr-2"
                    : "max-w-0 opacity-0 mr-0 pointer-events-none"
                }`}
              >
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Rechercher"
                    aria-label="Rechercher un produit"
                    enterKeyHint="search"
                    tabIndex={isSearchOpen ? 0 : -1}
                    className="w-full h-9 rounded-full border border-gray-300 bg-white pl-3 pr-11 text-base placeholder:text-sm outline-none focus:border-exaltNavy [&::-webkit-search-cancel-button]:hidden"
                  />
                  <button
                    type="submit"
                    tabIndex={isSearchOpen ? 0 : -1}
                    className="absolute right-1 top-1 bottom-1 px-2 rounded-full bg-exaltNavy text-white text-[11px] font-semibold hover:bg-exaltPink transition-colors"
                  >
                    OK
                  </button>
                </div>
              </form>
              <button
                type="button"
                aria-label={isSearchOpen ? "Fermer la recherche" : "Rechercher"}
                aria-expanded={isSearchOpen}
                className="hover:text-exaltPink"
                onClick={() => {
                  setIsSearchOpen((open) => !open);
                  setIsProfileOpen(false);
                }}
              >
                {isSearchOpen ? (
                  <HiXMark className="text-2xl max-sm:text-xl" />
                ) : (
                  <HiOutlineMagnifyingGlass className="text-2xl max-sm:text-xl" />
                )}
              </button>
            </div>

            {/* Desktop : l'icône profil mène à la connexion (inchangé) */}
            <Link
              to="/login"
              aria-label="Mon compte"
              className="hover:text-exaltPink max-lg:hidden"
            >
              <HiOutlineUser className="text-2xl max-sm:text-xl" />
            </Link>
            {/* Mobile : l'icône profil ouvre un menu déroulant */}
            <div
              className={`relative lg:hidden ${isSearchOpen ? "hidden" : ""}`}
              ref={profileRef}
            >
              <button
                type="button"
                aria-label="Mon compte"
                aria-haspopup="menu"
                aria-expanded={isProfileOpen}
                className="hover:text-exaltPink flex items-center"
                onClick={() => {
                  setIsProfileOpen((open) => !open);
                  setIsSearchOpen(false);
                }}
              >
                <HiOutlineUser className="text-2xl max-sm:text-xl" />
              </button>
              {isProfileOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-3 w-52 rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden"
                >
                  {loginStatus ? (
                    <>
                      <Link
                        to="/user-profile"
                        role="menuitem"
                        className={dropdownItemClass}
                      >
                        Mon compte
                      </Link>
                      <Link
                        to="/order-history"
                        role="menuitem"
                        className={dropdownItemClass}
                      >
                        Mes commandes
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={logout}
                        className={`${dropdownItemClass} border-t border-gray-100`}
                      >
                        Se déconnecter
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        role="menuitem"
                        className={dropdownItemClass}
                      >
                        Se connecter
                      </Link>
                      <Link
                        to="/register"
                        role="menuitem"
                        className={`${dropdownItemClass} border-t border-gray-100`}
                      >
                        Créer un compte
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <Link
              to="/cart"
              aria-label="Panier"
              className={`relative hover:text-exaltPink ${isSearchOpen ? "max-lg:hidden" : ""}`}
            >
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
      <SidebarMenu
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    </>
  );
};
export default Header;
