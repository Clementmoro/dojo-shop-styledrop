import { Link } from "react-router-dom";
import ProductGrid from "./ProductGrid";
import ProductGridWrapper from "./ProductGridWrapper";

const HomeCollectionSection = () => {
  return (
    <section>
      <div className="max-w-screen-2xl flex flex-col items-start gap-3 mx-auto mt-20 px-5 max-[400px]:px-3">
        <div>
          <p className="text-exaltPink text-sm font-semibold uppercase tracking-[0.2em] mb-2">
            Sélection
          </p>
          <h2 className="font-display text-exaltNavy text-4xl font-bold max-sm:text-3xl">
            Les incontournables
          </h2>
        </div>
        <Link to="/shop" className="text-exaltNavy font-semibold hover:text-exaltPink whitespace-nowrap">
          Tout voir →
        </Link>
      </div>
      <ProductGridWrapper limit={8}>
        <ProductGrid showQuickAdd />
      </ProductGridWrapper>
    </section>
  );
};
export default HomeCollectionSection;
