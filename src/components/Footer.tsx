import { Link } from "react-router-dom";
import SocialMediaFooter from "./SocialMediaFooter";

const Footer = () => {
  return (
    <>
      <SocialMediaFooter />
      <footer className="bg-exaltNavy text-white mt-16">
        <div className="max-w-screen-2xl mx-auto px-5 py-14 grid grid-cols-4 gap-10 max-lg:grid-cols-2 max-sm:grid-cols-1 max-[400px]:px-3">
          <div>
            <img
              src="https://images.prismic.io/exalt/ZlTQKaWtHYXtT1CW_HEADER_Logo.png?auto=format%2Ccompress&fit=max&w=256"
              alt="eXalt"
              className="h-8 brightness-0 invert"
            />
            <p className="text-white/70 text-sm mt-4 max-w-xs">
              La boutique officielle des goodies eXalt, pour les consultants, les clients et les curieux.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <h3 className="font-semibold text-exaltYellow mb-1">Service client</h3>
            <p className="text-white/80">Livraison offerte dès 80 €</p>
            <p className="text-white/80">Retours sous 30 jours</p>
            <p className="text-white/80">Paiement sécurisé</p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <h3 className="font-semibold text-exaltYellow mb-1">Collections</h3>
            <Link to="/shop/clothing" className="text-white/80 hover:text-white">Vêtements</Link>
            <Link to="/shop/accessories" className="text-white/80 hover:text-white">Accessoires</Link>
            <Link to="/shop/stationery" className="text-white/80 hover:text-white">Papeterie</Link>
            <Link to="/shop/limited-edition" className="text-white/80 hover:text-white">Édition limitée</Link>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <h3 className="font-semibold text-exaltYellow mb-1">eXalt</h3>
            <a href="https://www.exalt-company.com" target="_blank" rel="noreferrer" className="text-white/80 hover:text-white">Notre ADN</a>
            <a href="https://www.exalt-company.com" target="_blank" rel="noreferrer" className="text-white/80 hover:text-white">Rejoindre eXalt</a>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-screen-2xl mx-auto px-5 py-6 flex justify-between text-xs text-white/60 max-sm:flex-col max-sm:gap-3 max-[400px]:px-3">
            <p>© eXalt 2026 · Boutique de démonstration du Dojo Claude Code</p>
            <ul className="flex gap-6">
              <li>Cookies</li>
              <li>Confidentialité</li>
              <li>Mentions légales</li>
            </ul>
          </div>
        </div>
      </footer>
    </>
  );
};
export default Footer;
