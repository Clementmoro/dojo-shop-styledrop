import { TbCheck } from "react-icons/tb";
import LlamaRunnerGame from "./LlamaRunnerGame";

const COLORS = ["#0A0F5C", "#F0047F", "#FFD600", "#FFFFFF", "#1B2290"];

// confettis répartis de façon régulière (pas d'aléatoire : même rendu à chaque fois)
const CONFETTI = Array.from({ length: 70 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 13) % 20) / 10,
  duration: 2.6 + ((i * 7) % 10) / 10,
  size: 6 + ((i * 5) % 7),
  color: COLORS[i % COLORS.length],
  round: i % 3 === 0,
  drift: ((i * 11) % 40) - 20,
}));

const OrderCelebration = ({ onDone }: { onDone: () => void }) => {
  return (
    <div
      className="order-celebration fixed inset-0 z-[60] flex items-center justify-center bg-exaltNavy/85 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-celebration-title"
    >
      <style>{`
        .order-celebration .confetti { position: absolute; top: -20px; opacity: 0; }
        .order-celebration .celebration-card { opacity: 1; }
        @media (prefers-reduced-motion: no-preference) {
          .order-celebration .confetti { animation: confetti-fall var(--dur) linear var(--delay) infinite; }
          .order-celebration .celebration-card { animation: card-in .5s cubic-bezier(.2,1.4,.4,1) both; }
          .order-celebration .check { animation: check-pop .6s cubic-bezier(.2,1.6,.4,1) .25s both; }
          .order-celebration .check-ring { animation: check-ring 1.4s ease-out .4s infinite; }
        }
        @keyframes confetti-fall {
          0% { opacity: 1; transform: translate(0, 0) rotate(0deg); }
          100% { opacity: 1; transform: translate(var(--drift), 105vh) rotate(720deg); }
        }
        @keyframes card-in { from { opacity: 0; transform: translateY(24px) scale(.92); } to { opacity: 1; transform: none; } }
        @keyframes check-pop { from { transform: scale(0) rotate(-30deg); } to { transform: scale(1) rotate(0); } }
        @keyframes check-ring { from { transform: scale(1); opacity: .6; } to { transform: scale(1.9); opacity: 0; } }
      `}</style>

      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className="confetti"
          aria-hidden="true"
          style={
            {
              left: `${c.left}%`,
              width: c.size,
              height: c.round ? c.size : c.size * 1.6,
              background: c.color,
              borderRadius: c.round ? "50%" : 2,
              "--delay": `${c.delay}s`,
              "--dur": `${c.duration}s`,
              "--drift": `${c.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}

      <div className="celebration-card relative flex max-h-full w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-3xl bg-white p-5 text-center shadow-2xl sm:p-7">
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <span className="check-ring absolute inset-0 rounded-full bg-exaltPink" aria-hidden="true" />
            <span className="check relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-exaltPink text-white shadow-lg">
              <TbCheck className="h-7 w-7" strokeWidth={3} aria-hidden="true" />
            </span>
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-exaltPink">Commande confirmée</p>
          <h2 id="order-celebration-title" className="font-display text-3xl font-bold text-exaltNavy max-sm:text-2xl">
            Félicitations, ton année de Claude est offerte ! 🎉
          </h2>
          <p className="max-w-md text-gray-600">
            Merci pour ta commande. eXalt t'offre <span className="font-semibold text-exaltNavy">1 an d'abonnement Claude</span>,
            et notre lama galope déjà pour te livrer.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-exaltNavy">🦙 Pendant qu'on prépare ton colis, aide le lama à sauter les obstacles !</p>
          <LlamaRunnerGame />
        </div>

        <button
          type="button"
          onClick={onDone}
          className="flex h-12 w-full items-center justify-center rounded-full bg-exaltNavy font-semibold text-white transition-colors hover:bg-exaltPink"
        >
          Voir ma confirmation
        </button>
      </div>
    </div>
  );
};
export default OrderCelebration;
