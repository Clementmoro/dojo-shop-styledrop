import { HiChevronUp } from "react-icons/hi2";
import Button from "./Button";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../hooks";

const ShowingSearchPagination = ({
  page,
  query,
  setCurrentPage,
}: {
  page: number;
  query: string;
  setCurrentPage: (page: number) => void;
}) => {
  const { totalProducts, showingProducts } = useAppSelector(
    (state) => state.shop,
  );
  const navigate = useNavigate();
  return (
    <div className="px-5 max-[400px]:px-3 mt-12 mb-24">
      <div className="flex flex-col gap-6 justify-center items-center w-1/2 mx-auto max-sm:w-3/4 max-sm:gap-5">
        <p className="text-sm text-gray-600">
          {showingProducts} sur {totalProducts}
        </p>
        {showingProducts < totalProducts && (
          <Button
            text="Voir plus"
            mode="white"
            onClick={() => {
              setCurrentPage(page + 1);
              navigate(
                `/search?query=${encodeURIComponent(query)}&page=${page + 1}`,
                { replace: true },
              );
            }}
          />
        )}
        <a
          href="#gridTop"
          className="flex justify-center items-center text-sm gap-2 text-exaltNavy"
        >
          Retour en haut <HiChevronUp />
        </a>
      </div>
    </div>
  );
};
export default ShowingSearchPagination;
