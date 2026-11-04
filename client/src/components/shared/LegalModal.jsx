import React, { useState } from "react";

export default function LegalModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <footer style={{
        marginTop: "3rem",
        padding: "1.5rem 0",
        textAlign: "center",
        borderTop: "1px solid var(--line)",
        fontSize: "0.85rem",
        color: "var(--muted)"
      }}>
        <p style={{ margin: "0 0 0.4rem 0" }}>
          © {new Date().getFullYear()} <strong>Meet In The Middle</strong>. כל הזכויות שמורות.
        </p>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            background: "none",
            border: "none",
            color: "var(--accent-dark)",
            cursor: "pointer",
            textDecoration: "underline",
            fontSize: "0.85rem",
            fontFamily: "inherit"
          }}
        >
          תנאי שימוש, פרטיות ועוגיות
        </button>
      </footer>

      {isOpen && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "1rem"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "20px",
            maxWidth: "680px",
            width: "100%",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            textAlign: "right",
            direction: "rtl"
          }}>
            <header style={{
              padding: "1.2rem 1.5rem",
              borderBottom: "1px solid var(--line)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <h2 style={{ margin: 0, fontSize: "1.25rem", color: "var(--ink)" }}>תנאי שימוש ומדיניות פרטיות</h2>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  fontSize: "1rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </button>
            </header>

            <div style={{
              padding: "1.5rem",
              overflowY: "auto",
              fontSize: "0.92rem",
              lineHeight: "1.6",
              color: "#334155"
            }}>
              <h3 style={{ color: "var(--ink)", marginTop: 0 }}>1. כללי ותנאי שימוש</h3>
              <p>
                השירות באפליקציית <strong>Meet In The Middle</strong> (בכתובת meetinthemiddleapp.com) ניתן לשימוש "כפי שהוא" (AS-IS). הנתונים וזמני הנסיעה מתקבלים מצדדים שלישיים (Google Maps Platform, Waze) ואינם באחריות הנהלת האתר. אין לראות בזמני ההגעה או בנתוני בתי העסק התחייבות מכל סוג שהוא.
              </p>

              <h3 style={{ color: "var(--ink)" }}>2. מדיניות פרטיות (ללא שמירת נתונים)</h3>
              <p>
                אנו דוגלים בפרטיות מוחלטת: השמות והכתובות המוזנים במערכת מעובדים בזמן אמת בזיכרון השרת לצורך חישוב נקודת האמצע בלבד. <strong>אנו לא שומרים את הכתובות או המיקומים שלכם באף בסיס נתונים.</strong> המידע נמחק מזיכרון השרת מיד בתום הפקת התוצאות.
              </p>
              <p>
                הכתובות מועברות ישירות ל-Google Maps API לצורך חישוב זמני הנסיעה והצגת המקומות בהתאם למדיניות הפרטיות של Google.
              </p>

              <h3 style={{ color: "var(--ink)" }}>3. מדיניות עוגיות (Cookies)</h3>
              <p>
                האתר אינו עושה שימוש בעוגיות למטרות מעקב מסחרי, פרסום או שיווק מחדש. נעשה שימוש ברכיבי זיכרון מקומי (Local Storage) או עוגיות טכניות הכרחיות בלבד לצורך תפעול תקין של ממשק האתר והגנת שרתים.
              </p>

              <h3 style={{ color: "var(--ink)" }}>4. קניין רוחני</h3>
              <p>
                כל זכויות היוצרים, המיתוג וקוד המקור שמורים ל-Meet In The Middle. אין להעתיק או לעשות שימוש מסחרי בשירות ללא רשות מפורשת מראש.
              </p>
            </div>

            <footer style={{
              padding: "1rem 1.5rem",
              borderTop: "1px solid var(--line)",
              textAlign: "left"
            }}>
              <button
                className="button button--primary"
                onClick={() => setIsOpen(false)}
                style={{ padding: "0.6rem 1.4rem", fontSize: "0.9rem" }}
              >
                הבנתי, תודה
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}