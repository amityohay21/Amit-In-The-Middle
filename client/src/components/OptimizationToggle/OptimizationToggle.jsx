import React from "react";

export default function OptimizationToggle({ value, onChange }) {
  return (
    <section className="optimization-toggle">
      <div className="form-header">
        <h2>איך בוחרים את האמצע?</h2>
        <p>בחרו את שיטת החישוב שמתאימה ליציאה שלכם</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        
        {/* שיטה 1: שוויון בנטל */}
        <label
          style={{
            display: "flex",
            gap: "1rem",
            padding: "1.2rem",
            border: value === "minimax" ? "2px solid var(--accent)" : "1px solid var(--line)",
            borderRadius: "16px",
            background: value === "minimax" ? "var(--surface)" : "#f8fafc",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: value === "minimax" ? "0 4px 12px rgba(99, 102, 241, 0.15)" : "none",
            alignItems: "flex-start"
          }}
        >
          <input
            type="radio"
            name="optimization"
            value="minimax"
            checked={value === "minimax"}
            onChange={(e) => onChange(e.target.value)}
            style={{ marginTop: "4px", accentColor: "var(--accent)", transform: "scale(1.2)" }}
          />
          <div>
            <h3 style={{ margin: "0 0 6px 0", color: "var(--ink)", fontSize: "1.1rem" }}>
              ⚖️ שוויון בנטל
            </h3>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.95rem", lineHeight: "1.4" }}>
              כולם נוסעים פחות או יותר אותו הזמן, אף אחד לא אוכל אותה יותר מהשאר.
            </p>
          </div>
        </label>

        {/* שיטה 2: אחד בשביל כולם */}
        <label
          style={{
            display: "flex",
            gap: "1rem",
            padding: "1.2rem",
            border: value === "minavg" ? "2px solid var(--accent)" : "1px solid var(--line)",
            borderRadius: "16px",
            background: value === "minavg" ? "var(--surface)" : "#f8fafc",
            cursor: "pointer",
            transition: "all 0.2s",
            boxShadow: value === "minavg" ? "0 4px 12px rgba(99, 102, 241, 0.15)" : "none",
            alignItems: "flex-start"
          }}
        >
          <input
            type="radio"
            name="optimization"
            value="minavg"
            checked={value === "minavg"}
            onChange={(e) => onChange(e.target.value)}
            style={{ marginTop: "4px", accentColor: "var(--accent)", transform: "scale(1.2)" }}
          />
          <div>
            <h3 style={{ margin: "0 0 6px 0", color: "var(--ink)", fontSize: "1.1rem" }}>
              🦸‍♂️ אחד בשביל כולם וכולם בשביל אחד
            </h3>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.95rem", lineHeight: "1.4" }}>
              חוסך זמן נסיעה כללי לקבוצה, אבל יכול להיות שמישהו אחד ייסע יותר מכולם.
            </p>
          </div>
        </label>

      </div>
    </section>
  );
}