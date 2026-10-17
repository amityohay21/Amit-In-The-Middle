const API_BASE = "https://ameet-in-the-middle.onrender.com";

export async function searchMeetingPlaces({ 
  addresses, 
  optimizationMode, 
  minRating, 
  requireDineIn, 
  includeCarts,
  openNow
}) {
  const attemptRequest = async (retries = 1) => {
    try {
      const response = await fetch(`${API_BASE}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          addresses, 
          optimizationMode, 
          minRating, 
          requireDineIn, 
          includeCarts,
          openNow
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        // בודקים אם השגיאה נובעת מקריסה של גוגל (ולא משגיאת ולידציה כמו חוסר כתובות)
        if (retries > 0 && response.status >= 400 && response.status !== 404 && response.status !== 400) {
          console.warn(`[API] Attempt failed, retrying in 1.5s... (${retries} retries left)`);
          await new Promise(resolve => setTimeout(resolve, 1500)); // המתנה של שנייה וחצי
          return attemptRequest(retries - 1); // ניסיון חוזר
        }

        console.error("🚀 Backend Error Payload:", payload);
        
        // נותנים הודעה ספציפית אם זה נראה כמו Rate Limit מגוגל
        const isRateLimit = response.status === 429 || payload?.error?.message?.includes("not found");
        let message = payload?.error?.message || "החיפוש נכשל. נסו שוב בעוד רגע.";
        
        if (isRateLimit) {
            message = "יש עומס רגעי על המערכת. אנא נסו שוב בעוד כמה שניות.";
        }

        const error = new Error(message);
        error.details = payload?.error?.details;
        error.status = response.status;
        throw error;
      }

      return payload;
    } catch (err) {
        if (retries > 0) {
            console.warn(`[API] Network error, retrying in 1.5s... (${retries} retries left)`);
            await new Promise(resolve => setTimeout(resolve, 1500));
            return attemptRequest(retries - 1);
        }
        throw err;
    }
  };

  return attemptRequest();
}