import { useState, useMemo } from "react";
import ResultCard from "./ResultCard.jsx";

export default function ResultsList({ results, searchRadius }) {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortByRating, setSortByRating] = useState(false);

  // סינון ומיון משולבים שעובדים מדויק
  const filteredAndSortedResults = useMemo(() => {
    if (!results) return [];

    // שלב 1: סינון מדויק לפי הקטגוריה שנבחרה
    const filtered = results.filter((place) => {
      if (categoryFilter === "all") return true;

      const types = place.types || [];
      const name = (place.name || "").toLowerCase();
      
      if (categoryFilter === "cafe") {
        return types.includes("cafe");
      }
      if (categoryFilter === "restaurant") {
        return types.includes("restaurant") && !types.includes("cafe");
      }
      if (categoryFilter === "bar") {
        // בודק גם סוגי ברים שונים של גוגל וגם אם המילה בר/פאב מופיעה בשם המקום
        return (
          types.includes("bar") || 
          types.includes("night_club") || 
          types.includes("pub") || 
          types.includes("liquor_store") ||
          name.includes("בר") ||
          name.includes("פאב") ||
          name.includes("bar")
        );
      }

      return true;
    });

    // שלב 2: מיון לפי דירוג (אם המשתמש לחץ על כפתור המיון)
    if (sortByRating) {
      return [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return filtered;
  }, [results, categoryFilter, sortByRating]);

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
      <div className="filters-bar" style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <label style={{ marginLeft: "8px", fontWeight: "bold" }}>קטגוריה:</label>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #ccc" }}
          >
            <option value="all">הכל</option>
            <option value="cafe">בית קפה בלבד</option>
            <option value="restaurant">מסעדה בלבד</option>
            <option value="bar">בר בלבד</option>
          </select>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setSortByRating(!sortByRating)}
            style={{
              padding: "7px 14px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: sortByRating ? "#ff9800" : "#fff",
              color: sortByRating ? "#fff" : "#333",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            {sortByRating ? "⭐ ממוין לפי דירוג (בטל מיון)" : "📊 מיין לפי דירוג על פני מרחק"}
          </button>
        </div>
      </div>

      <div className="results__list">
        {filteredAndSortedResults.length > 0 ? (
          filteredAndSortedResults.map((place) => (
            <ResultCard key={place.placeId} place={place} />
          ))
        ) : (
          <p className="empty-state">אין מקומות העונים על תנאי הסינון שנבחרו.</p>
        )}
      </div>
    </section>
  );
}