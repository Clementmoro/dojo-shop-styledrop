import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./features/cart/cartSlice";
import shopReducer from "./features/shop/shopSlice";
import authReducer from "./features/auth/authSlice";

// le panier est gardé dans le navigateur : il survit à un rechargement ou à un retour sur le site
const CART_STORAGE_KEY = "exalt-cart";

const loadCart = () => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : undefined;
  } catch {
    return undefined;
  }
};

const savedCart = loadCart();

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    shop: shopReducer,
    auth: authReducer
  },
  ...(savedCart ? { preloadedState: { cart: savedCart } } : {}),
});

store.subscribe(() => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(store.getState().cart));
  } catch {
    // stockage indisponible (navigation privée) : le panier reste en mémoire
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
