import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading, 
  disabled, 
  ...props 
}) => {
  
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 rounded-none font-medium transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide text-sm";
  
  const variants = {
    primary: "bg-luxury-900 text-white hover:bg-black focus:ring-luxury-500",
    secondary: "bg-luxury-200 text-luxury-900 hover:bg-luxury-300 focus:ring-luxury-400",
    outline: "border border-luxury-900 text-luxury-900 hover:bg-luxury-50 focus:ring-luxury-500",
    ghost: "text-luxury-800 hover:bg-luxury-100 hover:text-black"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          İşleniyor...
        </span>
      ) : children}
    </button>
  );
};
