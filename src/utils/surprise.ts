// Produit mystère : un vrai produit en stock, tiré au sort, révélé à la fin du paiement
export const SURPRISE_ID = "surprise";
export const SURPRISE_PRICE = 20;
export const SURPRISE_IMAGE = "/assets/surprise-box.svg";

export const pickSurpriseProduct = (catalog: Product[]): Product | undefined => {
  const eligible = catalog.filter(
    (product) => !product.hidden && product.stock > 0 && product.price >= SURPRISE_PRICE && product.price < 80
  );
  return eligible[Math.floor(Math.random() * eligible.length)];
};

export const buildSurpriseCartItem = (product: Product): ProductInCart => ({
  id: SURPRISE_ID,
  image: SURPRISE_IMAGE,
  title: "Produit mystère",
  category: "surprise",
  price: SURPRISE_PRICE,
  quantity: 1,
  size: "?",
  color: "mystère",
  popularity: 0,
  stock: 1,
  surprise: { productId: product.id, title: product.title, image: product.image },
});
