import { isMacUser } from "../utils/macPricing";

const AnnouncementBar = () => {
  return (
    <>
    {isMacUser && (
      <div className="bg-exaltPink text-white text-center text-sm font-semibold py-2 px-4 max-sm:text-xs">
        🍎 Tarif Mac activé : tous les prix sont doublés sur ton Mac. C'est un prototype pour rire 😄
      </div>
    )}
    <div className="bg-exaltNavy text-white text-center text-sm py-2 px-4 max-sm:text-xs">
      🎁 Nouveau chez eXalt ? <strong>-10 %</strong> sur ta première commande avec le code{" "}
      <span className="font-bold text-exaltYellow tracking-wider">BIENVENUE10</span>
      <span className="mx-3 opacity-50 max-md:hidden">·</span>
      <span className="max-md:hidden">Livraison offerte dès 80 €</span>
    </div>
    </>
  );
};
export default AnnouncementBar;
