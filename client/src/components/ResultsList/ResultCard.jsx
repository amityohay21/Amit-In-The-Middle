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

export default function ResultCard({ place, participants, isShareMode, isSelected, onToggleSelect, onShowMap }) {
  const whatsappMessage = encodeURIComponent(
    `האמצע המושלם בשבילנו! 🎯\n\nניפגש ב-${place.name} 📍\nכתובת: ${place.vicinity}\n\n🚗 לניווט מהיר ב-Waze:\n${place.wazeUrl}`
  );
  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappMessage}`;

  const placeType = primaryType(place.types, place.name);
  const hasSeating = place.types?.some(t => ["restaurant", "cafe", "bar"].includes(t));

  return (
    <article 
      className="result-card" 
      style={{ 
        border: isSelected ? "2px solid var(--accent)" : "1px solid var(--line)",
        transform: isSelected ? "translateY(-4px)" : "none",
        boxShadow: isSelected ? "0 12px 24px rgba(99, 102, 241, 0.15)" : "",
        transition: "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
      }}
    >
      <header className="result-card__header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ width: "100%" }}>
          <h3 style={{ margin: "0 0 4px 0", fontSize: "1.3rem", color: "var(--ink)" }}>{place.name}</h3>
          
          {place.vicinity && (
            <p style={{ margin: "0 0 10px 0", fontSize: "0.85rem", color: "var(--muted)", fontWeight: "500" }}>
              📍 {place.vicinity}
            </p>
          )}
          
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

      <footer className="result-card__footer" style={{ marginTop: "auto" }}>
        {isShareMode ? (
          <button 
            className="button" 
            onClick={() => onToggleSelect(place)}
            style={{ 
              width: "100%", 
              backgroundColor: isSelected ? "var(--accent)" : "#f8fafc", 
              color: isSelected ? "#fff" : "var(--ink)",
              border: isSelected ? "none" : "1px solid var(--line)",
              fontWeight: "600",
              fontSize: "15px",
              padding: "12px",
              transition: "all 0.2s"
            }}
          >
            {isSelected ? "✅ נבחר (לחץ להסרה)" : "➕ הוסף להתייעצות"}
          </button>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", width: "100%" }}>
            {onShowMap && (
              <button 
                className="button" 
                onClick={() => onShowMap(place)}
                style={{ backgroundColor: "var(--accent)", color: "#fff", border: "none", fontWeight: "600", fontSize: "14px", padding: "8px" }}
              >
                🗺️ הצג במפה
              </button>
            )}
            <a className="button" href={place.googleSearchUrl} target="_blank" rel="noreferrer" style={{ backgroundColor: "#f0f0f0", color: "#333", textDecoration: "none", fontSize: "14px", textAlign: "center", padding: "8px", fontWeight: "600" }}>
              🔍 תפריט
            </a>
            <a className="button" href={place.wazeUrl} target="_blank" rel="noreferrer" style={{ backgroundColor: "#0099ff", color: "#fff", textDecoration: "none", fontSize: "14px", textAlign: "center", padding: "8px", fontWeight: "600" }}>
              Waze 🚗
            </a>
            <a className="button" href={whatsappUrl} target="_blank" rel="noreferrer" style={{ backgroundColor: "#25D366", color: "#fff", textDecoration: "none", fontSize: "14px", textAlign: "center", padding: "8px", fontWeight: "600" }}>
               וואטסאפ 💬
            </a>
          </div>
        )}
      </footer>
    </article>
  );
}