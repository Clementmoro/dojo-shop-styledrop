import { useState } from "react";
import { HiChevronDown, HiChevronUp } from "react-icons/hi2";

const Dropdown = ({
  dropdownTitle,
  children,
}: {
  dropdownTitle: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <div
        className="flex justify-between items-center border-b border-gray-200 h-14 cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <p className="text-exaltNavy font-medium text-base">{dropdownTitle}</p>
        {isOpen ? (
          <HiChevronUp className="text-base" />
        ) : (
          <HiChevronDown className="text-base" />
        )}
      </div>
      {isOpen && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 leading-relaxed pb-4">{children}</p>
        </div>
      )}
    </div>
  );
};
export default Dropdown;
