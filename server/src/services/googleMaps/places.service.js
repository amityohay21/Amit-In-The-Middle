import { AppError } from "../../middleware/errorHandler.js";

const PLACE_TYPES = ["restaurant", "cafe", "bar"];
const MAX_PLACES = 40; // הגדלנו מ-30 ל-40 כדי שיישאר מבחר יפה אחרי כל הסינונים שלנו
const PAGE_TOKEN_DELAY_MS = 2000;

// רשימה שחורה - רשתות המוניות ומקומות שלא מתאימים לישיבה חברתית
const BLACKLIST = ["מקדונלד", "mcdonald", "פיצה האט", "pizza hut", "דומינוס", "domino", "בורגראנץ", "פיצוצי", "yellow", "קיוסק"];

const cache = new Map();
let placesCallCount = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function roundCoord(value) {
  return value.toFixed(5);
}

// עדכנו את מפתח הקאש כך שיזכור גם את הפילטרים שהמשתמש בחר
function cacheKey(centroid, radius, minRating, includeCarts) {
  return `${roundCoord(centroid.lat)},${roundCoord(centroid.lng)}:${Math.round(radius)}:rating${minRating}:carts${includeCarts}`;
}

function mapPlace(place) {
  return {
    placeId: place.place_id,
    name: place.name,
    types: place.types ?? [],
    rating: place.rating ?? 0,
    userRatingsTotal: place.user_ratings_total ?? 0,
    vicinity: place.vicinity ?? "",
    location: {
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
    },
  };
}

// פונקציית עזר גנרית שקוראת ל-API של גוגל
async function nearbySearchPage(params, apiKey) {
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  for (const [key, value] of Object.entries(params)) {
    if (value != null) url.searchParams.set(key, String(value));
  }
  url.searchParams.set("key", apiKey);

  placesCallCount += 1;
  console.log(`[google] Places Nearby Search call #${placesCallCount} - params:`, params);

  const response = await fetch(url);
  if (!response.ok) {
    throw new AppError("Places request failed", 502, { httpStatus: response.status });
  }

  const data = await response.json();
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new AppError("Places search failed", 502, { googleStatus: data.status, errorMessage: data.error_message });
  }

  return data;
}

// פונקציה חדשה שתומכת גם בחיפוש לפי סוג וגם לפי מילת מפתח (לעגלות קפה)
async function searchByTypeOrKeyword(centroid, radius, type, keyword, apiKey) {
  const places = [];
  const params = {
    location: `${centroid.lat},${centroid.lng}`,
    radius: Math.round(radius),
    language: "iw",
  };
  
  if (type) params.type = type;
  if (keyword) params.keyword = keyword; // כאן נכנסת הבקשה ל"עגלת קפה"

  const first = await nearbySearchPage(params, apiKey);
  places.push(...(first.results ?? []));

  if (first.next_page_token && places.length < MAX_PLACES) {
    await sleep(PAGE_TOKEN_DELAY_MS);
    const second = await nearbySearchPage({ pagetoken: first.next_page_token }, apiKey);
    places.push(...(second.results ?? []));
  }

  return places;
}

export function getPlacesCallCount() {
  return placesCallCount;
}

// הפונקציה הראשית שעכשיו מקבלת גם את הפילטרים מהמשתמש
export async function searchNearbyPlaces(centroid, radius, apiKey, filters = {}) {
  const { minRating = 0, requireDineIn = false, includeCarts = false } = filters;
  const key = cacheKey(centroid, radius, minRating, includeCarts);
  
  if (cache.has(key)) {
    return cache.get(key);
  }

  // מכינים מערך בקשות לגוגל: סוגי המקומות הרגילים
  const requests = PLACE_TYPES.map((type) => searchByTypeOrKeyword(centroid, radius, type, null, apiKey));
  
  // אם המשתמש סימן שהוא רוצה עגלות קפה, נוסיף בקשות ייעודיות
  if (includeCarts) {
    requests.push(searchByTypeOrKeyword(centroid, radius, null, "עגלת קפה", apiKey));
    requests.push(searchByTypeOrKeyword(centroid, radius, null, "food truck", apiKey));
  }

  const typeResults = await Promise.all(requests);
  const byId = new Map();
  
  for (const list of typeResults) {
    for (const place of list) {
      if (!place?.place_id || byId.has(place.place_id)) continue;
      
      const mapped = mapPlace(place);
      const placeNameLower = mapped.name.toLowerCase();

      // --- שלב הסינון האיכותי (Frontend Filters) ---
      
      // 1. סינון רשתות ומקומות לא רצויים
      const isBlacklisted = BLACKLIST.some(badWord => placeNameLower.includes(badWord));
      if (isBlacklisted) continue;

      // 2. סינון לפי מינימום דירוג שהמשתמש בחר
      if (mapped.rating < minRating) continue;

      // 3. סינון ישיבה במקום (מסננים "Takeaway" רק אם הוגדרה חובת ישיבה וזה לא בית קפה/מסעדה במקביל)
      if (requireDineIn && mapped.types.includes("meal_takeaway") && !mapped.types.includes("restaurant") && !mapped.types.includes("cafe")) {
        continue;
      }

      byId.set(place.place_id, mapped);
    }
  }

  const results = Array.from(byId.values()).slice(0, MAX_PLACES);
  cache.set(key, results);
  return results;
}