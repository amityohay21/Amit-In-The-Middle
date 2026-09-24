const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export async function searchMeetingPlaces({ addresses, optimizationMode }) {
  const response = await fetch(`${API_BASE}/api/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ addresses, optimizationMode }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      payload?.error?.message || "החיפוש נכשל. נסו שוב בעוד רגע.";
    const error = new Error(message);
    error.details = payload?.error?.details;
    error.status = response.status;
    throw error;
  }

  return payload;
}
