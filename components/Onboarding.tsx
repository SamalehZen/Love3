import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Heart, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useHaptic } from '../hooks/useHaptic';
import { Logo, BRAND } from './Logo';

interface OnboardingProps {
  onComplete: () => void;
}

const IMG_WOMAN = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop";
const IMG_MAN = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop";

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDarkMode, theme } = useTheme();
  const { trigger } = useHaptic();

  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (isCompleted) return;
    setIsDragging(true);
  }, [isCompleted]);

  const handleDragMove = useCallback((clientX: number) => {
    if (!containerRef.current || isCompleted) return;

    const rect = containerRef.current.getBoundingClientRect();
    const handleWidth = 56;
    const padding = 8;
    const maxDrag = rect.width - handleWidth - padding;

    let newX = clientX - rect.left - (handleWidth / 2);
    if (newX < 0) newX = 0;
    if (newX > maxDrag) newX = maxDrag;

    setDragX(newX);
  }, [isCompleted]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging || !containerRef.current || isCompleted) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const handleWidth = 56;
    const padding = 8;
    const maxDrag = rect.width - handleWidth - padding;

    if (dragX > maxDrag * 0.70) {
      setDragX(maxDrag);
      setIsCompleted(true);
      trigger('success');
      setTimeout(() => {
        onComplete();
      }, 600);
    } else {
      setDragX(0);
    }
    setIsDragging(false);
  }, [isDragging, dragX, isCompleted, onComplete, trigger]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleDragMove(e.touches[0].clientX);
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

  const themeStyles = useMemo(() => ({
    bg: isDarkMode ? 'bg-[#0f0f0f]' : 'bg-[#F2F2F7]',
    overlay: isDarkMode 
      ? 'from-[#474FE7]/20 via-[#121214] to-[#121214]' 
      : 'from-[#474FE7]/10 via-[#F2F2F7] to-[#F2F2F7]',
    textTitle: isDarkMode ? 'text-white' : 'text-gray-900',
    textSub: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    cardBorder: isDarkMode ? 'border-white/10' : 'border-white',
    cardShadow: isDarkMode ? 'shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'shadow-[0_20px_50px_rgba(0,0,0,0.1)]',
    sliderBg: isDarkMode ? 'bg-[#1C1C1E] border-white/10' : 'bg-white border-gray-200 shadow-sm',
    shimmerText: isDarkMode 
      ? 'from-white/20 via-white to-white/20' 
      : 'from-gray-400 via-gray-900 to-gray-400',
  }), [isDarkMode]);

  const handleStyle = useMemo(() => ({
    transform: `translateX(${dragX}px)`,
    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.19, 1, 0.22, 1)'
  }), [dragX, isDragging]);

  return (
    <div className={`h-full flex flex-col relative overflow-hidden transition-colors duration-500 ${themeStyles.bg}`}>
      <div className={`absolute inset-0 bg-gradient-to-b ${themeStyles.overlay} pointer-events-none transition-colors duration-500`}></div>

      <div className="absolute top-6 left-0 right-0 z-20 flex justify-center">
        <Logo variant="full" size="lg" className={isDarkMode ? 'text-white' : 'text-gray-900'} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 mt-8">
        <div className="relative w-[85vw] max-w-[320px] md:max-w-[400px] lg:max-w-[450px] h-[360px] md:h-[420px] lg:h-[480px] flex items-center justify-center">
          <div 
            className={`absolute w-44 h-64 sm:w-48 sm:h-72 md:w-56 md:h-80 lg:w-64 lg:h-96 rounded-[28px] overflow-hidden shadow-2xl border-[3px] animate-float-back transition-colors duration-500 ${isDarkMode ? 'border-white/5' : 'border-white'}`}
            style={{ zIndex: 10 }}
          >
            <img src={IMG_MAN} className="w-full h-full object-cover" alt="Profile" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-black/10"></div>
            
            <div className="absolute bottom-4 left-4">
              <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                Jastin, 24 <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              </h3>
              <p className="text-gray-300 text-[10px]">New York</p>
            </div>

            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shimmer-wave pointer-events-none"></div>
          </div>

          <div className="absolute top-1/2 left-0 z-30 transform -translate-y-16 -translate-x-4 sm:-translate-x-6">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg shadow-red-500/10 border-2 border-red-500/30 transition-colors duration-500 ${isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white'}`}>
              <X className="text-red-500" size={18} strokeWidth={3} />
            </div>
          </div>

          <div 
            className={`absolute w-44 h-64 sm:w-48 sm:h-72 md:w-56 md:h-80 lg:w-64 lg:h-96 rounded-[28px] overflow-hidden border-[3px] animate-float-front transition-colors duration-500 ${themeStyles.cardBorder} ${themeStyles.cardShadow}`}
            style={{ zIndex: 20 }}
          >
            <img src={IMG_WOMAN} className="w-full h-full object-cover" alt="Profile" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-5 left-5">
              <h3 className="text-white font-bold text-base sm:text-lg flex items-center gap-2">
                Julia Lode, 27 <span className="w-2.5 h-2.5 bg-green-500 rounded-full border border-black shadow-[0_0_8px_#22c55e]"></span>
              </h3>
              <p className="text-gray-300 text-xs">Los Angeles</p>
            </div>

            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-shimmer-wave pointer-events-none" style={{ animationDelay: '0.50s' }}></div>
          </div>

          <div className="absolute bottom-10 sm:bottom-12 -right-0 sm:-right-2 z-30">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg border-4 transition-colors duration-500 ${isDarkMode ? 'border-[#121214]' : 'border-[#F2F2F7]'}`} style={{ backgroundColor: BRAND.colors.primary, boxShadow: `0 10px 25px ${BRAND.colors.primary}40` }}>
              <Heart className="text-white fill-current" size={20} />
            </div>
          </div>
        </div>

        <div className="text-center mt-6 sm:mt-8 px-8 relative z-20">
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 tracking-tight leading-tight transition-colors duration-500 ${themeStyles.textTitle}`}>
            Trouvez Votre <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#535BF3] to-[#474FE7]">Match Idéal</span>
          </h1>
          <p className={`text-xs sm:text-sm leading-relaxed max-w-[280px] mx-auto transition-colors duration-500 ${themeStyles.textSub}`}>
            Rencontrez de nouvelles personnes, créez de vraies connexions et voyez où cela mène.
          </p>
        </div>
      </div>

      <div className="px-6 pb-8 sm:pb-12 w-full max-w-sm mx-auto z-20">
        <div 
          ref={containerRef}
          className={`relative h-14 sm:h-16 rounded-full flex items-center px-2 overflow-hidden border transition-all duration-500 ${isCompleted ? 'border-[#474FE7]/50' : ''} ${themeStyles.sliderBg}`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-500 ${
              isCompleted 
              ? 'scale-110' 
              : 'animate-pulse'
            }`} style={isCompleted ? { color: BRAND.colors.primary } : {}}>
              {isCompleted ? 'Bienvenue' : (
                <span className={`bg-gradient-to-r ${themeStyles.shimmerText} bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer-text`}>
                  Commencer &gt;&gt;&gt;
                </span>
              )}
            </span>
          </div>

          <div 
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#474FE7]/20 to-[#474FE7]/5 transition-all duration-75"
            style={{ width: `${dragX + 56}px` }}
          />

          <div
            className={`absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-10 transition-transform duration-75 ${
              isCompleted ? 'text-white scale-110' : 'text-white'
            }`}
            style={{ ...handleStyle, backgroundColor: BRAND.colors.primary }}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
          >
            <Heart fill="currentColor" size={18} />
          </div>
        </div>
      </div>
    </div>
  );
};
