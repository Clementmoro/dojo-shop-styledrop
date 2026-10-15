// Magasins eXalt fictifs, utilisés par la pop-in « Trouver un magasin ».
export type ExaltStore = {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  hours: string;
};

export const EXALT_STORES: ExaltStore[] = [
  { id: "paris-opera", name: "eXalt Store Opéra", address: "12 boulevard Haussmann", city: "75009 Paris", lat: 48.8722, lng: 2.3335, hours: "Lun-Sam · 10h-19h30" },
  { id: "paris-bastille", name: "eXalt Store Bastille", address: "28 rue de la Roquette", city: "75011 Paris", lat: 48.8545, lng: 2.3735, hours: "Mar-Sam · 11h-19h" },
  { id: "la-defense", name: "eXalt Corner La Défense", address: "Centre commercial Les 4 Temps", city: "92800 Puteaux", lat: 48.8919, lng: 2.2380, hours: "Lun-Sam · 10h-20h" },
  { id: "boulogne", name: "eXalt Store Boulogne", address: "45 route de la Reine", city: "92100 Boulogne-Billancourt", lat: 48.8392, lng: 2.2465, hours: "Lun-Sam · 10h-19h" },
  { id: "saint-denis", name: "eXalt Corner Saint-Denis", address: "3 place du Front Populaire", city: "93200 Saint-Denis", lat: 48.9060, lng: 2.3640, hours: "Lun-Ven · 9h-18h" },
  { id: "versailles", name: "eXalt Store Versailles", address: "8 rue de la Paroisse", city: "78000 Versailles", lat: 48.8049, lng: 2.1290, hours: "Mar-Sam · 10h-19h" },
  { id: "creteil", name: "eXalt Corner Créteil", address: "Créteil Soleil, niveau 1", city: "94000 Créteil", lat: 48.7790, lng: 2.4600, hours: "Lun-Sam · 10h-20h" },
  { id: "lyon-part-dieu", name: "eXalt Store Part-Dieu", address: "17 rue du Docteur Bouchut", city: "69003 Lyon", lat: 45.7606, lng: 4.8590, hours: "Lun-Sam · 10h-19h30" },
  { id: "lyon-confluence", name: "eXalt Corner Confluence", address: "112 cours Charlemagne", city: "69002 Lyon", lat: 45.7412, lng: 4.8180, hours: "Lun-Sam · 10h-20h" },
  { id: "villeurbanne", name: "eXalt Store Villeurbanne", address: "6 avenue Henri Barbusse", city: "69100 Villeurbanne", lat: 45.7665, lng: 4.8800, hours: "Mar-Sam · 10h-19h" },
  { id: "lille", name: "eXalt Store Lille", address: "31 rue Esquermoise", city: "59800 Lille", lat: 50.6380, lng: 3.0610, hours: "Lun-Sam · 10h-19h" },
  { id: "roubaix", name: "eXalt Corner Roubaix", address: "McArthurGlen, allée 4", city: "59100 Roubaix", lat: 50.6942, lng: 3.1746, hours: "Lun-Sam · 10h-19h" },
  { id: "marseille", name: "eXalt Store Vieux-Port", address: "9 quai du Port", city: "13002 Marseille", lat: 43.2970, lng: 5.3690, hours: "Lun-Sam · 10h-19h" },
  { id: "aix", name: "eXalt Store Aix", address: "22 cours Mirabeau", city: "13100 Aix-en-Provence", lat: 43.5265, lng: 5.4480, hours: "Lun-Sam · 10h-19h" },
  { id: "bordeaux", name: "eXalt Store Bordeaux", address: "54 rue Sainte-Catherine", city: "33000 Bordeaux", lat: 44.8400, lng: -0.5735, hours: "Lun-Sam · 10h-19h30" },
  { id: "toulouse", name: "eXalt Store Capitole", address: "4 rue Saint-Rome", city: "31000 Toulouse", lat: 43.6030, lng: 1.4430, hours: "Lun-Sam · 10h-19h" },
  { id: "nantes", name: "eXalt Store Nantes", address: "15 rue Crébillon", city: "44000 Nantes", lat: 47.2135, lng: -1.5605, hours: "Lun-Sam · 10h-19h" },
  { id: "rennes", name: "eXalt Store Rennes", address: "7 rue Le Bastard", city: "35000 Rennes", lat: 48.1120, lng: -1.6790, hours: "Mar-Sam · 10h-19h" },
  { id: "strasbourg", name: "eXalt Store Strasbourg", address: "26 rue des Grandes Arcades", city: "67000 Strasbourg", lat: 48.5830, lng: 7.7470, hours: "Lun-Sam · 10h-19h" },
  { id: "nice", name: "eXalt Store Nice", address: "40 avenue Jean Médecin", city: "06000 Nice", lat: 43.7030, lng: 7.2660, hours: "Lun-Sam · 10h-19h30" },
];

// Distance à vol d'oiseau en kilomètres (formule de haversine).
export const distanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
