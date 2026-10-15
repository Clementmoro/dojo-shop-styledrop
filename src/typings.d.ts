interface Product {
  id: string;
  title: string;
  image: string;
  category: string;
  price: number;
  popularity: number;
  stock: number;
  description?: string;
  hidden?: boolean;
}

interface ProductInCart extends Product {
  id: string;
  quantity: number;
  size: string;
  color: string;
  stock: number;
  // Produit surprise : le vrai produit, caché jusqu'au paiement
  surprise?: { productId: string; title: string; image: string };
}

interface User {
  id: string;
  name: string;
  lastname: string;
  email: string;
  role: string;
  password: string;
}

interface Order {
  id: number;
  orderStatus: string;
  orderDate: string;
  paymentStatus: string;
  paymentMethod: string;
  transactionId: string;
  data: {
    email: string;
  };
  products: ProductInCart[];
  subtotal: number;
  shipping?: number;
  user: {
    email: string;
    id: number;
  };
}
