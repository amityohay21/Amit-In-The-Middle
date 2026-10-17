import { useCallback, useState } from "react";
import { searchMeetingPlaces } from "../api/searchApi.js";

export function useSearch() {
  // השינוי הענק: במקום סתם מחרוזות, שומרים גם שם וגם כתובת
  const [participants, setParticipants] = useState([
    { name: "", address: "" },
    { name: "", address: "" }
  ]);
  
  const [optimizationMode, setOptimizationMode] = useState("minimax");
  const [minRating, setMinRating] = useState(0);
  const [requireDineIn, setRequireDineIn] = useState(false);
  const [includeCarts, setIncludeCarts] = useState(false);
  const [openNow, setOpenNow] = useState(false);

  const [results, setResults] = useState(null);
  const [searchRadius, setSearchRadius] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addParticipant = useCallback(() => {
    setParticipants((current) => 
      current.length >= 4 ? current : [...current, { name: "", address: "" }]
    );
  }, []);

  const removeParticipant = useCallback((index) => {
    setParticipants((current) =>
      current.length <= 2 ? current : current.filter((_, i) => i !== index)
    );
  }, []);

  const updateParticipant = useCallback((index, field, value) => {
    setParticipants((current) =>
      current.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  }, []);

  const search = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // שולחים לשרת רק את הכתובות כדי שהאלגוריתם יעבוד כרגיל
      const data = await searchMeetingPlaces({
        addresses: participants.map((p) => p.address.trim()).filter(Boolean),
        optimizationMode,
        minRating,
        requireDineIn,
        includeCarts,
        openNow
      });
      setResults(data.results);
      setSearchRadius(data.searchRadius);
    } catch (err) {
      setResults(null);
      setSearchRadius(null);
      setError(err.message || "שגיאה לא צפויה");
    } finally {
      setIsLoading(false);
    }
  }, [participants, optimizationMode, minRating, requireDineIn, includeCarts, openNow]);

  return {
    participants,
    optimizationMode, setOptimizationMode,
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
  };
}