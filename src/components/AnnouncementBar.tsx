import toast from "react-hot-toast";

const WELCOME_CODE = "BIENVENUE10";

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Repli pour les navigateurs qui refusent l'API presse-papier
    const input = document.createElement("textarea");
    input.value = text;
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(input);
    return ok;
  }
};

const AnnouncementBar = () => {
  const handleCopy = async () => {
    const ok = await copyToClipboard(WELCOME_CODE);
    if (ok) {
      toast.success("Code copié, colle-le dans ton panier", { icon: "📋" });
    } else {
      toast.error(`Copie impossible : note le code ${WELCOME_CODE}`);
    }
  };

  return (
    <div className="bg-exaltNavy text-white text-center text-sm py-2 px-4 max-sm:text-xs">
      🎁 Nouveau chez eXalt ? <strong>-10 %</strong> sur ta première commande avec le code{" "}
      <button
        type="button"
        onClick={handleCopy}
        title="Cliquer pour copier le code"
        aria-label={`Copier le code ${WELCOME_CODE}`}
        className="inline-flex items-center gap-1 font-bold text-exaltYellow tracking-wider border border-dashed border-exaltYellow/70 rounded px-2 py-0.5 hover:bg-exaltYellow hover:text-exaltNavy transition-colors cursor-pointer"
      >
        {WELCOME_CODE}
        <span aria-hidden="true" className="text-xs">📋</span>
      </button>
      <span className="mx-3 opacity-50 max-md:hidden">·</span>
      <span className="max-md:hidden">Livraison offerte dès 80 €</span>
    </div>
  );
};
export default AnnouncementBar;
