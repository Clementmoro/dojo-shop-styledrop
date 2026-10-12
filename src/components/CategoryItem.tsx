import { Link } from "react-router-dom";

const CategoryItem = ({ categoryTitle, image, link }: { categoryTitle: string; image: string; link: string }) => {
  return (
    <Link
      to={`/shop/${link}`}
      className="group relative block aspect-[4/5] rounded-2xl overflow-hidden"
    >
      <img
        src={image.startsWith("http") ? image : `/assets/${image}`}
        alt={categoryTitle}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-exaltNavy/85 via-exaltNavy/10 to-transparent" />
      <div className="absolute bottom-0 p-5 max-sm:p-3">
        <h3 className="font-display text-white text-2xl font-bold max-sm:text-lg">{categoryTitle}</h3>
        <p className="text-white/80 text-sm group-hover:text-exaltYellow transition-colors">Explorer →</p>
      </div>
    </Link>
  );
};
export default CategoryItem;
