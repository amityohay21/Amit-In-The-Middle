import React, { useState, useEffect } from "react";
import "./StoryLoader.css";

// הוצאנו את משפטי ברירת המחדל החוצה. 
// עכשיו הקומפוננטה מקבלת את messages כפרמטר (Prop), ואם לא העבירו לה - היא משתמשת באלו.
const DEFAULT_MESSAGES = [
  "מאתר את האזור ההוגן ביותר לכולם...",
  "מחשב זמני נסיעה ופקקים...",
  "סורק בתי קפה ומסעדות שוות...",
  "מסנן לפי ההעדפות שלכם...",
  "מרכיב את ההמלצות הסופיות..."
];

export default function Loader({ messages = DEFAULT_MESSAGES }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // 1. טיפול בנעילת הגלילה של הדף ברקע
    document.body.style.overflow = "hidden";

    // 2. הפעלת הטיימר של המשפטים
    const timer = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 1800);

    // 3. פונקציית הניקוי (Cleanup) כשהטעינה מסתיימת והחלון נסגר
    return () => {
      clearInterval(timer);
      document.body.style.overflow = "unset"; // משחרר את נעילת הגלילה
    };
  }, [messages.length]);

  return (
    <div className="loader-overlay">
      <div 
        className="loader-modal" 
        role="status" 
        aria-live="polite"
      >
        <div className="loader__spinner"></div>
        <span className="loader__text">
          {messages[messageIndex]}
        </span>
      </div>
    </div>
  );
}