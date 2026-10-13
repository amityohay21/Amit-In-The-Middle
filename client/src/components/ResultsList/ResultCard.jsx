const TYPE_LABELS = {
  cafe: "בית קפה",
  restaurant: "מסעדה",
  bar: "בר",
};

// הוספנו זיהוי חכם לעגלות קפה לפי השם, כי גוגל מסווגת אותן לרוב רק כ"חנות" או "מסעדה"
function primaryType(types, name) {
  const nameLower = name?.toLowerCase() || "";
  if (nameLower.includes("עגלת קפה") || nameLower.includes("food truck")) {
    return "עגלת קפה";
  }

  for (const type of ["cafe", "restaurant", "bar"]) {
    if (types?.includes(type)) return TYPE_LABELS[type];
  }
  return "מקום בילוי";
}

export default function ResultCard({ place }) {
  // יצירת הודעת וואטסאפ מוכנה מראש עם פרטי המקום
  const whatsappMessage = encodeURIComponent(
    `ניפגש ב-${place.name}! 📍\nכתובת: ${place.vicinity || "לא צויינה כתובת"}\n⏱️ זמן נסיעה מקסימלי: ${place.score} דק'`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappMessage}`;

  const placeType = primaryType(place.types, place.name);
  
  // אם זה לא מוגדר כטייק-אווי בלבד (כלומר זה בית קפה/מסעדה/בר), נניח שיש מקום ישיבה
  const hasSeating = place.types?.some(t => ["restaurant", "cafe", "bar"].includes(t));

  return (
    <article className="result-card">
      <header className="result-card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ margin: "0 0 4px 0" }}>{place.name}</h3>
          <span className="result-card__type" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            {placeType}
            {/* אייקון הישיבה הנקי שהצעת */}
            {hasSeating && <span title="יש מקום ישיבה">🪑</span>}
          </span>
        </div>
      </header>

      <p className="result-card__meta">
        {place.rating > 0 ? `⭐ ${place.rating}` : "אין דירוג"}
        {place.userRatingsTotal > 0
          ? ` · ${place.userRatingsTotal} ביקורות`
          : null}
        {place.vicinity ? ` · ${place.vicinity}` : null}
      </p>

      <ul className="result-card__times">
        {place.travelTimes.map((item) => (
          <li key={item.participantIndex}>
            משתתף {item.participantIndex + 1}: {item.durationMinutes} דק׳
          </li>
        ))}
      </ul>

      <footer className="result-card__footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginTop: "12px" }}>
        <span className="result-card__score" style={{ fontWeight: "bold" }}>
          זמן נסיעה מקסימלי: {place.score} דק'
        </span>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <a
            className="button"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              backgroundColor: "#25D366",
              color: "#fff",
              padding: "6px 12px",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "bold",
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "14px"
            }}
          >
            💬 שתף בוואטסאפ
          </a>

          <a
            className="button button--link"
            href={place.navigationUrl}
            target="_blank"
            rel="noreferrer"
          >
            ניווט ב-Google Maps
          </a>
        </div>
      </footer>
    </article>
  );
}