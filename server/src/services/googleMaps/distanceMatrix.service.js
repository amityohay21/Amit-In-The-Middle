import { batchArray } from "../../utils/batchArray.js";
import { AppError } from "../../middleware/errorHandler.js";

const MAX_DESTINATIONS_PER_REQUEST = 25;
const MAX_ELEMENTS_PER_REQUEST = 100;

let distanceMatrixCallCount = 0;
let distanceMatrixElementCount = 0;

function formatLatLng(point) {
  return `${point.lat},${point.lng}`;
}

function minutesFromElement(element) {
  const seconds =
    element.duration_in_traffic?.value ?? element.duration?.value ?? null;
  if (seconds == null) return null;
  return Math.round(seconds / 60);
}

export function getDistanceMatrixStats() {
  return {
    calls: distanceMatrixCallCount,
    elements: distanceMatrixElementCount,
  };
}

async function fetchMatrix(origins, destinations, apiKey) {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/distancematrix/json"
  );
  url.searchParams.set("origins", origins.map(formatLatLng).join("|"));
  url.searchParams.set(
    "destinations",
    destinations.map(formatLatLng).join("|")
  );
  url.searchParams.set("mode", "driving");
  url.searchParams.set("departure_time", "now");
  url.searchParams.set("traffic_model", "best_guess");
  url.searchParams.set("language", "iw");
  url.searchParams.set("key", apiKey);

  const elements = origins.length * destinations.length;
  distanceMatrixCallCount += 1;
  distanceMatrixElementCount += elements;
  console.log(
    `[google] Distance Matrix call #${distanceMatrixCallCount} (${elements} elements, total ${distanceMatrixElementCount})`
  );

  const response = await fetch(url);
  if (!response.ok) {
    throw new AppError("Distance Matrix request failed", 502, {
      httpStatus: response.status,
    });
  }

  const data = await response.json();
  if (data.status !== "OK") {
    throw new AppError("Distance Matrix failed", 502, {
      googleStatus: data.status,
      errorMessage: data.error_message,
    });
  }

  return data;
}

/**
 * Origins (2–4) × destinations (up to 30). Splits destinations into batches
 * so we stay under Google's 25 destinations and 100 elements per request.
 */
export async function getTravelTimes(origins, destinations, apiKey) {
  const destBatchSize = Math.min(
    MAX_DESTINATIONS_PER_REQUEST,
    Math.floor(MAX_ELEMENTS_PER_REQUEST / Math.max(origins.length, 1))
  );

  const batches = batchArray(destinations, destBatchSize);
  const timesByDest = destinations.map(() =>
    origins.map(() => null)
  );

  let destOffset = 0;
  for (const batch of batches) {
    const data = await fetchMatrix(origins, batch, apiKey);

    data.rows.forEach((row, originIndex) => {
      row.elements.forEach((element, destInBatchIndex) => {
        const destIndex = destOffset + destInBatchIndex;
        timesByDest[destIndex][originIndex] =
          element.status === "OK" ? minutesFromElement(element) : null;
      });
    });

    destOffset += batch.length;
  }

  return timesByDest;
}
