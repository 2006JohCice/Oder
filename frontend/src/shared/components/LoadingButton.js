import React from 'react';
import '../css/LoadingButton.css';

/**
 * LoadingButton Component
 * 
 * A reusable button component with built-in loading state management.
 * Automatically disables the button during loading and shows a loading indicator.
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Button text/content
 * @param {Function} props.onClick - Click handler function
 * @param {boolean} props.isLoading - Loading state (optional, manages internally if not passed)
 * @param {Function} props.onLoadingChange - Callback when loading state changes
 * @param {string} props.loadingText - Text to show during loading (default: "Đang xử lý...")
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {boolean} props.disabled - Additional disabled state
 * @param {string} props.variant - Button variant (primary, secondary, ghost, danger)
 * @param {...any} props.rest 
 * 
 * @example
 * <LoadingButton onClick={handleSubmit}>
 *   Submit
 * </LoadingButton>
 * 
 * @example
 * const [loading, setLoading] = useState(false);
 * <LoadingButton 
 *   isLoading={loading}
 *   loadingText="Saving..."
 *   onClick={() => saveData()}
 * >
 *   Save
 * </LoadingButton>
 */
const LoadingButton = ({
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
  const buttonClass = `loading-btn loading-btn--${variant} ${className} ${
    isLoading ? 'loading-btn--loading' : ''
  }`;
  
  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      className={buttonClass}
      {...rest}
    >
      {isLoading ? (
        <>
          <span className="loading-spinner"></span>
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;
