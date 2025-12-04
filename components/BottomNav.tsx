import { useMemo } from 'react';
import { MapPin, Inbox, MessageCircle, User } from 'lucide-react';
import type { ViewState } from '@types';
import { useTheme } from '@contexts/ThemeContext';
import { useHaptic } from '@hooks/useHaptic';
import { useRequests } from '@contexts/RequestsContext';
import { useConversations } from '@contexts/ConversationsContext';

interface BottomNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const { isDarkMode } = useTheme();
  const { trigger } = useHaptic();
  const { pendingCount } = useRequests();
  const { conversations } = useConversations();

  const unreadCount = useMemo(
    () => conversations.reduce((sum, conv) => sum + (conv.unread_count ?? 0), 0),
    [conversations]
  );

  const items = useMemo(
    () => [
      { id: 'nearby' as ViewState, icon: MapPin, label: 'Carte' },
      { id: 'requests' as ViewState, icon: Inbox, label: 'Demandes', badge: pendingCount },
      { id: 'conversations' as ViewState, icon: MessageCircle, label: 'Messages', badge: unreadCount },
      { id: 'profile' as ViewState, icon: User, label: 'Profil' },
    ],
    [pendingCount, unreadCount]
  );

  const containerClass = useMemo(
    () =>
      `relative pointer-events-auto flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-full shadow-2xl transition-colors duration-500 overflow-hidden ${
        isDarkMode ? 'bg-[#0F0F11] border border-white/5 shadow-black/60' : 'bg-white border border-gray-100 shadow-gray-200/50'
      }`,
    [isDarkMode]
  );

  const handleSelect = (view: ViewState) => {
    trigger('light');
    setView(view);
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 lg:hidden">
      <div className={containerClass}>
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-shimmer-continuous"></div>
        </div>
        {items.map((item) => {
          const active = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`relative flex items-center rounded-full transition-all duration-500 overflow-hidden cursor-pointer z-10 h-12 sm:h-14 ${
                isDarkMode ? 'bg-[#1C1C1E]' : 'bg-gray-50 border border-gray-100'
              }`}
              style={{
                maxWidth: active ? '170px' : '48px',
                minWidth: '44px',
                paddingLeft: '5px',
                paddingRight: active ? '16px' : '5px',
              }}
            >
              <div
                className={`h-9 w-9 sm:h-11 sm:w-11 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  active
                    ? 'bg-[#32D583] text-black shadow-[0_0_15px_rgba(50,213,131,0.4)]'
                    : `${isDarkMode ? 'text-gray-500 bg-transparent' : 'text-gray-400 bg-transparent'}`
                }`}
              >
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${active ? 'scale-105' : 'scale-100'}`} strokeWidth={active ? 2.5 : 2} />
              </div>
              <div
                className={`overflow-hidden flex items-center whitespace-nowrap transition-all ${
                  active ? 'w-auto opacity-100 ml-2 sm:ml-3' : 'w-0 opacity-0 ml-0'
                }`}
              >
                <span className={`text-xs sm:text-sm font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {item.label}
                </span>
              </div>
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-5 px-1 rounded-full bg-action-purple text-white text-[10px] flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
