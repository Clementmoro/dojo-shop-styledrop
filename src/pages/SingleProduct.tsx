import {
  Button,
  Dropdown,
  ProductItem,
  QuantityInput,
  StandardSelectInput,
} from "../components";
import { useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { addProductToTheCart } from "../features/cart/cartSlice";
import { useAppDispatch } from "../hooks";
import WithSelectInputWrapper from "../utils/withSelectInputWrapper";
import WithNumberInputWrapper from "../utils/withNumberInputWrapper";
import { formatCategoryName } from "../utils/formatCategoryName";
import toast from "react-hot-toast";
import StoreLocatorModal from "../components/StoreLocatorModal";
import { applyMacPricing } from "../utils/macPricing";

// Date de livraison estimée : aujourd'hui + 4 jours ouvrés
const getEstimatedDelivery = () => {
  const date = new Date();
  let businessDays = 0;
  while (businessDays < 4) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) businessDays++;
  }
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
};

const SingleProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [singleProduct, setSingleProduct] = useState<Product | null>(null);
  const [isStoreLocatorOpen, setIsStoreLocatorOpen] = useState(false);
  // defining default values for input fields
  const [size, setSize] = useState<string>("xs");
  const [color, setColor] = useState<string>("black");
  const [quantity, setQuantity] = useState<number>(1);
  const params = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  // defining HOC instances
  const SelectInputUpgrade = WithSelectInputWrapper(StandardSelectInput);
  const QuantityInputUpgrade = WithNumberInputWrapper(QuantityInput);

  useEffect(() => {
    const fetchSingleProduct = async () => {
      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();
      setSingleProduct(applyMacPricing(data));
    };

    const fetchProducts = async () => {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(applyMacPricing(data));
    };
    fetchSingleProduct();
    fetchProducts();
  }, [params.id]);

  const isOutOfStock = (singleProduct?.stock ?? 1) === 0;
  const isSecret = Boolean(singleProduct?.hidden);

  useEffect(() => {
    if (isSecret) {
      toast("🥚 Secret n°3 sur 3 : le produit fantôme", { id: "secret-3", duration: 6000 });
    }
  }, [isSecret]);

  const handleAddToCart = () => {
    if (!singleProduct) return;
    if (isOutOfStock) {
      toast.error("Ce produit est en rupture de stock");
      return;
    }
    dispatch(
      addProductToTheCart({
        id: singleProduct.id + size + color,
        image: singleProduct.image,
        title: singleProduct.title,
        category: singleProduct.category,
        price: singleProduct.price,
        quantity: Math.min(quantity, singleProduct.stock),
        size,
        color,
        popularity: singleProduct.popularity,
        stock: singleProduct.stock,
      })
    );
    toast.success("Produit ajouté au panier");
  };

  return (
    <div className="max-w-screen-2xl mx-auto px-5 pt-8 max-[400px]:px-3">
      {isSecret && (
        <div className="mb-6 rounded-2xl bg-exaltYellow text-exaltNavy px-6 py-4 font-semibold">
          🥚 Tu as trouvé le produit fantôme. Il n'existe dans aucun menu : garde le secret jusqu'au débrief.
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-12 max-lg:grid-cols-1">
        <div className="rounded-3xl bg-exaltCream overflow-hidden">
          <img
            src={singleProduct?.image?.startsWith("http") || singleProduct?.image?.startsWith("/") ? singleProduct.image : `/assets/${singleProduct?.image}`}
            alt={singleProduct?.title}
            className={`w-full h-full object-cover ${isSecret ? "gold-product" : ""}`}
          />
        </div>
        <div className="w-full flex flex-col gap-6 mt-6">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-exaltPink">
              {formatCategoryName(singleProduct?.category || "")}
            </p>
            <h1 className="font-display text-4xl font-bold text-exaltNavy">{singleProduct?.title}</h1>
            <p className="text-2xl font-bold text-exaltNavy">{singleProduct?.price} €</p>
            {singleProduct?.description && (
              <p className="text-gray-600 leading-relaxed mt-2">{singleProduct.description}</p>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <SelectInputUpgrade
              selectList={[
                { id: "xs", value: "XS" },
                { id: "sm", value: "SM" },
                { id: "m", value: "M" },
                { id: "lg", value: "LG" },
                { id: "xl", value: "XL" },
                { id: "2xl", value: "2XL" },
              ]}
              value={size}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSize(() => e.target.value)
              }
            />
            <SelectInputUpgrade
              selectList={[
                { id: "black", value: "BLACK" },
                { id: "red", value: "RED" },
                { id: "blue", value: "BLUE" },
                { id: "white", value: "WHITE" },
                { id: "rose", value: "ROSE" },
                { id: "green", value: "GREEN" },
              ]}
              value={color}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setColor(() => e.target.value)
              }
            />

            <QuantityInputUpgrade
              value={quantity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setQuantity(() => parseInt(e.target.value))
              }
            />
          </div>
          {/* Stock indicator */}
          {singleProduct && (
            <div className="flex items-center gap-2">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                  Rupture de stock
                </span>
              ) : (singleProduct.stock ?? 99) <= 5 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 inline-block" />
                  Stock faible : {singleProduct.stock} restant{singleProduct.stock > 1 ? "s" : ""}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  En stock
                </span>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              mode="primary"
              text={isOutOfStock ? "Rupture de stock" : "Ajouter au panier"}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            />
            <button
              type="button"
              onClick={() => setIsStoreLocatorOpen(true)}
              className={`w-full h-12 rounded-full border-2 font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                isOutOfStock
                  ? "border-exaltPink text-exaltPink hover:bg-exaltPink hover:text-white"
                  : "border-exaltNavy text-exaltNavy hover:bg-exaltNavy hover:text-white"
              }`}
            >
              <span aria-hidden="true">📍</span>
              {isOutOfStock ? "Indisponible en ligne ? Trouve un magasin eXalt" : "Trouver un magasin eXalt près de chez moi"}
            </button>
            <p className="text-gray-500 text-sm text-right">
              Livraison estimée le {getEstimatedDelivery()}
            </p>
          </div>
          <div>
            <Dropdown dropdownTitle="Détails du produit">
              Produit officiel eXalt. Marquage réalisé en France par notre atelier partenaire. Entretien
              : lavage à 30 °C sur l'envers, pas de sèche-linge.
            </Dropdown>

            <Dropdown dropdownTitle="Livraison et retours">
              Expédition sous 48 h, livraison en 3 à 5 jours ouvrés. Livraison offerte dès 80 € d'achat.
              Retours gratuits sous 30 jours.
            </Dropdown>
          </div>
        </div>
      </div>

      <StoreLocatorModal
        isOpen={isStoreLocatorOpen}
        onClose={() => setIsStoreLocatorOpen(false)}
        productTitle={singleProduct?.title}
        productId={singleProduct?.id}
      />

      {/* similar products */}
      <div>
        <h2 className="font-display text-exaltNavy text-3xl font-bold mt-24 mb-2 max-sm:text-2xl">
          Vous aimerez aussi
        </h2>
        <div className="grid grid-cols-3 gap-6 mt-8 max-md:grid-cols-2 max-md:gap-4">
          {products.filter((product) => product.id !== singleProduct?.id).slice(0, 3).map((product: Product) => (
            <ProductItem
              key={product?.id}
              id={product?.id}
              image={product?.image}
              title={product?.title}
              category={product?.category}
              price={product?.price}
              popularity={product?.popularity}
              stock={product?.stock}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
export default SingleProduct;
