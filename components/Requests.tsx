import { useMemo, useState } from 'react';
import { Inbox, Send, Check, X, Loader2, Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useRequests } from '@contexts/RequestsContext';
import { useTheme } from '@contexts/ThemeContext';
import { Button } from '@components/ui/Button';
import { Skeleton } from '@components/ui/Skeleton';
import { usePullToRefresh } from '@hooks/usePullToRefresh';
import { useHaptic } from '@hooks/useHaptic';

const tabs = [
  { id: 'received', label: 'Reçues', icon: Inbox },
  { id: 'sent', label: 'Envoyées', icon: Send },
] as const;

type TabId = (typeof tabs)[number]['id'];

export const Requests = () => {
  const { theme } = useTheme();
  const { trigger } = useHaptic();
  const {
    receivedRequests,
    sentRequests,
    loading,
    acceptRequest,
    rejectRequest,
    refreshRequests,
  } = useRequests();

  const [activeTab, setActiveTab] = useState<TabId>('received');

  const { containerRef, pullDistance, progress, isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      trigger('light');
      await refreshRequests();
    },
  });

  const requests = activeTab === 'received' ? receivedRequests : sentRequests;

  const emptyState = activeTab === 'received'
    ? 'Aucune demande pour le moment.'
    : 'Aucune demande envoyée.';

  const handleAccept = async (id: string) => {
    trigger('medium');
    await acceptRequest(id);
  };

  const handleReject = async (id: string) => {
    trigger('soft');
    await rejectRequest(id);
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'accepted':
        return <span className="text-action-green text-xs font-semibold">Acceptée</span>;
      case 'rejected':
        return <span className="text-action-red text-xs font-semibold">Refusée</span>;
      default:
        return <span className="text-gray-400 text-xs">En attente</span>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="px-6 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs ${theme.textSub}`}>Connexion</p>
            <h2 className={`text-2xl font-semibold ${theme.textMain}`}>Demandes</h2>
          </div>
          <div className="flex items-center gap-3 text-sm text-action-green">
            <Bell size={18} />
            <span>Notifications actives</span>
          </div>
        </div>
        <div className="mt-6 flex gap-2 bg-white/5 rounded-full p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition-all ${
                  active ? 'bg-white/10 text-white font-semibold' : theme.textSub
                }`}
                onClick={() => {
                  trigger('soft');
                  setActiveTab(tab.id);
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden">
        <div
          ref={containerRef}
          className="h-full overflow-y-auto px-4 py-6 space-y-4"
          style={{
            transform: `translateY(${pullDistance}px)`
          }}
        >
          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton key={idx} className="w-full h-24 rounded-2xl" />
              ))}
            </div>
          )}

          {!loading && requests.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center py-16 opacity-80">
              <p className={`text-sm ${theme.textSub}`}>{emptyState}</p>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {requests.map((request) => {
              const profile = activeTab === 'received' ? request.from_user : request.to_user;
              if (!profile) return null;
              return (
                <motion.div
                  key={request.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, height: 0, margin: 0 }}
                  transition={{ duration: 0.25 }}
                  className="p-4 rounded-3xl bg-white/5 border border-white/5 backdrop-blur"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={profile.photo_url ?? 'https://placehold.co/80x80?text=Photo'}
                        alt={profile.name}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                      {profile.is_online && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-action-green text-black text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg">
                          ON
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-semibold ${theme.textMain}`}>
                          {profile.name}, {profile.age}
                        </h3>
                        {renderStatus(request.status)}
                      </div>
                      <p className={`text-sm truncate max-w-[200px] ${theme.textSub}`}>
                        {profile.bio || 'Profil discret'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Envoyée le {new Date(request.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                    </div>
                  </div>

                  {activeTab === 'received' && request.status === 'pending' && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <Button
                        variant="ghost"
                        onClick={() => handleReject(request.id)}
                        className="border border-white/10 text-gray-300 hover:bg-white/5"
                      >
                        <X size={16} /> Refuser
                      </Button>
                      <Button variant="primary" onClick={() => handleAccept(request.id)}>
                        <Check size={16} /> Accepter
                      </Button>
                    </div>
                  )}

                  {activeTab === 'sent' && request.status === 'pending' && (
                    <div className="mt-3 text-xs text-amber-400">En attente de réponse</div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-2 rounded-full bg-white/10">
          <div
            className="h-full bg-action-green rounded-full transition-all"
            style={{ width: `${progress * 100}%`, opacity: isRefreshing ? 1 : progress }}
          />
        </div>
      </div>
    </div>
  );
};
