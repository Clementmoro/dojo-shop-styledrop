import { useCallback, useEffect, useRef, useState } from "react";
import { LLAMA_STYLES, LlamaRider } from "./LlamaGallop";

// Mini-jeu de course infinie : le lama saute les colis (espace, flèche du haut, clic ou tap)
const W = 600;
const H = 170;
const GROUND = 146;
const LLAMA_SCALE = 0.62;
const LLAMA_X = 8;
// zone de collision du lama, un peu plus petite que le dessin pour rester indulgent
const HIT_LEFT = LLAMA_X + 50 * LLAMA_SCALE;
const HIT_RIGHT = LLAMA_X + 120 * LLAMA_SCALE;
const GRAVITY = 0.55;
const JUMP_SPEED = 10.2;
const START_SPEED = 5.2;
const BEST_KEY = "llama-runner-best";

type Obstacle = { id: number; x: number; w: number; h: number; kind: "box" | "cone" };
type GameState = "ready" | "running" | "over";

const wrapX = (x: number) => ((x % W) + W) % W;

const readBest = () => {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
};

const newObstacle = (id: number, x: number): Obstacle => {
  const kind = Math.random() < 0.6 ? "box" : "cone";
  return kind === "box"
    ? { id, x, kind, w: 22 + Math.round(Math.random() * 14), h: 20 + Math.round(Math.random() * 16) }
    : { id, x, kind, w: 18, h: 26 + Math.round(Math.random() * 10) };
};

