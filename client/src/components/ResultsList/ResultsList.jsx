import React, { useState, useMemo } from "react";
import ResultCard from "./ResultCard.jsx";

const FilterChip = ({ label, checked, onChange }) => (
  <label style={{
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "6px 14px", borderRadius: "20px",
    border: `1px solid ${checked ? "#007aff" : "#ccc"}`,
    background: checked ? "#e5f1ff" : "#fff",
    color: checked ? "#007aff" : "#555",
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
  const [categories, setCategories] = useState({
    cafe: true,
    restaurant: true,
    bar: true,
    cart: true,
  });
  
  const [sortByRating, setSortByRating] = useState(false);
  
  const [isShareMode, setIsShareMode] = useState(false);
  const [selectedPlaces, setSelectedPlaces] = useState([]);

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
    
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
    
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

  const toggleCategory = (key) => {
    setCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

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

      {/* סרגל סינון */}
      <div className="filters-bar" style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <FilterChip label="בתי קפה" checked={categories.cafe} onChange={() => toggleCategory("cafe")} />
        <FilterChip label="מסעדות" checked={categories.restaurant} onChange={() => toggleCategory("restaurant")} />
        <FilterChip label="ברים" checked={categories.bar} onChange={() => toggleCategory("bar")} />
        <FilterChip label="עגלות קפה" checked={categories.cart} onChange={() => toggleCategory("cart")} />

        <div style={{ marginRight: "auto" }}>
          <button
            type="button"
            onClick={() => setSortByRating(!sortByRating)}
            style={{
              padding: "7px 14px",
              borderRadius: "20px",
              border: `1px solid ${sortByRating ? "#ff9800" : "#ccc"}`,
              background: sortByRating ? "#fff3e0" : "#fff",
              color: sortByRating ? "#ff9800" : "#333",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "all 0.2s"
            }}
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
            />
          ))
        ) : (
          <p className="empty-state">אין מקומות העונים על תנאי הסינון שנבחרו.</p>
        )}
      </div>
    </section>
  );
}