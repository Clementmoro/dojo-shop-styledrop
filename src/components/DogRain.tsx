import { useEffect, useMemo, useState } from "react";

// Pluie de chiens déguisés qui remplit l'écran, pour fêter une commande validée
const SIZE = 60; // taille d'une tête, en px

// Têtes : surtout des 🐶, avec quelques intrus
const HEADS = ["🐶", "🐶", "🐶", "🐶", "🐶", "🐶", "🐕", "🐩", "🦮", "🌭"];

// Déguisements, placés sur la tête (top et taille en proportion de la tête)
const OUTFITS = [
  { emoji: "🕶️", top: 0.12, size: 0.62 },
  { emoji: "🎩", top: -0.5, size: 0.62 },
  { emoji: "👑", top: -0.42, size: 0.55 },
  { emoji: "🧢", top: -0.42, size: 0.6 },
  { emoji: "🎀", top: -0.3, size: 0.45 },
  { emoji: "🎓", top: -0.45, size: 0.6 },
  { emoji: "🎉", top: -0.45, size: 0.5 },
  { emoji: "🌸", top: -0.32, size: 0.42 },
];

const BUBBLES = [
  "Wouf !",
  "Ouaf ouaf 🎉",
  "Bon toutou !",
  "Merciii",
  "Much buy. Wow.",
  "Un sticker pour moi ?",
  "Livré en 3 jours !",
  "Je garde le colis 🐾",
  "Qui c'est le meilleur client ?",
  "Waf waf waf",
];

interface Dog {
  id: number;
  left: number;
  top: number;
  delay: number;
  rotate: number;
  spin: number;
  scale: number;
  head: string;
  outfit?: (typeof OUTFITS)[number];
  wiggle: boolean;
  bubble?: string;
}

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

const buildDogs = (): Dog[] => {
  const step = SIZE * 0.8;
  const cols = Math.ceil(window.innerWidth / step);
  const rows = Math.ceil(window.innerHeight / step);
  const dogs: Dog[] = [];
  // Les rangées du bas tombent en premier : l'écran se remplit de bas en haut
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const giant = Math.random() < 0.03;
      dogs.push({
        id: r * cols + c,
        left: (c + Math.random() * 0.6) * step - SIZE * 0.2,
        top: window.innerHeight - (r + 1) * step + Math.random() * 10,
        delay: r * 0.11 + Math.random() * 0.35,
        rotate: Math.round(Math.random() * 50 - 25),
        spin: Math.round(Math.random() * 720 - 360),
        scale: giant ? 1.9 : 0.8 + Math.random() * 0.45,
        head: pick(HEADS),
        outfit: Math.random() < 0.45 ? pick(OUTFITS) : undefined,
        wiggle: Math.random() < 0.3,
      });
    }
  }
  // Une dizaine de chiens bavards, plutôt en haut de l'écran pour qu'on les lise
  const talkers = dogs.filter((d) => d.top > 40 && d.top < window.innerHeight * 0.7 && d.left > 40 && d.left < window.innerWidth - 200);
  for (let i = 0; i < Math.min(10, Math.ceil(talkers.length / 20)); i++) {
    const dog = talkers[Math.floor(Math.random() * talkers.length)];
    dog.bubble = BUBBLES[i % BUBBLES.length];
    dog.scale = Math.max(dog.scale, 1.15);
  }
  return dogs.sort(() => Math.random() - 0.5).sort((a, b) => a.delay - b.delay);
};

const DogRain = ({ play }: { play: number }) => {
  const [visible, setVisible] = useState(true);
  const dogs = useMemo(() => buildDogs(), [play]);
  const lastDelay = Math.max(...dogs.map((d) => d.delay));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const end = lastDelay + 3.2;

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), end * 1000);
    return () => clearTimeout(timer);
  }, [play, end]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
      style={{ animation: `dograin-fade 0.8s ease-in ${end - 0.8}s forwards` }}
    >
      <style>{`
        @keyframes dograin-fall {
          0% { transform: translateY(-110vh) rotate(var(--spin)); }
          70% { transform: translateY(8px) rotate(var(--r)) scale(1.15, 0.75); }
          85% { transform: translateY(-14px) rotate(var(--r)) scale(0.92, 1.1); }
          100% { transform: translateY(0) rotate(var(--r)) scale(1); }
        }
        @keyframes dograin-wiggle {
          from { transform: rotate(-12deg); }
          to { transform: rotate(12deg) translateY(-4px); }
        }
        @keyframes dograin-pop {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2) rotate(-20deg); }
          60% { opacity: 1; transform: translate(-50%, -50%) scale(1.15) rotate(6deg); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotate(0); }
        }
        @keyframes dograin-bubble {
          from { opacity: 0; transform: translate(-50%, 6px) scale(0.6); }
          to { opacity: 1; transform: translate(-50%, 0) scale(1); }
        }
        @keyframes dograin-fade { to { opacity: 0; } }
      `}</style>

      {dogs.map((d) => (
        <span
          key={`${play}-${d.id}`}
          className="absolute select-none leading-none"
          style={
            {
              left: d.left,
              top: d.top,
              fontSize: SIZE * d.scale,
              zIndex: d.bubble ? 2 : 1,
              "--r": `${d.rotate}deg`,
              "--spin": `${d.spin}deg`,
              transform: `rotate(${d.rotate}deg)`,
              animation: reduceMotion ? undefined : `dograin-fall 0.9s cubic-bezier(.45,0,.55,1) ${d.delay}s both`,
            } as React.CSSProperties
          }
        >
          <span
            className="relative inline-block"
            style={{
              animation:
                d.wiggle && !reduceMotion
                  ? `dograin-wiggle ${0.25 + (d.id % 4) * 0.08}s ease-in-out ${d.delay + 0.9}s infinite alternate`
                  : undefined,
            }}
          >
            {d.head}
            {d.outfit && d.head !== "🌭" && (
              <span
                className="absolute left-1/2 -translate-x-1/2"
                style={{ top: `${d.outfit.top}em`, fontSize: `${d.outfit.size}em` }}
              >
                {d.outfit.emoji}
              </span>
            )}
            {d.bubble && (
              <span
                className="absolute left-1/2 bottom-full mb-1 whitespace-nowrap rounded-2xl bg-white px-3 py-1.5 font-bold text-exaltNavy shadow-lg border-2 border-exaltNavy"
                style={{
                  fontSize: 15,
                  animation: `dograin-bubble 0.3s ease-out ${d.delay + 0.9}s both`,
                }}
              >
                {d.bubble}
              </span>
            )}
          </span>
        </span>
      ))}

      {/* Le grand final : un chien géant à lunettes */}
      <div
        className="absolute left-1/2 top-1/2 z-10 flex flex-col items-center gap-3 rounded-[2rem] bg-exaltNavy px-8 py-6 text-center text-white shadow-2xl"
        style={{ animation: `dograin-pop 0.6s cubic-bezier(.3,1.6,.6,1) ${lastDelay + 0.6}s both` }}
      >
        <span className="relative leading-none" style={{ fontSize: 110 }}>
          🐶
          <span className="absolute left-1/2 -translate-x-1/2" style={{ top: "0.12em", fontSize: "0.62em" }}>
            🕶️
          </span>
        </span>
        <span className="font-display text-3xl font-bold max-sm:text-2xl">WOUF !</span>
        <span className="text-lg text-exaltYellow font-semibold">Commande validée 🐾</span>
      </div>
    </div>
  );
};

export default DogRain;
