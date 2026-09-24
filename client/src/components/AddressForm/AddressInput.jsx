export default function AddressInput({
  index,
  value,
  onChange,
  onRemove,
  canRemove,
}) {
  return (
    <div className="address-input">
      <label htmlFor={`address-${index}`}>כתובת {index + 1}</label>
      <div className="address-input__row">
        <input
          id={`address-${index}`}
          type="text"
          value={value || ""}
          onChange={(event) => onChange(index, event.target.value)}
          placeholder="למשל: הרצל 1, תל אביב"
          style={{
            flex: 1,
            padding: "10px 14px",
            borderRadius: "8px",
            border: "1px solid #ddd",
            fontSize: "15px",
            outline: "none",
            backgroundColor: "#fff",
            color: "#333"
          }}
        />
        {canRemove ? (
          <button
            type="button"
            className="button button--ghost"
            onClick={() => onRemove(index)}
          >
            הסר
          </button>
        ) : null}
      </div>
    </div>
  );
}