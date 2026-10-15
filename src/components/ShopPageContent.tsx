import {
  ProductGrid,
  ProductGridWrapper,
  ShopFilterAndSort,
  ShowingPagination,
} from "../components";

import { useState } from "react";

const ShopPageContent = ({ category, subcategory, page} : { category: string; subcategory?: string; page: number; }) => {
  const [sortCriteria, setSortCriteria] = useState<string>("");
  const [ currentPage, setCurrentPage ] = useState(page);
  
  

  return (
    <>
      <ShopFilterAndSort sortCriteria={sortCriteria} setSortCriteria={setSortCriteria} />
      <ProductGridWrapper sortCriteria={sortCriteria} category={category} subcategory={subcategory} page={currentPage} outOfStockLast>
        <ProductGrid showQuickAdd />
      </ProductGridWrapper>
      <ShowingPagination page={currentPage} category={category} setCurrentPage={setCurrentPage} />
    </>
  );
};
export default ShopPageContent;
