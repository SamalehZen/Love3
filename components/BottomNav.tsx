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
    <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      {/* 
          Floating Island Container 
          - Dark Mode: Deep Black #0F0F11 with subtle border
          - Light Mode: White with subtle border
      */}
      <div className={`pointer-events-auto flex items-center gap-2 p-2 rounded-full shadow-2xl transition-colors duration-500 ${isDarkMode ? 'bg-[#0F0F11] border border-white/5 shadow-black/50' : 'bg-white border border-gray-100 shadow-gray-200/50'}`}>
        
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`
                relative flex items-center h-12 rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden cursor-pointer
                ${isActive 
                    ? 'bg-[#32D583] text-[#0F0F11]' /* Active: Green Bg, Black Text */
                    : `${isDarkMode ? 'bg-[#1C1C1E] text-gray-500 hover:bg-[#2C2C2E]' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}` /* Inactive: Grey Bg */
                }
              `}
              style={{
                  // Fluid width transition: Active expands, Inactive shrinks to circle
                  maxWidth: isActive ? '160px' : '48px',
                  minWidth: '48px',
                  paddingLeft: isActive ? '20px' : '0',
                  paddingRight: isActive ? '24px' : '0',
                  justifyContent: isActive ? 'flex-start' : 'center'
              }}
            >
              {/* Icon */}
              <Icon 
                size={20} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`shrink-0 z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} 
              />
              
              {/* Label (Revealed on Active) */}
              <div 
                className={`overflow-hidden flex items-center whitespace-nowrap transition-all duration-500 ${isActive ? 'w-auto opacity-100 ml-2' : 'w-0 opacity-0 ml-0'}`}
              >
                <span className="text-sm font-bold tracking-wide">{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};