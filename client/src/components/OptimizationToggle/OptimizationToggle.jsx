const OPTIONS = [
  {
    value: "minimax",
    label: "Minimax",
    hint: "הוגנות — מקצר את הנסיעה הארוכה ביותר",
  },
  {
    value: "sum",
    label: "Sum of Times",
    hint: "יעילות — ממזער את סכום זמני הנסיעה",
  },
];

export default function OptimizationToggle({ value, onChange }) {
  return (
    <fieldset className="optimization-toggle">
      <legend>שיטת אופטימיזציה</legend>
      <div className="optimization-toggle__options">
        {OPTIONS.map((option) => (
          <label key={option.value} className="optimization-toggle__option">
            <input
              type="radio"
              name="optimizationMode"
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>
              <strong>{option.label}</strong>
              <small>{option.hint}</small>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
