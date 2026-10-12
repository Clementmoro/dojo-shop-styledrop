import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiXMark } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { setLoginStatus } from "../features/auth/authSlice";
import { store } from "../store";

const SidebarMenu = ({
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (prev: boolean) => void;
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const { loginStatus } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const logout = () => {
    toast.error("Tu es déconnecté");
    localStorage.removeItem("user");
    store.dispatch(setLoginStatus(false));
    navigate("/login");
  };

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
          <div className="flex flex-col items-center gap-1 mt-7">
            <Link
              to="/"
              className="py-2 border-b border-gray-100 text-exaltNavy font-medium hover:text-exaltPink w-full block flex justify-center"
            >
              Accueil
            </Link>
            <Link
              to="/shop"
              className="py-2 border-b border-gray-100 text-exaltNavy font-medium hover:text-exaltPink w-full block flex justify-center"
            >
              Boutique
            </Link>
            <Link
              to="/search"
              className="py-2 border-b border-gray-100 text-exaltNavy font-medium hover:text-exaltPink w-full block flex justify-center"
            >
              Recherche
            </Link>
            {loginStatus ? (
              <>
                <button
                  onClick={logout}
                  className="py-2 border-b border-gray-100 text-exaltNavy font-medium hover:text-exaltPink w-full block flex justify-center"
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="py-2 border-b border-gray-100 text-exaltNavy font-medium hover:text-exaltPink w-full block flex justify-center"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="py-2 border-b border-gray-100 text-exaltNavy font-medium hover:text-exaltPink w-full block flex justify-center"
                >
                  Créer un compte
                </Link>
              </>
            )}
            <Link
              to="/cart"
              className="py-2 border-b border-gray-100 text-exaltNavy font-medium hover:text-exaltPink w-full block flex justify-center"
            >
              Panier
            </Link>
          </div>
        </div>
      )}
    </>
  );
};
export default SidebarMenu;
