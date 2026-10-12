import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  mode: "primary" | "white" | "transparent";
  text: string;
}

const BASE =
  "w-full h-12 flex items-center justify-center rounded-full text-base font-semibold tracking-wide transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

const MODES = {
  primary: "bg-exaltNavy text-white hover:bg-exaltPink",
  white: "bg-white text-exaltNavy border border-exaltNavy/30 hover:border-exaltNavy",
  transparent: "text-white border-2 border-white hover:bg-white hover:text-exaltNavy",
};

const Button = ({ mode, text, className, ...props }: ButtonProps) => {
  return (
    <button {...props} className={`${BASE} ${MODES[mode]} ${className ?? ""}`}>
      {text}
    </button>
  );
};
export default Button;
