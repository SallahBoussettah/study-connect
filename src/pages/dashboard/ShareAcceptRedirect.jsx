import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

/**
 * Component that handles accepting a shared flashcard deck and redirects to the Shared With Me tab
 */
const ShareAcceptRedirect = () => {
  const { deckId, token } = useParams();
  const navigate = useNavigate();
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const acceptShare = async () => {
      try {
        setLoading(true);
        console.log(`Attempting to accept share for deck: ${deckId} with token: ${token}`);
        
        // Call API to accept the share
        const response = await api.post(`/flashcards/share/accept`, {
          deckId,
          token
        });
        
        console.log('Share acceptance response:', response);
        
        // Only proceed if component is still mounted
        if (isMounted) {
          // Show success message
          toast.success('Flashcard deck added to your Shared With Me tab');
          
          // Redirect to the Shared With Me tab
          navigate('/dashboard/flashcards?tab=shared');
        }
      } catch (err) {
        console.error('Error accepting shared deck:', err);
        if (isMounted) {
          // Extract error message from response if available
          const errorMessage = err.response?.data?.message || 
                              'Failed to accept shared deck. It may have expired or been revoked.';
          
          setError(errorMessage);
          toast.error(errorMessage);
          setLoading(false);
        }
      }
    };

    // Only attempt to accept if we have both deckId and token
    if (deckId && token) {
      acceptShare();
    } else {
      setError('Invalid share link. Missing deck ID or token.');
      setLoading(false);
    }
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [deckId, token, api, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
            <h2 className="text-xl font-semibold mt-4 text-secondary-900">Accepting shared flashcard deck...</h2>
            <p className="text-secondary-600 mt-2">Please wait while we process your request.</p>
          </>
        ) : error ? (
          <>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-secondary-900">Error</h2>
            <p className="text-secondary-600 mt-2">{error}</p>
            <button
              onClick={() => navigate('/dashboard/flashcards')}
              className="mt-6 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Go to Flashcards
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-secondary-900">Success!</h2>
            <p className="text-secondary-600 mt-2">Redirecting you to the shared deck...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ShareAcceptRedirect; 