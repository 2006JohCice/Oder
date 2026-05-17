import React from 'react';
import '../../../shared/css/LoadingButtonMini.css';

const LoadingButtonMini = ({
  children,
  onClick,
  isLoading: externalIsLoading,
  onLoadingChange,
  loadingText = 'Đang xử lý...',
  className = '',
  type = 'button',
  disabled = false,
  variant = 'primary',
  ...rest
}) => {
  const [internalIsLoading, setInternalIsLoading] = React.useState(false);
  
  // Use external loading state if provided, otherwise use internal state
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading;
  
  const handleClick = async (e) => {
    if (isLoading || disabled) return;
    
    try {
      // Set internal loading state if no external state is provided
      if (externalIsLoading === undefined) {
        setInternalIsLoading(true);
      }
      
      // Notify parent component of loading state change
      onLoadingChange?.(true);
      
      // Execute the onClick handler
      const result = onClick?.(e);
      
      // If onClick returns a Promise, wait for it
      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      console.error('LoadingButton error:', error);
      throw error;
    } finally {
      // Reset loading state if no external state is provided
      if (externalIsLoading === undefined) {
        setTimeout(() => {
          setInternalIsLoading(false);
          onLoadingChange?.(false);
        }, 0);
      } else {
        onLoadingChange?.(false);
      }
    }
  };
  
  const isDisabled = isLoading || disabled;
  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      {...rest}
    >
      {isLoading ? (
        <>
          <span className="button-mini-spinner">
            <i class="bi bi-arrow-counterclockwise"></i>
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButtonMini;
