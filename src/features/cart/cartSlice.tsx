import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FREE_GIFT, FREE_GIFT_ID } from "../../utils/surpriseGift";

type CartState = {
  productsInCart: ProductInCart[];
  subtotal: number;
  promoCode: string | null;
  discountRate: number;
};

const initialState: CartState = {
  productsInCart: [],
  subtotal: 0,
  promoCode: null,
  discountRate: 0,
};

// Casquette rose offerte : présente dès qu'un produit payant est dans le panier
const syncFreeGift = (state: CartState) => {
  const hasPaidProduct = state.productsInCart.some(
    (product) => product.id !== FREE_GIFT_ID && product.quantity > 0,
  );
  const others = state.productsInCart.filter(
    (product) => product.id !== FREE_GIFT_ID,
  );
  state.productsInCart = hasPaidProduct
    ? [...others, { ...FREE_GIFT }]
    : others;
};

export const cartSlice = createSlice({
  name: "cart",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    addProductToTheCart: (state, action: PayloadAction<ProductInCart>) => {
      const product = state.productsInCart.find(
        (product) => product.id === action.payload.id,
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
      action: PayloadAction<{ id: string }>,
    ) => {
      state.productsInCart = state.productsInCart.filter(
        (product) => product.id !== action.payload.id,
      );
      cartSlice.caseReducers.calculateTotalPrice(state);
    },
    updateProductQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>,
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
      action: PayloadAction<{ code: string; rate: number }>,
    ) => {
      state.promoCode = action.payload.code;
      state.discountRate = action.payload.rate;
    },
    removePromoCode: (state) => {
      state.promoCode = null;
      state.discountRate = 0;
    },
    calculateTotalPrice: (state) => {
      syncFreeGift(state);
      state.subtotal = state.productsInCart.reduce(
        (acc, product) => acc + product.price * product.quantity,
        0,
      );
    },
  },
});

export const {
  addProductToTheCart,
  removeProductFromTheCart,
  updateProductQuantity,
  calculateTotalPrice,
  applyPromoCode,
  removePromoCode,
} = cartSlice.actions;

export default cartSlice.reducer;
