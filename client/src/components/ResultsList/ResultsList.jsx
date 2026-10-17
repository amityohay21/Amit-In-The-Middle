import { useState, useMemo } from "react";
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

  const filteredAndSortedResults = useMemo(() => {
    if (!results) return [];

    // 1. קודם כל מבצעים את הסינון (פילטרים)
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

    // פונקציית עזר לחישוב "רמת ההוגנות" (הפער בין הזמן הכי ארוך להכי קצר)
    const getTimeGap = (place) => {
      if (!place.travelTimes || place.travelTimes.length === 0) return 0;
      const times = place.travelTimes.map(t => t.durationMinutes);
      // מחשבים: מקסימום דקות פחות מינימום דקות (פער קטן = יותר הוגן)
      return Math.max(...times) - Math.min(...times);
    };

    // 2. מבצעים את המיון
    if (sortByRating) {
      // אם המשתמש לחץ על כפתור המיון לפי דירוג -> ממיינים לפי ציון גוגל
      return [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // ברירת המחדל המנצחת: ממיינים מהפער הקטן ביותר (הכי הוגן) לגדול ביותר
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

      <div className="results__list">
        {filteredAndSortedResults.length > 0 ? (
          filteredAndSortedResults.map((place) => (
            <ResultCard key={place.placeId} place={place} participants={participants} />
          ))
        ) : (
          <p className="empty-state">אין מקומות העונים על תנאי הסינון שנבחרו.</p>
        )}
      </div>
    </section>
  );
}