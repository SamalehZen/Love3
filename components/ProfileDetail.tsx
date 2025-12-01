import React, { useState, useRef, useEffect } from 'react';
import { Settings, Edit2, Pizza, Book, Plane, Palette, Sun, CheckCircle, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const GALLERY_IMAGES = [
  "https://picsum.photos/300/400?random=21",
  "https://picsum.photos/300/400?random=22",
  "https://picsum.photos/600/400?random=23"
];

export const ProfileDetail: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Touch handling refs
  const touchStartX = useRef(0);
  const lastTap = useRef(0);

  // Reset zoom when changing slides
  useEffect(() => {
    setIsZoomed(false);
  }, [selectedIndex]);

  // Navigation handlers
  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! + 1) % GALLERY_IMAGES.length);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  };

  const handleClose = () => {
    setSelectedIndex(null);
    setIsZoomed(false);
  };

  // Touch/Swipe Logic
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isZoomed) return; // Disable swipe when zoomed to avoid conflict with panning

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    // Threshold for swipe (50px)
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
  };

  // Double tap to zoom
  const handleImageClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
        setIsZoomed(!isZoomed);
    }
    lastTap.current = now;
  };

  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-background pb-24">
      {/* Header Image */}
      <div className="relative w-full h-96">
        <img 
          src="https://picsum.photos/600/800?random=20" 
          alt="Profile" 
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background" />
        
        {/* Top Nav */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center pt-8">
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition">
                <Settings className="text-white" size={20} />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition">
                <Edit2 className="text-white" size={18} />
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="-mt-20 relative px-6 z-10">
         <div className="flex items-center gap-2 mb-1">
             <h1 className="text-3xl font-bold text-white">Lay M, 25</h1>
             <CheckCircle className="text-blue-500 fill-current" size={24} />
         </div>
         <p className="text-gray-400 text-sm mb-6">Washington, USA</p>

         <div className="mb-8">
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">About</h3>
            <p className="text-gray-200 text-base leading-relaxed">
                Hi there! 👋 I'm 25, into coffee ☕, travel ✈️, and late-night talks ✨. Always open to new people and good vibes 🌎.
            </p>
         </div>

         <div className="mb-8">
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Interests</h3>
            <div className="flex flex-wrap gap-3">
                {[
                    { icon: Pizza, label: 'Street Food', color: 'text-orange-500' },
                    { icon: Book, label: 'Books', color: 'text-blue-400' },
                    { icon: Plane, label: 'Travel', color: 'text-blue-300' },
                    { icon: Palette, label: 'Digital Art', color: 'text-purple-400' },
                    { icon: Sun, label: 'Beach Time', color: 'text-yellow-400' }
                ].map((interest, idx) => {
                    const Icon = interest.icon;
                    return (
                        <div key={idx} className="flex items-center gap-2 bg-chip px-4 py-2.5 rounded-full border border-white/5">
                            <Icon size={16} className={interest.color} />
                            <span className="text-gray-200 text-sm">{interest.label}</span>
                        </div>
                    );
                })}
            </div>
         </div>
         
         {/* Gallery Grid */}
         <div className="grid grid-cols-2 gap-3 mb-8">
             {GALLERY_IMAGES.map((src, index) => (
                <div 
                  key={index} 
                  className={`h-48 rounded-2xl bg-surface overflow-hidden cursor-pointer active:scale-95 transition-transform ${index === 2 ? 'col-span-2' : ''}`}
                  onClick={() => setSelectedIndex(index)}
                >
                    <img src={src} className="w-full h-full object-cover" alt={`Gallery ${index}`} />
                </div>
             ))}
         </div>
      </div>

      {/* Full Screen Lightbox */}
      {selectedIndex !== null && (
        <div 
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center touch-none animate-in fade-in duration-300"
            onClick={handleClose}
        >
            {/* Controls */}
            <button 
                onClick={handleClose}
                className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 z-50"
            >
                <X size={24} />
            </button>

            {/* Navigation Arrows (Hidden on mobile generally, but good for larger screens) */}
            <button 
                onClick={handlePrev}
                className="absolute left-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 z-50 hidden sm:block"
            >
                <ChevronLeft size={32} />
            </button>

            <button 
                onClick={handleNext}
                className="absolute right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 z-50 hidden sm:block"
            >
                <ChevronRight size={32} />
            </button>
            
            {/* Image Container */}
            <div 
                className="w-full h-full flex items-center justify-center overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <img 
                    src={GALLERY_IMAGES[selectedIndex]} 
                    alt="Full screen view" 
                    className={`max-w-full max-h-full object-contain transition-transform duration-300 ease-out ${isZoomed ? 'scale-[2.5] cursor-move' : 'scale-100 cursor-zoom-in'}`}
                    onClick={handleImageClick}
                />
            </div>

            {/* Bottom Indicators */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 z-50">
                {GALLERY_IMAGES.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === selectedIndex ? 'bg-white w-6' : 'bg-white/30'}`} 
                    />
                ))}
            </div>

            {/* Hint Toast */}
            {!isZoomed && (
                <div className="absolute bottom-24 bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-2 animate-pulse">
                    <ZoomIn size={14} className="text-gray-300" />
                    <span className="text-xs text-gray-300">Double tap to zoom</span>
                </div>
            )}
        </div>
      )}
    </div>
  );
};
