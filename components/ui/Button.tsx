import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const { isDarkMode } = useTheme();

  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

  const variants = {
    primary: 'bg-gradient-to-r from-action-purple to-blue-600 text-white shadow-lg hover:shadow-xl',
    secondary: isDarkMode
      ? 'bg-surface border border-white/10 text-white hover:bg-white/5'
      : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 shadow-sm',
    ghost: isDarkMode
      ? 'bg-transparent text-white hover:bg-white/5'
      : 'bg-transparent text-gray-900 hover:bg-black/5',
    danger: 'bg-action-red/10 border border-action-red/30 text-action-red hover:bg-action-red/20',
    success: 'bg-action-green text-white shadow-lg hover:shadow-xl shadow-action-green/30',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs gap-1.5',
    md: 'px-6 py-3 text-sm gap-2',
    lg: 'px-8 py-4 text-base gap-2.5',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg 
          className="animate-spin" 
          width={iconSizes[size]} 
          height={iconSizes[size]} 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4" 
            fill="none"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  );
};

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'secondary',
  size = 'md',
  className = '',
  ...props
}) => {
  const { isDarkMode } = useTheme();

  const baseStyles = 'inline-flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-gradient-to-r from-action-purple to-blue-600 text-white shadow-lg',
    secondary: isDarkMode
      ? 'bg-surface border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white'
      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm',
    ghost: isDarkMode
      ? 'bg-transparent text-gray-400 hover:bg-white/5 hover:text-white'
      : 'bg-transparent text-gray-500 hover:bg-black/5 hover:text-gray-900',
  };

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon}
    </button>
  );
};
