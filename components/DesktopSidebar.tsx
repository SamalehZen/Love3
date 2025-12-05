import React from 'react';
import { Users, Inbox, MessageCircle, User, Crown, Settings } from 'lucide-react';
import type { ViewState } from '@types';
import { useTheme } from '@contexts/ThemeContext';
import { useRequests } from '@contexts/RequestsContext';
import { useConversations } from '@contexts/ConversationsContext';
import { useAuth } from '@contexts/AuthContext';
import { Logo, BRAND } from './Logo';

interface DesktopSidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onOpenSettings: () => void;
}

const navItems = [
  { id: 'nearby', icon: Users, label: 'Connexions' },
  { id: 'requests', icon: Inbox, label: 'Demandes', badgeKey: 'requests' },
  { id: 'conversations', icon: MessageCircle, label: 'Messages', badgeKey: 'messages' },
  { id: 'profile', icon: User, label: 'Mon Profil' },
] as const;

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentView, setView, onOpenSettings }) => {
  const { isDarkMode, theme } = useTheme();
  const { pendingCount } = useRequests();
  const { conversations } = useConversations();
  const { profile } = useAuth();
  const unreadCount = conversations.reduce((sum, conv) => sum + (conv.unread_count ?? 0), 0);

  return (
    <div className={`h-full flex flex-col py-6 px-4 animate-sidebar-slide ${theme.bg}`}>
      <div className="px-4 mb-8">
        <div className="flex items-center gap-3">
          <Logo variant="icon-filled" size="md" />
          <div>
            <h1 className="text-xl font-bold text-[#32D583]">
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
          const badge = item.badgeKey === 'requests' ? pendingCount : item.badgeKey === 'messages' ? unreadCount : 0;

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
              <div className="ml-auto flex items-center gap-2">
                {badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-action-purple text-white text-xs">{badge}</span>
                )}
                {isActive && <div className="w-1.5 h-6 bg-[#32D583] rounded-full" />}
              </div>
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
            src={profile?.photo_url ?? 'https://placehold.co/80x80?text=Moi'}
            className="w-10 h-10 rounded-full object-cover"
            alt={profile?.name}
          />
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm truncate ${theme.textMain}`}>{profile?.name ?? 'Mon profil'}</p>
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
