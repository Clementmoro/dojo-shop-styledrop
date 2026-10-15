import { Link } from "react-router-dom";
import GiftReveal from "../components/GiftReveal";

// Page dédiée à la découverte de l'Article surprise offert
const Surprise = () => {
  return (
    <div className="max-w-screen-sm mx-auto px-5 pt-12 pb-16 text-center max-[400px]:px-3">
      <GiftReveal />
      <Link to="/shop" className="text-sm text-gray-500 underline hover:text-exaltPink">
        Continuer mes achats
      </Link>
    </div>
  );
};
export default Surprise;
