import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import customFetch from "../axios/custom";
import { formatCategoryName } from "../utils/formatCategoryName";

type Phase = "idle" | "spinning" | "open";

const CONFETTI_COLORS = [
  "#F0047F",
  "#0A0F5C",
  "#FFD23F",
  "#1B2290",
  "#FF8CC6",
  "#4ADE80",
];

const GIFT_STYLES = `
.gift-stage { position: relative; height: 22rem; display: flex; align-items: center; justify-content: center; perspective: 900px; }
.gift { position: relative; width: 11rem; height: 11rem; transform-style: preserve-3d; }
.gift-idle { animation: gift-wiggle 0.9s ease-in-out infinite; }
.gift-spinning { animation: gift-spin 1.4s cubic-bezier(.45,.05,.35,1) forwards; }
.gift-open { transform: scale(1.1); }
.gift-box { position: absolute; left: 0.5rem; right: 0.5rem; bottom: 0; height: 7.5rem; background: #fff; border: 2px solid #E4DFD6; border-radius: 0.6rem; box-shadow: 0 18px 30px -12px rgba(10,15,92,.25); transition: opacity .5s ease .35s, transform .5s ease .35s; }
.gift-ribbon-v { position: absolute; left: 50%; top: 0; bottom: 0; width: 1.4rem; transform: translateX(-50%); background: #F0047F; }
.gift-lid { position: absolute; left: 0; right: 0; top: 2.2rem; height: 2.4rem; background: #fff; border: 2px solid #E4DFD6; border-radius: 0.6rem; z-index: 2; transition: transform .7s cubic-bezier(.2,.9,.3,1.3), opacity .6s ease .2s; }
.gift-bow { position: absolute; left: 50%; top: -2.1rem; width: 6rem; height: 2.4rem; transform: translateX(-50%); }
.gift-bow::before, .gift-bow::after { content: ""; position: absolute; top: 0.2rem; width: 2.8rem; height: 2rem; border: 0.55rem solid #F0047F; border-radius: 50% 50% 10% 50%; }
.gift-bow::before { left: 0; transform: rotate(-20deg); }
.gift-bow::after { right: 0; transform: scaleX(-1) rotate(-20deg); }
.gift-knot { position: absolute; left: 50%; top: 1.3rem; width: 1.4rem; height: 1.4rem; transform: translateX(-50%); border-radius: 50%; background: #C00366; z-index: 1; }
.gift-open .gift-lid { transform: translate(-3.5rem, -9rem) rotate(-35deg); opacity: 0; }
.gift-open .gift-box { transform: translateY(2rem) scale(.85); opacity: 0; }
.gift-prize { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .75rem; opacity: 0; transform: scale(.3); pointer-events: none; }
.gift-prize-shown { animation: gift-pop .8s cubic-bezier(.2,.9,.3,1.4) .45s forwards; pointer-events: auto; }
.confetti { position: absolute; left: 50%; top: 45%; width: .55rem; height: .9rem; border-radius: 2px; opacity: 0; pointer-events: none; animation: confetti-burst 2.6s cubic-bezier(.15,.7,.3,1) var(--delay) forwards; }
@keyframes gift-wiggle { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-6deg) translateY(-4px); } 75% { transform: rotate(6deg) translateY(-4px); } }
@keyframes gift-spin { 0% { transform: rotateY(0) scale(1); } 60% { transform: rotateY(540deg) scale(1.15); } 100% { transform: rotateY(720deg) scale(1.1); } }
@keyframes gift-pop { to { opacity: 1; transform: scale(1); } }
@keyframes confetti-burst {
  0% { opacity: 1; transform: translate(-50%, -50%) rotate(0); }
  35% { opacity: 1; transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) rotate(calc(var(--r) * .5)); }
  100% { opacity: 0; transform: translate(calc(-50% + var(--x) * 1.2), calc(-50% + var(--y) + 22rem)) rotate(var(--r)); }
}
@media (prefers-reduced-motion: reduce) {
  .gift-idle, .gift-spinning { animation: none; }
  .gift-prize-shown { animation: none; opacity: 1; transform: none; }
  .confetti { display: none; }
}
`;

