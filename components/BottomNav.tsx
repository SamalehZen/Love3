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
          - Dark Mode: Deep Black #0F0F11 with subtle border
          - Light Mode: White with subtle border
          - Added overflow-hidden for shimmer effect
      */}
      <div className={`
        relative pointer-events-auto flex items-center gap-2 p-2.5 rounded-full shadow-2xl transition-colors duration-500 overflow-hidden
        ${isDarkMode ? 'bg-[#0F0F11] border border-white/10 shadow-black/60' : 'bg-white border border-gray-100 shadow-gray-200/50'}
      `}>
        
        {/* Continuous Premium Shimmer Overlay */}
        <div className={`absolute inset-0 pointer-events-none opacity-10 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer-slow`}></div>

        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`
                relative flex items-center h-14 rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden cursor-pointer z-10
                ${isActive 
                    ? 'bg-[#32D583] text-[#0F0F11] shadow-[0_0_20px_rgba(50,213,131,0.3)]' /* Active: Green Bg, Black Text, Green Glow */
                    : `${isDarkMode ? 'bg-[#1C1C1E] text-gray-500 hover:bg-[#2C2C2E]' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}` /* Inactive: Grey Bg */
                }
              `}
              style={{
                  // Fluid width transition: Active expands, Inactive shrinks to circle
                  maxWidth: isActive ? '170px' : '56px',
                  minWidth: '56px',
                  paddingLeft: isActive ? '22px' : '0',
                  paddingRight: isActive ? '26px' : '0',
                  justifyContent: isActive ? 'flex-start' : 'center'
              }}
            >
              {/* Icon */}
              <Icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`shrink-0 z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} 
              />
              
              {/* Label (Revealed on Active) */}
              <div 
                className={`overflow-hidden flex items-center whitespace-nowrap transition-all duration-500 ${isActive ? 'w-auto opacity-100 ml-3' : 'w-0 opacity-0 ml-0'}`}
              >
                <span className="text-[15px] font-bold tracking-wide">{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes shimmer-slow {
            0% { transform: translateX(-150%) skewX(-20deg); }
            50% { transform: translateX(150%) skewX(-20deg); }
            100% { transform: translateX(150%) skewX(-20deg); }
        }
        .animate-shimmer-slow {
            animation: shimmer-slow 6s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};