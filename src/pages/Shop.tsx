import {
  LoaderFunctionArgs,
  useLoaderData,
  useSearchParams,
} from "react-router-dom";
import { ShopBanner, ShopPageContent } from "../components";
import { getSubcategory } from "../utils/subcategories";

export const shopCategoryLoader = async ({ params }: LoaderFunctionArgs) => {
  const { category } = params;

  return category;
};

const Shop = () => {
  const category = useLoaderData() as string;
  const [searchParams] = useSearchParams();
  const subcategory = getSubcategory(searchParams.get("type"))?.slug;
  return (
    <div className="max-w-screen-2xl mx-auto pt-10">
      <ShopBanner category={category} subcategory={subcategory} />
      <ShopPageContent
        key={`${category || "all"}-${subcategory || ""}`}
        category={category}
        subcategory={subcategory}
        page={parseInt(searchParams.get("page") || "1")}
      />
    </div>
  );
};
export default Shop;
