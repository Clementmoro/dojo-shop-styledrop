import { useEffect, useMemo, useState } from "react";

// Explosion de licornes qui dansent sur toute la page, puis révélation du produit surprise
const UnicornReveal = ({ title, image, onDone }: { title: string; image: string; onDone: () => void }) => {
  const [visible, setVisible] = useState(true);

  const unicorns = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => {
        const angle = (i / 40) * Math.PI * 2 + Math.random() * 0.4;
        const burst = 25 + Math.random() * 25;
        return {
          id: i,
          emoji: i % 5 === 0 ? "✨" : i % 7 === 0 ? "🌈" : "🦄",
          size: 28 + Math.random() * 34,
          delay: Math.random() * 0.35,
          duration: 3.2 + Math.random() * 1.6,
          ax: Math.cos(angle) * burst,
          ay: Math.sin(angle) * burst,
          bx: (Math.random() * 160 - 80),
          by: (Math.random() * 140 - 70),
          cx: Math.cos(angle) * 90 + (Math.random() * 30 - 15),
          cy: Math.sin(angle) * 90 + (Math.random() * 30 - 15),
          rot: Math.random() * 720 - 360,
        };
      }),
    []
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDone();
    }, 5200);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[80] overflow-hidden pointer-events-none" aria-live="polite">
      {unicorns.map((u) => (
        <span
          key={u.id}
          className="unicorn-burst"
          style={{
            fontSize: `${u.size}px`,
            animationDelay: `${u.delay}s`,
            animationDuration: `${u.duration}s`,
            ["--ax" as string]: `${u.ax}vw`,
            ["--ay" as string]: `${u.ay}vh`,
            ["--bx" as string]: `${u.bx}vw`,
            ["--by" as string]: `${u.by}vh`,
            ["--cx" as string]: `${u.cx}vw`,
            ["--cy" as string]: `${u.cy}vh`,
            ["--rot" as string]: `${u.rot}deg`,
          }}
        >
          <span className="unicorn-dance" style={{ animationDelay: `${u.delay}s` }}>
            {u.emoji}
          </span>
        </span>
      ))}

      <div className="absolute inset-0 flex items-center justify-center px-6">
        <div className="surprise-card pointer-events-auto rounded-3xl bg-white px-6 py-5 text-center shadow-2xl ring-4 ring-exaltPink">
          <p className="text-sm font-semibold uppercase tracking-widest text-exaltPink">Ta surprise</p>
          <img
            src={image.startsWith("http") || image.startsWith("/") ? image : `/assets/${image}`}
            alt={title}
            className="mx-auto mt-3 h-28 w-28 rounded-2xl bg-exaltCream object-cover"
          />
          <p className="mt-3 text-lg font-bold text-exaltNavy">{title} 🦄</p>
        </div>
      </div>
    </div>
  );
};
export default UnicornReveal;
