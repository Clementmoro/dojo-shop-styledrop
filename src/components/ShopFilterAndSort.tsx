import { useAppSelector } from "../hooks";

const ShopFilterAndSort = ({
  sortCriteria,
  setSortCriteria,
}: {
  sortCriteria: string;
  setSortCriteria: (value: string) => void;
}) => {
  const { showingProducts, totalProducts } = useAppSelector((state) => state.shop);
  return (
    <div className="flex justify-between items-center px-5 max-sm:flex-col max-sm:gap-4 max-[400px]:px-3">
      <p className="text-sm text-gray-600">
        {showingProducts} produit{showingProducts > 1 ? "s" : ""} affiché{showingProducts > 1 ? "s" : ""} sur {totalProducts}
      </p>
      <div className="flex gap-3 items-center text-sm">
        <label htmlFor="sort" className="text-gray-600">Trier par</label>
        <select
          id="sort"
          className="border border-gray-300 rounded-full px-4 py-2 text-sm focus:border-exaltNavy focus:ring-exaltNavy"
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortCriteria(e.target.value)}
          value={sortCriteria}
        >
          <option value="default">Pertinence</option>
          <option value="popularity">Popularité</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
        </select>
      </div>
    </div>
  );
};
export default ShopFilterAndSort;
