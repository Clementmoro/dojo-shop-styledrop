import { useSyncExternalStore } from "react";

// Produits favoris, gardés dans le navigateur (ids produits)
const STORAGE_KEY = "exalt-favoris";
const listeners = new Set<() => void>();

const read = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

let current = read();

const write = (ids: string[]) => {
  current = ids;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // stockage indisponible (navigation privée) : les favoris restent le temps de la visite
  }
  listeners.forEach((l) => l());
};

export const toggleFavorite = (id: string) =>
  write(current.includes(id) ? current.filter((x) => x !== id) : [id, ...current]);

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useFavorites = () => useSyncExternalStore(subscribe, () => current);
