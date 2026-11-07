import React, { useState } from "react";
import AddressInput from "./AddressInput";

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
  // סטייט מקומי שעוקב מי מהמשתתפים סיים לבחור מהרשימה (true) ומי רק מקליד (false)
  const [resolvedStatus, setResolvedStatus] = useState([]);

  // סופר כמה שדות כתובת מלאים יש
  const filledCount = participants.filter((p) => (p.address || "").trim()).length;

  // בודק אם יש לפחות משתתף אחד שהתחיל להקליד אבל לא בחר מהרשימה הקופצת
  const hasUnresolvedAddresses = participants.some((p, index) => {
    const text = p.address || "";
    if (text.trim().length === 0) return false; // שדה ריק לחלוטין הוא תקין (לא מעכב)
    return !resolvedStatus[index]; // אם יש טקסט אבל הסטטוס הוא false = חצי אפוי
  });

  // הטופס תקין אך ורק אם יש לפחות 2 אנשים, ואף כתובת לא נשארה "חצי אפויה"
  const isFormValid = filledCount >= 2 && !hasUnresolvedAddresses;

  return (
    <form
      className="address-form"
      onSubmit={(event) => {
        event.preventDefault();
        // חסימת קריאת השרת ברמת הטופס כדי למנוע את הודעת ה"עומס רגעי"
        if (isFormValid) onSubmit();
      }}
    >
      <div className="form-header">
        <h2>מחשבים מסלול הוגן לכולם ⚖️</h2>
        <p>הזינו שמות וכתובות, ואנחנו נמצא את האמצע המושלם בשבילכם.</p>
      </div>

      <div className="participants-list">
        {participants.map((participant, index) => {
          const text = participant.address || "";
          // הגדרת השדה הנוכחי כבעייתי אם יש בו טקסט והוא לא אושר מהרשימה
          const isInvalid = text.trim().length > 0 && !resolvedStatus[index]; 

          return (
            <div key={index} className="participant-row">
              <div className="participant-inputs">
                <input
                  type="text"
                  className="input-name"
                  placeholder={index === 0 ? "שם (למשל: עמית)" : index === 1 ? "שם (למשל: עדן)" : "שם"}
                  value={participant.name}
                  onChange={(e) => onChange(index, "name", e.target.value)}
                />
                
                <AddressInput
                  className="input-address"
                  placeholder={index === 0 ? "כתובת (למשל: האמהות 1, נס ציונה)" : "כתובת (למשל: תל אביב)"}
                  value={participant.address}
                  onChange={(newAddress, isResolved) => {
                    // עדכון הסטייט המרכזי (טקסט)
                    onChange(index, "address", newAddress);
                    // עדכון הסטייט המקומי (האם נבחר מגוגל)
                    setResolvedStatus(prev => {
                      const next = [...prev];
                      next[index] = isResolved;
                      return next;
                    });
                  }}
                  style={{
                    // אם המשתמש התחיל להקליד ולא בחר - המסגרת תאדים
                    border: isInvalid ? '2px solid #ef4444' : undefined,
                    backgroundColor: isInvalid ? '#fef2f2' : undefined
                  }}
                />
              </div>
              
              {participants.length > 2 && (
                <button
                  type="button"
                  className="button--remove"
                  onClick={() => {
                    onRemove(index);
                    // אם מחקנו משתתף, אנחנו מנקים את הסטטוס שלו כדי שהמערך יישאר מסונכרן
                    setResolvedStatus(prev => prev.filter((_, i) => i !== index));
                  }}
                  title="הסר"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
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

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", alignItems: "flex-start" }}>
        <button type="button" className="button button--ghost" onClick={onAdd} disabled={participants.length >= 4}>
          + הוסף חבר/ה
        </button>
        
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flex: 1, marginLeft: "15px" }}>
          <button 
            type="submit" 
            className="button button--primary"
            disabled={isLoading || !isFormValid}
            style={{
              // כפתור אפור כאשר חסרה בחירה, וכחול כשהכל מוכן
              backgroundColor: isFormValid ? 'var(--accent)' : '#d1d5db',
              color: isFormValid ? '#fff' : '#6b7280',
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              opacity: isFormValid ? 1 : 0.8,
              width: '100%',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            מצאו נקודת מפגש
          </button>
          
          {/* הודעת השגיאה שתחליף את חלון העומס - מופיעה רק כשיש כתובת חצי-אפויה */}
          {hasUnresolvedAddresses && (
            <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: '600', marginTop: '6px', textAlign: 'left' }}>
              * חובה לבחור את הכתובות המודגשות מהרשימה
            </span>
          )}
        </div>
      </div>
    </form>
  );
}