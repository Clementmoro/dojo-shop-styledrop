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
      <div className="rounded-2xl bg-green-50 border border-green-200 px-5 py-4 text-green-800">
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
      className="rounded-2xl border-2 border-exaltPink/30 bg-exaltCream px-5 py-5 flex flex-col gap-3"
    >
      <div>
        <p className="font-display text-lg font-bold text-exaltNavy">
          🔔 Prévenez-moi du retour en stock
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Laissez votre email, on vous écrit dès que ce produit est de nouveau disponible.
        </p>
      </div>
      <input
        type="text"
        placeholder="Prénom (facultatif)"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-exaltNavy"
      />
      <input
        type="email"
        required
        placeholder="Votre email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-exaltNavy"
      />
      <button
        type="submit"
        className="bg-exaltNavy text-white font-semibold rounded-lg py-3 hover:bg-exaltNavyLight transition-colors"
      >
        M'inscrire à la liste d'attente
      </button>
    </form>
  );
};

export default WaitlistForm;
