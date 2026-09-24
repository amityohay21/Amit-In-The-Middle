import { haversine } from "./haversine.js";

const MIN_SEARCH_RADIUS_METERS = 3000;

/** Simple geographic mean of participant coordinates. */
export function computeCentroid(points) {
  if (!points.length) {
    throw new Error("Cannot compute centroid of an empty point list");
  }

  const sum = points.reduce(
    (acc, point) => ({
      lat: acc.lat + point.lat,
      lng: acc.lng + point.lng,
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: sum.lat / points.length,
    lng: sum.lng / points.length,
  };
}

export function computeSearchRadius(centroid, points) {
  const maxDistance = Math.max(
    ...points.map((point) => haversine(centroid, point))
  );
  return Math.max(maxDistance * 0.5, MIN_SEARCH_RADIUS_METERS);
}
