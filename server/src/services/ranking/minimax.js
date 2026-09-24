/** score(p) = max(t1...tn) — fairness (no one has an extreme trip). */
export function minimaxScore(durationMinutes) {
  if (!durationMinutes.length) {
    return Number.POSITIVE_INFINITY;
  }
  return Math.max(...durationMinutes);
}
