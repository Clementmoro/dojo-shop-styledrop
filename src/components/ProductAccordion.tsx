import { useId, useState } from "react";
import { TbChevronDown } from "react-icons/tb";
import { IconType } from "react-icons";

// Section repliable de la fiche produit, avec une icône pour repérer le thème
const ProductAccordion = ({
  icon: Icon,
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  icon: IconType;
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-exaltCream text-exaltNavy">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-semibold text-exaltNavy">{title}</span>
          {subtitle && <span className="block text-xs text-gray-500">{subtitle}</span>}
        </span>
        <TbChevronDown
          className={`h-5 w-5 text-exaltNavy transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <div id={contentId} className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
};
export default ProductAccordion;
