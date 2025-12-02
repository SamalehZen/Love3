import React, { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}, ref) => {
  const { isDarkMode } = useTheme();

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-[#32D583] to-[#22C55E] text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]';
      case 'secondary':
        return isDarkMode
          ? 'bg-surface border border-white/10 text-white hover:bg-white/10'
          : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50';
      case 'ghost':
        return isDarkMode
          ? 'bg-transparent text-gray-300 hover:bg-white/5'
          : 'bg-transparent text-gray-700 hover:bg-gray-100';
      case 'danger':
        return 'bg-action-red/10 border border-action-red/30 text-action-red hover:bg-action-red hover:text-white';
      case 'gold':
        return 'bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 border border-[#FFD700]/30 text-[#FFD700] hover:from-[#FFD700]/30 hover:to-[#FFA500]/30';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-xs rounded-full';
      case 'md':
        return 'px-5 py-2.5 text-sm rounded-full';
      case 'lg':
        return 'px-8 py-3.5 text-base rounded-full';
      case 'icon':
        return 'w-10 h-10 rounded-full p-0 flex items-center justify-center';
    }
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-all duration-200 active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: 'default' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}, ref) => {
  const { isDarkMode } = useTheme();

  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return isDarkMode
          ? 'bg-[#1C1C1E] border-white/10 text-gray-300 hover:bg-white/10'
          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50';
      case 'primary':
        return 'bg-gradient-to-br from-[#32D583] to-[#22C55E] border-transparent text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]';
      case 'danger':
        return isDarkMode
          ? 'bg-[#1C1C1E] border-white/10 text-action-red hover:bg-action-red hover:text-white'
          : 'bg-white border-gray-200 text-action-red hover:bg-action-red hover:text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-9 h-9';
      case 'md':
        return 'w-12 h-12';
      case 'lg':
        return 'w-14 h-14 sm:w-16 sm:h-16';
    }
  };

  return (
    <button
      ref={ref}
      className={`
        rounded-full border flex items-center justify-center
        transition-all duration-200 active:scale-95
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
      `}
      {...props}
    >
      {icon}
    </button>
  );
});

IconButton.displayName = 'IconButton';
