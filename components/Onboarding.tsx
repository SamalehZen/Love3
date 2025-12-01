import React, { useState, useRef, useEffect } from 'react';
import { Heart, ChevronRight, X } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Static "Luxury" Images
  const IMG_WOMAN = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop";
  const IMG_MAN = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop";

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (isCompleted) return;
    setIsDragging(true);
  };

  const handleDragMove = (clientX: number) => {
    if (!containerRef.current || isCompleted) return;

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
    if (!isDragging || !containerRef.current || isCompleted) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const handleWidth = 56;
    const padding = 8;
    const maxDrag = rect.width - handleWidth - padding;

    if (dragX > maxDrag * 0.70) {
      // Success State
      setDragX(maxDrag);
      setIsCompleted(true);
      setTimeout(() => {
          onComplete();
      }, 600);
    } else {
      // Snap back
      setDragX(0);
    }
    setIsDragging(false);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => isDragging && handleDragMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => isDragging && handleDragMove(e.touches[0].clientX);
    const handleUp = () => isDragging && handleDragEnd();

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
  }, [isDragging, dragX, isCompleted]);


  return (
    <div className="h-full flex flex-col bg-[#0f0f0f] relative overflow-hidden">
      
      {/* Background Gradient - Green Theme */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#32D583]/20 via-[#121214] to-[#121214] pointer-events-none"></div>

      {/* --- HERO SECTION: Stacked Cards --- */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 -mt-10">
        
        {/* Card Container - Width restricted to force overlap */}
        <div className="relative w-80 h-[380px] flex items-center justify-center">

            {/* --- BACK CARD (Man) --- */}
            {/* Positioned Left & Behind with Float Animation */}
            <div 
                className="absolute w-48 h-72 rounded-[28px] overflow-hidden shadow-2xl border-[3px] border-white/5 animate-float-back"
                style={{ zIndex: 10 }}
            >
                <img src={IMG_MAN} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute inset-0 bg-black/10"></div> {/* Dimmer */}
                
                {/* Info */}
                <div className="absolute bottom-4 left-4">
                    <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                        Jastin, 24 <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    </h3>
                    <p className="text-gray-300 text-[10px]">New York</p>
                </div>

                {/* Shimmer - Starts first */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-shimmer-wave pointer-events-none"></div>
            </div>

            {/* Floating Icon: Red X (Left of Man) - STATIC */}
            <div className="absolute top-1/2 left-0 z-30 transform -translate-y-16 -translate-x-6">
                <div className="w-12 h-12 rounded-full bg-[#1C1C1E] flex items-center justify-center shadow-lg shadow-red-500/10 border-2 border-red-500/30">
                     <X className="text-red-500" size={20} strokeWidth={3} />
                </div>
            </div>

            {/* --- FRONT CARD (Woman) --- */}
            {/* Positioned Right & Front with Float Animation */}
            <div 
                className="absolute w-48 h-72 rounded-[28px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-[3px] border-white/10 animate-float-front"
                style={{ zIndex: 20 }}
            >
                <img src={IMG_WOMAN} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                
                {/* Info */}
                <div className="absolute bottom-5 left-5">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        Julia Lode, 27 <span className="w-2.5 h-2.5 bg-green-500 rounded-full border border-black shadow-[0_0_8px_#22c55e]"></span>
                    </h3>
                    <p className="text-gray-300 text-xs">Los Angeles</p>
                </div>

                {/* Shimmer - Delay 0.50s */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-shimmer-wave pointer-events-none" style={{ animationDelay: '0.50s' }}></div>
            </div>

             {/* Floating Icon: GREEN Heart (Bottom Right of Woman) - STATIC */}
             <div className="absolute bottom-12 -right-2 z-30">
                <div className="w-14 h-14 rounded-full bg-[#32D583] flex items-center justify-center shadow-lg shadow-[#32D583]/30 border-4 border-[#121214]">
                    <Heart className="text-white fill-current" size={24} />
                </div>
            </div>

        </div>

        {/* Text Content */}
        <div className="text-center mt-8 px-8 relative z-20">
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight leading-tight">
                Trouvez Votre <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B3C] to-[#FF3A1F]">Match Idéal</span>
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed max-w-[280px] mx-auto">
                Rencontrez de nouvelles personnes, créez de vraies connexions et voyez où cela mène.
            </p>
        </div>
      </div>

      {/* --- SLIDER SECTION --- */}
      <div className="px-6 pb-12 w-full max-w-sm mx-auto z-20">
        <div 
            ref={containerRef}
            className={`relative h-16 bg-[#1C1C1E] rounded-full flex items-center px-2 overflow-hidden border transition-colors duration-500 ${isCompleted ? 'border-action-green/50' : 'border-white/10'}`}
        >
             {/* Slider Track Text */}
             <div className="absolute inset-0 flex items-center justify-center">
                 <span className={`text-sm font-semibold tracking-widest uppercase transition-all duration-500 ${
                     isCompleted 
                     ? 'text-action-green scale-110' 
                     : 'text-white/30 animate-pulse'
                 }`}>
                    {isCompleted ? 'Bienvenue' : (
                        <span className="bg-gradient-to-r from-white/20 via-white to-white/20 bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer-text">
                            Commencer &gt;&gt;&gt;
                        </span>
                    )}
                 </span>
             </div>

             {/* Progress Fill - Green */}
             <div 
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-action-green/20 to-action-green/5 transition-all duration-75"
                style={{ width: `${dragX + 56}px` }}
             />

             {/* Draggable Handle */}
             <div
                className={`absolute w-12 h-12 rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-10 transition-transform duration-75 ${
                    isCompleted ? 'bg-action-green text-black scale-110' : 'bg-action-red text-white'
                }`}
                style={{ 
                    transform: `translateX(${dragX}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.19, 1, 0.22, 1)'
                }}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
             >
                {isCompleted ? <Heart fill="currentColor" size={20} /> : <Heart fill="currentColor" size={20} />}
             </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes shimmer-wave {
            0% { transform: translateX(-200%) skewX(-20deg); }
            30% { transform: translateX(200%) skewX(-20deg); } /* Fast pass */
            100% { transform: translateX(200%) skewX(-20deg); } /* Wait */
        }
        .animate-shimmer-wave {
            animation: shimmer-wave 5.5s infinite ease-in-out;
        }
        @keyframes shimmer-text {
            0% { background-position: 200% center; }
            100% { background-position: -200% center; }
        }
        .animate-shimmer-text {
            animation: shimmer-text 3s linear infinite;
        }
        
        /* Floating Animations maintaining the tilt */
        @keyframes float-back {
            0%, 100% { transform: translateX(-65px) rotate(-15deg) translateY(0); }
            50% { transform: translateX(-65px) rotate(-15deg) translateY(-8px); }
        }
        .animate-float-back {
            animation: float-back 4s ease-in-out infinite;
        }

        @keyframes float-front {
            0%, 100% { transform: translateX(45px) translateY(10px) rotate(6deg); }
            50% { transform: translateX(45px) translateY(2px) rotate(6deg); }
        }
        .animate-float-front {
            animation: float-front 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};