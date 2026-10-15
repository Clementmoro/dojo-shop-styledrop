import { useEffect, useMemo, useState } from "react";

// Pluie de têtes de chien qui remplit l'écran, pour fêter une commande validée
const DOG = "🐶";
const SIZE = 60; // taille d'une tête, en px

interface Dog {
  id: number;
  left: number;
  top: number;
  delay: number;
  rotate: number;
  scale: number;
}

const buildDogs = (): Dog[] => {
  const cols = Math.ceil(window.innerWidth / (SIZE * 0.8));
  const rows = Math.ceil(window.innerHeight / (SIZE * 0.8));
  const dogs: Dog[] = [];
  // Les rangées du bas tombent en premier, l'écran se remplit de bas en haut
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dogs.push({
        id: r * cols + c,
        left: (c + Math.random() * 0.6) * SIZE * 0.8 - SIZE * 0.2,
        top: window.innerHeight - (r + 1) * SIZE * 0.8 + Math.random() * 10,
        delay: r * 0.11 + Math.random() * 0.35,
        rotate: Math.round(Math.random() * 60 - 30),
        scale: 0.85 + Math.random() * 0.4,
      });
    }
  }
  return dogs;
};

const DogRain = ({ play }: { play: number }) => {
  const [visible, setVisible] = useState(true);
  const dogs = useMemo(() => buildDogs(), [play]);
  const lastDelay = Math.max(...dogs.map((d) => d.delay));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), (lastDelay + 2.6) * 1000);
    return () => clearTimeout(timer);
  }, [play, lastDelay]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
      style={{ animation: `dograin-fade 0.8s ease-in ${lastDelay + 1.8}s forwards` }}
    >
      <style>{`
        @keyframes dograin-fall {
          0% { transform: translateY(-110vh) rotate(var(--r)) scale(var(--s)); }
          80% { transform: translateY(6px) rotate(var(--r)) scale(var(--s)); }
          100% { transform: translateY(0) rotate(var(--r)) scale(var(--s)); }
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
              fontSize: SIZE,
              "--r": `${d.rotate}deg`,
              "--s": d.scale,
              transform: `rotate(${d.rotate}deg) scale(${d.scale})`,
              animation: reduceMotion ? undefined : `dograin-fall 0.75s cubic-bezier(.45,0,.55,1) ${d.delay}s both`,
            } as React.CSSProperties
          }
        >
          {DOG}
        </span>
      ))}
    </div>
  );
};

export default DogRain;
