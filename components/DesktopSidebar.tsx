import React from 'react';
import { Home, MapPin, MessageCircle, Heart, User, Crown, Settings } from 'lucide-react';
import { ViewState } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { Logo, BRAND } from './Logo';

interface DesktopSidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onOpenSettings: () => void;
}

const navItems = [
  { id: 'swipe', icon: Home, label: 'Découvrir' },
  { id: 'nearby', icon: MapPin, label: 'À proximité' },
  { id: 'chat', icon: MessageCircle, label: 'Messages' },
  { id: 'matches', icon: Heart, label: 'Mes Fans' },
  { id: 'profile', icon: User, label: 'Mon Profil' },
] as const;

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentView, setView, onOpenSettings }) => {
  const { isDarkMode, theme } = useTheme();

  return (
    <div className={`h-full flex flex-col py-6 px-4 animate-sidebar-slide ${theme.bg}`}>
      <div className="px-4 mb-8">
        <div className="flex items-center gap-3">
          <Logo variant="icon-filled" size="md" />
          <div>
            <h1 className="text-xl font-bold" style={{ color: BRAND.colors.primary }}>
              {BRAND.name}
            </h1>
            <p className={`text-[10px] ${theme.textSub}`}>{BRAND.tagline}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`
                w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 focus-ring
                ${isActive 
                  ? 'bg-[#32D583]/10 text-[#32D583]' 
                  : `${theme.textSub} hover:bg-white/5`
                }
              `}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`font-medium ${isActive ? 'text-[#32D583]' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="ml-auto w-1.5 h-6 bg-[#32D583] rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="relative rounded-2xl p-4 overflow-hidden mb-4 cursor-pointer group hover-lift">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/10 via-[#FFA500]/10 to-[#FFD700]/5 border border-[#FFD700]/20 rounded-2xl"></div>
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#FFD700]/20 blur-3xl rounded-full"></div>
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute top-0 left-0 w-[200%] h-full bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent premium-shimmer"></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Crown size={18} className="text-[#FFD700] fill-current" />
              <span className="text-[#FFD700] font-bold text-sm">{BRAND.name} Gold</span>
            </div>
            <p className="text-gray-400 text-xs mb-3">Débloquez toutes les fonctionnalités</p>
            <button className="w-full py-2 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-lg text-black font-semibold text-sm hover:opacity-90 transition-opacity active:scale-95">
              Upgrader
            </button>
          </div>
        </div>

        <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}>
          <img 
            src="https://picsum.photos/100/100?random=1" 
            className="w-10 h-10 rounded-full object-cover"
            alt="Profile"
          />
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm truncate ${theme.textMain}`}>Lay M.</p>
            <p className={`text-xs ${theme.textSub}`}>Voir le profil</p>
          </div>
          <button 
            onClick={onOpenSettings}
            className={`p-2 rounded-lg transition-colors focus-ring ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-300'} ${theme.textSub}`}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
