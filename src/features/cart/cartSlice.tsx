import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getPromoDiscountRate } from "../../utils/promoCodes";

type CartState = {
  productsInCart: ProductInCart[];
  subtotal: number;
  promoCode: string | null;
  discountRate: number;
};

const emptyCart: CartState = {
  productsInCart: [],
  subtotal: 0,
  promoCode: null,
  discountRate: 0,
};

// Le panier est sauvegardé dans le navigateur pour survivre au rafraîchissement
export const CART_STORAGE_KEY = "exalt-cart";

const loadCart = (): CartState => {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "null");
    if (saved && Array.isArray(saved.productsInCart)) {
      return { ...emptyCart, ...saved };
    }
  } catch {
    // stockage indisponible ou illisible : on repart d'un panier vide
  }
  return emptyCart;
};

export const saveCart = (cart: CartState) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // stockage plein ou bloqué : le panier reste en mémoire pour cette visite
  }
};

const initialState: CartState = loadCart();

export const cartSlice = createSlice({
  name: "cart",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    addProductToTheCart: (state, action: PayloadAction<ProductInCart>) => {
      const product = state.productsInCart.find(
        (product) => product.id === action.payload.id
      );
      if (product) {
        state.productsInCart = state.productsInCart.map((product) => {
          if (product.id === action.payload.id) {
            return {
              ...product,
              quantity: product.quantity + action.payload.quantity,
            };
          }
          return product;
        });
      } else {
        state.productsInCart.push(action.payload);
      }
      cartSlice.caseReducers.calculateTotalPrice(state);
    },
    removeProductFromTheCart: (
      state,
      action: PayloadAction<{ id: string }>
    ) => {
      state.productsInCart = state.productsInCart.filter(
        (product) => product.id !== action.payload.id
      );
      cartSlice.caseReducers.calculateTotalPrice(state);
    },
    updateProductQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) => {
      state.productsInCart = state.productsInCart.map((product) => {
        if (product.id === action.payload.id) {
          return {
            ...product,
            quantity: action.payload.quantity,
          };
        }
        return product;
      });
      cartSlice.caseReducers.calculateTotalPrice(state);
    },
    applyPromoCode: (
      state,
      action: PayloadAction<{ code: string; rate: number }>
    ) => {
      state.promoCode = action.payload.code;
      state.discountRate = action.payload.rate;
    },
    removePromoCode: (state) => {
      state.promoCode = null;
      state.discountRate = 0;
    },
    // Après une commande validée
    clearCart: () => emptyCart,
    calculateTotalPrice: (state) => {
      state.subtotal = state.productsInCart.reduce(
        (acc, product) => acc + product.price * product.quantity,
        0
      );
      // Remise progressive : le taux suit le nombre d'articles du panier
      const itemCount = state.productsInCart.reduce((acc, product) => acc + product.quantity, 0);
      if (state.promoCode) {
        state.discountRate = getPromoDiscountRate(state.promoCode, Math.max(1, itemCount)) ?? 0;
      }
    },
  },
});

export const {
  addProductToTheCart,
  removeProductFromTheCart,
  updateProductQuantity,
  calculateTotalPrice,
  clearCart,
  applyPromoCode,
  removePromoCode,
} = cartSlice.actions;

export default cartSlice.reducer;
