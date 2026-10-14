export async function searchNearbyPlaces(centroid, radius, apiKey, options = {}) {
  const { minRating = 0, requireDineIn = false, includeCarts = false, openNow = false } = options;

  // אם המשתמש סימן עגלות קפה, נוסיף אותן למילות החיפוש, אחרת נחפש רגיל
  const keyword = includeCarts ? "cafe OR restaurant OR bar OR עגלת קפה" : "cafe OR restaurant OR bar";

  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
  url.searchParams.append("location", `${centroid.lat},${centroid.lng}`);
  url.searchParams.append("radius", radius.toString());
  url.searchParams.append("keyword", keyword);
  url.searchParams.append("language", "iw");
  url.searchParams.append("key", apiKey);

  // חסכון מטורף: שולחים את ההנחיה "פתוח עכשיו" ישר לגוגל
  if (openNow) {
    url.searchParams.append("opennow", "true");
  }

  try {
    const response = await fetch(url.toString());
    const data = await response.json();

    if (!data.results) return [];

    const validPlaces = [];

    for (const place of data.results) {
      // חילוץ המידע
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

      // 1. סינון מקומות שחורים (כמו תחנות דלק, מלונות, וסופרים שיש להם קיוסק)
      const isBlacklisted = mapped.types.some(t =>
        ["lodging", "gas_station", "supermarket", "convenience_store", "clothing_store"].includes(t)
      );
      if (isBlacklisted) continue;

      // 2. סינון דירוג שהמשתמש בחר
      if (mapped.rating < minRating) continue;

      // 3. סינון מקומות "מעפנים" - חובה מעל 100 ביקורות!
      if (mapped.userRatingsTotal < 100) continue;

      // 4. סינון ישיבה במקום (מורידים מקומות שהם Takeaway בלבד)
      if (requireDineIn) {
        const isTakeawayOnly = mapped.types.includes("meal_takeaway") && 
                               !mapped.types.includes("restaurant") && 
                               !mapped.types.includes("cafe");
        if (isTakeawayOnly) continue;
      }

      validPlaces.push(mapped);
    }

    return validPlaces;
  } catch (error) {
    console.error("Error fetching places from Google Maps API:", error);
    throw error;
  }
}