import React from 'react';

export default function FitTrackBadge({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <path d="M25 15H80V32H45V46H72V63H45V90H25V15Z" fill="#111827"/>
    </svg>
  );
}