import React from 'react';
import { Layers, MapPin, MessageCircle, Star, User } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  // Navigation Configuration
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
        
        {/* Responsive SVG Curve Background */}
        <div className="absolute inset-0 w-full h-full pointer-events-auto filter drop-shadow-[0_-5px_10px_rgba(0,0,0,0.5)] text-[#1C1C1E]">
            <svg 
                viewBox="0 0 100 88" 
                preserveAspectRatio="none"
                className="w-full h-full"
            >
                {/* 
                  Path Logic (Relative coordinates):
                  Start bottom left (0,88)
                  Line to top left (0,20)
                  Line to near center (38,20)
                  Curve down-then-up for the hole/hump:
                    Control point 1: (42, 20)
                    Control point 2: (42, 50) -> Dip down? No, we want a hump.
                    Actually, design calls for a "convex" hump where the button sits IN or ON it.
                    Let's match the previous "hump" style but make it responsive.
                    Center is 50.
                    Start curve at 35. End curve at 65.
                    Bezier up to (50, -10).
                */}
                <path 
                    d="M0,88 L0,20 L36,20 C36,20 42,20 45,10 C48,-2 52,-2 55,10 C58,20 64,20 64,20 L100,20 L100,88 Z" 
                    fill="currentColor"
                />
            </svg>
        </div>

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
          {/* Sits exactly in the SVG hump */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-8 w-14 h-14 pointer-events-auto">
             <button
                onClick={() => setView('chat')}
                className={`w-full h-full rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 border-4 border-[#121214] ${
                    currentView === 'chat' 
                    ? 'bg-action-purple scale-110 shadow-[0_0_20px_rgba(123,76,246,0.6)]' 
                    : 'bg-[#2C2C2E] text-gray-400 hover:text-white hover:bg-action-purple hover:-translate-y-1'
                }`}
             >
                <MessageCircle size={26} strokeWidth={2.5} className="text-white fill-current" />
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