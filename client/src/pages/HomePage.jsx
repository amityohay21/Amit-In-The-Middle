import AddressForm from "../components/AddressForm/AddressForm.jsx";
import OptimizationToggle from "../components/OptimizationToggle/OptimizationToggle.jsx";
import ResultsList from "../components/ResultsList/ResultsList.jsx";
import Loader from "../components/shared/Loader.jsx";
import ErrorBanner from "../components/shared/ErrorBanner.jsx";
import { useSearch } from "../hooks/useSearch.js";

export default function HomePage() {
  const {
    addresses,
    optimizationMode,
    setOptimizationMode,
    results,
    searchRadius,
    isLoading,
    error,
    addAddress,
    removeAddress,
    updateAddress,
    search,
  } = useSearch();

  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">Ameet In The Middle</p>
        <h1>איפה הכי שווה להיפגש?</h1>
        <p>
          הזינו 2–4 כתובות, בחרו שיטת אופטימיזציה, וקבלו בתי קפה, מסעדות וברים
          עם זמני נסיעה מאוזנים.
        </p>
      </header>

      <OptimizationToggle
        value={optimizationMode}
        onChange={setOptimizationMode}
      />

      <AddressForm
        addresses={addresses}
        onChange={updateAddress}
        onAdd={addAddress}
        onRemove={removeAddress}
        onSubmit={search}
        isLoading={isLoading}
      />

      <ErrorBanner message={error} />
      {isLoading ? <Loader /> : null}
      <ResultsList results={results} searchRadius={searchRadius} />
    </main>
  );
}
