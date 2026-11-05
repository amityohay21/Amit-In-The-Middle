import React, { useState, useMemo } from "react";
import ResultCard from "./ResultCard.jsx";
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from "@react-google-maps/api";

const FilterChip = ({ label, checked, onChange }) => (
  <label style={{
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "6px 14px", borderRadius: "20px",
    border: `1px solid ${checked ? "var(--accent)" : "#ccc"}`,
    background: checked ? "#eef2ff" : "#fff",
    color: checked ? "var(--accent)" : "#555",
    cursor: "pointer", fontSize: "14px", userSelect: "none",
    transition: "all 0.2s"
  }}>
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={onChange} 
      style={{ display: "none" }} 
    />
    {checked ? "✓ " : ""}{label}
  </label>
);

export default function ResultsList({ results, searchRadius, participants }) {
  const [categories, setCategories] = useState({ cafe: true, restaurant: true, bar: true, cart: true });
  const [sortByRating, setSortByRating] = useState(false);
  
  // --- ניהול מצבי התייעצות ומפה ---
  const [isShareMode, setIsShareMode] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [mapPlace, setMapPlace] = useState(null); // המקום שמוצג כרגע במפה

  // טעינת הסקריפט של גוגל מפות
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_JS_KEY || "", // שואב את המפתח מקובץ ה-.env
  });

  const toggleSelection = (place) => {
    const isSelected = selectedPlaces.some(p => p.placeId === place.placeId);
    if (isSelected) {
      setSelectedPlaces(selectedPlaces.filter(p => p.placeId !== place.placeId));
    } else {
      if (selectedPlaces.length < 3) {
        setSelectedPlaces([...selectedPlaces, place]);
      } else {
        alert("ניתן לבחור עד 3 מקומות להתייעצות.");
      }
    }
  };

  const handleShareWhatsApp = () => {
    if (selectedPlaces.length === 0) return;
    let text = "היי! מצאתי כמה מקומות שיוצאים בדיוק באמצע הדרך לכולנו דרך Meet In The Middle 📍 איפה יושבים?\n\n";
    selectedPlaces.forEach((place, index) => {
      const maxTime = Math.max(...place.travelTimes.map(t => t.durationMinutes));
      text += `${index + 1}️⃣ *${place.name}*\n🚗 עד ${maxTime} דק' נסיעה לכולם\n🌐 פרטים ותפריט: ${place.googleSearchUrl}\n\n`;
    });
    text += "תצביעו! 🎯";
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
    setIsShareMode(false);
    setSelectedPlaces([]);
  };

  const filteredAndSortedResults = useMemo(() => {
    if (!results) return [];
    const filtered = results.filter((place) => {
      const types = place.types || [];
      const name = (place.name || "").toLowerCase();
      const isCart = name.includes("עגלת קפה") || name.includes("food truck");
      const isBar = types.includes("bar") || types.includes("night_club") || types.includes("pub") || types.includes("liquor_store") || name.includes("בר") || name.includes("פאב") || name.includes("bar");
      const isCafe = types.includes("cafe");
      const isRestaurant = types.includes("restaurant") && !isCafe && !isBar && !isCart;

      if (isCart) return categories.cart;
      if (isBar) return categories.bar;
      if (isCafe) return categories.cafe;
      if (isRestaurant) return categories.restaurant;
      return categories.restaurant || categories.cafe;
    });

    const getTimeGap = (place) => {
      if (!place.travelTimes || place.travelTimes.length === 0) return 0;
      const times = place.travelTimes.map(t => t.durationMinutes);
      return Math.max(...times) - Math.min(...times);
    };

    if (sortByRating) {
      return [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      return [...filtered].sort((a, b) => getTimeGap(a) - getTimeGap(b));
    }
  }, [results, categories, sortByRating]);

  const toggleCategory = (key) => setCategories(prev => ({ ...prev, [key]: !prev[key] }));

  if (!results) return null;

  return (
    <section className="results">
      <header className="results__header">
        <h2>תוצאות</h2>
      </header>

      {/* באנר התייעצות קבוצתית */}
      <div style={{ background: "var(--surface)", padding: "16px", borderRadius: "16px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "1px solid var(--line)", flexWrap: "wrap", gap: "12px" }}>
        {isShareMode ? (
          <>
            <div>
              <h3 style={{ margin: "0 0 4px 0", color: "var(--accent-dark)", fontSize: "1.1rem" }}>מצב התייעצות</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--muted)" }}>בחר עד 3 מקומות לשיתוף בקבוצה</p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button className="button" onClick={() => {setIsShareMode(false); setSelectedPlaces([]);}} style={{ backgroundColor: "#FFE4E6", color: "var(--danger)", padding: "8px 16px" }}>ביטול</button>
              <button className="button button--primary" onClick={handleShareWhatsApp} disabled={selectedPlaces.length === 0} style={{ padding: "8px 16px" }}>
                שלח לוואטסאפ ({selectedPlaces.length}/3)
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h3 style={{ margin: "0 0 4px 0", color: "var(--ink)", fontSize: "1.1rem" }}>רוצה להתייעץ עם כולם?</h3>
              <p style={{ margin: 0, fontSize: "14px", color: "var(--muted)" }}>צור הודעת בחירה ישר לוואטסאפ</p>
            </div>
            <button className="button button--primary" onClick={() => setIsShareMode(true)} style={{ padding: "8px 16px" }}>
              💬 התייעצות בקבוצה
            </button>
          </>
        )}
      </div>

      {/* פילטרים */}
      <div className="filters-bar" style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <FilterChip label="בתי קפה" checked={categories.cafe} onChange={() => toggleCategory("cafe")} />
        <FilterChip label="מסעדות" checked={categories.restaurant} onChange={() => toggleCategory("restaurant")} />
        <FilterChip label="ברים" checked={categories.bar} onChange={() => toggleCategory("bar")} />
        <FilterChip label="עגלות קפה" checked={categories.cart} onChange={() => toggleCategory("cart")} />

        <div style={{ marginRight: "auto" }}>
          <button
            type="button"
            onClick={() => setSortByRating(!sortByRating)}
            style={{ padding: "7px 14px", borderRadius: "20px", border: `1px solid ${sortByRating ? "#ff9800" : "#ccc"}`, background: sortByRating ? "#fff3e0" : "#fff", color: sortByRating ? "#ff9800" : "#333", cursor: "pointer", fontWeight: "bold", transition: "all 0.2s" }}
          >
            {sortByRating ? "⭐ ממוין לפי דירוג" : "📊 מיין לפי דירוג"}
          </button>
        </div>
      </div>

      {/* רשימת המקומות */}
      <div className="results__list">
        {filteredAndSortedResults.length > 0 ? (
          filteredAndSortedResults.map((place) => (
            <ResultCard 
              key={place.placeId} 
              place={place} 
              participants={participants}
              isShareMode={isShareMode}
              isSelected={selectedPlaces.some(p => p.placeId === place.placeId)}
              onToggleSelect={toggleSelection}
              onShowMap={(p) => setMapPlace(p)} // פתיחת מודל המפה
            />
          ))
        ) : (
          <p className="empty-state">אין מקומות העונים על תנאי הסינון שנבחרו.</p>
        )}
      </div>

      {/* --- מודל מפה צף (Map Modal) --- */}
      {mapPlace && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", 
          justifyContent: "center", alignItems: "center", padding: "16px", backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: "#fff", width: "100%", maxWidth: "700px", borderRadius: "16px",
            overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column"
          }}>
            {/* כותרת החלונית */}
            <div style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--ink)" }}>{mapPlace.name}</h3>
              <button onClick={() => setMapPlace(null)} style={{ background: "none", border: "none", fontSize: "1.8rem", cursor: "pointer", color: "var(--muted)", lineHeight: 1 }}>&times;</button>
            </div>

            {/* שטח המפה */}
            <div style={{ width: "100%", height: "450px", position: "relative" }}>
              {!isLoaded ? (
                <div style={{ display: "flex", height: "100%", justifyContent: "center", alignItems: "center" }}>טוען מפה...</div>
              ) : (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={{
                    lat: mapPlace.geometry?.location?.lat || mapPlace.location?.lat || mapPlace.lat || 32.0853,
                    lng: mapPlace.geometry?.location?.lng || mapPlace.location?.lng || mapPlace.lng || 34.7818
                  }}
                  zoom={12}
                  options={{ disableDefaultUI: true, zoomControl: true }}
                >
                  {/* נעץ כחול למקום העסק */}
                  <MarkerF
                    position={{
                      lat: mapPlace.geometry?.location?.lat || mapPlace.location?.lat || mapPlace.lat || 32.0853,
                      lng: mapPlace.geometry?.location?.lng || mapPlace.location?.lng || mapPlace.lng || 34.7818
                    }}
                    icon={{ url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
                  />

                  {/* נעצים אפורים + בלוני מידע לחברים */}
                  {mapPlace.travelTimes?.map((item) => {
                    const p = participants[item.participantIndex];
                    if (!p) return null;
                    const pLat = p.geometry?.location?.lat || p.location?.lat || p.lat;
                    const pLng = p.geometry?.location?.lng || p.location?.lng || p.lng;
                    if (!pLat || !pLng) return null;

                    const pos = { lat: pLat, lng: pLng };
                    // SVG של נעץ אפור נקי
                    const grayPinSvg = `data:image/svg+xml;utf-8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="%23888888" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;

                    return (
                      <div key={item.participantIndex}>
                        <MarkerF position={pos} icon={{ url: grayPinSvg }} />
                        <InfoWindowF position={pos} options={{ disableAutoPan: true }}>
                          <div style={{ padding: "2px", fontWeight: "600", color: "#333", fontSize: "14px", textAlign: "center", lineHeight: "1.4" }}>
                            {p.name} <br/> <span style={{color: "var(--muted)"}}>🚗 {item.durationMinutes} דק'</span>
                          </div>
                        </InfoWindowF>
                      </div>
                    );
                  })}
                </GoogleMap>
              )}
            </div>
            
            {/* כפתור ניווט מהיר בתחתית המודל */}
            <div style={{ padding: "16px", display: "flex", justifyContent: "center", background: "#f8fafc" }}>
              <a className="button" href={mapPlace.wazeUrl} target="_blank" rel="noreferrer" style={{ backgroundColor: "#0099ff", color: "#fff", textDecoration: "none", fontSize: "15px", fontWeight: "600", padding: "10px 24px", borderRadius: "24px" }}>
                נווט לנקודת האמצע עם Waze 🚗
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}