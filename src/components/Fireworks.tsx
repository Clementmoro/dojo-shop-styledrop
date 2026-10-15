import { useEffect, useRef } from "react";

const COLORS = ["#FF5FA2", "#B57BFF", "#5FC8FF", "#FFC93C", "#7CE38B", "#F0047F", "#FFFFFF", "#FF8A3D"];

type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number };
type Rocket = { x: number; y: number; vy: number; targetY: number; color: string };

// Feux d'artifice plein écran : des fusées partent du bas et explosent partout
const Fireworks = ({ duration = 7000 }: { duration?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const rockets: Rocket[] = [];
    const particles: Particle[] = [];
    const start = performance.now();
    let lastLaunch = 0;
    let frame = 0;

    const explode = (x: number, y: number, color: string) => {
      const count = 70 + Math.floor(Math.random() * 50);
      const multi = Math.random() < 0.4;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4.5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color: multi ? COLORS[Math.floor(Math.random() * COLORS.length)] : color,
          size: 1.5 + Math.random() * 2.2,
        });
      }
    };

    const loop = (now: number) => {
      const elapsed = now - start;
      // Traînées lumineuses : on efface doucement l'image précédente
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
      ctx.fillRect(0, 0, W(), H());
      ctx.globalCompositeOperation = "lighter";

      if (elapsed < duration - 1200 && now - lastLaunch > 140) {
        lastLaunch = now;
        const salvo = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < salvo; i++) {
          rockets.push({
            x: Math.random() * W(),
            y: H() + 10,
            vy: -(9 + Math.random() * 5),
            targetY: H() * (0.08 + Math.random() * 0.55),
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
          });
        }
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        r.vy *= 0.985;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        if (r.y <= r.targetY || r.vy > -2) {
          explode(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy = p.vy * 0.97 + 0.06;
        p.life -= 0.013;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (elapsed < duration || particles.length > 0) frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [duration]);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />;
};
export default Fireworks;
