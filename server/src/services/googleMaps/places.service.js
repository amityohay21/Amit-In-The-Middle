import { AppError } from "../../middleware/errorHandler.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function searchNearbyPlaces(centroid, radius, apiKey, options = {}) {
  const { minRating = 0, requireDineIn = false, includeCarts = false, openNow = false } = options;

  const keyword = includeCarts ? "cafe OR restaurant OR bar OR עגלת קפה" : "cafe OR restaurant OR bar";

  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.append("location", `${centroid.lat},${centroid.lng}`);
  url.searchParams.append("radius", radius.toString());
  url.searchParams.append("keyword", keyword);
  url.searchParams.append("language", "iw"); 
  url.searchParams.append("key", apiKey);

  if (openNow) {
    url.searchParams.append("opennow", "true");
  }

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts += 1;
    
    try {
      const response = await fetch(url.toString());
      const data = await response.json();

      // זיהוי עומס רגעי מול גוגל
      if (data.status === "OVER_QUERY_LIMIT" || data.status === "UNKNOWN_ERROR") {
        if (attempts < maxAttempts) {
          console.warn(`[google] Rate limit hit for Places API, retrying in ${attempts}s...`);
          await sleep(1000 * attempts);
          continue;
        }
        throw new AppError("יש עומס רגעי על שרתי המפות. אנא נסו שוב בעוד כמה שניות.", 429, {
          googleStatus: data.status,
        });
      }

      if (!data.results) return [];

      const validPlaces = [];

      for (const place of data.results) {
        const mapped = {
          placeId: place.place_id,
          name: place.name,
          location: place.geometry.location,
          types: place.types || [],
          rating: place.rating || 0,
          userRatingsTotal: place.user_ratings_total || 0,
          vicinity: place.vicinity || "",
          business_status: place.business_status
        };

        const isBlacklisted = mapped.types.some(t =>
          ["lodging", "gas_station", "supermarket", "convenience_store", "clothing_store"].includes(t)
        );
        if (isBlacklisted) continue;

        if (mapped.rating < minRating) continue;
        if (mapped.userRatingsTotal < 100) continue;

        if (requireDineIn) {
          const isDeliveryOnly = mapped.types.includes("meal_delivery") && 
                                 !mapped.types.includes("restaurant") && 
                                 !mapped.types.includes("cafe") && 
                                 !mapped.types.includes("food");
          if (isDeliveryOnly) continue;
        }

        validPlaces.push(mapped);
      }

      return validPlaces;
      
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 429) {
          throw error; // זו שגיאת עומס שכבר טיפלנו בה, זורקים אותה הלאה ללקוח
      }
      
      // אם זו שגיאת רשת אמיתית, ננסה שוב
      if (attempts < maxAttempts) {
         await sleep(1000 * attempts);
         continue;
      }
      console.error("Error fetching places from Google Maps API:", error);
      throw error;
    }
  }
}