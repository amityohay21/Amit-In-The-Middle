import AddressInput from "./AddressInput.jsx";

export default function AddressForm({
  addresses,
  onChange,
  onAdd,
  onRemove,
  onSubmit,
  isLoading,
}) {
  const filledCount = addresses.filter((address) => (address || "").trim()).length;

  return (
    <form
      className="address-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {addresses.map((address, index) => (
        <AddressInput
          key={index}
          index={index}
          value={address}
          onChange={onChange}
          onRemove={onRemove}
          canRemove={addresses.length > 2}
        />
      ))}

      <div className="address-form__actions">
        <button
          type="button"
          className="button button--ghost"
          onClick={onAdd}
          disabled={addresses.length >= 4}
        >
          הוסף כתובת
        </button>
        <button
          type="submit"
          className="button button--primary"
          disabled={isLoading || filledCount < 2}
        >
          מצאו נקודת מפגש
        </button>
      </div>
    </form>
  );
}
