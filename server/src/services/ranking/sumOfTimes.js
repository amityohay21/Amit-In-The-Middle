/** score(p) = sum(t1...tn) — total travel-time efficiency. */
export function sumOfTimesScore(durationMinutes) {
  if (!durationMinutes.length) {
    return Number.POSITIVE_INFINITY;
  }
  return durationMinutes.reduce((sum, minutes) => sum + minutes, 0);
}