const GiftReveal = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [prize, setPrize] = useState<Product | null>(null);
  const [round, setRound] = useState(0);

  // Tire au sort un vrai produit disponible du catalogue
  useEffect(() => {
    customFetch("/products")
      .then((response) => {
        const candidates = (response.data as Product[]).filter(
          (product) => product.category !== "surprise" && product.stock > 0,
        );
        setPrize(
          candidates[Math.floor(Math.random() * candidates.length)] ?? null,
        );
      })
      .catch(() => setPrize(null));
  }, []);

  // Déroulé : le cadeau frétille, tourne sur lui-même, puis s'ouvre
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) {
      setPhase("open");
      return;
    }
    setPhase("idle");
    const spin = setTimeout(() => setPhase("spinning"), 1200);
    const open = setTimeout(() => setPhase("open"), 2600);
    return () => {
      clearTimeout(spin);
      clearTimeout(open);
    };
  }, [round]);

  const confetti = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const distance = 6 + Math.random() * 12;
        return {
          id: `${round}-${i}`,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          x: `${Math.cos(angle) * distance}rem`,
          y: `${Math.sin(angle) * distance - 4}rem`,
          r: `${Math.round(Math.random() * 720 - 360)}deg`,
          delay: `${Math.random() * 0.25}s`,
          round: i % 3 === 0,
        };
      }),
    [round],
  );

  return (
    <section className="relative mb-10 rounded-3xl bg-exaltCream px-5 pt-8 pb-6 overflow-hidden">
      <style>{GIFT_STYLES}</style>
      <p className="text-exaltPink text-sm font-semibold uppercase tracking-[0.2em]">
        Ton article surprise
      </p>
      <h2 className="font-display text-2xl font-bold text-exaltNavy mt-1">
        {phase === "open" ? "Et c'est…" : "Ton cadeau s'ouvre…"}
      </h2>

      <div className="gift-stage" aria-live="polite">
        <div className={`gift gift-${phase}`} aria-hidden={phase === "open"}>
          <div className="gift-lid">
            <div className="gift-ribbon-v" />
            <div className="gift-bow" />
            <div className="gift-knot" />
          </div>
          <div className="gift-box">
            <div className="gift-ribbon-v" />
          </div>
        </div>

        {phase === "open" &&
          confetti.map((piece) => (
            <span
              key={piece.id}
              className="confetti"
              style={
                {
                  background: piece.color,
                  borderRadius: piece.round ? "50%" : undefined,
                  "--x": piece.x,
                  "--y": piece.y,
                  "--r": piece.r,
                  "--delay": piece.delay,
                } as React.CSSProperties
              }
            />
          ))}

        <div
          className={`gift-prize ${phase === "open" ? "gift-prize-shown" : ""}`}
        >
          {prize ? (
            <>
              <img
                src={prize.image}
                alt={prize.title}
                className="h-40 w-40 rounded-2xl bg-white object-cover shadow-lg"
              />
              <div>
                <p className="font-display text-xl font-bold text-exaltNavy">
                  {prize.title}
                </p>
                <p className="text-sm text-gray-500">
                  {formatCategoryName(prize.category)} · d'une valeur de{" "}
                  {prize.price} €
                </p>
              </div>
            </>
          ) : (
            <p className="font-display text-xl font-bold text-exaltNavy">
              Un goodie eXalt rien que pour toi !
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        {prize && phase === "open" && (
          <Link
            to={`/product/${prize.id}`}
            className="font-semibold text-exaltNavy underline hover:text-exaltPink"
          >
            Voir la fiche du produit
          </Link>
        )}
        {phase === "open" && (
          <button
            type="button"
            onClick={() => setRound((r) => r + 1)}
            className="font-semibold text-exaltPink hover:text-exaltNavy"
          >
            Rejouer l'ouverture
          </button>
        )}
      </div>
    </section>
  );
};
export default GiftReveal;
