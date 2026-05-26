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

const SingleProduct = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [singleProduct, setSingleProduct] = useState<Product | null>(null);
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
      setSingleProduct(data);
    };

    const fetchProducts = async () => {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    };
    fetchSingleProduct();
    fetchProducts();
  }, [params.id]);

  const isOutOfStock = (singleProduct?.stock ?? 1) === 0;

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
    <div className="max-w-screen-2xl mx-auto px-5 max-[400px]:px-3">
      <div className="grid grid-cols-3 gap-x-8 max-lg:grid-cols-1">
        <div className="lg:col-span-2">
          <img
            src={singleProduct?.image?.startsWith("http") || singleProduct?.image?.startsWith("/") ? singleProduct.image : `/assets/${singleProduct?.image}`}
            alt={singleProduct?.title}
          />
        </div>
        <div className="w-full flex flex-col gap-5 mt-9">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl">{singleProduct?.title}</h1>
            <div className="flex justify-between items-center">
              <p className="text-base text-secondaryBrown">
                {formatCategoryName(singleProduct?.category || "")}
              </p>
              <p className="text-base font-bold">{singleProduct?.price}€</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
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
                  Stock faible — {singleProduct.stock} restant{singleProduct.stock > 1 ? "s" : ""}
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
              mode="brown"
              text={isOutOfStock ? "Rupture de stock" : "Add to cart"}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={isOutOfStock ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            />
            <p className="text-secondaryBrown text-sm text-right">
              Delivery estimated on the Friday, July 26
            </p>
          </div>
          <div>
            {/* drowdown items */}
            <Dropdown dropdownTitle="Description">
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Labore
              quos deleniti, mollitia, vitae harum suscipit voluptatem quasi, ab
              assumenda accusantium rem praesentium accusamus quae quam tempore
              nostrum corporis eaque. Mollitia.
            </Dropdown>

            <Dropdown dropdownTitle="Product Details">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga ad
              at odio illo, necessitatibus, reprehenderit dolore voluptas ea
              consequuntur ducimus repellat soluta mollitia facere sapiente.
              Unde provident possimus hic dolore.
            </Dropdown>

            <Dropdown dropdownTitle="Delivery Details">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga ad
              at odio illo, necessitatibus, reprehenderit dolore voluptas ea
              consequuntur ducimus repellat soluta mollitia facere sapiente.
              Unde provident possimus hic dolore.
            </Dropdown>
          </div>
        </div>
      </div>

      {/* similar products */}
      <div>
        <h2 className="text-black/90 text-5xl mt-24 mb-12 text-center max-lg:text-4xl">
          Similar Products
        </h2>
        <div className="flex flex-wrap justify-between items-center gap-y-8 mt-12 max-xl:justify-start max-xl:gap-5 ">
          {products.slice(0, 3).map((product: Product) => (
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
