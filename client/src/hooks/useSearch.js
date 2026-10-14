import { useCallback, useState } from "react";
import { searchMeetingPlaces } from "../api/searchApi.js";

export function useSearch() {
  const [addresses, setAddresses] = useState(["", ""]);
  const [optimizationMode, setOptimizationMode] = useState("minimax");
  
  // המצבים של הפילטרים 
  const [minRating, setMinRating] = useState(0);
  const [requireDineIn, setRequireDineIn] = useState(false);
  const [includeCarts, setIncludeCarts] = useState(false);
  const [openNow, setOpenNow] = useState(false); // הפיצ'ר החדש!

  const [results, setResults] = useState(null);
  const [searchRadius, setSearchRadius] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addAddress = useCallback(() => {
    setAddresses((current) => (current.length >= 4 ? current : [...current, ""]));
  }, []);

  const removeAddress = useCallback((index) => {
    setAddresses((current) =>
      current.length <= 2 ? current : current.filter((_, i) => i !== index)
    );
  }, []);

  const updateAddress = useCallback((index, value) => {
    setAddresses((current) =>
      current.map((address, i) => (i === index ? value : address))
    );
  }, []);

  const search = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await searchMeetingPlaces({
        addresses: addresses.map((address) => address.trim()).filter(Boolean),
        optimizationMode,
        minRating,
        requireDineIn,
        includeCarts,
        openNow // מעבירים לשרת
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
  }, [addresses, optimizationMode, minRating, requireDineIn, includeCarts, openNow]);

  return {
    addresses,
    optimizationMode,
    setOptimizationMode,
    minRating, setMinRating,
    requireDineIn, setRequireDineIn,
    includeCarts, setIncludeCarts,
    openNow, setOpenNow, // חושפים החוצה
    results,
    searchRadius,
    isLoading,
    error,
    addAddress,
    removeAddress,
    updateAddress,
    search,
  };
}