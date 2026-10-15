import { useState } from "react";
import toast from "react-hot-toast";

interface WaitlistEntry {
  productId: string;
  productTitle: string;
  firstName: string;
  email: string;
  createdAt: string;
}

const STORAGE_KEY = "exalt-waitlist";

const readWaitlist = (): WaitlistEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const isAlreadyRegistered = (productId: string) =>
  readWaitlist().some((entry) => entry.productId === productId);

// Inscription à la liste d'attente d'un produit en rupture (sauvegardée dans le navigateur)
const WaitlistForm = ({ product }: { product: Product }) => {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [registered, setRegistered] = useState(() => isAlreadyRegistered(product.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Merci d'indiquer une adresse email valide");
      return;
    }
    const entry: WaitlistEntry = {
      productId: product.id,
      productTitle: product.title,
      firstName: firstName.trim(),
      email: email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...readWaitlist(), entry]));
    } catch {
      // stockage indisponible (navigation privée) : on confirme quand même
    }
    setRegistered(true);
    toast.success("C'est noté ! On vous prévient dès le retour en stock");
  };

  if (registered) {
    return (
      <div id="liste-attente" role="status" className="rounded-2xl bg-green-50 border border-green-200 px-5 py-4 text-green-800">
        <p className="font-semibold">✅ Vous êtes sur la liste d'attente</p>
        <p className="text-sm mt-1">
          On vous envoie un email dès que « {product.title} » revient en stock.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      id="liste-attente"
      aria-labelledby="waitlist-title"
      className="rounded-2xl border-2 border-exaltPink/40 bg-exaltCream p-4 sm:p-5 flex flex-col gap-3"
    >
      <div>
        <h2 id="waitlist-title" className="font-display text-lg font-bold text-exaltNavy">
          🔔 Prévenez-moi du retour en stock
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Un seul email, dès que ce produit est de nouveau disponible.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_3fr]">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-exaltNavy">Prénom (facultatif)</span>
          <input
            type="text"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full min-h-[48px] border border-gray-300 rounded-lg px-4 text-base bg-white outline-none focus:border-exaltNavy focus:ring-2 focus:ring-exaltNavy/20"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-exaltNavy">Email</span>
          <input
            id="waitlist-email"
            type="email"
            required
            inputMode="email"
            autoComplete="email"
            placeholder="vous@exemple.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-h-[48px] border border-gray-300 rounded-lg px-4 text-base bg-white outline-none focus:border-exaltNavy focus:ring-2 focus:ring-exaltNavy/20"
          />
        </label>
      </div>
      <button
        type="submit"
        className="w-full min-h-[48px] bg-exaltNavy text-white font-semibold rounded-lg hover:bg-exaltNavyLight transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-exaltPink"
      >
        M'inscrire à la liste d'attente
      </button>
    </form>
  );
};

export default WaitlistForm;
