import React, { useEffect, useState } from 'react';
import { Home, MapPin, MessageCircle, Heart, User, Sparkles } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Detect System Theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkMode(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }
  }, []);

  // Navigation Configuration
  const navItems = [
    { id: 'swipe', icon: Home, label: 'Accueil' },
    { id: 'nearby', icon: MapPin, label: 'Proximité' },
    { id: 'chat', icon: MessageCircle, label: '', isCenter: true }, // Placeholder for center
    { id: 'matches', icon: Heart, label: 'Fans' },
    { id: 'profile', icon: User, label: 'Profil' },
  ];

  // Theme Colors
  const theme = {
      barBg: isDarkMode ? 'text-[#1C1C1E]' : 'text-white', // SVG fill color
      shadow: isDarkMode ? 'drop-shadow-[0_-5px_10px_rgba(0,0,0,0.5)]' : 'drop-shadow-[0_-5px_15px_rgba(0,0,0,0.05)]',
      textInactive: isDarkMode ? 'text-gray-500' : 'text-gray-400',
      textActive: 'text-[#FF6B3C]', // Primary Orange match
      iconInactive: isDarkMode ? 'text-gray-500' : 'text-gray-400',
      iconActive: 'text-[#FF6B3C]',
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto pointer-events-none">
      
      <div className="relative w-full h-[90px] flex items-end">
        
        {/* SVG Background with Hump */}
        <div className={`absolute inset-0 w-full h-full pointer-events-auto transition-colors duration-500 ${theme.shadow} ${theme.barBg}`}>
            <svg 
                viewBox="0 0 375 90" 
                preserveAspectRatio="none"
                className="w-full h-full"
            >
                {/* 
                   Path Breakdown:
                   M 0,30 : Start left, 30px from top
                   L 135,30 : Line to start of curve
                   C 145,30 155,10 187.5,10 : Curve up to peak (center)
                   C 220,10 230,30 240,30 : Curve down from peak
                   L 375,30 : Line to right edge
                   L 375,90 : Line to bottom right
                   L 0,90 : Line to bottom left
                   Z : Close
                */}
                <path 
                    d="M 0,30 L 135,30 C 145,30 160,6 187.5,6 C 215,6 230,30 240,30 L 375,30 L 375,90 L 0,90 Z" 
                    fill="currentColor"
                />
            </svg>
        </div>

        {/* Floating Center Button (Chat) */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[45px] z-20 pointer-events-auto">
             <button
                onClick={() => setView('chat')}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95 bg-[#FF6B3C] border-4 ${isDarkMode ? 'border-[#121214]' : 'border-white'}`}
             >
                <MessageCircle size={24} className="text-white fill-current" />
             </button>
        </div>

        {/* Navigation Items Container */}
        <div className="relative w-full h-[60px] flex justify-between items-center px-2 pointer-events-auto pb-1">
          {navItems.map((item) => {
             if (item.isCenter) {
                 // Spacer for center button
                 return <div key={item.id} className="w-16" />;
             }

             const isActive = currentView === item.id;
             const Icon = item.icon;

             return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id as ViewState)}
                  className="flex-1 flex flex-col items-center justify-center gap-1 h-full pt-2 group"
                >
                  <Icon 
                    size={24} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-colors duration-300 ${isActive ? theme.iconActive : theme.iconInactive} ${isActive ? 'fill-current opacity-20' : 'fill-none'} absolute`}
                  />
                  {/* Foreground Icon (Outline) */}
                   <Icon 
                    size={24} 
                    strokeWidth={isActive ? 2.5 : 2}
                    className={`transition-colors duration-300 ${isActive ? theme.iconActive : theme.iconInactive}`}
                  />
                  
                  <span className={`text-[10px] font-medium mt-7 transition-colors duration-300 ${isActive ? theme.textActive : theme.textInactive}`}>
                    {item.label}
                  </span>
                </button>
             );
          })}
        </div>
      </div>
    </div>
  );
};
