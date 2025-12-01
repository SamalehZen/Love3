import React, { useEffect, useState } from 'react';
import { Home, MapPin, MessageCircle, Heart, User } from 'lucide-react';
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

  const navItems = [
    { id: 'swipe', icon: Home, label: 'Accueil' },
    { id: 'nearby', icon: MapPin, label: 'Proximité' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'matches', icon: Heart, label: 'Fans' },
    { id: 'profile', icon: User, label: 'Profil' },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      {/* 
          Floating Island Container 
          - Clipped overflow ensures shimmer stays inside
          - Responsive padding/gap
      */}
      <div className={`
        relative pointer-events-auto flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-full shadow-2xl transition-colors duration-500 overflow-hidden
        ${isDarkMode ? 'bg-[#0F0F11] border border-white/5 shadow-black/60' : 'bg-white border border-gray-100 shadow-gray-200/50'}
      `}>
        
        {/* Continuous Premium Shimmer Overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
             <div className={`absolute top-0 left-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-shimmer-continuous`}></div>
        </div>

        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`
                relative flex items-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden cursor-pointer z-10
                h-12 sm:h-14
                ${isDarkMode ? 'bg-[#1C1C1E]' : 'bg-gray-50 border border-gray-100'}
              `}
              style={{
                  // Fluid width transition: Active expands, Inactive remains circle
                  // Responsive sizing ensures 5 items fit on 360px width
                  maxWidth: isActive ? '160px' : '48px',
                  minWidth: '44px', 
                  paddingLeft: '5px', 
                  paddingRight: isActive ? '16px' : '5px', 
              }}
            >
              {/* Icon Circle Wrapper 
                  - Active: Green Background (#32D583) with Black Icon
                  - Inactive: Transparent with Grey Icon
              */}
              <div className={`
                h-9 w-9 sm:h-11 sm:w-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
                ${isActive 
                    ? 'bg-[#32D583] text-[#0F0F11] shadow-[0_0_15px_rgba(50,213,131,0.4)]' 
                    : `${isDarkMode ? 'text-gray-500 bg-transparent' : 'text-gray-400 bg-transparent'}` 
                }
              `}>
                <Icon 
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${isActive ? 'scale-105' : 'scale-100'}`} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
              </div>
              
              {/* Label (Revealed on Active) */}
              <div 
                className={`overflow-hidden flex items-center whitespace-nowrap transition-all duration-500 ${isActive ? 'w-auto opacity-100 ml-2 sm:ml-3' : 'w-0 opacity-0 ml-0'}`}
              >
                <span className={`text-xs sm:text-sm font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes shimmer-continuous {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(50%); }
        }
        .animate-shimmer-continuous {
            animation: shimmer-continuous 3s infinite linear;
        }
      `}</style>
    </div>
  );
};