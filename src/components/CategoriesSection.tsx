import CategoryItem from "./CategoryItem";

const CATEGORIES = [
  {
    title: "Vêtements",
    link: "clothing",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=700&fit=crop&q=80",
  },
  {
    title: "Accessoires",
    link: "accessories",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=700&fit=crop&q=80",
  },
  {
    title: "Papeterie",
    link: "stationery",
    image: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600&h=700&fit=crop&q=80",
  },
  {
    title: "Édition limitée",
    link: "limited-edition",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&h=700&fit=crop&q=80",
  },
];

const CategoriesSection = () => {
  return (
    <section className="max-w-screen-2xl px-5 mx-auto mt-24 max-[400px]:px-3">
      <p className="text-exaltPink text-sm font-semibold uppercase tracking-[0.2em] mb-2">
        Univers
      </p>
      <h2 className="font-display text-exaltNavy text-4xl font-bold max-sm:text-3xl mb-10">
        Nos collections
      </h2>
      <div className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-sm:gap-3">
        {CATEGORIES.map((category) => (
          <CategoryItem
            key={category.link}
            categoryTitle={category.title}
            image={category.image}
            link={category.link}
          />
        ))}
      </div>
    </section>
  );
};
export default CategoriesSection;
