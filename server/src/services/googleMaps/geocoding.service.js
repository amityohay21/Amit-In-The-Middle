import { AppError } from "../../middleware/errorHandler.js";

const cache = new Map();
let geocodeCallCount = 0;

function cacheKey(address) {
  return address.trim().toLowerCase();
}

export function getGeocodeCallCount() {
  return geocodeCallCount;
}

/**
 * Geocode all addresses in parallel.
 * Fails with a clear per-address error instead of crashing the whole request.
 */
export async function geocodeAddresses(addresses, apiKey) {
  return Promise.all(
    addresses.map(async (address, participantIndex) => {
      const key = cacheKey(address);
      if (cache.has(key)) {
        return { ...cache.get(key), participantIndex, address };
      }

      geocodeCallCount += 1;
      console.log(
        `[google] Geocoding call #${geocodeCallCount} for "${address}"`
      );

      const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
      url.searchParams.set("address", address);
      url.searchParams.set("key", apiKey);
      url.searchParams.set("language", "iw");

      const response = await fetch(url);
      if (!response.ok) {
        throw new AppError("Geocoding request failed", 502, {
          participantIndex,
          address,
          httpStatus: response.status,
        });
      }

      const data = await response.json();

      if (data.status === "ZERO_RESULTS" || !data.results?.length) {
        throw new AppError("Address not found", 400, {
          participantIndex,
          address,
          googleStatus: data.status,
        });
      }

      if (data.status !== "OK") {
        throw new AppError("Geocoding failed", 502, {
          participantIndex,
          address,
          googleStatus: data.status,
          errorMessage: data.error_message,
        });
      }

      const result = data.results[0];
      if (data.results.length > 1 && result.partial_match) {
        throw new AppError("Address is ambiguous", 400, {
          participantIndex,
          address,
          suggestions: data.results.slice(0, 5).map((item) => item.formatted_address),
        });
      }

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
