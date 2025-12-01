import React, { useState, useRef, useEffect } from 'react';
import { X, Heart, Gift, MapPin, Search, Star } from 'lucide-react';
import { Profile } from '../types';

interface SwipeCardProps {
  profile: Profile;
  nextProfile?: Profile;
  onAction: (action: 'like' | 'reject' | 'super') => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ profile, nextProfile, onAction }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [exitVelocity, setExitVelocity] = useState(0);
  
  const startX = useRef(0);
  const startY = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 120;
  const ROTATION_FACTOR = 0.05;

  // Reset state when profile changes to ensure new card starts fresh
  useEffect(() => {
    setDragX(0);
    setDragY(0);
    setExitVelocity(0);
    setIsDragging(false);
  }, [profile.id]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    if ('touches' in e) {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    } else {
      startX.current = (e as React.MouseEvent).clientX;
      startY.current = (e as React.MouseEvent).clientY;
    }
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const deltaX = clientX - startX.current;
    const deltaY = clientY - startY.current;
    setDragX(deltaX);
    setDragY(deltaY);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      const direction = dragX > 0 ? 'like' : 'reject';
      const velocity = dragX > 0 ? 1000 : -1000;
      setExitVelocity(velocity);
      
      // Delay action to allow exit animation to play
      setTimeout(() => {
        onAction(direction);
      }, 200);
    } else {
      // Snap back
      setDragX(0);
      setDragY(0);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    const handleUp = () => handleDragEnd();

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

  // Calculations for animations
  const isExiting = exitVelocity !== 0;
  
  // Calculate swipe progress (0 to 1). If exiting, force to 1 to complete animations.
  const rawProgress = Math.min(Math.abs(dragX) / (SWIPE_THRESHOLD * 1.2), 1);
  const swipeProgress = isExiting ? 1 : rawProgress;

  const rotation = dragX * ROTATION_FACTOR;
  
  // Opacities for LIKE/NOPE stamps
  const likeOpacity = Math.min(Math.max(dragX / (SWIPE_THRESHOLD * 0.8), 0), 1);
  const nopeOpacity = Math.min(Math.max(-dragX / (SWIPE_THRESHOLD * 0.8), 0), 1);
  
  // Back card animation: Scales up and moves up as front card leaves
  const backCardScale = 0.92 + (0.08 * swipeProgress); // 0.92 -> 1.0
  const backCardY = 30 - (30 * swipeProgress);         // 30px -> 0px
  const backCardOpacity = 0.5 + (0.5 * swipeProgress); // Fade in

  const cardStyle = {
    transform: exitVelocity 
      ? `translate(${exitVelocity}px, ${dragY}px) rotate(${exitVelocity * 0.05}deg)`
      : `translate(${dragX}px, ${dragY}px) rotate(${rotation}deg)`,
    transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div className="relative w-full h-full flex flex-col pt-4 pb-24 px-4 overflow-hidden select-none">
        
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4 px-2 z-50">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-red p-0.5">
                <img src="https://picsum.photos/100/100?random=1" className="w-full h-full rounded-full object-cover" />
            </div>
            <div>
                <p className="text-gray-400 text-xs">Hello Damien!</p>
                <div className="flex items-center gap-1 text-white text-sm font-medium">
                    <MapPin size={12} className="text-gray-400" />
                    Washington, USA
                </div>
            </div>
         </div>
         <button className="w-10 h-10 rounded-full bg-surface border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
            <Search className="text-gray-300" size={20} />
         </button>
      </div>

      {/* Card Stack Container */}
      <div className="flex-1 relative w-full perspective-[1000px]">
         
         {/* --- Background Card (Next Profile) --- */}
         {nextProfile && (
            <div 
                className="absolute inset-0 z-10 rounded-[32px] overflow-hidden bg-surface border border-white/5 shadow-xl"
                style={{
                    transform: `scale(${backCardScale}) translateY(${backCardY}px)`,
                    opacity: backCardOpacity,
                    transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease'
                }}
            >
                 <img 
                    src={nextProfile.imageUrl} 
                    alt={nextProfile.name} 
                    className="w-full h-full object-cover filter brightness-75"
                />
                 {/* Dark overlay that fades out as it comes to front */}
                <div 
                    className="absolute inset-0 bg-black/50 transition-opacity duration-300" 
                    style={{ opacity: 1 - swipeProgress }} 
                />
                
                {/* Info preview */}
                <div className="absolute bottom-0 w-full p-6 pb-8 bg-gradient-to-t from-black/90 to-transparent">
                    <h2 className="text-xl font-bold text-white/50">{nextProfile.name}, {nextProfile.age}</h2>
                </div>
            </div>
         )}

         {/* --- Foreground Card (Active) --- */}
         <div 
            ref={cardRef}
            className="absolute inset-0 z-20 rounded-[32px] overflow-hidden shadow-2xl bg-surface touch-none"
            style={cardStyle}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
         >
            {/* Same content as before */}
            <img 
                src={profile.imageUrl} 
                alt={profile.name} 
                className="w-full h-full object-cover pointer-events-none"
            />
            
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/90 pointer-events-none" />
            
            <div 
                className="absolute top-10 right-8 border-[6px] border-red-500 rounded-lg px-4 py-2 rotate-12 pointer-events-none transition-opacity duration-200"
                style={{ opacity: nopeOpacity }}
            >
                <span className="text-red-500 font-bold text-4xl tracking-widest drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">NOPE</span>
            </div>

            <div 
                className="absolute top-10 left-8 border-[6px] border-green-500 rounded-lg px-4 py-2 -rotate-12 pointer-events-none transition-opacity duration-200"
                style={{ opacity: likeOpacity }}
            >
                <span className="text-green-500 font-bold text-4xl tracking-widest drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">LIKE</span>
            </div>

            <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg pointer-events-none">
                <span className="text-white text-sm font-semibold flex items-center gap-1">
                    <Star size={12} className="text-yellow-400 fill-current" />
                    Match {profile.matchPercentage}%
                </span>
            </div>

            <div className="absolute bottom-0 w-full p-6 pb-8 pointer-events-none">
                <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">{profile.name}, {profile.age}</h2>
                    {profile.isOnline && (
                        <span className="w-3 h-3 bg-action-green rounded-full shadow-[0_0_10px_rgba(50,213,131,0.8)] animate-pulse"></span>
                    )}
                </div>
                <p className="text-gray-300 text-sm font-medium mb-6 drop-shadow-md">{profile.location}</p>
                
                <div className="flex items-center justify-between px-4 pointer-events-auto">
                    <button 
                        onClick={(e) => { e.stopPropagation(); setExitVelocity(-1000); setTimeout(() => onAction('reject'), 200); }}
                        className="w-16 h-16 rounded-full bg-[#1C1C1E]/80 backdrop-blur-sm border border-action-red/30 flex items-center justify-center text-action-red hover:bg-action-red hover:text-white hover:scale-110 transition-all duration-300 shadow-lg active:scale-95 group"
                    >
                        <X size={32} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>

                    <button 
                        onClick={(e) => { e.stopPropagation(); onAction('super'); }}
                        className="w-14 h-14 rounded-full bg-action-purple/20 backdrop-blur-sm border border-action-purple/50 flex items-center justify-center text-action-purple hover:bg-action-purple hover:text-white hover:scale-110 transition-all duration-300 shadow-lg active:scale-95 group mx-4"
                    >
                        <Gift size={24} strokeWidth={2.5} className="group-hover:animate-bounce" />
                    </button>

                    <button 
                        onClick={(e) => { e.stopPropagation(); setExitVelocity(1000); setTimeout(() => onAction('like'), 200); }}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4ADE80] to-[#22C55E] flex items-center justify-center text-white hover:scale-110 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)] transition-all duration-300 shadow-lg shadow-green-500/30 active:scale-95 group"
                    >
                        <Heart size={32} fill="currentColor" className="group-hover:scale-110 transition-transform duration-300" />
                    </button>
                </div>
            </div>
         </div>

      </div>
    </div>
  );
};