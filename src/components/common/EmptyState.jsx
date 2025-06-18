import React from 'react';
import { FaFolderOpen } from 'react-icons/fa';

const EmptyState = ({ 
  title = 'No items found', 
  description = 'There are no items to display at this time.', 
  icon: Icon = FaFolderOpen,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
      <div className="bg-primary-50 p-5 rounded-full mb-4">
        <Icon className="text-4xl text-primary-500" />
      </div>
      <h3 className="text-xl font-medium text-secondary-900 mb-2">{title}</h3>
      <p className="text-secondary-600 text-center max-w-md mb-6">{description}</p>
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState; 