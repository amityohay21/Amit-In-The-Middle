import React, { useState, useEffect } from "react";

const STORY_MESSAGES = [
  "מאתר את האזור ההוגן ביותר לכולם...",
  "מחשב זמני נסיעה ופקקים...",
  "סורק בתי קפה ומסעדות שוות...",
  "מסנן לפי ההעדפות שלכם...",
  "מרכיב את ההמלצות הסופיות..."
];

export default function Loader() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // מתחלף כל 1.8 שניות כדי לייצר תחושה של עבודה מתקדמת
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % STORY_MESSAGES.length);
    }, 1800);

    // ניקוי הטיימר כשהקומפוננטה (ההמתנה) מסתיימת
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="loader" 
      role="status" 
      aria-live="polite"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2.5rem 1rem",
        gap: "1.2rem",
        background: "var(--surface)",
        borderRadius: "24px",
        border: "1px solid rgba(255, 255, 255, 0.8)",
        boxShadow: "0 12px 32px rgba(45, 42, 38, 0.04)",
        marginTop: "1.2rem",
        textAlign: "center"
      }}
    >
      {/* ספינר מוגדל ואלגנטי יותר */}
      <div 
        className="loader__spinner" 
        style={{ 
          width: "42px", 
          height: "42px", 
          borderWidth: "3px",
          borderColor: "var(--line)",
          borderTopColor: "var(--accent)" 
        }} 
      />
      
      {/* הטקסט המתחלף */}
      <span 
        style={{ 
          fontSize: "1.15rem", 
          fontWeight: "500", 
          color: "var(--accent-dark)",
          transition: "opacity 0.3s ease"
        }}
      >
        {STORY_MESSAGES[messageIndex]}
      </span>
    </div>
  );
}