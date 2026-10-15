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

const FRANCE_BOUNDS: [[number, number], [number, number]] = [[42.3, -4.8], [51.1, 8.3]];

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const formatKm = (km: number) => `${km.toFixed(1).replace(".", ",")} km`;

const storeIcon = (L: any, label: string, active: boolean) =>
  L.divIcon({
    className: "",
    html: `<div style="background:${active ? "#F0047F" : "#0A0F5C"};color:#fff;font:700 12px/1 system-ui,sans-serif;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 3px 8px rgba(10,15,92,.35)"><span style="transform:rotate(45deg)">${label}</span></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });

const storePopup = (s: ExaltStore, distance?: number) =>
  `<div style="font-family:system-ui,sans-serif;min-width:160px"><strong style="color:#0A0F5C">${escapeHtml(s.name)}</strong><br/>${escapeHtml(s.address)}<br/>${escapeHtml(s.city)}${
    distance !== undefined ? `<br/><span style="color:#F0047F;font-weight:600">${formatKm(distance)}</span>` : ""
  }</div>`;

const StoreLocatorModal = ({ isOpen, onClose, productTitle }: { isOpen: boolean; onClose: () => void; productTitle?: string }) => {
  const [address, setAddress] = useState("");
  const [home, setHome] = useState<Home | null>(null);
  const [stores, setStores] = useState<StoreWithDistance[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
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

  // Crée la carte à l'ouverture, la détruit à la fermeture
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapEl.current) return;
        const map = L.map(mapEl.current, { scrollWheelZoom: false, zoomControl: true });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution: "© OpenStreetMap",
        }).addTo(map);
        map.fitBounds(FRANCE_BOUNDS);
        mapRef.current = map;
        layerRef.current = L.layerGroup().addTo(map);
        drawLayer();
        setTimeout(() => map.invalidateSize(), 80);
      })
      .catch(() => !cancelled && setError("La carte n'a pas pu se charger. Vérifie ta connexion et réessaie."));
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerRef.current = null;
        markersRef.current = {};
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Avant recherche : tous les magasins. Après : domicile, cercle de 20 km et magasins proches.
  const drawLayer = () => {
    const L = (window as any).L;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;
    layer.clearLayers();
    markersRef.current = {};
    if (!home) {
      EXALT_STORES.forEach((s) => {
        markersRef.current[s.id] = L.marker([s.lat, s.lng], { icon: storeIcon(L, "", false) }).bindPopup(storePopup(s)).addTo(layer);
      });
      map.fitBounds(FRANCE_BOUNDS);
      return;
    }
    const circle = L.circle([home.lat, home.lng], {
      radius: RADIUS_KM * 1000,
      color: "#1B2290",
      weight: 1.5,
      dashArray: "6 6",
      fillColor: "#1B2290",
      fillOpacity: 0.05,
    }).addTo(layer);
    L.circleMarker([home.lat, home.lng], { radius: 9, color: "#fff", weight: 3, fillColor: "#F0047F", fillOpacity: 1 })
      .bindPopup(`<strong>Chez toi</strong><br/>${escapeHtml(home.label)}`)
      .addTo(layer);
    stores.forEach((s, i) => {
      markersRef.current[s.id] = L.marker([s.lat, s.lng], { icon: storeIcon(L, String(i + 1), false) })
        .bindPopup(storePopup(s, s.distance))
        .on("click", () => setActiveId(s.id))
        .addTo(layer);
    });
    map.fitBounds(circle.getBounds(), { padding: [16, 16] });
  };

  useEffect(drawLayer, [home, stores]);

  // Met en avant le magasin choisi dans la liste
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !home) return;
    stores.forEach((s, i) => markersRef.current[s.id]?.setIcon(storeIcon(L, String(i + 1), s.id === activeId)));
    const active = stores.find((s) => s.id === activeId);
    if (active && mapRef.current) {
      mapRef.current.setView([active.lat, active.lng], Math.max(mapRef.current.getZoom(), 13));
      markersRef.current[active.id]?.openPopup();
    }
  }, [activeId, home, stores]);

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
      setActiveId(null);
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
      className="fixed inset-0 z-50 bg-exaltNavy/70 backdrop-blur-sm flex items-center justify-center p-6 max-md:p-3"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="store-locator-title"
    >
      <div
        className="bg-white w-full max-w-6xl h-[min(88vh,760px)] max-md:h-[94vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between gap-4 px-8 py-5 border-b border-gray-100 max-md:px-5 max-md:py-4 flex-none">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-exaltPink">Retrait en magasin</p>
            <h2 id="store-locator-title" className="font-display text-3xl font-bold text-exaltNavy mt-1 max-md:text-2xl">
              Trouver un magasin eXalt
            </h2>
            {productTitle && <p className="text-sm text-gray-500 mt-1 truncate">Pour : {productTitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="w-11 h-11 rounded-full bg-exaltCream hover:bg-exaltNavy hover:text-white text-exaltNavy text-2xl leading-none flex-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Corps : recherche + liste à gauche, carte à droite */}
        <div className="flex-1 min-h-0 grid grid-cols-[minmax(320px,400px)_1fr] max-md:grid-cols-1 max-md:grid-rows-[auto_minmax(200px,38%)_1fr]">
          <div className="flex flex-col min-h-0 border-r border-gray-100 max-md:border-r-0 max-md:contents">
            <form onSubmit={handleSearch} className="p-6 max-md:p-5 max-md:pb-4 flex-none max-md:order-1">
              <label htmlFor="store-address" className="text-sm font-semibold text-exaltNavy">
                L'adresse de ton domicile
              </label>
              <div className="mt-2 flex flex-col gap-2">
                <input
                  ref={inputRef}
                  id="store-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex. 10 rue de Rivoli, Paris"
                  autoComplete="street-address"
                  className="w-full h-12 rounded-full border-gray-300 px-5 text-sm focus:border-exaltNavy focus:ring-exaltNavy"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-full bg-exaltNavy hover:bg-exaltPink transition-colors text-white font-semibold text-sm disabled:opacity-60"
                >
                  {loading ? "Recherche…" : `Voir les magasins à moins de ${RADIUS_KM} km`}
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </form>

            <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-6 max-md:px-5 max-md:pt-4 max-md:order-3">
              {!home ? (
                <div className="rounded-2xl bg-exaltCream p-5 text-sm text-exaltNavy">
                  <p className="font-semibold">{EXALT_STORES.length} magasins eXalt en France</p>
                  <p className="text-gray-600 mt-1">
                    Saisis ton adresse pour voir ceux à moins de {RADIUS_KM} km de chez toi, avec la distance et l'itinéraire.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    {stores.length === 0 ? "Aucun magasin" : <strong className="text-exaltNavy">{stores.length} magasin{stores.length > 1 ? "s" : ""}</strong>}
                    {` à moins de ${RADIUS_KM} km de `}
                    <span className="text-exaltNavy">{home.label}</span>
                  </p>
                  {stores.length === 0 ? (
                    <div className="rounded-2xl bg-exaltCream p-5 text-sm text-gray-600">
                      Pas de magasin près de chez toi pour l'instant. Commande en ligne, la livraison est offerte dès 80 €.
                    </div>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {stores.map((s, i) => {
                        const active = s.id === activeId;
                        return (
                          <li key={s.id}>
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => setActiveId(s.id)}
                              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setActiveId(s.id))}
                              className={`w-full text-left flex items-start gap-3 p-4 rounded-2xl border transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-exaltNavy ${
                                active ? "border-exaltPink bg-pink-50/50" : "border-gray-100 hover:border-exaltNavy/30"
                              }`}
                            >
                              <span
                                className={`w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center flex-none ${
                                  active ? "bg-exaltPink" : "bg-exaltNavy"
                                }`}
                              >
                                {i + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline justify-between gap-2">
                                  <p className="font-semibold text-exaltNavy truncate">{s.name}</p>
                                  <span className="text-sm font-semibold text-exaltPink flex-none">{formatKm(s.distance)}</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {s.address}, {s.city}
                                </p>
                                <div className="flex items-center justify-between gap-2 mt-2">
                                  <p className="text-xs text-gray-500">{s.hours}</p>
                                  <a
                                    href={`https://www.openstreetmap.org/directions?route=${home.lat}%2C${home.lng}%3B${s.lat}%2C${s.lng}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xs font-semibold text-exaltNavy underline underline-offset-2 hover:text-exaltPink flex-none"
                                  >
                                    Itinéraire
                                  </a>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              )}
              <p className="text-[11px] text-gray-400 mt-4">Magasins fictifs pour le prototype.</p>
            </div>
          </div>

          <div className="relative min-h-0 bg-exaltCream max-md:order-2">
            <div ref={mapEl} className="absolute inset-0 z-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreLocatorModal;
