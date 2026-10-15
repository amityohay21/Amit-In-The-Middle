import React from 'react';

export default function OptimizationToggle({ value, onChange }) {
  return (
    <fieldset className="optimization-toggle">
      <legend>שיטת אופטימיזציה</legend>
      <div className="optimization-toggle__options">
        
        {/* כפתור Minimax */}
        <label className={`optimization-toggle__label ${value === "minimax" ? "active" : ""}`}>
          <div className="optimization-toggle__radio-group">
            <span className="optimization-toggle__title">Minimax</span>
            <input
              type="radio"
              name="optimizationMode"
              value="minimax"
              checked={value === "minimax"}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
          <span className="optimization-toggle__description">
            שוויון בנטל — דואג שאף אחד לא "יאכל אותה" יותר מהשאר
          </span>
        </label>

        {/* כפתור Sum of Times */}
        <label className={`optimization-toggle__label ${value === "sum" ? "active" : ""}`}>
          <div className="optimization-toggle__radio-group">
            <span className="optimization-toggle__title">Sum of Times</span>
            <input
              type="radio"
              name="optimizationMode"
              value="sum"
              checked={value === "sum"}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
          <span className="optimization-toggle__description">
             קורבן למען הקבוצה — חוסך זמן נסיעה כללי, אבל מישהו ינהג יותר
          </span>
        </label>
        
      </div>
    </fieldset>
  );
}