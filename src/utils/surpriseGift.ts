// Cadeau offert : une casquette rose ajoutée au panier dès qu'un produit y entre
export const FREE_GIFT_ID = "gift-pink-cap";

// Produit du catalogue révélé par l'animation (eXalt Pink Cap · Drop #1)
export const FREE_GIFT_PRODUCT_ID = "14";

export const FREE_GIFT: ProductInCart = {
  id: FREE_GIFT_ID,
  title: "Casquette rose offerte",
  image: "/assets/products/exalt-pink-cap.png",
  category: "cadeau",
  price: 0,
  popularity: 0,
  quantity: 1,
  size: "",
  color: "",
  stock: 1,
};

export const isFreeGift = (product?: { id: string }) => product?.id === FREE_GIFT_ID;
