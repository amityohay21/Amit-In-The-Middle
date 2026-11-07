import React, { useEffect, useRef, useState } from 'react';

export default function AddressInput({ value, onChange, placeholder, className, style, isResolved }) {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!window.google) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "il" },
      fields: ["formatted_address", "name"],
      types: ["geocode", "establishment"]
    });

    const listener = autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current.getPlace();
      if (place && (place.formatted_address || place.name)) {
        setTimeout(() => {
          onChange(place.formatted_address || place.name, true);
        }, 0);
      }
    });

    return () => {
      if (window.google && autocompleteRef.current) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [onChange]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("הדפדפן שלך לא תומך באיתור מיקום.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
          setIsLocating(false);
          if (status === "OK" && results[0]) {
            onChange(results[0].formatted_address, true);
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div style={{ position: 'relative', flex: 2, display: 'flex', width: '100%' }}>
      <input
        ref={inputRef}
        type="text"
        className={className}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value, false)}
        onKeyDown={handleKeyDown}
        style={{ 
          width: '100%', 
          paddingLeft: '40px', 
          paddingRight: isResolved ? '35px' : '10px', 
          ...style 
        }} 
      />
      
      {/* אייקון וי אלגנטי (SVG) במקום אימוג'י */}
      {isResolved && (
        <span style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </span>
      )}
      
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