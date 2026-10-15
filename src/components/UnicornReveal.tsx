import { useEffect, useMemo, useState } from "react";
import DancingUnicorn from "./DancingUnicorn";

const COLORS = ["#FF5FA2", "#B57BFF", "#5FC8FF", "#FFC93C", "#7CE38B", "#F0047F"];

// Explosion d'étincelles, parade de licornes qui dansent sur toute la page, puis révélation du produit mystère
const UnicornReveal = ({ title, image, onDone }: { title: string; image: string; onDone: () => void }) => {
  const [visible, setVisible] = useState(true);

  const sparks = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => {
        const angle = (i / 60) * Math.PI * 2 + Math.random() * 0.3;
        const burst = 30 + Math.random() * 35;
        return {
          id: i,
          star: i % 3 === 0,
          color: COLORS[i % COLORS.length],
          size: 10 + Math.random() * 18,
          delay: Math.random() * 0.25,
          duration: 1.8 + Math.random() * 1.2,
          ax: Math.cos(angle) * burst * 0.5,
          ay: Math.sin(angle) * burst * 0.5,
          bx: Math.cos(angle) * burst,
          by: Math.sin(angle) * burst,
          cx: Math.cos(angle) * burst * 1.3,
          cy: Math.sin(angle) * burst * 1.3 + 15,
          rot: Math.random() * 540 - 270,
        };
      }),
    []
  );

  const unicorns = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        id: i,
        fromLeft: i % 2 === 0,
        top: 4 + ((i * 13) % 78),
        size: 120 + Math.random() * 90,
        delay: 0.3 + i * 0.35,
        duration: 4.2 + Math.random() * 1.4,
      })),
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDone();
    }, 7500);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[80] overflow-hidden pointer-events-none" aria-live="polite">
      {sparks.map((s) => (
        <span
          key={s.id}
          className="unicorn-burst"
          style={{
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            ["--ax" as string]: `${s.ax}vw`,
            ["--ay" as string]: `${s.ay}vh`,
            ["--bx" as string]: `${s.bx}vw`,
            ["--by" as string]: `${s.by}vh`,
            ["--cx" as string]: `${s.cx}vw`,
            ["--cy" as string]: `${s.cy}vh`,
            ["--rot" as string]: `${s.rot}deg`,
          }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 20 20">
            {s.star ? (
              <path d="M10 0 L12.5 7.5 L20 10 L12.5 12.5 L10 20 L7.5 12.5 L0 10 L7.5 7.5 Z" fill={s.color} />
            ) : (
              <circle cx="10" cy="10" r="8" fill={s.color} />
            )}
          </svg>
        </span>
      ))}

      {unicorns.map((u) => (
        <div
          key={u.id}
          className={u.fromLeft ? "unicorn-parade-ltr" : "unicorn-parade-rtl"}
          style={{ top: `${u.top}vh`, animationDelay: `${u.delay}s`, animationDuration: `${u.duration}s` }}
        >
          <DancingUnicorn size={u.size} flip={!u.fromLeft} />
        </div>
      ))}

      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="surprise-card pointer-events-auto rounded-3xl bg-white px-6 py-5 text-center shadow-2xl ring-4 ring-exaltPink">
          <p className="text-sm font-semibold uppercase tracking-widest text-exaltPink">Ton produit mystère</p>
          <img
            src={image.startsWith("http") || image.startsWith("/") ? image : `/assets/${image}`}
            alt={title}
            className="mx-auto mt-3 h-28 w-28 rounded-2xl bg-exaltCream object-cover"
          />
          <p className="mt-3 text-lg font-bold text-exaltNavy">{title}</p>
        </div>
      </div>
    </div>
  );
};
export default UnicornReveal;
