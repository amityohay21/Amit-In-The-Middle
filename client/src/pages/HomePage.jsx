import AddressForm from "../components/AddressForm/AddressForm.jsx";
import OptimizationToggle from "../components/OptimizationToggle/OptimizationToggle.jsx";
import ResultsList from "../components/ResultsList/ResultsList.jsx";
import Loader from "../components/shared/Loader.jsx";
import ErrorBanner from "../components/shared/ErrorBanner.jsx";
import { useSearch } from "../hooks/useSearch.js";

export default function HomePage() {
  const {
    participants, // החלפנו את addresses ב-participants (שמכיל גם שם וגם כתובת)
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
    addParticipant,    // שונה מ-addAddress
    removeParticipant, // שונה מ-removeAddress
    updateParticipant, // שונה מ-updateAddress
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
        participants={participants} // מעבירים את המשתתפים לטופס
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
      
      {/* מעבירים את המשתתפים גם לרשימת התוצאות כדי שהשמות יופיעו! */}
      <ResultsList results={results} searchRadius={searchRadius} participants={participants} />
    </main>
  );
}