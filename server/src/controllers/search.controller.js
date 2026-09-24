import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";
import { computeCentroid, computeSearchRadius } from "../services/geo/centroid.js";
import { geocodeAddresses } from "../services/googleMaps/geocoding.service.js";
import { searchNearbyPlaces } from "../services/googleMaps/places.service.js";
import { getTravelTimes } from "../services/googleMaps/distanceMatrix.service.js";
import { minimaxScore } from "../services/ranking/minimax.js";
import { sumOfTimesScore } from "../services/ranking/sumOfTimes.js";

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
    const { addresses, optimizationMode } = req.validatedSearch;
    const apiKey = env.googleMapsApiKey;

    const participants = await geocodeAddresses(addresses, apiKey);
    const points = participants.map(({ lat, lng }) => ({ lat, lng }));

    const centroid = computeCentroid(points);
    const searchRadius = Math.round(computeSearchRadius(centroid, points));

    const places = await searchNearbyPlaces(centroid, searchRadius, apiKey);
    if (!places.length) {
      throw new AppError("No nearby cafes, restaurants, or bars found", 404, {
        searchRadius,
        centroid,
      });
    }

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
