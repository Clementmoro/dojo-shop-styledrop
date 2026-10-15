import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import customFetch from "../axios/custom";
import SurpriseCelebration from "../components/SurpriseCelebration";
import {
  getRevealedSurprise,
  pickSurprise,
  saveRevealedSurprise,
  takeSurprisePending,
} from "../utils/surprise";

const imageSrc = (image: string) =>
  image.startsWith("http") || image.startsWith("/") ? image : `/assets/${image}`;

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [surprise, setSurprise] = useState<Product | null>(getRevealedSurprise);
  const [celebrating, setCelebrating] = useState(false);

  // Juste après le paiement : tirage du produit surprise puis le spectacle
  useEffect(() => {
    if (!takeSurprisePending()) return;
    customFetch("/products").then(({ data }) => {
      const product = pickSurprise(data);
      if (!product) return;
      saveRevealedSurprise(product);
      setSurprise(product);
      setCelebrating(true);
    });
  }, []);

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

      {celebrating && surprise && (
        <SurpriseCelebration product={surprise} onClose={() => setCelebrating(false)} />
      )}

      {surprise && (
        <div className="mb-4 flex items-center gap-4 rounded-2xl bg-exaltCream p-4 text-left">
          <img src={imageSrc(surprise.image)} alt="" className="h-16 w-16 rounded-xl bg-white object-cover" />
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-exaltPink font-bold">Ton produit surprise</p>
            <p className="font-semibold text-exaltNavy">{surprise.title}</p>
            <p className="text-xs text-gray-500">Offert, livré avec ta commande</p>
          </div>
          <button
            type="button"
            onClick={() => setCelebrating(true)}
            className="text-xs font-semibold text-exaltNavy underline underline-offset-2 hover:text-exaltPink"
          >
            Revoir le spectacle
          </button>
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
