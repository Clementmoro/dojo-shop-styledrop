import { useEffect, useRef, useState } from "react";
import { EXALT_STORES, ExaltStore, distanceKm } from "../data/stores";

const RADIUS_KM = 20;
const LEAFLET_VERSION = "1.9.4";

// Carte OpenStreetMap via Leaflet, chargée à la demande depuis un CDN.
let leafletPromise: Promise<any> | null = null;
const loadLeaflet = (): Promise<any> => {
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
    document.head.appendChild(css);
    const script = document.createElement("script");
    script.src = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;
    script.onload = () => resolve(w.L);
    script.onerror = () => {
      leafletPromise = null;
      reject(new Error("leaflet"));
    };
    document.body.appendChild(script);
  });
  return leafletPromise;
};

type Home = { label: string; lat: number; lng: number };
type StoreWithDistance = ExaltStore & { distance: number };

const StoreLocatorModal = ({ isOpen, onClose, productTitle }: { isOpen: boolean; onClose: () => void; productTitle?: string }) => {
  const [address, setAddress] = useState("");
  const [home, setHome] = useState<Home | null>(null);
  const [stores, setStores] = useState<StoreWithDistance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Nettoie la carte quand la pop-in se ferme
  useEffect(() => {
    if (!isOpen && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
  }, [isOpen]);

  // Dessine la carte : domicile, cercle de 20 km et magasins
  useEffect(() => {
    if (!home || !mapEl.current) return;
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapEl.current) return;
        if (mapRef.current) mapRef.current.remove();
        const map = L.map(mapEl.current, { scrollWheelZoom: false });
        mapRef.current = map;
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution: "© OpenStreetMap",
        }).addTo(map);
        const circle = L.circle([home.lat, home.lng], {
          radius: RADIUS_KM * 1000,
          color: "#1B2290",
          weight: 1,
          fillColor: "#1B2290",
          fillOpacity: 0.06,
        }).addTo(map);
        L.circleMarker([home.lat, home.lng], { radius: 8, color: "#fff", weight: 3, fillColor: "#0A0F5C", fillOpacity: 1 })
          .addTo(map)
          .bindPopup(`<strong>Chez toi</strong><br/>${home.label}`);
        stores.forEach((s, i) => {
          const icon = L.divIcon({
            className: "",
            html: `<div style="background:#F0047F;color:#fff;font-weight:700;font-size:12px;width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"><span style="transform:rotate(45deg)">${i + 1}</span></div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 26],
          });
          L.marker([s.lat, s.lng], { icon })
            .addTo(map)
            .bindPopup(`<strong>${s.name}</strong><br/>${s.address}<br/>${s.city}<br/><em>${s.distance.toFixed(1).replace(".", ",")} km</em>`);
        });
        map.fitBounds(circle.getBounds(), { padding: [10, 10] });
        setTimeout(() => map.invalidateSize(), 50);
      })
      .catch(() => !cancelled && setError("La carte n'a pas pu se charger. Vérifie ta connexion et réessaie."));
    return () => {
      cancelled = true;
    };
  }, [home, stores]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = address.trim();
    if (q.length < 3) {
      setError("Saisis ton adresse complète (rue, ville ou code postal).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Base Adresse Nationale (gratuite, sans clé)
      const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=1`);
      const data = await res.json();
      const feature = data?.features?.[0];
      if (!feature) {
        setError("Adresse introuvable. Essaie avec le code postal ou le nom de la ville.");
        setLoading(false);
        return;
      }
      const [lng, lat] = feature.geometry.coordinates;
      const nearby = EXALT_STORES.map((s) => ({ ...s, distance: distanceKm(lat, lng, s.lat, s.lng) }))
        .filter((s) => s.distance <= RADIUS_KM)
        .sort((a, b) => a.distance - b.distance);
      setStores(nearby);
      setHome({ label: feature.properties.label, lat, lng });
    } catch {
      setError("La recherche d'adresse ne répond pas. Réessaie dans un instant.");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-exaltNavy/60 flex items-center justify-center p-4 max-sm:p-0 max-sm:items-end"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-locator-title"
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl max-sm:rounded-b-none max-h-[92vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-exaltPink">Retrait en magasin</p>
            <h2 id="store-locator-title" className="font-display text-2xl font-bold text-exaltNavy mt-1">
              Trouver un magasin eXalt
            </h2>
            {productTitle && <p className="text-sm text-gray-500 mt-1">Pour : {productTitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-10 h-10 rounded-full hover:bg-exaltCream text-exaltNavy text-2xl leading-none flex-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSearch} className="px-6 mt-5">
          <label htmlFor="store-address" className="text-sm font-semibold text-exaltNavy">
            L'adresse de ton domicile
          </label>
          <div className="mt-2 flex gap-2 max-sm:flex-col">
            <input
              ref={inputRef}
              id="store-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ex. 10 rue de Rivoli, Paris"
              autoComplete="street-address"
              className="flex-1 h-12 rounded-full border-gray-300 px-5 text-sm focus:border-exaltNavy focus:ring-exaltNavy"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-12 px-6 rounded-full bg-exaltNavy hover:bg-exaltPink transition-colors text-white font-semibold text-sm disabled:opacity-60"
            >
              {loading ? "Recherche…" : "Rechercher"}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </form>

        {home && (
          <div className="px-6 pb-6 mt-5 flex flex-col gap-4">
            <div ref={mapEl} className="w-full h-72 max-sm:h-60 rounded-2xl overflow-hidden bg-exaltCream z-0" />
            <p className="text-sm text-gray-600">
              {stores.length === 0
                ? `Aucun magasin eXalt à moins de ${RADIUS_KM} km de ${home.label}.`
                : `${stores.length} magasin${stores.length > 1 ? "s" : ""} eXalt à moins de ${RADIUS_KM} km de ${home.label}.`}
            </p>
            {stores.length > 0 && (
              <ul className="flex flex-col divide-y divide-gray-100 border border-gray-100 rounded-2xl">
                {stores.map((s, i) => (
                  <li key={s.id} className="flex items-start gap-3 p-4">
                    <span className="w-7 h-7 rounded-full bg-exaltPink text-white text-xs font-bold flex items-center justify-center flex-none">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-exaltNavy">{s.name}</p>
                      <p className="text-sm text-gray-600">
                        {s.address}, {s.city}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{s.hours}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-none">
                      <span className="text-sm font-semibold text-exaltNavy">{s.distance.toFixed(1).replace(".", ",")} km</span>
                      <a
                        href={`https://www.openstreetmap.org/directions?route=${home.lat}%2C${home.lng}%3B${s.lat}%2C${s.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-exaltPink hover:underline"
                      >
                        Itinéraire
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[11px] text-gray-400">Magasins fictifs pour le prototype.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreLocatorModal;
