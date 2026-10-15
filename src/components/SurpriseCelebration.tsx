import { useEffect, useRef, useState } from "react";

// Le spectacle après paiement, en 3 actes :
// 1. des canards sortent le produit surprise d'une boîte
// 2. feux d'artifice et confettis
// 3. des mariachis DJ au festival des runners Ironman

type Scene = "ducks" | "fireworks" | "fiesta";

const COLORS = ["#F0047F", "#FFD600", "#FFFFFF", "#38BDF8", "#22C55E", "#A78BFA"];
const FIREWORKS_AT = 5200;
const FIESTA_AT = 9800;

const imageSrc = (image: string) =>
  image.startsWith("http") || image.startsWith("/") ? image : `/assets/${image}`;

type Particle = {
  x: number; y: number; vx: number; vy: number;
  life: number; color: string; size: number;
  confetti: boolean; spin: number; angle: number;
};

// Feux d'artifice et confettis dessinés sur un canvas plein écran
const useSkyShow = (canvas: React.RefObject<HTMLCanvasElement>, scene: Scene, reduced: boolean) => {
  useEffect(() => {
    const el = canvas.current;
    if (!el || reduced || scene === "ducks") return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      el.width = window.innerWidth;
      el.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const color = () => COLORS[Math.floor(Math.random() * COLORS.length)];

    const burst = () => {
      const x = rand(0.15, 0.85) * el.width;
      const y = rand(0.12, 0.45) * el.height;
      const c = color();
      for (let i = 0; i < 70; i++) {
        const a = (Math.PI * 2 * i) / 70;
        const speed = rand(2, 6);
        particles.push({ x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 1,
          color: Math.random() < 0.2 ? "#FFFFFF" : c, size: rand(1.5, 3), confetti: false, spin: 0, angle: 0 });
      }
    };
    const confetti = (count: number) => {
      for (let i = 0; i < count; i++) {
        particles.push({ x: rand(0, el.width), y: rand(-40, -5), vx: rand(-1, 1), vy: rand(2, 4.5), life: 1,
          color: color(), size: rand(6, 11), confetti: true, spin: rand(-0.2, 0.2), angle: rand(0, Math.PI) });
      }
    };

    const fireworks = scene === "fireworks";
    const burstTimer = window.setInterval(burst, fireworks ? 380 : 1400);
    const confettiTimer = window.setInterval(() => confetti(fireworks ? 14 : 4), 120);
    burst();

    let frame = 0;
    const tick = () => {
      ctx.clearRect(0, 0, el.width, el.height);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.confetti) {
          p.angle += p.spin;
          p.vx += Math.sin(p.y / 40) * 0.05;
          if (p.y > el.height + 20) particles.splice(i, 1);
        } else {
          p.vy += 0.06;
          p.vx *= 0.985;
          p.life -= 0.014;
          if (p.life <= 0) particles.splice(i, 1);
        }
      }
      particles.forEach((p) => {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        if (p.confetti) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(burstTimer);
      window.clearInterval(confettiTimer);
      window.removeEventListener("resize", resize);
    };
  }, [canvas, scene, reduced]);
};

const RUNNERS = ["🏃‍♀️", "🏃", "🏃‍♂️", "🚴", "🏃‍♀️", "🏊", "🏃‍♂️", "🏃"];
const NOTES = ["🎵", "🎶", "🎵", "🎶", "🎵"];

