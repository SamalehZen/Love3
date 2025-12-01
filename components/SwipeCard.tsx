import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { X, Heart, Gift, MapPin, Search, Star, Sparkles, HeartCrack, RotateCcw } from 'lucide-react';
import { Profile } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useHaptic } from '../hooks/useHaptic';

interface SwipeCardProps {
  profile: Profile;
  nextProfile?: Profile;
  onAction: (action: 'like' | 'reject' | 'super') => void;
  onUndo?: () => void;
  canUndo?: boolean;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ 
  profile, 
  nextProfile, 
  onAction,
  onUndo,
  canUndo = false
}) => {
  const { isDarkMode } = useTheme();
  const { trigger } = useHaptic();
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [exitVelocity, setExitVelocity] = useState(0);
  
  const startX = useRef(0);
  const startY = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 100;
  const ROTATION_FACTOR = 0.04;

  useEffect(() => {
    setDragX(0);
    setDragY(0);
    setExitVelocity(0);
    setIsDragging(false);
  }, [profile.id]);

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    if ('touches' in e) {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    } else {
      startX.current = e.clientX;
      startY.current = e.clientY;
    }
  }, []);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    const deltaX = clientX - startX.current;
    const deltaY = clientY - startY.current;
    setDragX(deltaX);
    setDragY(deltaY);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);

    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      const direction = dragX > 0 ? 'like' : 'reject';
      const velocity = dragX > 0 ? 1500 : -1500;
      setExitVelocity(velocity);
      trigger('medium');
      
      setTimeout(() => {
        onAction(direction);
      }, 300);
    } else {
      setDragX(0);
      setDragY(0);
    }
  }, [dragX, onAction, trigger]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    const handleUp = () => handleDragEnd();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const handleSwipeAction = useCallback((action: 'like' | 'reject' | 'super') => {
    trigger('medium');
    if (action === 'like') {
      setExitVelocity(1000);
    } else if (action === 'reject') {
      setExitVelocity(-1000);
    }
    setTimeout(() => onAction(action), 200);
  }, [onAction, trigger]);

  const isExiting = exitVelocity !== 0;
  const rawProgress = Math.min(Math.abs(dragX) / (SWIPE_THRESHOLD * 1.5), 1);
  const swipeProgress = isExiting ? 1 : rawProgress;
  const rotation = dragX * ROTATION_FACTOR;
  const iconScale = isExiting ? 1.8 : 0.5 + (rawProgress * 0.8); 
  const iconOpacity = isExiting ? 1 : Math.min(rawProgress * 1.5, 1);
  const backCardScale = 0.94 + (0.06 * swipeProgress);
  const backCardY = 20 - (20 * swipeProgress);
  const backCardOpacity = 0.6 + (0.4 * swipeProgress);

  const cardStyle = useMemo(() => ({
    transform: exitVelocity 
      ? `translate(${exitVelocity}px, ${dragY}px) rotate(${exitVelocity * 0.03}deg)`
      : `translate(${dragX}px, ${dragY}px) rotate(${rotation}deg)`,
    transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    cursor: isDragging ? 'grabbing' : 'grab',
    backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
  }), [exitVelocity, dragX, dragY, rotation, isDragging, isDarkMode]);

  const rightBtnScale = dragX > 0 ? 1 + (rawProgress * 0.3) : 1;
  const leftBtnScale = dragX < 0 ? 1 + (rawProgress * 0.3) : 1;

  const bgClass = isDarkMode ? 'bg-[#000]' : 'bg-[#F2F2F7]';
  const textMain = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSub = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const iconBtnBg = isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white';
  const iconBtnBorder = isDarkMode ? 'border-white/10' : 'border-black/5';
  const cardBorder = isDarkMode ? 'border-white/5' : 'border-black/5';

  return (
    <div className={`relative w-full h-full flex flex-col pt-4 pb-24 px-4 overflow-hidden select-none transition-colors duration-500 ${bgClass}`}>
      <div className="flex justify-between items-center mb-4 px-2 z-50">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full overflow-hidden p-0.5 border ${isDarkMode ? 'border-white/20' : 'border-gray-200'}`}>
            <img 
              src="https://picsum.photos/100/100?random=1" 
              alt="User"
              className="w-full h-full rounded-full object-cover"
              loading="lazy"
            />
          </div>
          <div>
            <p className={`${textSub} text-[10px] uppercase tracking-wider font-semibold`}>Bienvenue</p>
            <div className={`flex items-center gap-1 ${textMain} text-sm font-medium`}>
              <MapPin size={12} className="text-action-purple" />
              Washington, USA
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canUndo && (
            <button 
              onClick={onUndo}
              className={`w-10 h-10 rounded-full ${iconBtnBg} border ${iconBtnBorder} flex items-center justify-center hover:opacity-80 transition active:scale-95 shadow-sm`}
            >
              <RotateCcw className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} size={18} />
            </button>
          )}
          <button className={`w-10 h-10 rounded-full ${iconBtnBg} border ${iconBtnBorder} flex items-center justify-center hover:opacity-80 transition active:scale-95 shadow-sm`}>
            <Search className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative w-full perspective-[1000px]">
        {nextProfile && (
          <div 
            className={`absolute inset-0 z-10 rounded-[36px] overflow-hidden shadow-xl border ${cardBorder}`}
            style={{
              transform: `scale(${backCardScale}) translateY(${backCardY}px)`,
              opacity: backCardOpacity,
              transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1), opacity 0.5s ease',
              backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF'
            }}
          >
            <img 
              src={nextProfile.imageUrl} 
              alt={nextProfile.name} 
              className="w-full h-full object-cover filter brightness-[0.6]"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent opacity-50">
              <h2 className="text-xl font-bold text-white/50">{nextProfile.name}</h2>
            </div>
          </div>
        )}

        <div 
          ref={cardRef}
          className={`absolute inset-0 z-20 rounded-[36px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.15)] touch-none border ${cardBorder}`}
          style={cardStyle}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          <img 
            src={profile.imageUrl} 
            alt={profile.name} 
            className="w-full h-full object-cover pointer-events-none select-none"
            loading="eager"
            decoding="async"
          />

          <div className="absolute inset-0 pointer-events-none z-10 opacity-20 overflow-hidden rounded-[36px]">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent premium-shimmer absolute top-0 left-0" />
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/90 pointer-events-none" />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div 
              className="flex flex-col items-center justify-center"
              style={{ 
                opacity: dragX > 0 ? iconOpacity : 0,
                transform: `scale(${dragX > 0 ? iconScale : 0.5}) rotate(-10deg)`,
                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
              <div className="relative">
                <div className={`absolute inset-0 rounded-full bg-action-green/30 blur-xl ${isExiting && dragX > 0 ? 'pulse-effect' : ''}`} />
                <Heart size={120} fill="currentColor" className="text-[#4ADE80] drop-shadow-[0_0_20px_rgba(74,222,128,0.6)]" />
                <Sparkles className="absolute -top-4 -right-4 text-white animate-bounce" size={40} />
              </div>
              <span className="text-white font-bold text-2xl tracking-widest mt-4 drop-shadow-md">LIKE</span>
            </div>

            <div 
              className="flex flex-col items-center justify-center"
              style={{ 
                opacity: dragX < 0 ? iconOpacity : 0,
                transform: `scale(${dragX < 0 ? iconScale : 0.5}) rotate(10deg)`,
                transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
            >
              <div className="relative">
                <div className={`absolute inset-0 rounded-full bg-action-red/30 blur-xl ${isExiting && dragX < 0 ? 'pulse-effect' : ''}`} />
                <HeartCrack size={120} strokeWidth={2} className="text-[#EF4444] drop-shadow-[0_0_20px_rgba(239,68,68,0.6)] fill-transparent" />
              </div>
              <span className="text-white font-bold text-2xl tracking-widest mt-4 drop-shadow-md">NON</span>
            </div>
          </div>

          <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-lg pointer-events-none z-20">
            <span className="text-white text-xs font-bold flex items-center gap-1.5 tracking-wide">
              <Star size={12} fill="currentColor" className="text-yellow-400" />
              Match {profile.matchPercentage}%
            </span>
          </div>

          <div className="absolute bottom-0 w-full p-6 pb-28 z-20 pointer-events-none">
            <div className="flex items-center gap-2 mb-2 translate-y-2">
              <h2 className="text-[28px] sm:text-[32px] font-bold text-white tracking-tight drop-shadow-lg leading-none">
                {profile.name}, {profile.age}
              </h2>
              {profile.isOnline && (
                <span className="w-2.5 h-2.5 bg-action-green rounded-full shadow-[0_0_10px_#32D583] animate-pulse mt-2" />
              )}
            </div>
            
            <p className="text-gray-200 text-xs sm:text-sm font-medium mb-4 line-clamp-2 drop-shadow-md leading-relaxed opacity-90">
              {profile.bio}
            </p>

            <div className="flex flex-wrap gap-2 mb-2">
              {profile.interests.slice(0, 3).map((interest, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-1 rounded-full shadow-sm">
                  <span className="text-[10px] text-white font-medium uppercase tracking-wide">{interest}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex items-center justify-between px-8 pb-4 pt-2 z-50">
        <button 
          onClick={(e) => { e.stopPropagation(); handleSwipeAction('reject'); }}
          style={{ transform: `scale(${leftBtnScale})` }}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${iconBtnBg} border ${iconBtnBorder} flex items-center justify-center text-action-red shadow-lg transition-transform duration-200 active:scale-95 group hover:bg-action-red hover:text-white`}
        >
          <HeartCrack size={28} strokeWidth={2} className="group-hover:rotate-12 transition-transform duration-300 sm:w-8 sm:h-8" />
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); handleSwipeAction('super'); }}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${isDarkMode ? 'bg-action-purple/10 border-action-purple/30' : 'bg-white border-white'} flex items-center justify-center text-action-purple shadow-md transition-transform hover:scale-110 active:scale-95 hover:bg-action-purple hover:text-white border`}
        >
          <Gift size={20} strokeWidth={2.5} className="sm:w-[22px] sm:h-[22px]" />
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); handleSwipeAction('like'); }}
          style={{ transform: `scale(${rightBtnScale})` }}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#32D583] to-[#22C55E] flex items-center justify-center text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-transform duration-200 active:scale-95 group hover:shadow-[0_0_30px_rgba(34,197,94,0.5)]"
        >
          <Heart size={28} fill="currentColor" className="group-hover:scale-110 transition-transform duration-300 sm:w-8 sm:h-8" />
        </button>
      </div>
    </div>
  );
};
