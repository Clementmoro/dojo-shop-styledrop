import { useEffect, useState } from "react";

// ↑ ↑ ↓ ↓ ← → ← → B A
const SEQUENCE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];
const COLORS = ["#F0047F", "#FFD600", "#0A0F5C", "#1B2290", "#ffffff"];

const KonamiEgg = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let position = 0;
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      position = key === SEQUENCE[position] ? position + 1 : key === SEQUENCE[0] ? 1 : 0;
      if (position === SEQUENCE.length) {
        position = 0;
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      {Array.from({ length: 80 }).map((_, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${Math.random() * 100}vw`,
            width: `${6 + Math.random() * 8}px`,
            height: `${10 + Math.random() * 10}px`,
            background: COLORS[i % COLORS.length],
            animationDuration: `${2.5 + Math.random() * 2.5}s`,
            animationDelay: `${Math.random() * 1.5}s`,
          }}
        />
      ))}
      <div
        className="fixed inset-0 z-[60] bg-exaltNavy/70 flex items-center justify-center p-5"
        onClick={() => setIsOpen(false)}
      >
        <div
          className="bg-white rounded-3xl max-w-md w-full p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-5xl">🕹️</p>
          <p className="text-exaltPink text-sm font-semibold uppercase tracking-[0.2em] mt-4">
            Secret n°2 sur 3
          </p>
          <h2 className="font-display text-3xl font-bold text-exaltNavy mt-2">Code Konami activé</h2>
          <p className="text-gray-600 mt-3">
            Tu fais partie des rares à connaître les classiques. Garde ça pour toi jusqu'au débrief.
          </p>
          <button
            onClick={() => setIsOpen(false)}
            className="mt-6 bg-exaltNavy hover:bg-exaltPink transition-colors text-white font-semibold rounded-full h-12 px-8"
          >
            Continuer l'exploration
          </button>
        </div>
      </div>
    </>
  );
};
export default KonamiEgg;
