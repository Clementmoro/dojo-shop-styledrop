import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import customFetch from "../axios/custom";
import { clearCart } from "../features/cart/cartSlice";
import { useAppDispatch, useAppSelector } from "../hooks";

export const MYSTERY_TITLE = "eXalt Produit Mystère";

// Dès que le produit mystère entre dans le panier, la commande part toute seule,
// sans formulaire ni paiement, et on file vers la pluie de chiens
const MysteryCheckout = () => {
  const { productsInCart, subtotal } = useAppSelector((state) => state.cart);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const sending = useRef(false);

  useEffect(() => {
    if (sending.current || !productsInCart.some((p) => p.title === MYSTERY_TITLE)) return;
    sending.current = true;
    customFetch
      .post("/orders", {
        data: {},
        products: productsInCart,
        subtotal,
        mystery: true,
        orderStatus: "Processing",
        orderDate: new Date().toISOString(),
      })
      .then(() => {
        dispatch(clearCart());
        toast.success("Commande mystère validée !", { icon: "🎁", id: "mystere" });
        navigate("/order-confirmation?mystere=1");
      })
      .catch(() => toast.error("Oups, le mystère reste entier. Réessaie dans un instant."))
      .finally(() => {
        sending.current = false;
      });
  }, [productsInCart, subtotal, dispatch, navigate]);

  return null;
};

export default MysteryCheckout;
