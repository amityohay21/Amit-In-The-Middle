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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts += 1;
    distanceMatrixCallCount += 1;
    distanceMatrixElementCount += elements;
    console.log(`[google] Distance Matrix call #${distanceMatrixCallCount} (${elements} elements, total ${distanceMatrixElementCount}) - Attempt ${attempts}`);

    const response = await fetch(url);
    if (!response.ok) {
      if (attempts < maxAttempts) {
        await sleep(1000 * attempts);
        continue;
      }
      throw new AppError("Distance Matrix request failed", 502, {
        httpStatus: response.status,
      });
    }

    const data = await response.json();
    
    // זיהוי עומס רגעי
    if (data.status === "OVER_QUERY_LIMIT" || data.status === "UNKNOWN_ERROR") {
      if (attempts < maxAttempts) {
        console.warn(`[google] Rate limit hit for Distance Matrix, retrying in ${attempts}s...`);
        await sleep(1000 * attempts);
        continue;
      }
      throw new AppError("יש עומס רגעי על שרתי המפות. אנא נסו שוב בעוד כמה שניות.", 429, {
        googleStatus: data.status,
      });
    }

    if (data.status !== "OK") {
      throw new AppError("Distance Matrix failed", 502, {
        googleStatus: data.status,
        errorMessage: data.error_message,
      });
    }

    return data;
  }
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
    // השהיה קטנה בין שליחת חבילות לגוגל כדי למנוע יצירת עומס אצלם מלכתחילה!
    if (destOffset > 0) {
      await sleep(300); 
    }

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