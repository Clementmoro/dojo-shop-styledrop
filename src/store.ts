import { configureStore } from "@reduxjs/toolkit";
import cartReducer, { saveCart } from "./features/cart/cartSlice";
import shopReducer from "./features/shop/shopSlice";
import authReducer from "./features/auth/authSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    shop: shopReducer,
    auth: authReducer
  },
});

// Sauvegarde le panier à chaque changement
let lastCart = store.getState().cart;
store.subscribe(() => {
  const cart = store.getState().cart;
  if (cart !== lastCart) {
    lastCart = cart;
    saveCart(cart);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
