import { useEffect, useRef, useState } from "react";

// Spectacle du produit « Surprise », joué après le paiement :
// damier de couleurs → bleu nuit 2 s → bouquet final → texte → photo de Clément.
type Phase = "grid" | "night" | "fireworks" | "text" | "photo";

const GRID = 10; // 10 × 10 carrés, chacun 10 % de la largeur et de la hauteur
const PHOTO_SRC = "/assets/clement.jpg"; // déposer la photo ici ; sinon, ses initiales s'affichent
const NIGHT = "#0B1D3F";

const vivid = () => `hsl(${Math.floor(Math.random() * 360)} 95% 55%)`;

const SurpriseShow = ({ onClose }: { onClose: () => void }) => {
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [phase, setPhase] = useState<Phase>(reduced ? "photo" : "grid");
  const [colors] = useState(() => Array.from({ length: GRID * GRID }, vivid));
  const [photoOk, setPhotoOk] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Enchaînement des étapes
  useEffect(() => {
    if (reduced) return;
    const t = [
      setTimeout(() => setPhase("night"), 2600),
      setTimeout(() => setPhase("fireworks"), 4600),
      setTimeout(() => setPhase("text"), 7600),
      setTimeout(() => setPhase("photo"), 9600),
    ];
    return () => t.forEach(clearTimeout);
  }, [reduced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Feu d'artifice : bouquet final intense, puis quelques fusées en fond
  const showFireworks = phase === "fireworks" || phase === "text" || phase === "photo";
  useEffect(() => {
    if (!showFireworks || reduced) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    type Rocket = { x: number; y: number; vy: number; targetY: number; hue: number };
    type Spark = { x: number; y: number; vx: number; vy: number; life: number; hue: number; size: number };
    const rockets: Rocket[] = [];
    const sparks: Spark[] = [];
    const start = performance.now();
    let last = start;
    let raf = 0;

    const launch = () => {
      const w = window.innerWidth, h = window.innerHeight;
      rockets.push({ x: w * (0.1 + Math.random() * 0.8), y: h, vy: -(9 + Math.random() * 5), targetY: h * (0.12 + Math.random() * 0.4), hue: Math.random() * 360 });
    };
    const explode = (r: Rocket) => {
      const n = 70 + Math.floor(Math.random() * 50);
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n;
        const speed = 2 + Math.random() * 4.5;
        sparks.push({ x: r.x, y: r.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 1, hue: (r.hue + Math.random() * 40) % 360, size: 1.5 + Math.random() * 1.8 });
      }
    };

    const tick = (now: number) => {
      const elapsed = now - start;
      const dt = Math.min((now - last) / 16.7, 3);
      last = now;
      // Bouquet final pendant 3,5 s, puis rythme calme
      const rate = elapsed < 3500 ? 0.45 : 0.05;
      if (Math.random() < rate * dt) launch();
      if (elapsed < 3500 && Math.random() < 0.2 * dt) launch();

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(11, 29, 63, 0.25)";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
      ctx.globalCompositeOperation = "lighter";

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy * dt;
        ctx.fillStyle = `hsl(${r.hue} 100% 75%)`;
        ctx.fillRect(r.x - 1.5, r.y, 3, 10);
        if (r.y <= r.targetY) {
          explode(r);
          rockets.splice(i, 1);
        }
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.vx *= 0.985;
        s.vy = s.vy * 0.985 + 0.06 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= 0.012 * dt;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.fillStyle = `hsla(${s.hue} 100% 62% / ${s.life})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    ctx.fillStyle = NIGHT;
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [showFireworks, reduced]);

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden" style={{ background: NIGHT }} role="dialog" aria-modal="true" aria-label="Ta Surprise eXalt">
      <style>{`
        @keyframes surprise-pop { from { transform: scale(0); opacity: 0 } to { transform: scale(1); opacity: 1 } }
        @keyframes surprise-rise { from { transform: translateY(24px) scale(.96); opacity: 0 } to { transform: none; opacity: 1 } }
      `}</style>

      {phase === "grid" && (
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)`, gridTemplateRows: `repeat(${GRID}, 1fr)` }}>
          {colors.map((c, i) => (
            <div
              key={i}
              style={{
                background: c,
                animation: `surprise-pop 400ms cubic-bezier(.2,.9,.3,1.3) both`,
                animationDelay: `${((i % GRID) + Math.floor(i / GRID)) * 70}ms`,
              }}
            />
          ))}
        </div>
      )}

      {showFireworks && !reduced && <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />}

      {(phase === "text" || phase === "photo") && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center pointer-events-none">
          <div style={{ animation: "surprise-rise 700ms ease-out both" }}>
            <p className="text-exaltYellow text-sm font-semibold uppercase tracking-[0.3em]">Surprise débloquée</p>
            <h2 className="font-display text-5xl font-bold text-white mt-3 max-sm:text-3xl" style={{ textShadow: "0 4px 24px rgba(0,0,0,.5)" }}>
              Bravo, légende ! 🎉
            </h2>
            <p className="text-white/90 text-lg mt-3 max-w-xl max-sm:text-base">
              Tu as osé le produit mystère. Ta Surprise eXalt est en route, et tu rejoins le club très fermé de ceux qui
              savent. Clément te dit merci en personne :
            </p>
          </div>
          {phase === "photo" && (
            <figure className="flex flex-col items-center gap-3" style={{ animation: "surprise-rise 700ms ease-out both" }}>
              {photoOk ? (
                <img
                  src={PHOTO_SRC}
                  alt="Clément"
                  onError={() => setPhotoOk(false)}
                  className="w-44 h-44 rounded-full object-cover border-4 border-exaltYellow shadow-2xl max-sm:w-32 max-sm:h-32"
                />
              ) : (
                <div className="w-44 h-44 rounded-full bg-exaltPink border-4 border-exaltYellow shadow-2xl flex items-center justify-center font-display text-6xl font-bold text-white max-sm:w-32 max-sm:h-32 max-sm:text-4xl">
                  CM
                </div>
              )}
              <figcaption className="text-white font-semibold">Clément</figcaption>
            </figure>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 h-10 px-4 rounded-full bg-white/15 hover:bg-white/30 text-white text-sm font-semibold backdrop-blur"
        style={{ top: "max(1rem, env(safe-area-inset-top))" }}
      >
        Fermer ✕
      </button>
    </div>
  );
};

export default SurpriseShow;
