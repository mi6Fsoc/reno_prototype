import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  isLoading, 
  className = '', 
  ...props 
}) => {
  const sizeStyles = {
    sm: "px-3.5 py-1.5 text-xs font-medium",
    md: "px-5 py-2.5 text-sm font-medium",
    lg: "px-6 py-3.5 text-base font-semibold",
  };

  const baseStyles = "rounded-[8px] transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-dark shadow-[0_2px_12px_rgba(185,138,69,0.25)] hover:shadow-[0_4px_20px_rgba(185,138,69,0.35)]",
    secondary: "bg-[#25211B] text-[#FFE8B8] border border-[#3E3426] hover:border-primary hover:bg-[#2C261F]",
    outline: "border border-border bg-transparent text-white hover:border-primary hover:bg-[#1E2026] text-white",
    accent: "bg-accent text-accent-foreground hover:bg-[#F3DCA7] shadow-sm",
    danger: "bg-red-950/80 text-red-200 border border-red-800/60 hover:bg-red-900"
  };

  return (
    <button 
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <i className="fas fa-circle-notch fa-spin text-xs"></i>
          <span>Computing...</span>
        </>
      ) : children}
    </button>
  );
};

export default Button;