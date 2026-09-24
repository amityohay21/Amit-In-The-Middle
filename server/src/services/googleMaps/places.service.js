import { AppError } from "../../middleware/errorHandler.js";

const PLACE_TYPES = ["restaurant", "cafe", "bar"];
const MAX_PLACES = 30;
const PAGE_TOKEN_DELAY_MS = 2000;

const cache = new Map();
let placesCallCount = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function roundCoord(value) {
  return value.toFixed(5);
}

function cacheKey(centroid, radius) {
  return `${roundCoord(centroid.lat)},${roundCoord(centroid.lng)}:${Math.round(radius)}`;
}

function mapPlace(place) {
  return {
    placeId: place.place_id,
    name: place.name,
    types: place.types ?? [],
    rating: place.rating ?? null,
    userRatingsTotal: place.user_ratings_total ?? 0,
    vicinity: place.vicinity ?? "",
    location: {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
    },
  };
}

async function nearbySearchPage(params, apiKey) {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
  );
  for (const [key, value] of Object.entries(params)) {
    if (value != null) url.searchParams.set(key, String(value));
  }
  url.searchParams.set("key", apiKey);

  placesCallCount += 1;
  console.log(`[google] Places Nearby Search call #${placesCallCount}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new AppError("Places request failed", 502, {
      httpStatus: response.status,
    });
  }

  const data = await response.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new AppError("Places search failed", 502, {
      googleStatus: data.status,
      errorMessage: data.error_message,
    });
  }

  return data;
}

async function searchByType(centroid, radius, type, apiKey) {
  const places = [];
  let pageToken;

  const first = await nearbySearchPage(
    {
      location: `${centroid.lat},${centroid.lng}`,
      radius: Math.round(radius),
      type,
      language: "iw",
    },
    apiKey
  );

  places.push(...(first.results ?? []));
  pageToken = first.next_page_token;

  if (pageToken && places.length < MAX_PLACES) {
    await sleep(PAGE_TOKEN_DELAY_MS);
    const second = await nearbySearchPage({ pagetoken: pageToken }, apiKey);
    places.push(...(second.results ?? []));
  }

  return places;
}

export function getPlacesCallCount() {
  return placesCallCount;
}

/**
 * Nearby Search around the centroid. One type per request (Google limitation),
 * then merge and dedupe by place_id. Cap at 30 results.
 */
export async function searchNearbyPlaces(centroid, radius, apiKey) {
  const key = cacheKey(centroid, radius);
  if (cache.has(key)) {
    return cache.get(key);
  }

  const typeResults = await Promise.all(
    PLACE_TYPES.map((type) => searchByType(centroid, radius, type, apiKey))
  );

  const byId = new Map();
  const maxLen = Math.max(...typeResults.map((list) => list.length), 0);
  for (let i = 0; i < maxLen && byId.size < MAX_PLACES; i += 1) {
    for (const list of typeResults) {
      const place = list[i];
      if (!place?.place_id || byId.has(place.place_id)) continue;
      byId.set(place.place_id, mapPlace(place));
      if (byId.size >= MAX_PLACES) break;
    }
  }

  const results = Array.from(byId.values()).slice(0, MAX_PLACES);
  cache.set(key, results);
  return results;
}
