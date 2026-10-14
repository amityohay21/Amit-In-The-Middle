import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import { computeCentroid, computeSearchRadius } from "../services/geo/centroid.js";
import { geocodeAddresses } from "../services/googleMaps/geocoding.service.js";
import { searchNearbyPlaces } from "../services/googleMaps/places.service.js";
import { getTravelTimes } from "../services/googleMaps/distanceMatrix.service.js";
import { minimaxScore } from "../services/ranking/minimax.js";
import { sumOfTimesScore } from "../services/ranking/sumOfTimes.js";

// פונקציית עזר מתמטית לחישוב מרחק אווירי (Haversine)
function getAirDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function buildNavigationUrl(place) {
  const params = new URLSearchParams({
    api: "1",
    destination: `${place.location.lat},${place.location.lng}`,
    destination_place_id: place.placeId,
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function scorePlace(mode, durationMinutes) {
  return mode === "sum"
    ? sumOfTimesScore(durationMinutes)
    : minimaxScore(durationMinutes);
}

export async function searchMeetings(req, res, next) {
  try {
    // הנה התיקון: אנחנו קולטים את כל הפילטרים מהבקשה
    const { addresses, optimizationMode, minRating, requireDineIn, includeCarts } = req.validatedSearch;
    const apiKey = env.googleMapsApiKey;

    const participants = await geocodeAddresses(addresses, apiKey);
    const points = participants.map(({ lat, lng }) => ({ lat, lng }));

    const centroid = computeCentroid(points);
    const searchRadius = Math.round(computeSearchRadius(centroid, points));

    // מעבירים את הפילטרים לשירות של גוגל
    let places = await searchNearbyPlaces(centroid, searchRadius, apiKey, {
      minRating,
      requireDineIn,
      includeCarts
    });
    
    if (!places.length) {
      throw new AppError("לא נמצאו מקומות שעונים על דרישות הסינון.", 404, {
        searchRadius,
        centroid,
      });
    }

    // סינון גיאומטרי מקדים (Pre-filtering)
    places = places.map(place => {
      const totalAirDistance = points.reduce((sum, point) => {
        return sum + getAirDistance(point.lat, point.lng, place.location.lat, place.location.lng);
      }, 0);
      return { ...place, totalAirDistance };
    });

    places.sort((a, b) => a.totalAirDistance - b.totalAirDistance);
    
    // בחרנו שלא להגביל ל-12 בשלב זה, אז הפונקציה מחשבת מרחק אבל לא מסננת מקומות

    const timesByDest = await getTravelTimes(
      points,
      places.map((place) => place.location),
      apiKey
    );

    const results = places
      .map((place, index) => {
        const travelTimes = timesByDest[index].map((durationMinutes, participantIndex) => ({
          participantIndex,
          durationMinutes,
        }));

        const usableMinutes = travelTimes
          .map((item) => item.durationMinutes)
          .filter((minutes) => minutes != null);

        if (usableMinutes.length !== participants.length) {
          return null;
        }

        return {
          placeId: place.placeId,
          name: place.name,
          types: place.types,
          rating: place.rating,
          userRatingsTotal: place.userRatingsTotal,
          vicinity: place.vicinity,
          travelTimes,
          score: scorePlace(optimizationMode, usableMinutes),
          navigationUrl: buildNavigationUrl(place),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score);

    res.json({
      searchRadius,
      centroid,
      optimizationMode,
      participantCount: participants.length,
      results,
    });
  } catch (error) {
    next(error);
  }
}