import { Link } from "react-router-dom";

const Banner = () => {
  return (
    <div className="banner w-full max-sm:h-[520px]">
      <div className="max-w-screen-2xl mx-auto h-full flex flex-col justify-center px-5 max-[400px]:px-3">
        <p className="text-exaltYellow text-sm font-semibold uppercase tracking-[0.2em] mb-4">
          Boutique officielle
        </p>
        <h1 className="font-display text-white text-7xl font-bold leading-[1.05] max-w-2xl max-md:text-5xl max-[400px]:text-4xl">
          Porte l'esprit <span className="text-exaltPink">eXalt</span>
        </h1>
        <p className="text-white/85 text-xl mt-5 max-w-lg max-sm:text-base">
          Hoodies, accessoires, papeterie et éditions limitées. Pour les eXaltés, leurs clients et
          tous ceux qui nous rejoignent.
        </p>
        <div className="flex gap-3 mt-8 max-[400px]:flex-col w-[440px] max-sm:w-full">
          <Link
            to="/shop"
            className="bg-exaltPink hover:bg-white hover:text-exaltNavy transition-colors text-white font-semibold rounded-full h-12 w-full flex items-center justify-center"
          >
            Découvrir la boutique
          </Link>
          <Link
            to="/shop/limited-edition"
            className="text-white border-2 border-white hover:bg-white hover:text-exaltNavy transition-colors font-semibold rounded-full h-12 w-full flex items-center justify-center"
          >
            Édition limitée
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Banner;
