import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Gift, ChevronRight } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }
    // Update width on resize
    const handleResize = () => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.clientWidth);
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
  };

  const handleDragMove = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const handleWidth = 56; // 14 (3.5rem) * 4px roughly, based on h-14 w-14
    const padding = 8; // 4px on each side
    const maxDrag = rect.width - handleWidth - padding;

    // Calculate position relative to container left
    let newX = clientX - rect.left - (handleWidth / 2);

    // Clamp values
    if (newX < 0) newX = 0;
    if (newX > maxDrag) newX = maxDrag;

    setDragX(newX);
  };

  const handleDragEnd = () => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const handleWidth = 56;
    const padding = 8;
    const maxDrag = rect.width - handleWidth - padding;

    // If dragged more than 70% across, complete the action
    if (dragX > maxDrag * 0.70) {
      setDragX(maxDrag);
      // Small delay for visual satisfaction before transition
      setTimeout(() => {
          onComplete();
      }, 200);
    } else {
      // Snap back
      setDragX(0);
    }
    setIsDragging(false);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleDragMove(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) handleDragMove(e.touches[0].clientX);
    };
    const handleUp = () => {
      if (isDragging) handleDragEnd();
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchend', handleUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, dragX]);

  // Calculate text opacity based on drag position
  const maxDrag = containerWidth > 0 ? containerWidth - 56 - 8 : 1;
  const textOpacity = Math.max(0, 1 - (dragX / maxDrag) * 1.5);

  return (
    <div className="h-full flex flex-col items-center justify-between p-6 relative overflow-hidden bg-background">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary-orange/20 to-transparent opacity-30 pointer-events-none" />

      {/* Header */}
      <div className="mt-8 z-10">
        <h1 className="text-white text-xl font-semibold tracking-wide text-center">Connexa</h1>
      </div>

      {/* Hero Visual */}
      <div className="flex-1 w-full flex items-center justify-center relative mt-4">
        {/* Decorative Cards */}
        <div className="relative w-64 h-80">
          {/* Back Card (Left) */}
          <div className="absolute top-4 -left-12 w-48 h-64 bg-surface rounded-[32px] transform -rotate-12 shadow-2xl border border-white/5 overflow-hidden opacity-80">
             <img src="https://picsum.photos/400/500?random=10" alt="User 1" className="w-full h-full object-cover opacity-60" />
             <div className="absolute bottom-4 left-4">
                <div className="w-10 h-10 bg-action-purple rounded-full flex items-center justify-center shadow-lg">
                    <Gift className="text-white" size={20} />
                </div>
             </div>
          </div>

          {/* Back Card (Right) */}
          <div className="absolute top-12 -right-8 w-48 h-64 bg-surface rounded-[32px] transform rotate-12 shadow-2xl border border-white/5 overflow-hidden opacity-90">
             <img src="https://picsum.photos/400/500?random=11" alt="User 2" className="w-full h-full object-cover opacity-60" />
             <div className="absolute top-4 right-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <MessageCircle className="text-white" size={20} />
                </div>
             </div>
          </div>

          {/* Main Card */}
          <div className="absolute top-0 left-4 w-56 h-72 bg-gradient-to-br from-primary-orange to-primary-red rounded-[32px] shadow-2xl transform rotate-0 overflow-hidden z-20">
             <img src="https://picsum.photos/400/500?random=12" alt="Main User" className="w-full h-full object-cover" />
             <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent">
                 <h3 className="text-white font-bold text-lg">Julia Lode, 27</h3>
                 <p className="text-gray-300 text-xs">Los Angeles</p>
             </div>
             {/* Floating Action Button on Card */}
             <div className="absolute bottom-8 -right-4 bg-action-red w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-4 border-background">
                <Heart className="text-white fill-current" size={24} />
             </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full mb-8 z-10">
        <h2 className="text-4xl font-bold text-white text-center leading-tight mb-4">
          Find Your <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-orange to-primary-red">
            Perfect Match
          </span>
        </h2>
        
        <p className="text-gray-400 text-center text-sm mb-10 px-6">
          Meet New People, Spark Real Connections, And See Where It Goes.
        </p>

        {/* Slide to Unlock Button */}
        <div 
            ref={containerRef}
            className="w-full h-16 bg-[#1C1C1E] rounded-full relative border border-white/10 overflow-hidden select-none group"
        >
           {/* Shimmer Text */}
           <div 
             className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300"
             style={{ opacity: textOpacity }}
           >
              <span className="text-white/50 text-lg font-semibold flex items-center gap-1">
                Get Started 
                <span className="flex">
                    <ChevronRight size={16} className="opacity-40 animate-pulse" />
                    <ChevronRight size={16} className="opacity-70 animate-pulse delay-75" />
                    <ChevronRight size={16} className="opacity-100 animate-pulse delay-150" />
                </span>
              </span>
              
              {/* Shimmer overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
           </div>

           {/* Draggable Handle */}
           <div 
              className="absolute top-1 left-1 w-14 h-14 bg-primary-red rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-20 shadow-[0_0_20px_rgba(232,75,60,0.5)]"
              style={{ 
                  transform: `translateX(${dragX}px)`,
                  transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
           >
               <Heart className={`text-white fill-current transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`} size={24} />
           </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};