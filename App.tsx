import { useEffect, useMemo, useState } from 'react';
import { ViewState } from '@types';
import { Onboarding } from '@components/Onboarding';
import { NearbyMap } from '@components/NearbyMap';
import { Requests } from '@components/Requests';
import { ConversationsList } from '@components/ConversationsList';
import { ChatInterface } from '@components/ChatInterface';
import { BottomNav } from '@components/BottomNav';
import { DesktopSidebar } from '@components/DesktopSidebar';
import { ProfileDetail } from '@components/ProfileDetail';
import { PlaceSwiper } from '@components/PlaceSwiper';

import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import { useConversations } from '@contexts/ConversationsContext';
import { useRequests } from '@contexts/RequestsContext';
import { useGeolocation } from '@hooks/useGeolocation';
import { Skeleton } from '@components/ui/Skeleton';

export function App() {
  const { theme } = useTheme();
  const { user, profile, loading: authLoading } = useAuth();
  const { conversations, currentConversation, selectConversation } = useConversations();
  const { lastAcceptedConversationId, acknowledgeAcceptedConversation } = useRequests();

  const [view, setView] = useState<ViewState>('onboarding');
  const [placeConversationId, setPlaceConversationId] = useState<string | null>(null);
  const { location } = useGeolocation(Boolean(user) && view !== 'onboarding');

  useEffect(() => {
    if (!authLoading && user && profile && view === 'onboarding') {
      setView('nearby');
    }
    if (!user) {
      setView('onboarding');
    }
  }, [authLoading, profile, user, view]);

  useEffect(() => {
    if (lastAcceptedConversationId) {
      selectConversation(lastAcceptedConversationId);
      setView('chat');
      acknowledgeAcceptedConversation();
    }
  }, [acknowledgeAcceptedConversation, lastAcceptedConversationId, selectConversation]);

  const activePlaceConversation = useMemo(
    () => conversations.find((conv) => conv.id === placeConversationId) ?? currentConversation ?? null,
    [conversations, currentConversation, placeConversationId]
  );

  const handleOpenPlaces = (conversationId: string | undefined) => {
    if (!conversationId) return;
    setPlaceConversationId(conversationId);
    setView('places');
  };

  const renderView = () => {
    if (!user || !profile) {
      return <Onboarding onComplete={() => setView('nearby')} />;
    }

    switch (view) {
      case 'nearby':
        return <NearbyMap location={location} />;
      case 'requests':
        return <Requests />;
      case 'conversations':
        return <ConversationsList onConversationSelected={() => setView('chat')} />;
      case 'chat':
        return (
          <ChatInterface
            onBack={() => setView('conversations')}
            onOpenPlaces={() => handleOpenPlaces(currentConversation?.id)}
          />
        );
      case 'places':
        return activePlaceConversation ? (
          <PlaceSwiper
            conversation={activePlaceConversation}
            coordinates={location}
            onClose={() => setView('chat')}
          />
        ) : (
          <ConversationsList onConversationSelected={() => setView('chat')} />
        );
      case 'profile':
        return <ProfileDetail onOpenSettings={() => null} />;
      default:
        return <NearbyMap location={location} />;
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans">
      <div className="flex h-[100dvh]">
        {view !== 'onboarding' && user && profile && (
          <aside className="hidden lg:flex lg:w-72 xl:w-80 flex-col bg-background border-r border-white/5">
            <DesktopSidebar currentView={view} setView={setView} onOpenSettings={() => setView('profile')} />
          </aside>
        )}

        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-4xl h-[100dvh] relative bg-background shadow-2xl overflow-hidden flex flex-col">
            {authLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Skeleton className="w-32 h-32 rounded-full" />
              </div>
            ) : (
              renderView()
            )}

            {view !== 'onboarding' && user && profile && (
              <BottomNav currentView={view} setView={setView} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
