const TYPE_LABELS = {
  cafe: "בית קפה",
  restaurant: "מסעדה",
  bar: "בר",
};

function primaryType(types) {
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

  return (
    <article className="result-card">
      <header className="result-card__header">
        <h3>{place.name}</h3>
        <span className="result-card__type">{primaryType(place.types)}</span>
      </header>

      <p className="result-card__meta">
        {place.rating != null ? `★ ${place.rating}` : "אין דירוג"}
        {place.userRatingsTotal
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

      <footer className="result-card__footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <span className="result-card__score">זמן נסיעה מקסימלי: {place.score} דק'</span>
        
        <div style={{ display: "flex", gap: "10px" }}>
          {/* כפתור שיתוף בוואטסאפ */}
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