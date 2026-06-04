import React from 'react';

export const Icon = ({ type, className }) => {
  const size = 24;
  switch (type) {
    case 'video':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M17 9l4-2v10l-4-2V9z" fill="currentColor" />
        </svg>
      );
    case 'pdf':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M13 2v6h6" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case 'audio':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 9v6a3 3 0 0 0 3 3h0" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <rect x="4" y="7" width="4" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M16 7v10a3 3 0 0 0 3 3" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case 'image':
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor" />
          <path d="M21 19l-6-5-4 4-3-3-4 4" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
      );
    default:
      return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      );
  }
};

export default Icon;
