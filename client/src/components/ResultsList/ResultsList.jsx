import React, { useState, useMemo } from "react";
import ResultCard from "./ResultCard.jsx";
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from "@react-google-maps/api";

const cleanMapStyle = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }, 
  { featureType: "transit", stylers: [{ visibility: "off" }] }, 
  { featureType: "landscape", stylers: [{ color: "#f8fafc" }] }, 
  { featureType: "water", stylers: [{ color: "#e2e8f0" }] }, 
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] }, 
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] } 
];

const extractCoords = (item) => {
  if (!item) return null;
  const lat = item.lat ?? item.latitude ?? item.location?.lat ?? item.geometry?.location?.lat ?? item.coords?.lat;
  const lng = item.lng ?? item.longitude ?? item.location?.lng ?? item.geometry?.location?.lng ?? item.coords?.lng;
  
  if (lat !== undefined && lng !== undefined) {
    const numLat = typeof lat === 'function' ? lat() : Number(lat);
    const numLng = typeof lng === 'function' ? lng() : Number(lng);
    if (!isNaN(numLat) && !isNaN(numLng)) return { lat: numLat, lng: numLng };
  }
  return null;
};

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
    <input type="checkbox" checked={checked} onChange={onChange} style={{ display: "none" }} />
    {checked ? "✓ " : ""}{label}
  </label>
);

export default function ResultsList({ results, searchRadius, participants }) {
  const [categories, setCategories] = useState({ cafe: true, restaurant: true, bar: true, cart: true });
  const [sortByRating, setSortByRating] = useState(false);
  
  const [isShareMode, setIsShareMode] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [mapPlace, setMapPlace] = useState(null); 

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_JS_KEY || "", 
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

  const mapPlaceCoords = mapPlace ? extractCoords(mapPlace) : null;
  const fallbackCoords = { lat: 32.0853, lng: 34.7818 }; 

  if (!results) return null;

  return (
    <section className="results">
      <header className="results__header">
        <h2>תוצאות</h2>
      </header>

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
              onShowMap={(p) => setMapPlace(p)}
            />
          ))
        ) : (
          <p className="empty-state">אין מקומות העונים על תנאי הסינון שנבחרו.</p>
        )}
      </div>

      {mapPlace && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", 
          justifyContent: "center", alignItems: "center", padding: "16px", backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: "#fff", width: "100%", maxWidth: "700px", 
            borderRadius: "16px", overflow: "hidden", 
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column"
          }}>
            <div style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--ink)" }}>{mapPlace.name}</h3>
              <button onClick={() => setMapPlace(null)} style={{ background: "none", border: "none", fontSize: "1.8rem", cursor: "pointer", color: "var(--muted)", lineHeight: 1 }}>&times;</button>
            </div>

            {/* התיקון הקריטי: גובה מפורש ומוחלט כדי למנוע את באג המסך הלבן */}
            <div style={{ width: "100%", height: "55vh", minHeight: "350px", maxHeight: "500px", position: "relative" }}>
              {!isLoaded ? (
                <div style={{ display: "flex", height: "100%", justifyContent: "center", alignItems: "center" }}>טוען מפה...</div>
              ) : (
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: "100%" }}
                  center={mapPlaceCoords || fallbackCoords}
                  zoom={12}
                  options={{ disableDefaultUI: true, zoomControl: true, styles: cleanMapStyle }}
                >
                  {/* נעץ העסק (כחול) מאובטח עם HTTPS */}
                  {mapPlaceCoords && (
                    <MarkerF
                      position={mapPlaceCoords}
                      zIndex={999}
                      icon={{ url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
                    />
                  )}

                  {/* נעצי המשתתפים (אדומים) מאובטחים עם HTTPS */}
                  {mapPlace.travelTimes?.map((item, idx) => {
                    const pIndex = item.participantIndex !== undefined ? item.participantIndex : idx;
                    const p = participants[pIndex];
                    const pCoords = extractCoords(p);
                    
                    if (!pCoords) return null;

                    return (
                      <div key={pIndex}>
                        <MarkerF 
                          position={pCoords} 
                          icon={{ url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png" }}
                        />
                        <InfoWindowF position={pCoords} options={{ disableAutoPan: true }}>
                          <div style={{ padding: "2px", fontWeight: "600", color: "#333", fontSize: "14px", textAlign: "center", lineHeight: "1.4" }}>
                            {p.name || `משתתף ${pIndex + 1}`} <br/> 
                            <span style={{color: "var(--muted)"}}>🚗 {item.durationMinutes} דק'</span>
                          </div>
                        </InfoWindowF>
                      </div>
                    );
                  })}
                </GoogleMap>
              )}
            </div>
            
            <div style={{ padding: "16px", display: "flex", justifyContent: "center", background: "#f8fafc" }}>
              <a className="button" href={mapPlace.wazeUrl} target="_blank" rel="noreferrer" style={{ backgroundColor: "#0099ff", color: "#fff", textDecoration: "none", fontSize: "15px", fontWeight: "600", padding: "10px 24px", borderRadius: "24px", width: "100%", textAlign: "center" }}>
                נווט לנקודת האמצע עם Waze 🚗
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}