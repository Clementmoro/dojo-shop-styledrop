import { useEffect } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

// Page non référencée : on n'y arrive qu'en lisant le code source ou le robots.txt
const Coulisses = () => {
  useEffect(() => {
    toast("🥚 Secret n°1 sur 3 : les coulisses", { id: "secret-1", duration: 6000 });
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-5 py-20 max-[400px]:px-3">
      <p className="text-exaltPink text-sm font-semibold uppercase tracking-[0.2em]">
        Secret n°1 sur 3
      </p>
      <h1 className="font-display text-5xl font-bold text-exaltNavy mt-3 max-sm:text-4xl">
        Bienvenue dans les coulisses 🎬
      </h1>
      <p className="text-lg text-gray-600 mt-6 leading-relaxed">
        Tu es arrivé ici en lisant ce que les utilisateurs ne voient jamais : le code source de la
        page. C'est exactement le réflexe qu'on attend d'un PM en mission. Le produit, ce n'est pas
        seulement ce qui s'affiche, c'est aussi tout ce qu'il y a derrière.
      </p>

      <div className="mt-10 grid gap-4">
        <div className="rounded-2xl bg-exaltCream p-6">
          <p className="font-semibold text-exaltNavy">🕹️ Un indice pour le secret n°2</p>
          <p className="text-gray-600 mt-1">
            Les vieux gamers de l'équipe ont laissé un code de triche quelque part sur le site. Il se
            tape au clavier, et il date de 1986.
          </p>
        </div>
        <div className="rounded-2xl bg-exaltCream p-6">
          <p className="font-semibold text-exaltNavy">👻 Un indice pour le secret n°3</p>
          <p className="text-gray-600 mt-1">
            Il existe un produit qui n'apparaît dans aucun menu ni aucune recherche. Les données
            analytics l'ont pourtant vu passer. Son numéro ? Le plus grand nombre à deux chiffres.
          </p>
        </div>
      </div>

      <Link
        to="/"
        className="inline-flex mt-10 bg-exaltNavy hover:bg-exaltPink transition-colors text-white font-semibold rounded-full h-12 px-8 items-center"
      >
        Retourner sur la boutique
      </Link>
    </div>
  );
};
export default Coulisses;
