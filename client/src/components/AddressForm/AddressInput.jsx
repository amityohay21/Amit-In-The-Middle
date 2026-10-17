import React, { useEffect, useRef, useState } from 'react';

export default function AddressInput({ value, onChange, placeholder, className }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    // מוודאים שגוגל נטען
    if (!window.google) return;

    // מחברים את שורת הטקסט לאלגוריתם ההשלמה של גוגל
    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "il" }, // מגביל חיפוש לישראל
      fields: ["formatted_address", "name"],
      types: ["geocode", "establishment"]
    });

    // מאזינים לבחירה של המשתמש מהרשימה שנפתחת
    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current.getPlace();
      if (place && (place.formatted_address || place.name)) {
        onChange(place.formatted_address || place.name);
      }
    });

    return () => {
      if (window.google && autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange]);

  // מנגנון מיקום נוכחי (GPS)
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("הדפדפן שלך לא תומך באיתור מיקום.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // ממירים את הנ.צ (קואורדינטות) לכתובת טקסט אמיתית
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
          setIsLocating(false);
          if (status === "OK" && results[0]) {
            onChange(results[0].formatted_address);
          } else {
            alert("לא הצלחנו לפענח את הכתובת. נסו להקליד ידנית.");
          }
        });
      },
      (error) => {
        setIsLocating(false);
        alert("לא הצלחנו למצוא אותך. ודאו שאישרתם לדפדפן גישה למיקום (GPS).");
      }
    );
  };

  return (
    <div style={{ position: 'relative', flex: 2, display: 'flex', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', paddingLeft: '40px' }} 
      />
      
      {/* כפתור "מיקום נוכחי" 📍 */}
      <button
        type="button"
        onClick={getCurrentLocation}
        disabled={isLocating}
        title="השתמש במיקום הנוכחי שלי"
        style={{
          position: 'absolute',
          left: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: isLocating ? 'wait' : 'pointer',
          fontSize: '1.2rem',
          padding: '0',
          color: isLocating ? 'var(--muted)' : 'var(--accent)',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'translateY(-50%) scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = 'translateY(-50%) scale(1)'}
      >
        {isLocating ? "⏳" : "📍"}
      </button>
    </div>
  );
}