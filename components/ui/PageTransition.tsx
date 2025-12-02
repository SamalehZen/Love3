import React, { ReactNode, useEffect, useState } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  variant?: 'fade' | 'slide-up' | 'slide-down' | 'scale';
  duration?: number;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  className = '',
  variant = 'slide-up',
  duration = 300
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const getAnimationClass = () => {
    if (!isVisible) {
      switch (variant) {
        case 'fade':
          return 'opacity-0';
        case 'slide-up':
          return 'opacity-0 translate-y-4';
        case 'slide-down':
          return 'opacity-0 -translate-y-4';
        case 'scale':
          return 'opacity-0 scale-95';
        default:
          return 'opacity-0';
      }
    }
    return 'opacity-100 translate-y-0 scale-100';
  };

  return (
    <div 
      className={`transform transition-all ease-out ${getAnimationClass()} ${className}`}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

interface AnimatedListProps {
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({ 
  children, 
  staggerDelay = 50,
  className = '' 
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <div
          className="animate-fade-in animate-slide-in-bottom"
          style={{ animationDelay: `${index * staggerDelay}ms`, animationFillMode: 'both' }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};
