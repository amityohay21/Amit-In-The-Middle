import AddressForm from "../components/AddressForm/AddressForm.jsx";
import OptimizationToggle from "../components/OptimizationToggle/OptimizationToggle.jsx";
import ResultsList from "../components/ResultsList/ResultsList.jsx";
import Loader from "../components/shared/Loader.jsx";
import ErrorBanner from "../components/shared/ErrorBanner.jsx";
import { useSearch } from "../hooks/useSearch.js";

export default function HomePage() {
  const {
    participants,
    optimizationMode,
    setOptimizationMode,
    minRating, setMinRating,
    requireDineIn, setRequireDineIn,
    includeCarts, setIncludeCarts,
    openNow, setOpenNow,
    results,
    searchRadius,
    isLoading,
    error,
    addParticipant,
    removeParticipant,
    updateParticipant,
    search,
  } = useSearch();

  return (
    <main className="page">
      {/* כותרת ממותגת חדשה */}
      <header className="brand-header">
  <div className="brand-badge">
    <span>📍</span> נקודת מפגש הוגנת
  </div>
  <h1 className="brand-title">Meet In The Middle</h1>
  <p className="brand-subtitle">
    הזינו 2–4 כתובות, בחרו את שיטת האיזון וקבלו מקומות מפגש שווים עם זמני נסיעה מדויקים בלייב!
  </p>
</header>

      <OptimizationToggle
        value={optimizationMode}
        onChange={setOptimizationMode}
      />

      <AddressForm
        participants={participants}
        onChange={updateParticipant} 
        onAdd={addParticipant}
        onRemove={removeParticipant}
        onSubmit={search}
        isLoading={isLoading}
        minRating={minRating}
        setMinRating={setMinRating}
        requireDineIn={requireDineIn}
        setRequireDineIn={setRequireDineIn}
        includeCarts={includeCarts}
        setIncludeCarts={setIncludeCarts}
        openNow={openNow}
        setOpenNow={setOpenNow}
      />

      <ErrorBanner message={error} />
      {isLoading ? <Loader /> : null}
      
      <ResultsList results={results} searchRadius={searchRadius} participants={participants} />
    </main>
  );
}