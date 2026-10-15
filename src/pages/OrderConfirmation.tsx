import { useCallback, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { UnicornReveal } from "../components";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  // Produit mystère : dévoilé ici, une fois le paiement terminé
  const location = useLocation();
  const surprise = (location.state as { surprise?: { title: string; image: string } } | null)?.surprise;
  const [showReveal, setShowReveal] = useState(Boolean(surprise));
  const [revealDone, setRevealDone] = useState(false);
  const handleRevealDone = useCallback(() => {
    setShowReveal(false);
    setRevealDone(true);
  }, []);

  const handleRetrieve = (e: React.FormEvent) => {
    e.preventDefault();
    // v1: UI only
    setEmailSent(true);
  };

  return (
    <div className="max-w-screen-sm mx-auto px-5 pt-20 pb-16 text-center">
      {showReveal && surprise && (
        <UnicornReveal title={surprise.title} image={surprise.image} onDone={handleRevealDone} />
      )}
      <h1 className="text-3xl font-light mb-2">Merci pour votre commande !</h1>
      <p className="text-gray-500 mb-10">
        Votre commande a bien été enregistrée et sera expédiée prochainement.
      </p>

      {surprise && revealDone && (
        <p className="queen-message mb-6 font-display text-4xl font-bold text-exaltPink max-sm:text-3xl">
          Félicitations ma Queen 👑
        </p>
      )}

      {surprise && (
        <div className="mb-6 flex items-center gap-4 rounded-2xl border-2 border-exaltPink bg-white p-4 text-left">
          <img
            src={surprise.image.startsWith("http") || surprise.image.startsWith("/") ? surprise.image : `/assets/${surprise.image}`}
            alt={surprise.title}
            className="h-20 w-20 flex-shrink-0 rounded-xl bg-exaltCream object-cover"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-exaltPink">Ton produit mystère</p>
            <p className="mt-1 text-lg font-bold text-exaltNavy">{surprise.title} 🦄</p>
            <button type="button" onClick={() => {
                setRevealDone(false);
                setShowReveal(true);
              }} className="mt-1 text-xs text-gray-500 underline">
              Revoir les licornes
            </button>
          </div>
        </div>
      )}

      {/* Suivre ma commande */}
      <div className="border border-gray-200 p-6 mb-4 text-left">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">
          Suivre ma commande
        </h2>
        <p className="text-xs text-gray-400 mb-3">
          Entrez votre adresse e-mail pour retrouver votre commande
        </p>
        {!emailSent ? (
          <form onSubmit={handleRetrieve} className="flex flex-col gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
            <button
              type="submit"
              className="bg-exaltNavy text-white py-2 text-sm font-medium tracking-wide hover:opacity-90 transition"
            >
              Retrouver ma commande
            </button>
          </form>
        ) : (
          <p className="text-sm text-green-600">
            ✓ Un email vous a été envoyé avec le suivi de votre commande.
          </p>
        )}
      </div>

      {/* Créer un compte */}
      <div className="border border-gray-200 p-6 mb-6 text-left">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">
          Créer un compte
        </h2>
        <p className="text-xs text-gray-400 mb-3">
          Gardez un historique de vos commandes et simplifiez vos prochains achats.
        </p>
        <button
          onClick={() => navigate("/register")}
          className="w-full bg-exaltNavy text-white py-2 text-sm font-medium tracking-wide hover:opacity-90 transition mb-2"
        >
          Créer mon compte
        </button>
        <Link
          to="/login"
          className="block text-center text-xs text-gray-400 underline hover:text-gray-600"
        >
          J'ai déjà un compte
        </Link>
      </div>

      <Link
        to="/shop"
        className="text-xs text-gray-400 underline hover:text-gray-600"
      >
        Continuer mes achats
      </Link>
    </div>
  );
};
export default OrderConfirmation;
