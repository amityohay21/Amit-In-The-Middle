import { AppError } from "../../middleware/errorHandler.js";

const cache = new Map();
let geocodeCallCount = 0;

function cacheKey(address) {
  return address.trim().toLowerCase();
}

export function getGeocodeCallCount() {
  return geocodeCallCount;
}

// פונקציית עזר להשהיה חכמה
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Geocode all addresses in parallel with Retry logic for Rate Limits.
 */
export async function geocodeAddresses(addresses, apiKey) {
  return Promise.all(
    addresses.map(async (address, participantIndex) => {
      const key = cacheKey(address);
      if (cache.has(key)) {
        return { ...cache.get(key), participantIndex, address };
      }

      const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      url.searchParams.set("address", address);
      url.searchParams.set("key", apiKey);
      url.searchParams.set("language", "iw");

      let attempts = 0;
      const maxAttempts = 3;
      let data;

      while (attempts < maxAttempts) {
        attempts += 1;
        geocodeCallCount += 1;
        console.log(`[google] Geocoding call #${geocodeCallCount} for "${address}" (Attempt ${attempts})`);

        const response = await fetch(url);
        
        if (!response.ok) {
          if (attempts < maxAttempts) {
            await sleep(1000 * attempts);
            continue;
          }
          throw new AppError("Geocoding request failed", 502, {
            participantIndex,
            address,
            httpStatus: response.status,
          });
        }

        data = await response.json();

        // אם גוגל חוסם בגלל עומס, מחכים קצת ומנסים שוב!
        if (data.status === "OVER_QUERY_LIMIT" || data.status === "UNKNOWN_ERROR") {
          if (attempts < maxAttempts) {
            console.warn(`[google] Rate limit hit for "${address}", retrying in ${attempts}s...`);
            await sleep(1000 * attempts);
            continue;
          }
          // אם גם אחרי 3 נסיונות זה נכשל, מחזירים סטטוס 429
          throw new AppError("יש עומס רגעי על שרתי המפות. אנא נסו שוב בעוד כמה שניות.", 429, {
            participantIndex,
            address,
            googleStatus: data.status,
          });
        }

        // אם התשובה תקינה או שיש שגיאה לגיטימית, יוצאים מהלולאה
        break;
      }

      // קודם בודקים אם הכתובת באמת לא נמצאה (ורק אחרי ששללנו Rate Limit!)
      if (data.status === "ZERO_RESULTS") {
        throw new AppError("Address not found", 400, {
          participantIndex,
          address,
          googleStatus: data.status,
        });
      }

      // כל שגיאה אחרת מגוגל
      if (data.status !== "OK") {
        throw new AppError("Geocoding failed", 502, {
          participantIndex,
          address,
          googleStatus: data.status,
          errorMessage: data.error_message,
        });
      }

      const result = data.results[0];

      const location = {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
      };

      cache.set(key, location);
      return { ...location, participantIndex, address };
    })
  );
}