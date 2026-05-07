import { useState, useCallback } from 'react';

/**
 * Custom hook for managing button loading states
 * 
 * Provides a simple way to manage loading states for async operations
 * 
 * @returns {Object} - Loading state management utilities
 * @example
 * const { isLoading, handleLoading, startLoading, stopLoading } = useButtonLoading();
 * 
 * const handleSubmit = async () => {
 *   await handleLoading(async () => {
 *     await apiCall();
 *   });
 * };
 * 
 * <LoadingButton isLoading={isLoading} onClick={handleSubmit}>
 *   Submit
 * </LoadingButton>
 */
const useButtonLoading = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Wrapper function for async operations
  const handleLoading = useCallback(async (asyncFn) => {
    try {
      setIsLoading(true);
      await asyncFn();
    } catch (error) {
      console.error('Operation error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Manual start/stop functions
  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  return {
    isLoading,
    handleLoading,
    startLoading,
    stopLoading,
    setIsLoading
  };
};

export default useButtonLoading;
