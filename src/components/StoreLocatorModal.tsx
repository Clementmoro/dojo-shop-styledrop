import { useEffect, useRef, useState } from "react";
import { EXALT_STORES, ExaltStore, distanceKm, getStoreStock } from "../data/stores";

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
type StoreWithInfo = ExaltStore & { distance?: number; stock: number };
type Suggestion = { label: string; context: string; lat: number; lng: number };

const FRANCE_BOUNDS: [[number, number], [number, number]] = [[42.3, -4.8], [51.1, 8.3]];
const ADDRESS_API = "https://api-adresse.data.gouv.fr";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const formatKm = (km: number) => `${km.toFixed(1).replace(".", ",")} km`;
const stockLabel = (stock: number) => (stock === 0 ? "Rupture" : `${stock} en stock`);

// Épingle numérotée + pastille de stock
const storeIcon = (L: any, label: string, stock: number, active: boolean) => {
  const pill = stock === 0 ? "background:#F3F4F6;color:#6B7280" : "background:#ECFDF5;color:#047857";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:30px;height:30px">
      <div style="background:${active ? "#F0047F" : "#0A0F5C"};color:#fff;font:700 12px/1 system-ui,sans-serif;width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 3px 8px rgba(10,15,92,.35)"><span style="transform:rotate(45deg)">${label}</span></div>
      <div style="position:absolute;left:26px;top:-6px;white-space:nowrap;${pill};font:600 11px/1 system-ui,sans-serif;padding:4px 7px;border-radius:999px;border:1px solid #fff;box-shadow:0 2px 6px rgba(10,15,92,.2)">${stockLabel(stock)}</div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });
};

const storePopup = (s: StoreWithInfo) =>
  `<div style="font-family:system-ui,sans-serif;min-width:170px"><strong style="color:#0A0F5C">${escapeHtml(s.name)}</strong><br/>${escapeHtml(s.address)}<br/>${escapeHtml(s.city)}<br/><span style="font-weight:600;color:${s.stock ? "#047857" : "#6B7280"}">${stockLabel(s.stock)}</span>${
    s.distance !== undefined ? ` · <span style="color:#F0047F;font-weight:600">${formatKm(s.distance)}</span>` : ""
  }</div>`;

