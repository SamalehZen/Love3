import React, { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  variant?: 'fade' | 'slide-up' | 'slide-down' | 'scale';
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = '',
  variant = 'slide-up'
}) => {
  const variants = {
    'fade': 'animate-in fade-in duration-300',
    'slide-up': 'animate-in fade-in slide-in-from-bottom-4 duration-300',
    'slide-down': 'animate-in fade-in slide-in-from-top duration-300',
    'scale': 'animate-in fade-in scale-in duration-300',
  };

  return (
    <div className={`${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};
