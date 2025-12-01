import React, { useState, useRef, useEffect } from 'react';
import { Heart, X, ChevronRight, Sparkles } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Static "Luxury" Images
  const IMG_WOMAN = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop";
  const IMG_MAN = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop";

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.clientWidth);
    }
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
    const handleWidth = 56;
    const padding = 8;
    const maxDrag = rect.width - handleWidth - padding;

    let newX = clientX - rect.left - (handleWidth / 2);
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

    if (dragX > maxDrag * 0.70) {
      setDragX(maxDrag);
      setTimeout(() => {
          onComplete();
      }, 200);
    } else {
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

  const maxDrag = containerWidth > 0 ? containerWidth - 56 - 8 : 1;
  const textOpacity = Math.max(0, 1 - (dragX / maxDrag) * 1.5);

  return (
    <div className="h-full flex flex-col items-center justify-between p-6 relative overflow-hidden bg-[#000]">
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-20deg); }
          50% { transform: translateX(150%) skewX(-20deg); }
          100% { transform: translateX(150%) skewX(-20deg); }
        }
        .animate-shimmer-card {
          animation: shimmer 3s infinite ease-in-out;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-10px) rotate(-2deg); }
        }
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
        @keyframes float-back {
          0%, 100% { transform: translateY(0px) rotate(-8deg) translateX(-10px); }
          50% { transform: translateY(-5px) rotate(-6deg) translateX(-10px); }
        }
        .animate-float-back {
            animation: float-back 7s ease-in-out infinite;
        }
      `}</style>

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-action-purple/20 via-primary-red/5 to-transparent opacity-40 pointer-events-none blur-3xl" />

      {/* Spacer for top since we removed the header */}
      <div className="mt-4"></div>

      {/* Hero Visual - Premium 2 Card Layout */}
      <div className="flex-1 w-full flex items-center justify-center relative -mt-8">
        {/* Reduced Container Size */}
        <div className="relative w-64 h-[400px]">
          
          {/* Card 1: Man (Back/Left) - "Cancel" Concept */}
          {/* Adjusted positioning to be more visible (moved left) and animated */}
          <div className="absolute top-6 -left-10 w-full h-full rounded-[32px] transform -rotate-6 scale-95 shadow-2xl border border-white/10 overflow-hidden z-10 bg-[#1C1C1E] animate-float-back">
             <img src={IMG_MAN} alt="User Man" className="w-full h-full object-cover opacity-80 filter grayscale-[20%]" />
             
             {/* Shimmer Overlay for Back Card */}
             <div className="absolute inset-0 z-30 pointer-events-none opacity-60">
                 <div className="w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-card" style={{ animationDelay: '1.5s' }}></div>
             </div>

             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
             
             {/* Cancel Icon Badge - Animated */}
             <div className="absolute bottom-8 left-6 backdrop-blur-md bg-white/10 border border-white/20 w-12 h-12 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <X className="text-white" size={24} />
             </div>
          </div>

          {/* Card 2: Woman (Front/Right) - "Love" Concept */}
          <div className="absolute top-0 right-0 w-full h-full rounded-[32px] transform rotate-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden z-20 bg-[#1C1C1E] animate-float">
             <img src={IMG_WOMAN} alt="User Woman" className="w-full h-full object-cover" />
             
             {/* Premium Shimmer Overlay */}
             <div className="absolute inset-0 z-30 pointer-events-none">
                 <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-card"></div>
             </div>

             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>
             
             {/* Text Info */}
             <div className="absolute bottom-24 left-6 z-30">
                 <h2 className="text-2xl font-bold text-white tracking-tight">Julia, 24</h2>
                 <p className="text-gray-300 text-xs font-medium">Paris, France</p>
             </div>

             {/* Love Icon Badge */}
             <div className="absolute bottom-6 right-6 bg-gradient-to-tr from-action-purple to-pink-500 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(123,76,246,0.5)] border-2 border-white/20 z-30">
                <Heart className="text-white fill-current" size={24} />
             </div>
             
             {/* Decorative Sparkle */}
             <div className="absolute top-6 right-6 opacity-80 animate-pulse">
                <Sparkles className="text-yellow-400" size={20} />
             </div>
          </div>

        </div>
      </div>

      {/* Content */}
      <div className="w-full mb-8 z-30">
        <h2 className="text-3xl font-bold text-white text-center leading-tight mb-3 tracking-tight">
          Trouvez Votre <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-action-purple to-pink-500">
            Match Idéal
          </span>
        </h2>
        
        <p className="text-gray-400 text-center text-sm mb-8 px-6 font-light">
          Rencontrez de nouvelles personnes et créez de vrais liens uniques.
        </p>

        {/* Slide to Unlock Button */}
        <div 
            ref={containerRef}
            className="w-full h-16 bg-[#1C1C1E]/80 backdrop-blur-xl rounded-full relative border border-white/10 overflow-hidden select-none shadow-2xl"
        >
           {/* Shimmer Text */}
           <div 
             className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300"
             style={{ opacity: textOpacity }}
           >
              <span className="text-white/60 text-sm font-semibold flex items-center gap-2 tracking-widest uppercase">
                Commencer 
                <span className="flex">
                    <ChevronRight size={14} className="opacity-40 animate-pulse" />
                    <ChevronRight size={14} className="opacity-70 animate-pulse delay-75" />
                    <ChevronRight size={14} className="opacity-100 animate-pulse delay-150" />
                </span>
              </span>
           </div>

           {/* Draggable Handle */}
           <div 
              className="absolute top-1 left-1 w-14 h-14 bg-white rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-20 shadow-[0_0_25px_rgba(255,255,255,0.4)]"
              style={{ 
                  transform: `translateX(${dragX}px)`,
                  transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
           >
               <Heart className={`text-action-purple fill-current transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`} size={22} />
           </div>
        </div>
      </div>
    </div>
  );
};