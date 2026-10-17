import React from "react";

const getChipStyle = (isActive) => ({
  padding: "8px 16px",
  borderRadius: "999px",
  border: isActive ? "none" : "1px solid #e0d8d0",
  backgroundColor: isActive ? "var(--accent-light)" : "var(--surface)",
  color: isActive ? "var(--accent-dark)" : "var(--muted)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "0.95rem",
  fontWeight: isActive ? "600" : "500",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: isActive ? "0 4px 12px rgba(255, 107, 53, 0.15)" : "none",
  outline: "none"
});

export default function AddressForm({
  participants,
  onChange,
  onAdd,
  onRemove,
  onSubmit,
  isLoading,
  minRating, setMinRating,
  requireDineIn, setRequireDineIn,
  includeCarts, setIncludeCarts,
  openNow, setOpenNow 
}) {
  const filledCount = participants.filter((p) => (p.address || "").trim()).length;

  return (
    <form
      className="address-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div className="form-header">
        <h2>הסוף לריב הקבוע בוואטסאפ 🎯</h2>
        <p>הזינו שמות וכתובות, ואנחנו נמצא את האמצע המושלם בשבילכם.</p>
      </div>

      <div className="participants-list">
        {participants.map((participant, index) => (
          <div key={index} className="participant-row">
            <div className="participant-inputs">
              <input
                type="text"
                className="input-name"
                placeholder={index === 0 ? "שם (למשל: עמית)" : index === 1 ? "שם (למשל: עדן)" : "שם"}
                value={participant.name}
                onChange={(e) => onChange(index, "name", e.target.value)}
              />
              <input
                type="text"
                className="input-address"
                placeholder="כתובת / עיר"
                value={participant.address}
                onChange={(e) => onChange(index, "address", e.target.value)}
              />
            </div>
            {participants.length > 2 && (
              <button
                type="button"
                className="button--remove"
                onClick={() => onRemove(index)}
                title="הסר"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "20px 0" }}>
        <button type="button" onClick={() => setOpenNow(!openNow)} style={getChipStyle(openNow)}>
          🟢 פתוח עכשיו
        </button>
        <button type="button" onClick={() => setRequireDineIn(!requireDineIn)} style={getChipStyle(requireDineIn)}>
          🪑 ישיבה במקום
        </button>
        <button type="button" onClick={() => setIncludeCarts(!includeCarts)} style={getChipStyle(includeCarts)}>
          ☕ עגלות קפה
        </button>
        <select
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          style={{ ...getChipStyle(minRating > 0), appearance: "none", paddingRight: "16px" }}
        >
          <option value={0}>⭐ כל הדירוגים</option>
          <option value={3.5}>⭐ 3.5 ומעלה</option>
          <option value={4.0}>⭐ 4.0 ומעלה</option>
          <option value={4.5}>⭐ 4.5 ומעלה</option>
        </select>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
        <button type="button" className="button button--ghost" onClick={onAdd} disabled={participants.length >= 4}>
          + הוסף חבר/ה
        </button>
        <button type="submit" className="button button--primary" disabled={isLoading || filledCount < 2}>
          מצאו נקודת מפגש
        </button>
      </div>
    </form>
  );
}