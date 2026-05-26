import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleRetrieve = (e: React.FormEvent) => {
    e.preventDefault();
    // v1: UI only
    setEmailSent(true);
  };

  return (
    <div className="max-w-screen-sm mx-auto px-5 pt-20 pb-16 text-center">
      <h1 className="text-3xl font-light mb-2">Merci pour votre commande !</h1>
      <p className="text-gray-500 mb-10">
        Votre commande a bien été enregistrée et sera expédiée prochainement.
      </p>

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
              className="bg-secondaryBrown text-white py-2 text-sm font-medium tracking-wide hover:opacity-90 transition"
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
          className="w-full bg-secondaryBrown text-white py-2 text-sm font-medium tracking-wide hover:opacity-90 transition mb-2"
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
