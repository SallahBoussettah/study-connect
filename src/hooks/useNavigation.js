import { useNavigate } from 'react-router-dom';

/**
 * Custom hook that provides safe navigation functionality
 * Falls back to a no-op function if used outside of Router context
 * @returns {Function} A function that navigates to the given path or logs a warning if outside Router context
 */
export const useNavigation = () => {
  let navigate;
  
  try {
    navigate = useNavigate();
    return navigate;
  } catch (error) {
    // If useNavigate throws an error, we're outside of a Router context
    console.warn("useNavigation hook used outside of a Router context");
    
    // Return a no-op function that logs a warning
    return (path) => {
      console.warn(`Navigation to ${path} was attempted but is not available outside Router context`);
    };
  }
}; 