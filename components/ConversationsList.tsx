import { Fragment } from 'react';
import { MessageCircle, MapPin, CheckCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useConversations } from '@contexts/ConversationsContext';
import { useTheme } from '@contexts/ThemeContext';
import { Skeleton } from '@components/ui/Skeleton';
import { usePullToRefresh } from '@hooks/usePullToRefresh';
import { useHaptic } from '@hooks/useHaptic';
import { useAuth } from '@contexts/AuthContext';

interface ConversationsListProps {
  onConversationSelected?: () => void;
}

const formatTime = (created_at?: string) => {
  if (!created_at) return '';
  const date = new Date(created_at);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

export const ConversationsList: React.FC<ConversationsListProps> = ({ onConversationSelected }) => {
  const { theme } = useTheme();
  const { trigger } = useHaptic();
  const { conversations, loading, selectConversation, currentConversationId, refreshConversations } =
    useConversations();
  const { user } = useAuth();

  const { containerRef, pullDistance, progress } = usePullToRefresh({
    onRefresh: async () => {
      trigger('light');
      await refreshConversations();
    },
  });

  const handleSelect = (id: string) => {
    trigger('medium');
    selectConversation(id);
    onConversationSelected?.();
  };

  return (
    <div className="flex flex-col h-full">
      <header className="px-6 pt-6 pb-4 border-b border-white/5 flex items-center gap-3">
        <div>
          <p className={`text-xs ${theme.textSub}`}>Conversations</p>
          <h2 className={`text-2xl font-semibold ${theme.textMain}`}>Messages</h2>
        </div>
        <div className="ml-auto px-3 py-1 rounded-full bg-white/10 text-xs text-white">
          {conversations.length} actifs
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden">
        <div
          ref={containerRef}
          className="h-full overflow-y-auto px-4 py-4 space-y-2"
          style={{ transform: `translateY(${pullDistance}px)` }}
        >
          {loading && (
            <Fragment>
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} className="w-full h-20 rounded-3xl" />
              ))}
            </Fragment>
          )}

          {!loading && conversations.length === 0 && (
            <div className="text-center text-gray-400 py-16 text-sm">Aucune conversation pour le moment.</div>
          )}

          <AnimatePresence mode="popLayout">
            {conversations.map((conversation) => {
              const selected = currentConversationId === conversation.id;
              const lastMessage = conversation.last_message;
              const unread = conversation.unread_count ?? 0;
              const partnerProfile = conversation.participants?.find((p) => p.id !== user?.id) ??
                conversation.participants?.[0];
              const name = partnerProfile?.name ?? 'Partenaire';
              const photo = partnerProfile?.photo_url ?? 'https://placehold.co/80x80?text=RDV';

              return (
                <motion.button
                  key={conversation.id}
                  layout
                  onClick={() => handleSelect(conversation.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-3xl border transition-all text-left ${
                    selected ? 'border-action-green bg-white/10' : 'border-white/5 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="relative">
                    <img src={photo} alt={name} className="w-14 h-14 rounded-2xl object-cover" />
                    {conversation.place_match_id && (
                      <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-action-green text-black flex items-center justify-center text-[10px]">
                        <MapPin size={14} />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-semibold ${theme.textMain}`}>{name}</p>
                      {partnerProfile?.is_online && <span className="w-2 h-2 rounded-full bg-action-green" />}
                    </div>
                    <p className={`text-sm truncate ${theme.textSub}`}>
                      {lastMessage?.content ?? 'Commencez à discuter'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-400">{formatTime(lastMessage?.created_at)}</span>
                    {unread > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-action-green text-black text-xs font-bold">
                        {unread}
                      </span>
                    ) : lastMessage && lastMessage.sender_id === user?.id ? (
                      <CheckCheck
                        size={18}
                        className={lastMessage.is_read ? 'text-action-green' : 'text-gray-500'}
                      />
                    ) : (
                      <MessageCircle size={18} className="text-gray-500" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/10 rounded-full">
          <div className="h-full bg-action-green rounded-full" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
    </div>
  );
};
