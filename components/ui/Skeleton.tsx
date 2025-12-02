import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div 
      className={`animate-pulse rounded ${
        isDarkMode 
          ? 'bg-gradient-to-r from-surface via-white/5 to-surface' 
          : 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200'
      } ${className}`} 
    />
  );
};

export const ProfileCardSkeleton: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`w-full h-full rounded-[36px] overflow-hidden relative ${isDarkMode ? 'bg-surface' : 'bg-gray-100'}`}>
      <Skeleton className="w-full h-full" />
      <div className="absolute bottom-6 left-6 right-6 space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const MessageSkeleton: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-start">
        <Skeleton className={`h-16 w-3/4 rounded-2xl ${isDarkMode ? 'bg-surface' : 'bg-gray-100'}`} />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-12 w-2/3 rounded-2xl bg-action-green/20" />
      </div>
      <div className="flex justify-start">
        <Skeleton className={`h-20 w-4/5 rounded-2xl ${isDarkMode ? 'bg-surface' : 'bg-gray-100'}`} />
      </div>
    </div>
  );
};

export const ProfileSkeleton: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className={`h-24 rounded-2xl ${isDarkMode ? 'bg-surface' : 'bg-gray-100'}`} />
        ))}
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className={`h-24 rounded-2xl ${isDarkMode ? 'bg-surface' : 'bg-gray-100'}`} />
      </div>
    </div>
  );
};

export const MapCardSkeleton: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`w-full max-w-sm p-4 rounded-[24px] ${isDarkMode ? 'bg-surface/90' : 'bg-white/90'}`}>
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>
    </div>
  );
};
