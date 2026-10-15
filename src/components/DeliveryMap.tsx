import { useEffect, useMemo, useRef, useState } from "react";
import { TbBuildingWarehouse, TbClock, TbMapPin, TbRoute, TbTruckDelivery } from "react-icons/tb";

// Hypothèse de proto : les colis partent de l'entrepôt eXalt à Paris
const WAREHOUSE = { lat: 48.8566, lon: 2.3522, label: "Entrepôt eXalt, Paris" };
const TILE_SIZE = 256;
const TILE_URL = (z: number, x: number, y: number) =>
  `https://${"abcd"[(x + y) % 4]}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;

type Point = { lat: number; lon: number };
type Destination = { postalCode: string; city: string; country: string };
type GeoResult = Point & { label: string };

// projection des cartes en ligne (Web Mercator), en pixels pour un niveau de zoom
const project = ({ lat, lon }: Point, zoom: number) => {
  const scale = TILE_SIZE * 2 ** zoom;
  const sin = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((lon + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
};

// distance à vol d'oiseau, majorée de 25 % pour approcher la distance par la route
const roadDistanceKm = (a: Point, b: Point) => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  const crow = 2 * 6371 * Math.asin(Math.sqrt(h));
  return Math.max(1, Math.round((crow * 1.25) / 5) * 5);
};

// même règle que la fiche produit : aujourd'hui + 4 jours ouvrés
const estimatedDelivery = () => {
  const date = new Date();
  let businessDays = 0;
  while (businessDays < 4) {
    date.setDate(date.getDate() + 1);
    if (date.getDay() !== 0 && date.getDay() !== 6) businessDays++;
  }
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
};

const geocode = async ({ postalCode, city, country }: Destination, signal: AbortSignal): Promise<GeoResult | null> => {
  if (country === "France" && /^\d{5}$/.test(postalCode.trim())) {
    const q = encodeURIComponent(`${postalCode.trim()} ${city.trim()}`.trim());
    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${q}&type=municipality&limit=1`, { signal });
    const json = await res.json();
    const feature = json?.features?.[0];
    if (!feature) return null;
    const [lon, lat] = feature.geometry.coordinates;
    return { lat, lon, label: `${feature.properties.city} (${feature.properties.postcode})` };
  }
  const q = encodeURIComponent([postalCode, city, country].filter(Boolean).join(" "));
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=fr&q=${q}`, { signal });
  const json = await res.json();
  const place = json?.[0];
  if (!place) return null;
  return {
    lat: Number(place.lat),
    lon: Number(place.lon),
    label: [city || place.display_name.split(",")[0], postalCode].filter(Boolean).join(" ") + `, ${country}`,
  };
};

const DeliveryMap = ({ destination }: { destination: Destination }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [target, setTarget] = useState<GeoResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "notfound">("idle");
  const height = width < 480 ? 210 : 260;
  const reduceMotion =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { postalCode, city, country } = destination;
  useEffect(() => {
    if (postalCode.trim().length < 4 && city.trim().length < 2) {
      setTarget(null);
      setStatus("idle");
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setStatus("loading");
      try {
        const result = await geocode({ postalCode, city, country }, controller.signal);
        setTarget(result);
        setStatus(result ? "found" : "notfound");
      } catch {
        if (!controller.signal.aborted) setStatus("notfound");
      }
    }, 600);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [postalCode, city, country]);

  // cadrage : le plus grand zoom qui montre l'entrepôt et l'adresse avec une marge
  const view = useMemo(() => {
    const points: Point[] = target ? [WAREHOUSE, target] : [WAREHOUSE];
    const pad = 56;
    let zoom = target ? 12 : 5;
    if (target) {
      while (zoom > 3) {
        const a = project(points[0], zoom);
        const b = project(points[1], zoom);
        if (Math.abs(a.x - b.x) + pad * 2 <= width && Math.abs(a.y - b.y) + pad * 2 <= height) break;
        zoom--;
      }
    }
    const projected = points.map((p) => project(p, zoom));
    const cx = projected.reduce((s, p) => s + p.x, 0) / projected.length;
    const cy = projected.reduce((s, p) => s + p.y, 0) / projected.length;
    const left = cx - width / 2;
    const top = cy - height / 2;
    const tiles: { key: string; src: string; x: number; y: number }[] = [];
    const max = 2 ** zoom;
    for (let tx = Math.floor(left / TILE_SIZE); tx <= Math.floor((left + width) / TILE_SIZE); tx++) {
      for (let ty = Math.floor(top / TILE_SIZE); ty <= Math.floor((top + height) / TILE_SIZE); ty++) {
        if (ty < 0 || ty >= max) continue;
        const wrapped = ((tx % max) + max) % max;
        tiles.push({ key: `${zoom}-${tx}-${ty}`, src: TILE_URL(zoom, wrapped, ty), x: tx * TILE_SIZE - left, y: ty * TILE_SIZE - top });
      }
    }
    const [origin, dest] = projected.map((p) => ({ x: p.x - left, y: p.y - top }));
    return { tiles, origin, dest };
  }, [target, width, height]);

  const { origin, dest } = view;
  // trajet en courbe douce entre l'entrepôt et l'adresse
  const route = dest
    ? (() => {
        const mx = (origin.x + dest.x) / 2;
        const my = (origin.y + dest.y) / 2;
        const dx = dest.x - origin.x;
        const dy = dest.y - origin.y;
        const bend = 0.18;
        return `M ${origin.x} ${origin.y} Q ${mx - dy * bend} ${my + dx * bend} ${dest.x} ${dest.y}`;
      })()
    : null;
  const goesLeft = dest ? dest.x < origin.x : false;
  const distance = target ? roadDistanceKm(WAREHOUSE, target) : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div ref={boxRef} className="relative w-full overflow-hidden bg-[#EEF0F5]" style={{ height }}>
        {view.tiles.map((t) => (
          <img
            key={t.key}
            src={t.src}
            alt=""
            draggable={false}
            className="absolute select-none"
            style={{ left: t.x, top: t.y, width: TILE_SIZE, height: TILE_SIZE }}
          />
        ))}

        <svg className="absolute inset-0" width={width} height={height} aria-hidden="true">
          <defs>
            <filter id="map-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0A0F5C" floodOpacity="0.25" />
            </filter>
          </defs>

          {route && (
            <>
              <path d={route} fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.9} />
              <path d={route} fill="none" stroke="#0A0F5C" strokeWidth={4} strokeLinecap="round" strokeDasharray="1 9">
                {!reduceMotion && <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.8s" repeatCount="indefinite" />}
              </path>
            </>
          )}

          {/* entrepôt */}
          <g transform={`translate(${origin.x} ${origin.y})`} filter="url(#map-shadow)">
            <circle r={16} fill="#0A0F5C" stroke="#FFFFFF" strokeWidth={3} />
            <g transform="translate(-9 -9)" color="#FFFFFF">
              <TbBuildingWarehouse size={18} />
            </g>
          </g>

          {/* adresse du client */}
          {dest && (
            <g transform={`translate(${dest.x} ${dest.y})`}>
              {!reduceMotion && (
                <circle r={10} fill="#F0047F" opacity={0.35}>
                  <animate attributeName="r" values="10;26;10" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.35;0;0.35" dur="2.2s" repeatCount="indefinite" />
                </circle>
              )}
              <g filter="url(#map-shadow)">
                <circle r={16} fill="#F0047F" stroke="#FFFFFF" strokeWidth={3} />
                <g transform="translate(-9 -9)" color="#FFFFFF">
                  <TbMapPin size={18} />
                </g>
              </g>
            </g>
          )}

          {/* camion */}
          {route && (
            <g filter="url(#map-shadow)">
              {reduceMotion ? null : (
                <animateMotion dur="4s" repeatCount="indefinite" path={route} keyPoints="0;1;1" keyTimes="0;0.85;1" calcMode="linear" />
              )}
              <g transform={reduceMotion && dest ? `translate(${(origin.x + dest.x) / 2} ${(origin.y + dest.y) / 2})` : undefined}>
                <rect x={-18} y={-14} width={36} height={28} rx={10} fill="#FFD600" stroke="#FFFFFF" strokeWidth={2.5} />
                <g transform={goesLeft ? "translate(11 -11) scale(-1 1)" : "translate(-11 -11)"} color="#0A0F5C">
                  <TbTruckDelivery size={22} />
                </g>
              </g>
            </g>
          )}
        </svg>

        {status !== "found" && (
          <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white/95 px-4 py-3 text-sm text-exaltNavy shadow-md backdrop-blur">
            {status === "loading" && "Recherche de ton adresse…"}
            {status === "notfound" && "Adresse introuvable : vérifie le code postal et la ville."}
            {status === "idle" && "Saisis ton code postal et ta ville pour voir le trajet de ton colis."}
          </div>
        )}

        <span className="absolute right-1.5 top-1.5 rounded bg-white/80 px-1.5 text-[10px] text-gray-500">
          © OpenStreetMap · © CARTO
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 p-4 text-sm sm:grid-cols-3">
        <div className="flex items-start gap-2.5">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-exaltCream text-exaltNavy">
            <TbBuildingWarehouse className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-exaltPink">Départ</span>
            <span className="block text-exaltNavy">{WAREHOUSE.label}</span>
          </span>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-exaltCream text-exaltNavy">
            <TbRoute className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-exaltPink">Distance</span>
            <span className="block text-exaltNavy">
              {distance ? `≈ ${distance} km jusqu'à ${target?.label}` : "À calculer"}
            </span>
          </span>
        </div>
        <div className="flex items-start gap-2.5">
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-exaltCream text-exaltNavy">
            <TbClock className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-exaltPink">Livraison estimée</span>
            <span className="block text-exaltNavy first-letter:uppercase">{estimatedDelivery()}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
export default DeliveryMap;
