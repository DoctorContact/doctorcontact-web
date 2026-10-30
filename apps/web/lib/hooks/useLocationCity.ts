import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSearchLocations } from "@/lib/api";

export type LocationStatus = "idle" | "loading" | "granted" | "denied" | "manual";

type SearchLoc = { id?: string; nameEn?: string; isActive?: boolean };
type Coords = { lat: number; lon: number };

// A detected spot further than this from every listed location is ignored
// (the person then sees all doctors instead of an empty list).
const MAX_NEARBY_KM = 50;
const COORDS_CACHE_KEY = "dc_location_coords_v1";

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function distanceKm(a: Coords, b: Coords) {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

function readCoordsCache(): Record<string, Coords | null> {
  try {
    return JSON.parse(localStorage.getItem(COORDS_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCoordsCache(cache: Record<string, Coords | null>) {
  try {
    localStorage.setItem(COORDS_CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* storage unavailable — fine, we just geocode again next time */
  }
}

let locationsPromise: Promise<SearchLoc[]> | null = null;
function loadLocations(): Promise<SearchLoc[]> {
  if (!locationsPromise) {
    locationsPromise = fetchSearchLocations()
      .then((data: unknown) => {
        const list = Array.isArray(data) ? data : (data as { data?: unknown })?.data;
        return Array.isArray(list) ? (list as SearchLoc[]) : [];
      })
      .catch(() => []);
  }
  return locationsPromise;
}

// Coordinates of a listed location, found once via Nominatim and cached in the browser.
async function getLocationCoords(
  name: string,
  state: string | undefined,
  cache: Record<string, Coords | null>
): Promise<Coords | null> {
  const key = `${normalize(name)}|${normalize(state || "")}`;
  if (key in cache) return cache[key];

  try {
    const q = [name, state].filter(Boolean).join(", ");
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&accept-language=en&q=${encodeURIComponent(q)}`
    );
    const arr = await res.json();
    const coords: Coords | null = arr?.[0]
      ? { lat: Number(arr[0].lat), lon: Number(arr[0].lon) }
      : null;
    cache[key] = coords;
    writeCoordsCache(cache);
    await sleep(1100); // Nominatim allows ~1 request per second
    return coords;
  } catch {
    return null; // network problem: don't cache, try again next visit
  }
}

/**
 * GPS often returns a tiny village/area name that is not in our location list.
 * 1) match any part of the address against the list (e.g. Najuriya -> Dubrajpur block)
 * 2) otherwise pick the nearest listed location within MAX_NEARBY_KM
 * 3) otherwise return null (no city filter, so the list is never empty)
 */
async function resolveListedCity(
  position: Coords,
  address: Record<string, unknown>
): Promise<string | null> {
  const locations = (await loadLocations()).filter(
    (l) => l?.nameEn && l.isActive !== false
  );

  // No list available: keep the old behaviour.
  if (!locations.length) {
    const a = address as Record<string, string | undefined>;
    return a.city || a.town || a.village || a.county || null;
  }

  // 1) Address match (exact first, then "contains")
  const parts = Object.values(address)
    .filter((v): v is string => typeof v === "string")
    .map(normalize)
    .filter(Boolean);

  const exact = locations.find((l) => parts.includes(normalize(l.nameEn!)));
  if (exact) return exact.nameEn!;

  const partial = locations.find((l) => {
    const n = normalize(l.nameEn!);
    return n && parts.some((p) => p.includes(n));
  });
  if (partial) return partial.nameEn!;

  // 2) Nearest listed location
  const state = typeof address.state === "string" ? address.state : undefined;
  const cache = readCoordsCache();
  let best: { name: string; km: number } | null = null;

  for (const loc of locations) {
    const coords = await getLocationCoords(loc.nameEn!, state, cache);
    if (!coords) continue;
    const km = distanceKm(position, coords);
    if (!best || km < best.km) best = { name: loc.nameEn!, km };
  }

  return best && best.km <= MAX_NEARBY_KM ? best.name : null;
}

/**
 * Detects the user's city from browser geolocation (with their permission),
 * reverse-geocoded via OpenStreetMap's free Nominatim API — no API key needed.
 * The result is always one of the listed search locations (nearest if needed).
 * Falls back gracefully, and always lets the person pick a city manually.
 */
export function useLocationCity() {
  const [city, setCity] = useState<string | null>(null);
  const [status, setStatus] = useState<LocationStatus>("idle");
  // Once the person picks a city themselves, GPS detection must never overwrite it.
  const manualRef = useRef(false);

  const detect = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setStatus("denied");
      return;
    }

    setStatus("loading");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (manualRef.current) return;
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`
          );
          const data = await res.json();
          const address = data?.address ?? {};

          const detected = await resolveListedCity(
            { lat: latitude, lon: longitude },
            address
          );
          if (manualRef.current) return;

          if (detected) {
            setCity(detected);
            setStatus("granted");
          } else {
            setStatus("denied");
          }
        } catch {
          if (!manualRef.current) setStatus("denied");
        }
      },
      () => {
        if (!manualRef.current) setStatus("denied");
      },
      { timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    detect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stable identity: callers list this in effect deps, and a new function every
  // render would re-run their effects and reset the city back to the URL value.
  const setManualCity = useCallback((value: string) => {
    manualRef.current = !!value;
    setCity(value || null);
    setStatus(value ? "manual" : "idle");
  }, []);

  return { city, status, detect, setManualCity };
}