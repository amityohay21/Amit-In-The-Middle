const API_BASE = "https://ameet-in-the-middle.onrender.com";

// הוספנו את הפילטרים החדשים לפונקציה כדי שיישלחו לשרת
export async function searchMeetingPlaces({ 
  addresses, 
  optimizationMode, 
  minRating, 
  requireDineIn, 
  includeCarts 
}) {
  const response = await fetch(`${API_BASE}/api/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      addresses, 
      optimizationMode, 
      minRating, 
      requireDineIn, 
      includeCarts 
    }),
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