const StoreLocatorModal = ({
  isOpen,
  onClose,
  productTitle,
  productId,
}: {
  isOpen: boolean;
  onClose: () => void;
  productTitle?: string;
  productId?: string | number;
}) => {
  const [address, setAddress] = useState("");
  const [home, setHome] = useState<Home | null>(null);
  const [stores, setStores] = useState<StoreWithInfo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [highlighted, setHighlighted] = useState(-1);
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsOpenRef = useRef(false);
  const skipSuggestRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  suggestionsOpenRef.current = suggestions.length > 0;

  const pid = String(productId ?? "");
  const allStores: StoreWithInfo[] = EXALT_STORES.map((s) => ({ ...s, stock: getStoreStock(s.id, pid) }));

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (suggestionsOpenRef.current) setSuggestions([]);
      else onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Propositions d'adresses pendant la saisie (3 max)
  useEffect(() => {
    if (skipSuggestRef.current) {
      skipSuggestRef.current = false;
      return;
    }
    const q = address.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${ADDRESS_API}/search/?q=${encodeURIComponent(q)}&limit=3&autocomplete=1`, { signal: controller.signal });
        const data = await res.json();
        setSuggestions(
          (data?.features ?? []).slice(0, 3).map((f: any) => ({
            label: f.properties.label,
            context: f.properties.context,
            lng: f.geometry.coordinates[0],
            lat: f.geometry.coordinates[1],
          }))
        );
        setHighlighted(-1);
      } catch {
        /* saisie en cours ou réseau indisponible : pas de proposition */
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [address]);

  // Crée la carte à l'ouverture, la détruit à la fermeture
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapEl.current) return;
        const map = L.map(mapEl.current, { scrollWheelZoom: false });
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
      allStores.forEach((s) => {
        markersRef.current[s.id] = L.marker([s.lat, s.lng], { icon: storeIcon(L, "", s.stock, false) }).bindPopup(storePopup(s)).addTo(layer);
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
      markersRef.current[s.id] = L.marker([s.lat, s.lng], { icon: storeIcon(L, String(i + 1), s.stock, false) })
        .bindPopup(storePopup(s))
        .on("click", () => setActiveId(s.id))
        .addTo(layer);
    });
    map.fitBounds(circle.getBounds(), { padding: [16, 16] });
  };

  useEffect(drawLayer, [home, stores, pid]);

  // Met en avant le magasin choisi dans la liste
  useEffect(() => {
    const L = (window as any).L;
    if (!L || !home) return;
    stores.forEach((s, i) => markersRef.current[s.id]?.setIcon(storeIcon(L, String(i + 1), s.stock, s.id === activeId)));
    const active = stores.find((s) => s.id === activeId);
    if (active && mapRef.current) {
      mapRef.current.setView([active.lat, active.lng], Math.max(mapRef.current.getZoom(), 13));
      markersRef.current[active.id]?.openPopup();
    }
  }, [activeId, home, stores]);

  const showStoresAround = (lat: number, lng: number, label: string) => {
    const nearby = allStores
      .map((s) => ({ ...s, distance: distanceKm(lat, lng, s.lat, s.lng) }))
      .filter((s) => s.distance <= RADIUS_KM)
      .sort((a, b) => a.distance - b.distance);
    setActiveId(null);
    setStores(nearby);
    setHome({ label, lat, lng });
  };

  const pickSuggestion = (s: Suggestion) => {
    skipSuggestRef.current = true;
    setAddress(s.label);
    setSuggestions([]);
    setError(null);
    showStoresAround(s.lat, s.lng, s.label);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (highlighted >= 0 && suggestions[highlighted]) {
      pickSuggestion(suggestions[highlighted]);
      return;
    }
    const q = address.trim();
    if (q.length < 3) {
      setError("Saisis ton adresse complète (rue, ville ou code postal).");
      return;
    }
    setSuggestions([]);
    setLoading(true);
    setError(null);
    try {
      // Base Adresse Nationale (gratuite, sans clé)
      const res = await fetch(`${ADDRESS_API}/search/?q=${encodeURIComponent(q)}&limit=1`);
      const data = await res.json();
      const feature = data?.features?.[0];
      if (!feature) {
        setError("Adresse introuvable. Essaie avec le code postal ou le nom de la ville.");
      } else {
        const [lng, lat] = feature.geometry.coordinates;
        showStoresAround(lat, lng, feature.properties.label);
      }
    } catch {
      setError("La recherche d'adresse ne répond pas. Réessaie dans un instant.");
    }
    setLoading(false);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setError("Ton navigateur ne permet pas la géolocalisation. Saisis ton adresse.");
      return;
    }
    setLocating(true);
    setError(null);
    setSuggestions([]);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        let label = "Ta position actuelle";
        try {
          const res = await fetch(`${ADDRESS_API}/reverse/?lon=${lng}&lat=${lat}&limit=1`);
          const data = await res.json();
          label = data?.features?.[0]?.properties?.label ?? label;
        } catch {
          /* on garde « Ta position actuelle » */
        }
        skipSuggestRef.current = true;
        setAddress(label === "Ta position actuelle" ? "" : label);
        showStoresAround(lat, lng, label);
        setLocating(false);
      },
      (err) => {
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Tu as refusé la géolocalisation. Autorise-la dans ton navigateur ou saisis ton adresse."
            : "Impossible de te localiser pour l'instant. Saisis ton adresse."
        );
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => (h <= 0 ? suggestions.length - 1 : h - 1));
    }
  };

  if (!isOpen) return null;

  const nearbyInStock = stores.filter((s) => s.stock > 0).length;

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
            <form onSubmit={handleSearch} className="p-6 max-md:p-5 max-md:pb-4 flex-none max-md:order-1 relative z-10">
              <label htmlFor="store-address" className="text-sm font-semibold text-exaltNavy">
                L'adresse de ton domicile
              </label>
              <div className="mt-2 flex flex-col gap-2">
                <div className="flex gap-2">
                  <div className="relative flex-1 min-w-0">
                    <input
                      ref={inputRef}
                      id="store-address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onKeyDown={handleInputKeyDown}
                      onBlur={() => setTimeout(() => setSuggestions([]), 150)}
                      placeholder="Ex. 10 rue de Rivoli, Paris"
                      autoComplete="off"
                      role="combobox"
                      aria-expanded={suggestions.length > 0}
                      aria-controls="store-address-suggestions"
                      aria-autocomplete="list"
                      aria-activedescendant={highlighted >= 0 ? `store-suggestion-${highlighted}` : undefined}
                      className="w-full h-12 rounded-full border-gray-300 px-5 text-sm focus:border-exaltNavy focus:ring-exaltNavy"
                    />
                    {suggestions.length > 0 && (
                      <ul
                        id="store-address-suggestions"
                        role="listbox"
                        className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden"
                      >
                        {suggestions.map((s, i) => (
                          <li
                            key={`${s.label}-${i}`}
                            id={`store-suggestion-${i}`}
                            role="option"
                            aria-selected={i === highlighted}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              pickSuggestion(s);
                            }}
                            onMouseEnter={() => setHighlighted(i)}
                            className={`px-4 py-3 cursor-pointer flex items-start gap-3 ${i === highlighted ? "bg-exaltCream" : "bg-white"}`}
                          >
                            <span aria-hidden="true" className="text-exaltPink mt-0.5">📍</span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-exaltNavy truncate">{s.label}</span>
                              <span className="block text-xs text-gray-500 truncate">{s.context}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleLocate}
                    disabled={locating}
                    title="Me géolocaliser"
                    className="h-12 px-4 rounded-full border-2 border-exaltNavy text-exaltNavy hover:bg-exaltNavy hover:text-white transition-colors text-sm font-semibold flex items-center gap-1.5 flex-none disabled:opacity-60"
                  >
                    <span aria-hidden="true">📍</span>
                    <span className="max-[400px]:sr-only">{locating ? "Localisation…" : "Me géolocaliser"}</span>
                  </button>
                </div>
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
                  <p className="font-semibold">
                    {allStores.filter((s) => s.stock > 0).length} magasins sur {allStores.length} ont ce produit en stock
                  </p>
                  <p className="text-gray-600 mt-1">
                    Saisis ton adresse ou géolocalise-toi pour voir ceux à moins de {RADIUS_KM} km de chez toi.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-3">
                    {stores.length === 0 ? "Aucun magasin" : <strong className="text-exaltNavy">{stores.length} magasin{stores.length > 1 ? "s" : ""}</strong>}
                    {` à moins de ${RADIUS_KM} km de `}
                    <span className="text-exaltNavy">{home.label}</span>
                    {stores.length > 0 && `, dont ${nearbyInStock} avec ce produit en stock`}
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
                                  <span className="text-sm font-semibold text-exaltPink flex-none">{formatKm(s.distance ?? 0)}</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {s.address}, {s.city}
                                </p>
                                <div className="flex items-center justify-between gap-2 mt-2">
                                  <span
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                      s.stock ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                                    }`}
                                  >
                                    {stockLabel(s.stock)}
                                  </span>
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
                                <p className="text-xs text-gray-500 mt-1">{s.hours}</p>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              )}
              <p className="text-[11px] text-gray-400 mt-4">Magasins et stocks fictifs pour le prototype.</p>
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
