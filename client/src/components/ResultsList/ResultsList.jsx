import { useState, useMemo } from "react";
import ResultCard from "./ResultCard.jsx";

// פונקציית עזר לעיצוב כפתורי הצ'קליסט (שייראו כמו תגיות אלגנטיות)
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
      style={{ display: "none" }} // מסתירים את הריבוע המכוער של הדפדפן
    />
    {checked ? "✓ " : ""}{label}
  </label>
);

// הוספנו את participants לפרופס שהקומפוננטה מקבלת!
export default function ResultsList({ results, searchRadius, participants }) {
  // המצבים של הצ'קליסט - כברירת מחדל הכל מסומן (מוצג)
  const [categories, setCategories] = useState({
    cafe: true,
    restaurant: true,
    bar: true,
    cart: true,
  });
  
  const [sortByRating, setSortByRating] = useState(false);

  // סינון ומיון משולבים שעובדים מדויק ומהר על המכשיר (Client-side)
  const filteredAndSortedResults = useMemo(() => {
    if (!results) return [];

    const filtered = results.filter((place) => {
      const types = place.types || [];
      const name = (place.name || "").toLowerCase();
      
      const isCart = name.includes("עגלת קפה") || name.includes("food truck");
      const isBar = types.includes("bar") || types.includes("night_club") || types.includes("pub") || types.includes("liquor_store") || name.includes("בר") || name.includes("פאב") || name.includes("bar");
      const isCafe = types.includes("cafe");
      const isRestaurant = types.includes("restaurant") && !isCafe && !isBar && !isCart;

      // בודקים אם הקטגוריה של המקום כרגע מסומנת ב-V אצל המשתמש
      if (isCart) return categories.cart;
      if (isBar) return categories.bar;
      if (isCafe) return categories.cafe;
      if (isRestaurant) return categories.restaurant;
      
      // אם גוגל החזיר מקום לא מוגדר, נציג אותו אם לפחות בתי קפה או מסעדות מסומנים
      return categories.restaurant || categories.cafe;
    });

    if (sortByRating) {
      return [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return filtered;
  }, [results, categories, sortByRating]);

  // פונקציית עזר לשינוי מצב של צ'ק-בוקס ספציפי
  const toggleCategory = (key) => {
    setCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!results) return null;

  return (
    <section className="results">
      <header className="results__header">
        <h2>תוצאות</h2>
        {searchRadius != null ? (
          <p>רדיוס חיפוש: {Math.round(searchRadius / 1000)} ק״מ</p>
        ) : null}
      </header>

      {/* סרגל סינונים ומיון */}
      <div className="filters-bar" style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        
        {/* כפתורי הצ'קליסט החדשים שלנו */}
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
            // הנה ההזרקה של המשתתפים לתוך הכרטיסייה!
            <ResultCard key={place.placeId} place={place} participants={participants} />
          ))
        ) : (
          <p className="empty-state">אין מקומות העונים על תנאי הסינון שנבחרו.</p>
        )}
      </div>
    </section>
  );
}