import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div 
      className={`animate-pulse rounded ${isDarkMode ? 'bg-gradient-to-r from-surface via-white/5 to-surface' : 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200'} ${className}`}
    />
  );
};

export const ProfileCardSkeleton: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`w-full h-full rounded-[36px] overflow-hidden relative ${isDarkMode ? 'bg-surface' : 'bg-gray-100'}`}>
      <Skeleton className="w-full h-full" />
      <div className="absolute bottom-6 left-6 right-6 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export const ChatMessageSkeleton: React.FC = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="space-y-4">
      <div className="flex justify-start">
        <Skeleton className={`h-12 w-48 rounded-2xl rounded-tl-none ${isDarkMode ? '' : ''}`} />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-10 w-36 rounded-2xl rounded-tr-none" />
      </div>
      <div className="flex justify-start">
        <Skeleton className="h-16 w-56 rounded-2xl rounded-tl-none" />
      </div>
    </div>
  );
};

export const ProfileDetailSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-5">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <Skeleton className="h-32 rounded-2xl" />
    </div>
  );
};
