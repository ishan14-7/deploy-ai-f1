import React, { useState } from 'react';

interface DriverAvatarProps {
  year?: number;
  code: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero' | 'full';
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-xs',
  md: 'w-16 h-16 text-sm',
  lg: 'w-24 h-24 text-base',
  xl: 'w-32 h-32 text-xl',
  hero: 'w-64 h-64 text-5xl',
  full: 'w-full h-full text-6xl' // Added for Scenario Preview large avatar
};

export const DriverAvatar: React.FC<DriverAvatarProps> = ({ code, year, size = 'md', className = '' }) => {
  const normalizedCode = code.toLowerCase();
    const [imgSrc, setImgSrc] = useState(`/drivers/${year || 2024}/${normalizedCode.toLowerCase()}.png`);
  const [error, setError] = useState(false);
  
  // Update imgSrc if year or code changes
  React.useEffect(() => {
    setImgSrc(`/drivers/${year || 2024}/${normalizedCode.toLowerCase()}.png`);
    setError(false);
  }, [code, year]);
  
  

  const handleImageError = () => {
    if (imgSrc !== `/drivers/2024/${normalizedCode.toLowerCase()}.png`) {
      // Fallback to 2024
      setImgSrc(`/drivers/2024/${normalizedCode.toLowerCase()}.png`);
    } else {
      // Fallback to text
      setError(true);
    }
  };

  const fallbackText = normalizedCode.slice(0, 3) || '?';

  return (
    <div 
      className={`relative flex items-center justify-center shrink-0 overflow-hidden bg-card border border-border ${sizeClasses[size]} ${className}`}
    >
      {!error ? (
        <img 
          src={imgSrc} 
          alt={code.toUpperCase()} 
          className="w-full h-full object-cover object-top "
          onError={handleImageError}
        />
      ) : (
        <span className="font-mono font-bold text-muted-foreground tracking-tighter select-none">
          {fallbackText}
        </span>
      )}
    </div>
  );
};
