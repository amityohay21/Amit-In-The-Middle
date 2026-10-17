import React from 'react';

const TYPE_LABELS = { cafe: "בית קפה", restaurant: "מסעדה", bar: "בר" };

function primaryType(types, name) {
  const nameLower = name?.toLowerCase() || "";
  if (nameLower.includes("עגלת קפה") || nameLower.includes("food truck")) return "עגלת קפה";
  for (const type of ["cafe", "restaurant", "bar"]) {
    if (types?.includes(type)) return TYPE_LABELS[type];
  }
  return "מקום בילוי";
}

export default function ResultCard({ place, participants }) {
  const whatsappMessage = encodeURIComponent(
    `האמצע המושלם בשבילנו! 🎯\n\nניפגש ב-${place.name} 📍\nכתובת: ${place.vicinity}\n\n🚗 לניווט מהיר ב-Waze:\n${place.wazeUrl}`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappMessage}`;

  const placeType = primaryType(place.types, place.name);
  const hasSeating = place.types?.some(t => ["restaurant", "cafe", "bar"].includes(t));

  return (
    <article className="result-card">
      <header className="result-card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ margin: "0 0 8px 0", fontSize: "1.3rem", color: "var(--ink)" }}>{place.name}</h3>
          
          {/* אזור התגיות - עם הדירוג החי של גוגל */}
          <div className="badges-wrapper">
            <span className="badge badge--type">{placeType} {hasSeating && "🪑"}</span>
            {place.rating > 0 && (
              <span className="badge badge--gold">
                ⭐ {place.rating} ({place.userRatingsTotal} ביקורות)
              </span>
            )}
            {place.userRatingsTotal >= 1000 && <span className="badge badge--gold">🏆 בחירת הקהל</span>}
            {place.business_status === "OPERATIONAL" && <span className="badge badge--green">🟢 פתוח</span>}
          </div>
        </div>
      </header>

      <ul className="result-card__times">
        {place.travelTimes.map((item) => {
          const participantName = participants?.[item.participantIndex]?.name || `משתתף ${item.participantIndex + 1}`;
          return (
            <li key={item.participantIndex} style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{participantName}</strong>
              <span>{item.durationMinutes} דקות נסיעה</span>
            </li>
          );
        })}
      </ul>

      <footer className="result-card__footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginTop: "16px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", width: "100%" }}>
          <a className="button" href={place.googleSearchUrl} target="_blank" rel="noreferrer" style={{ backgroundColor: "#f0f0f0", color: "#333", textDecoration: "none", fontSize: "14px", flex: "1", textAlign: "center" }}>
            🔍 תפריט
          </a>
          <a className="button" href={place.wazeUrl} target="_blank" rel="noreferrer" style={{ backgroundColor: "#0099ff", color: "#fff", textDecoration: "none", fontSize: "14px", flex: "1", textAlign: "center" }}>
            Waze 🚗
          </a>
          <a className="button" href={whatsappUrl} target="_blank" rel="noreferrer" style={{ backgroundColor: "#25D366", color: "#fff", textDecoration: "none", fontSize: "14px", flex: "1", textAlign: "center" }}>
            שתף בוואטסאפ
          </a>
        </div>
      </footer>
    </article>
  );
}