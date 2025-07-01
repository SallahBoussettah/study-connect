/**
 * Avatar utility functions for consistent avatar handling across the application
 */
import React from 'react';

const API_URL = 'http://localhost:5000';

/**
 * Gets the full avatar URL from a relative path
 * @param {string} avatarPath - The avatar path from the API
 * @returns {string} - The full avatar URL
 */
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  
  // If it's already an absolute URL, return it as is
  if (avatarPath.startsWith('http')) {
    return avatarPath;
  }
  
  // Otherwise, prepend the API URL
  return `${API_URL}${avatarPath}`;
};

/**
 * Generates a placeholder avatar URL using UI Avatars service
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @returns {string} - The placeholder avatar URL
 */
export const getAvatarPlaceholder = (firstName, lastName) => {
  const name = firstName && lastName 
    ? `${firstName}+${lastName}`
    : firstName || lastName || 'User';
    
  return `https://ui-avatars.com/api/?name=${name.replace(/\s+/g, '+')}&background=random&color=fff`;
};

/**
 * Gets the appropriate avatar URL, falling back to a placeholder if needed
 * @param {Object} user - User object with avatar, firstName, and lastName properties
 * @returns {string} - The avatar URL or placeholder
 */
export const getUserAvatar = (user) => {
  if (!user) return getAvatarPlaceholder('User', '');
  
  return user.avatar 
    ? getAvatarUrl(user.avatar)
    : getAvatarPlaceholder(user.firstName, user.lastName);
};

/**
 * Renders an avatar image with fallback to initials
 * @param {string} avatarUrl - The avatar URL
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @param {string} className - Optional CSS class name
 * @returns {JSX.Element} - The avatar component
 */
export const renderAvatar = (avatarUrl, firstName, lastName, className = "w-full h-full object-cover") => {
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  
  if (!avatarUrl) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-blue-500 rounded-full text-white text-2xl font-bold">
        {initials}
      </div>
    );
  }
  
  return (
    <img
      src={getAvatarUrl(avatarUrl)}
      alt={`${firstName || ''} ${lastName || ''}`.trim() || "User"}
      className={className}
      onError={(e) => {
        // If image fails to load, replace with initials
        const parent = e.target.parentNode;
        if (parent) {
          // Clear the parent node
          while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
          }
          
          // Create a div for initials
          const initialsDiv = document.createElement('div');
          initialsDiv.className = "flex items-center justify-center h-full w-full bg-blue-500 rounded-full text-white text-2xl font-bold";
          initialsDiv.textContent = initials;
          
          // Append to parent
          parent.appendChild(initialsDiv);
        }
      }}
    />
  );
}; 