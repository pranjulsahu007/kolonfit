import React, { useState } from 'react';

interface LogoProps {
  variant?: 'light' | 'dark';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'dark', className = '' }) => {
  const [error, setError] = useState(false);

  // If no error, try to show the image
  if (!error) {
    return (
      <img
        src="logo.png"
        alt="FitWiser"
        className={`h-10 w-auto object-contain ${className}`}
        onError={() => setError(true)}
      />
    );
  }

  // Fallback: Recreate the logo visually
  const textColor = variant === 'dark' ? 'text-slate-800' : 'text-white';
  
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="h-9 w-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm shadow-emerald-500/20">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H7L10 4L14 20L17 12H21" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className={`text-2xl font-bold tracking-tight ${textColor}`}>
        Fit<span className="text-emerald-500">Wiser</span>
      </span>
    </div>
  );
};