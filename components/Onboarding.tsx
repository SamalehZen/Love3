import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Heart, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useHaptic } from '../hooks/useHaptic';
import { Logo, BRAND } from './Logo';
import { GridBackground, Spotlight } from './SpotlightBackground';

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
  const { isDarkMode } = useTheme();
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
      ? 'from-[#32D583]/20 via-[#121214] to-[#121214]' 
      : 'from-[#32D583]/10 via-[#F2F2F7] to-[#F2F2F7]',
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
      <GridBackground />
      <Spotlight />
      <div className={`absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-black/80 via-transparent to-[#010f08]/80 pointer-events-none transition-colors duration-500`}></div>
      
      <div className="absolute top-4 sm:top-6 left-0 right-0 z-30 flex justify-center lg:justify-start lg:left-8 xl:left-12">
        <Logo variant="full" size="lg" className={isDarkMode ? 'text-white drop-shadow-lg' : 'text-gray-900 drop-shadow-lg'} />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center relative z-10 pt-16 lg:pt-0 lg:px-8 xl:px-16 gap-8 lg:gap-16 xl:gap-24">
        <div className="relative w-[85vw] max-w-[320px] md:max-w-[380px] lg:max-w-[420px] xl:max-w-[480px] h-[320px] sm:h-[360px] md:h-[400px] lg:h-[450px] xl:h-[520px] flex items-center justify-center flex-shrink-0">
          <div 
            className={`absolute w-36 h-52 sm:w-44 sm:h-64 md:w-52 md:h-72 lg:w-56 lg:h-80 xl:w-64 xl:h-96 rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-2xl border-[3px] animate-float-back transition-colors duration-500 ${isDarkMode ? 'border-white/5' : 'border-white'}`}
            style={{ zIndex: 10 }}
          >
            <img src={IMG_MAN} className="w-full h-full object-cover" alt="Profile" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-black/10"></div>
            
            <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4">
              <h3 className="text-white font-bold text-xs sm:text-sm flex items-center gap-1.5">
                Jastin, 24 <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#32D583] rounded-full"></span>
              </h3>
              <p className="text-gray-300 text-[9px] sm:text-[10px]">New York</p>
            </div>

            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shimmer-wave pointer-events-none"></div>
          </div>

          <div className="absolute top-1/2 left-0 z-30 transform -translate-y-14 sm:-translate-y-16 -translate-x-2 sm:-translate-x-4 lg:-translate-x-6">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center shadow-lg shadow-red-500/10 border-2 border-red-500/30 transition-colors duration-500 ${isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white'}`}>
              <X className="text-red-500" size={16} strokeWidth={3} />
            </div>
          </div>

          <div 
            className={`absolute w-36 h-52 sm:w-44 sm:h-64 md:w-52 md:h-72 lg:w-56 lg:h-80 xl:w-64 xl:h-96 rounded-[24px] sm:rounded-[28px] overflow-hidden border-[3px] animate-float-front transition-colors duration-500 ${themeStyles.cardBorder} ${themeStyles.cardShadow}`}
            style={{ zIndex: 20 }}
          >
            <img src={IMG_WOMAN} className="w-full h-full object-cover" alt="Profile" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5">
              <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg flex items-center gap-1.5 sm:gap-2">
                Julia Lode, 27 <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#32D583] rounded-full border border-black shadow-[0_0_8px_#32D583]"></span>
              </h3>
              <p className="text-gray-300 text-[10px] sm:text-xs">Los Angeles</p>
            </div>

            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-shimmer-wave pointer-events-none" style={{ animationDelay: '0.50s' }}></div>
          </div>

          <div className="absolute bottom-6 sm:bottom-10 lg:bottom-12 -right-1 sm:-right-0 lg:-right-2 z-30">
            <div 
              className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center shadow-lg border-4 transition-colors duration-500 ${isDarkMode ? 'border-[#121214]' : 'border-[#F2F2F7]'}`} 
              style={{ backgroundColor: BRAND.colors.primary, boxShadow: `0 10px 25px ${BRAND.colors.primary}40` }}
            >
              <Heart className="text-white fill-current" size={18} />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center lg:items-start text-center lg:text-left lg:max-w-md xl:max-w-lg">
          <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 tracking-tight leading-tight transition-colors duration-500 ${themeStyles.textTitle}`}>
            Trouvez Votre <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ADE80] to-[#32D583]">Match Idéal</span>
          </h1>
          <p className={`text-xs sm:text-sm lg:text-base leading-relaxed max-w-[280px] lg:max-w-none transition-colors duration-500 ${themeStyles.textSub}`}>
            Rencontrez de nouvelles personnes, créez de vraies connexions et voyez où cela mène.
          </p>
          
          <div className="w-full max-w-[280px] sm:max-w-sm lg:max-w-md mt-6 sm:mt-8 lg:mt-10">
            <div 
              ref={containerRef}
              className={`relative h-12 sm:h-14 lg:h-16 rounded-full flex items-center px-2 overflow-hidden border transition-all duration-500 ${isCompleted ? 'border-[#32D583]/50' : ''} ${themeStyles.sliderBg}`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-[10px] sm:text-xs lg:text-sm font-semibold tracking-widest uppercase transition-all duration-500 ${
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
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#32D583]/20 to-[#32D583]/5 transition-all duration-75"
                style={{ width: `${dragX + 56}px` }}
              />

              <div
                className={`absolute w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-10 transition-transform duration-75 ${
                  isCompleted ? 'text-white scale-110' : 'text-white'
                }`}
                style={{ ...handleStyle, backgroundColor: BRAND.colors.primary }}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
              >
                <Heart fill="currentColor" size={16} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-6 sm:h-8 lg:h-4 flex-shrink-0"></div>
    </div>
  );
};