const SurpriseCelebration = ({ product, onClose }: { product: Product; onClose: () => void }) => {
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const [scene, setScene] = useState<Scene>(reduced ? "fiesta" : "ducks");
  const canvas = useRef<HTMLCanvasElement>(null);
  useSkyShow(canvas, scene, reduced);

  useEffect(() => {
    if (reduced) return;
    const t1 = window.setTimeout(() => setScene("fireworks"), FIREWORKS_AT);
    const t2 = window.setTimeout(() => setScene("fiesta"), FIESTA_AT);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [reduced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const name = product.title.replace(/^eXalt /, "");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Ton produit surprise : ${product.title}`}
      className={`sx-root fixed inset-0 z-[100] overflow-hidden text-white ${scene === "fiesta" ? "sx-festival" : "bg-exaltNavy"}`}
    >
      <style>{CSS}</style>
      <canvas ref={canvas} className="pointer-events-none absolute inset-0 z-20" />

      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-40 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/25"
      >
        Passer
      </button>

      {/* Acte 1 et 2 : les canards et la boîte */}
      {scene !== "fiesta" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          <p className="sx-fade mb-6 px-6 text-center font-display text-2xl font-bold max-sm:text-xl">
            {scene === "ducks" ? "Les canards ont une livraison spéciale pour toi…" : "Ta surprise est arrivée !"}
          </p>

          <div className="relative flex items-end justify-center" style={{ height: "46vmin", width: "90vmin" }}>
            {/* Le produit qui sort de la boîte */}
            <div className="sx-rise absolute bottom-[14vmin] left-1/2 z-10 flex flex-col items-center" style={{ marginLeft: "-15vmin", width: "30vmin" }}>
              <div className="sx-glow overflow-hidden rounded-2xl bg-white" style={{ width: "24vmin", height: "24vmin" }}>
                <img src={imageSrc(product.image)} alt={product.title} className="h-full w-full object-cover" />
              </div>
            </div>

            {/* Canards de gauche */}
            <div className="sx-in-left absolute bottom-0 left-0 flex gap-[1vmin]" style={{ fontSize: "11vmin" }}>
              <span className="sx-bob inline-block"><span className="inline-block -scale-x-100">🦆</span></span>
              <span className="sx-bob sx-delay inline-block"><span className="inline-block -scale-x-100">🦆</span></span>
              <span className="sx-quack absolute -top-[5vmin] left-[8vmin] rounded-full bg-white px-3 py-1 text-sm font-bold text-exaltNavy">Coin !</span>
            </div>

            {/* La boîte */}
            <div className="sx-shake relative z-20" style={{ width: "26vmin", height: "20vmin" }}>
              <div className="sx-lid absolute -top-[4vmin] left-[-1vmin] right-[-1vmin] h-[5vmin] rounded-md bg-exaltPink shadow-lg">
                <div className="absolute inset-y-0 left-1/2 w-[3vmin] -translate-x-1/2 bg-exaltYellow" />
              </div>
              <div className="absolute inset-0 rounded-b-xl bg-exaltPink shadow-2xl">
                <div className="absolute inset-y-0 left-1/2 w-[3vmin] -translate-x-1/2 bg-exaltYellow" />
                <span className="absolute inset-0 flex items-center justify-center font-display text-[6vmin] font-black text-white/90">?</span>
              </div>
            </div>

            {/* Canard de droite */}
            <div className="sx-in-right absolute bottom-0 right-0 flex" style={{ fontSize: "11vmin" }}>
              <span className="sx-bob sx-delay inline-block">🦆</span>
              <span className="sx-quack sx-delay absolute -top-[5vmin] right-[3vmin] rounded-full bg-white px-3 py-1 text-sm font-bold text-exaltNavy">Coin coin !</span>
            </div>
          </div>

          <p className="sx-name mt-8 px-6 text-center font-display text-3xl font-black text-exaltYellow max-sm:text-2xl">
            🎁 {name}
          </p>
          <p className="sx-name mt-1 text-sm text-white/80">Offert avec ta commande</p>
        </div>
      )}

      {/* Acte 3 : mariachis DJ au festival Ironman */}
      {scene === "fiesta" && (
        <div className="sx-fade absolute inset-0 z-10 flex flex-col items-center">
          <div className="sx-beam sx-beam-l" />
          <div className="sx-beam sx-beam-r" />

          <div className="relative z-10 mt-[7vh] rounded-xl border-4 border-exaltYellow bg-exaltPink px-6 py-2 text-center font-display font-black uppercase tracking-wider shadow-2xl" style={{ fontSize: "4.2vmin" }}>
            🏁 Ironman Fiesta Festival 🏁
          </div>

          {/* La scène */}
          <div className="relative z-10 mt-[4vh] flex flex-col items-center">
            <div className="flex items-end gap-[2vmin]" style={{ fontSize: "10vmin" }}>
              <span className="sx-dance inline-block">🎺</span>
              <span className="sx-dance sx-delay inline-block">🤠</span>
              <span className="sx-dance inline-block relative">
                🎧
                <span className="absolute -bottom-[2vmin] left-1/2 -translate-x-1/2" style={{ fontSize: "6vmin" }}>🎛️</span>
              </span>
              <span className="sx-dance sx-delay inline-block">🤠</span>
              <span className="sx-dance inline-block">🎸</span>
            </div>
            <div className="mt-[3vmin] h-[2.5vmin] rounded-full bg-exaltYellow/80" style={{ width: "70vmin" }} />
            <div className="absolute -left-[11vmin] bottom-0" style={{ fontSize: "9vmin" }}>🔊</div>
            <div className="absolute -right-[11vmin] bottom-0" style={{ fontSize: "9vmin" }}>🔊</div>
            {NOTES.map((n, i) => (
              <span key={i} className="sx-note absolute" style={{ left: `${10 + i * 20}%`, top: "-4vmin", fontSize: "5vmin", animationDelay: `${i * 0.5}s` }}>
                {n}
              </span>
            ))}
          </div>

          <div className="relative z-10 mt-[4vh] flex items-center gap-4 rounded-2xl bg-white/10 px-5 py-3 backdrop-blur">
            <img src={imageSrc(product.image)} alt="" className="h-14 w-14 rounded-xl bg-white object-cover" />
            <div>
              <p className="text-xs uppercase tracking-wider text-white/70">Ta surprise</p>
              <p className="font-display text-lg font-bold text-exaltYellow">{name}</p>
            </div>
          </div>

          <p className="relative z-10 mt-[3vh] px-6 text-center font-display text-2xl font-bold max-sm:text-lg">
            ¡Ándale ! Merci pour ta commande 🎉
          </p>
          <button
            type="button"
            onClick={onClose}
            className="relative z-30 mt-4 h-12 rounded-full bg-exaltYellow px-8 font-bold text-exaltNavy transition-transform hover:scale-105"
          >
            Voir ma commande
          </button>

          {/* Les runners qui traversent le festival */}
          <div className="pointer-events-none absolute bottom-[2vh] left-0 right-0 h-[12vmin]">
            {RUNNERS.map((r, i) => (
              <span key={i} className="sx-run absolute bottom-0" style={{ fontSize: "8vmin", animationDelay: `${i * 0.9}s`, animationDuration: `${5 + (i % 3)}s` }}>
                {r}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CSS = `
.sx-festival { background: radial-gradient(ellipse at 50% 0%, #4B3F8A 0%, #1B2290 45%, #0A0F5C 100%); }
@keyframes sx-fade { from { opacity: 0 } to { opacity: 1 } }
.sx-fade { animation: sx-fade .6s ease-out both; }
@keyframes sx-in-left { from { transform: translateX(-70vw) } to { transform: translateX(0) } }
@keyframes sx-in-right { from { transform: translateX(70vw) } to { transform: translateX(0) } }
.sx-in-left { animation: sx-in-left 1.8s cubic-bezier(.2,.8,.3,1) both; }
.sx-in-right { animation: sx-in-right 1.8s .2s cubic-bezier(.2,.8,.3,1) both; }
@keyframes sx-bob { 0%,100% { translate: 0 0; rotate: -8deg } 50% { translate: 0 -1.5vmin; rotate: 8deg } }
.sx-bob { animation: sx-bob .35s ease-in-out infinite; }
.sx-delay { animation-delay: .15s; }
@keyframes sx-quack { 0%, 100% { opacity: 0; transform: scale(.5) } 10%, 80% { opacity: 1; transform: scale(1) } }
.sx-quack { opacity: 0; animation: sx-quack 1.4s 1.6s ease-out both; }
@keyframes sx-shake { 0%,100% { transform: rotate(0) } 20% { transform: rotate(-6deg) } 40% { transform: rotate(6deg) } 60% { transform: rotate(-4deg) } 80% { transform: rotate(4deg) } }
.sx-shake { animation: sx-shake .5s 1.9s ease-in-out 2; }
@keyframes sx-lid { to { transform: translate(-14vmin, -30vmin) rotate(-40deg); opacity: 0 } }
.sx-lid { animation: sx-lid .9s 2.9s cubic-bezier(.3,.6,.4,1) both; }
@keyframes sx-rise { from { transform: translateY(14vmin) scale(.2); opacity: 0 } 60% { opacity: 1 } to { transform: translateY(-6vmin) scale(1); opacity: 1 } }
.sx-rise { animation: sx-rise 1.2s 3.2s cubic-bezier(.2,1.3,.4,1) both; }
@keyframes sx-glow { 0%,100% { box-shadow: 0 0 2vmin 0.5vmin rgba(255,214,0,.6) } 50% { box-shadow: 0 0 6vmin 2vmin rgba(255,214,0,.9) } }
.sx-glow { animation: sx-glow 1.2s ease-in-out infinite; }
@keyframes sx-name { from { opacity: 0; transform: translateY(2vmin) } to { opacity: 1; transform: none } }
.sx-name { animation: sx-name .6s 4s ease-out both; }
@keyframes sx-dance { 0%,100% { transform: translateY(0) rotate(-6deg) } 50% { transform: translateY(-2.5vmin) rotate(6deg) } }
.sx-dance { animation: sx-dance .45s ease-in-out infinite; }
@keyframes sx-note { 0% { opacity: 0; transform: translateY(0) } 20% { opacity: 1 } 100% { opacity: 0; transform: translateY(-14vmin) rotate(20deg) } }
.sx-note { animation: sx-note 2.4s ease-out infinite; }
@keyframes sx-run { from { left: 105% } to { left: -15% } }
.sx-run { animation-name: sx-run; animation-timing-function: linear; animation-iteration-count: infinite; animation-fill-mode: both; }
.sx-beam { position: absolute; top: -10vh; width: 30vmin; height: 120vh; background: linear-gradient(to bottom, rgba(255,214,0,.35), transparent 80%); filter: blur(6px); transform-origin: top center; }
.sx-beam-l { left: 15%; animation: sx-sweep-l 3s ease-in-out infinite alternate; }
.sx-beam-r { right: 15%; background: linear-gradient(to bottom, rgba(240,4,127,.4), transparent 80%); animation: sx-sweep-r 3.4s ease-in-out infinite alternate; }
@keyframes sx-sweep-l { from { transform: rotate(-25deg) } to { transform: rotate(20deg) } }
@keyframes sx-sweep-r { from { transform: rotate(25deg) } to { transform: rotate(-20deg) } }
@media (prefers-reduced-motion: reduce) {
  .sx-root *, .sx-root { animation: none !important; }
}
`;

export default SurpriseCelebration;
