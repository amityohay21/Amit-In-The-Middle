export default function Loader({ label = "מחפשים נקודת מפגש..." }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__spinner" />
      <span>{label}</span>
    </div>
  );
}
