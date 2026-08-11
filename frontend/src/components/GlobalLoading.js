import React, { useState, useEffect } from "react";
import "./GlobalLoading.css";

const GlobalLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);

  useEffect(() => {
    const handleStart = () => {
      setLoadingCount((prev) => prev + 1);
    };

    const handleEnd = () => {
      setLoadingCount((prev) => Math.max(0, prev - 1));
    };

    window.addEventListener("api:loading:start", handleStart);
    window.addEventListener("api:loading:end", handleEnd);

    return () => {
      window.removeEventListener("api:loading:start", handleStart);
      window.removeEventListener("api:loading:end", handleEnd);
    };
  }, []);

  useEffect(() => {
    setIsLoading(loadingCount > 0);
  }, [loadingCount]);

  if (!isLoading) return null;

  return (
    <div className="global-loading-overlay">
      <div className="global-loading-spinner"></div>
    </div>
  );
};

export default GlobalLoading;
