import AddressInput from "./AddressInput.jsx";

// פונקציית עזר קטנה לעיצוב התגיות בצורה נקייה
const getChipStyle = (isActive) => ({
  padding: "6px 14px",
  borderRadius: "20px",
  border: `1px solid ${isActive ? "#007aff" : "#d1d1d6"}`,
  backgroundColor: isActive ? "#e5f1ff" : "transparent",
  color: isActive ? "#007aff" : "#333",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "0.9rem",
  transition: "all 0.2s ease",
  outline: "none"
});

export default function AddressForm({
  addresses,
  onChange,
  onAdd,
  onRemove,
  onSubmit,
  isLoading,
  // מקבלים את הפילטרים מבחוץ
  minRating, setMinRating,
  requireDineIn, setRequireDineIn,
  includeCarts, setIncludeCarts
}) {
  const filledCount = addresses.filter((address) => (address || "").trim()).length;

  return (
    <form
      className="address-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {addresses.map((address, index) => (
        <AddressInput
          key={index}
          index={index}
          value={address}
          onChange={onChange}
          onRemove={onRemove}
          canRemove={addresses.length > 2}
        />
      ))}

      {/* אזור הפילטרים החדש */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "12px 0 20px 0" }}>
        
        {/* מתג ישיבה */}
        <button
          type="button"
          onClick={() => setRequireDineIn(!requireDineIn)}
          style={getChipStyle(requireDineIn)}
        >
          🪑 ישיבה במקום
        </button>

        {/* מתג עגלות קפה */}
        <button
          type="button"
          onClick={() => setIncludeCarts(!includeCarts)}
          style={getChipStyle(includeCarts)}
        >
          ☕ עגלות קפה
        </button>

        {/* בחירת דירוג */}
        <select
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          style={{
            ...getChipStyle(minRating > 0),
            appearance: "none", // מסתיר את החץ המכוער של הדפדפן
            paddingRight: "14px"
          }}
        >
          <option value={0}>⭐ כל הדירוגים</option>
          <option value={3.5}>⭐ 3.5 ומעלה</option>
          <option value={4.0}>⭐ 4.0 ומעלה</option>
          <option value={4.5}>⭐ 4.5 ומעלה</option>
        </select>
      </div>

      <div className="address-form__actions">
        <button
          type="button"
          className="button button--ghost"
          onClick={onAdd}
          disabled={addresses.length >= 4}
        >
          הוסף כתובת
        </button>
        <button
          type="submit"
          className="button button--primary"
          disabled={isLoading || filledCount < 2}
        >
          מצאו נקודת מפגש
        </button>
      </div>
    </form>
  );
}