const LlamaRunnerGame = () => {
  const [state, setState] = useState<GameState>("ready");
  const [, setFrame] = useState(0);
  const [best, setBest] = useState(readBest);
  const game = useRef({ y: 0, vy: 0, speed: START_SPEED, distance: 0, obstacles: [] as Obstacle[], nextId: 0 });
  const stateRef = useRef<GameState>("ready");
  stateRef.current = state;

  const start = useCallback(() => {
    game.current = { y: 0, vy: 0, speed: START_SPEED, distance: 0, obstacles: [newObstacle(0, W + 40)], nextId: 1 };
    setState("running");
  }, []);

  const jump = useCallback(() => {
    if (stateRef.current !== "running") {
      start();
      return;
    }
    if (game.current.y === 0) game.current.vy = JUMP_SPEED;
  }, [start]);

  // clavier : espace ou flèche du haut (sans faire défiler la page ni cliquer sur un bouton)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" && e.code !== "ArrowUp") return;
      e.preventDefault();
      if (e.type === "keydown" && !e.repeat) jump();
    };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keyup", onKey, true);
    };
  }, [jump]);

  // boucle de jeu
  useEffect(() => {
    if (state !== "running") return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(2.5, (now - last) / 16.67);
      last = now;
      const g = game.current;

      g.vy -= GRAVITY * dt;
      g.y = Math.max(0, g.y + g.vy * dt);
      if (g.y === 0 && g.vy < 0) g.vy = 0;

      g.speed = Math.min(12, g.speed + 0.0018 * dt);
      g.distance += g.speed * dt;
      g.obstacles = g.obstacles.map((o) => ({ ...o, x: o.x - g.speed * dt })).filter((o) => o.x + o.w > -10);

      const lastObstacle = g.obstacles[g.obstacles.length - 1];
      const gap = 230 + Math.random() * 220 + g.speed * 12;
      if (!lastObstacle || lastObstacle.x < W - gap) {
        g.obstacles.push(newObstacle(g.nextId++, W + 20));
      }

      const hit = g.obstacles.some(
        (o) => o.x < HIT_RIGHT && o.x + o.w > HIT_LEFT && g.y < o.h - 4
      );
      if (hit) {
        const score = Math.floor(g.distance / 10);
        if (score > readBest()) {
          try {
            localStorage.setItem(BEST_KEY, String(score));
          } catch {
            // record non sauvegardé, pas grave
          }
          setBest(score);
        }
        setState("over");
        return;
      }

      setFrame((f) => f + 1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state]);

  const g = game.current;
  const score = Math.floor(g.distance / 10);
  const pad = (n: number) => String(n).padStart(5, "0");
  const llamaTop = GROUND - 107 * LLAMA_SCALE - g.y;

  return (
    <div
      className={`llama-scene ${state === "running" && g.y === 0 ? "is-galloping" : ""} cursor-pointer select-none rounded-2xl`}
      style={{ height: "auto", aspectRatio: `${W} / ${H}` }}
      onPointerDown={(e) => {
        e.preventDefault();
        jump();
      }}
      role="application"
      aria-label="Mini-jeu : appuie sur espace ou touche l'écran pour faire sauter le lama"
    >
      <style>{LLAMA_STYLES}</style>
      <svg viewBox={`0 0 ${W} ${H}`} className="touch-manipulation">
        <defs>
          <linearGradient id="runner-sky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0A0F5C" />
            <stop offset="1" stopColor="#1B2290" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#runner-sky)" />
        <circle cx={W - 40} cy="30" r="12" fill="#FFD600" />
        {[60, 190, 330, 450].map((x, i) => (
          <circle key={x} cx={wrapX(x - g.distance * 0.15)} cy={22 + (i % 2) * 18} r="1.8" fill="#FFFFFF" opacity="0.7" />
        ))}

        {/* sol qui défile */}
        <rect y={GROUND} width={W} height={H - GROUND} fill="#F0047F" />
        <line
          x1="0"
          y1={GROUND + 7}
          x2={W}
          y2={GROUND + 7}
          stroke="#FFD600"
          strokeWidth="3"
          strokeDasharray="14 18"
          strokeDashoffset={g.distance % 32}
          strokeLinecap="round"
        />

        {/* obstacles : colis eXalt et plots */}
        {g.obstacles.map((o) =>
          o.kind === "box" ? (
            <g key={o.id} transform={`translate(${o.x} ${GROUND - o.h})`}>
              <rect width={o.w} height={o.h} rx="2" fill="#FFD600" stroke="#0A0F5C" strokeWidth="2" />
              <line x1={o.w / 2} y1="0" x2={o.w / 2} y2={o.h} stroke="#0A0F5C" strokeWidth="2" />
              <line x1="0" y1={o.h * 0.35} x2={o.w} y2={o.h * 0.35} stroke="#0A0F5C" strokeWidth="1.5" />
            </g>
          ) : (
            <g key={o.id} transform={`translate(${o.x} ${GROUND - o.h})`}>
              <path d={`M${o.w / 2} 0 L${o.w} ${o.h} L0 ${o.h} Z`} fill="#FFFFFF" stroke="#0A0F5C" strokeWidth="2" strokeLinejoin="round" />
              <path d={`M${o.w * 0.3} ${o.h * 0.45} L${o.w * 0.7} ${o.h * 0.45}`} stroke="#F0047F" strokeWidth="3" />
            </g>
          )
        )}

        {/* le lama */}
        <g transform={`translate(${LLAMA_X} ${llamaTop}) scale(${LLAMA_SCALE})`}>
          <LlamaRider />
        </g>

        {/* score */}
        <text x={W - 16} y="64" textAnchor="end" fill="#FFFFFF" fontSize="14" fontFamily="ui-monospace, monospace" fontWeight="700">
          {pad(score)}
        </text>
        <text x={W - 16} y="82" textAnchor="end" fill="#FFD600" fontSize="11" fontFamily="ui-monospace, monospace">
          Record {pad(Math.max(best, state === "over" ? score : 0))}
        </text>

        {state !== "running" && (
          <g>
            <rect x={W / 2 - 170} y="44" width="340" height="62" rx="14" fill="#FFFFFF" opacity="0.95" />
            <text x={W / 2} y="70" textAnchor="middle" fill="#0A0F5C" fontSize="17" fontWeight="700" fontFamily="inherit">
              {state === "ready" ? "Aide le lama à livrer ton colis !" : `Oups ! ${score} points`}
            </text>
            <text x={W / 2} y="93" textAnchor="middle" fill="#F0047F" fontSize="13" fontWeight="600" fontFamily="inherit">
              {state === "ready" ? "Espace ou tap pour sauter" : "Espace ou tap pour rejouer"}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
export default LlamaRunnerGame;
