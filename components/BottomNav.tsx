import React from 'react';
import { Layers, MapPin, MessageCircle, Star, User } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  // Navigation Configuration
  // Note: Chat is handled separately as the center floating button
  const leftItems = [
    { id: 'swipe', icon: Layers, label: 'Accueil' },
    { id: 'nearby', icon: MapPin, label: 'À proximité' },
  ];

  const rightItems = [
    { id: 'matches', icon: Star, label: 'Fans' },
    { id: 'profile', icon: User, label: 'Profil' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto pointer-events-none">
      <div className="relative w-full h-[88px] flex items-end">
        
        {/* SVG Curve Background */}
        <svg 
            viewBox="0 0 375 88" 
            className="absolute bottom-0 left-0 w-full h-full text-[#1C1C1E] drop-shadow-[0_-5px_10px_rgba(0,0,0,0.5)] pointer-events-auto"
            preserveAspectRatio="none"
        >
          {/* 
            Path Explanation:
            Start bottom-left, go up to height (approx 88-20=68), line to center-left area.
            Curve up for the "hump" (convex).
            Line to top-right, down to bottom-right, close.
           */}
          <path 
            d="M0,88 L0,20 C0,20 120,20 140,20 C140,20 155,20 165,10 C175,-5 200,-5 210,10 C220,20 235,20 235,20 C255,20 375,20 375,20 L375,88 Z" 
            fill="currentColor"
          />
        </svg>

        {/* Navigation Content Container */}
        <div className="relative w-full h-[68px] flex justify-between items-center px-4 pointer-events-auto">
          
          {/* Left Side Icons */}
          <div className="flex items-center justify-around w-[40%]">
            {leftItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id as ViewState)}
                  className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                    isActive ? 'text-[#C0A0FF]' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'drop-shadow-[0_0_8px_rgba(192,160,255,0.5)]' : ''} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Center Floating Chat Button */}
          {/* Positioned absolutely relative to the container to sit in the "hump" */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-10 w-16 h-16 pointer-events-auto">
             <button
                onClick={() => setView('chat')}
                className={`w-full h-full rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 ${
                    currentView === 'chat' 
                    ? 'bg-action-purple scale-110 shadow-[0_0_20px_rgba(123,76,246,0.6)]' 
                    : 'bg-[#2C2C2E] text-gray-400 hover:text-white hover:bg-action-purple hover:-translate-y-1'
                }`}
             >
                <MessageCircle size={32} strokeWidth={2.5} className="text-white fill-current" />
             </button>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center justify-around w-[40%]">
            {rightItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setView(item.id as ViewState)}
                  className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                    isActive ? 'text-[#C0A0FF]' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'drop-shadow-[0_0_8px_rgba(192,160,255,0.5)]' : ''} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};