import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true
}) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto'; // Restore scrolling when modal is closed
    };
  }, [isOpen, onClose]);

  // Get modal size class
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'max-w-md';
      case 'lg':
        return 'max-w-3xl';
      case 'xl':
        return 'max-w-5xl';
      case 'full':
        return 'max-w-full mx-4';
      default: // md
        return 'max-w-xl';
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={closeOnBackdropClick ? onClose : undefined}
      ></div>

      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Modal content */}
        <div 
          className={`${getSizeClass()} w-full bg-white rounded-lg shadow-xl relative transform transition-all`}
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
        >
          {/* Header */}
          {title && (
            <div className="flex justify-between items-center border-b border-secondary-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
              {showCloseButton && (
                <button 
                  onClick={onClose}
                  className="text-secondary-500 hover:text-secondary-700 focus:outline-none"
                  aria-label="Close"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal; 