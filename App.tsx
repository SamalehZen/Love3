import React, { useState, useCallback, useMemo } from 'react';
import { Onboarding } from './components/Onboarding';
import { SwipeCard } from './components/SwipeCard';
import { ProfileDetail } from './components/ProfileDetail';
import { BottomNav } from './components/BottomNav';
import { DesktopSidebar } from './components/DesktopSidebar';
import { ChatInterface } from './components/ChatInterface';
import { MapContainer, Place } from './components/NearbyMap';
import { Settings } from './components/Settings';
import { MatchAnimation } from './components/MatchAnimation';
import { PageTransition } from './components/ui/PageTransition';
import { ViewState, Profile } from './types';
import { useTheme } from './contexts/ThemeContext';
import { useSwipeHistory } from './hooks/useSwipeHistory';
import { useNotification } from './contexts/NotificationContext';
import { Sparkles, Heart } from 'lucide-react';
import { Button } from './components/ui/Button';

const MOCK_PROFILES: Profile[] = [
  {
    id: 1,
    name: "Irene Fox",
    age: 27,
    location: "Washington, D.C.",
    bio: "Art lover and coffee addict.",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    interests: ["Art", "Coffee"],
    matchPercentage: 86,
    isOnline: true,
    relationshipStatus: 'Single'
  },
  {
    id: 2,
    name: "Jessica Al",
    age: 24,
    location: "New York, NY",
    bio: "Looking for adventure.",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    interests: ["Travel", "Hiking"],
    matchPercentage: 92,
    isOnline: false,
    relationshipStatus: 'Single'
  },
  {
    id: 3,
    name: "Sarah Connors",
    age: 29,
    location: "Los Angeles, CA",
    bio: "Tech enthusiast.",
    imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
    interests: ["Coding", "Sci-Fi"],
    matchPercentage: 74,
    isOnline: true,
    relationshipStatus: 'Open'
  },
  {
    id: 4,
    name: "Emily Clark",
    age: 25,
    location: "Chicago, IL",
    bio: "Pizza & Movies.",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    interests: ["Food", "Cinema"],
    matchPercentage: 88,
    isOnline: true,
    relationshipStatus: 'Single'
  }
];

const USER_PROFILE: Profile = {
  id: 0,
  name: "You",
  age: 25,
  location: "Washington, D.C.",
  bio: "",
  imageUrl: "https://picsum.photos/600/800?random=20",
  interests: [],
  matchPercentage: 100,
  isOnline: true,
};

export function App() {
  const [view, setView] = useState<ViewState>('onboarding');
  const [profileIndex, setProfileIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  
  const { isDarkMode, theme } = useTheme();
  const { addToHistory, undo, canUndo } = useSwipeHistory();
  const { success } = useNotification();

  const mapCenter = useMemo(() => ({ lat: 11.585, lng: 43.148 }), []);
  
  const nearbyPlaces: Place[] = useMemo(() => [
    { 
      id: 'amina',
      name: "Amina",
      age: 23,
      location: { lat: 11.594, lng: 43.149 },
      isOnline: true,
      isVerified: true,
      relationshipStatus: 'Single',
      imageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80"
    },
    { 
      id: 'hassan',
      name: "Hassan",
      age: 26,
      location: { lat: 11.564, lng: 43.125 },
      isOnline: false,
      isVerified: true,
      relationshipStatus: 'Taken',
      imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80"
    },
    { 
      id: 'fatouma',
      name: "Fatouma",
      age: 24,
      location: { lat: 11.605, lng: 43.160 },
      isOnline: true,
      isVerified: false,
      relationshipStatus: 'Single',
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
    },
    { 
      id: 'moussa',
      name: "Moussa",
      age: 28,
      location: { lat: 11.580, lng: 43.138 },
      isOnline: true,
      isVerified: true,
      relationshipStatus: 'Complicated',
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80"
    },
    { 
      id: 'safia',
      name: "Safia",
      age: 22,
      location: { lat: 11.570, lng: 43.155 },
      isOnline: false,
      isVerified: true,
      relationshipStatus: 'Single',
      imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80"
    },
    { 
      id: 'ali',
      name: "Ali",
      age: 25,
      location: { lat: 11.550, lng: 43.110 },
      isOnline: true,
      isVerified: false,
      relationshipStatus: 'Open',
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
    },
    { 
      id: 'yasmin',
      name: "Yasmin",
      age: 21,
      location: { lat: 11.558, lng: 43.165 },
      isOnline: true,
      isVerified: true,
      relationshipStatus: 'Single',
      imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
    },
    { 
      id: 'omar',
      name: "Omar",
      age: 29,
      location: { lat: 11.530, lng: 43.150 },
      isOnline: false,
      isVerified: true,
      relationshipStatus: 'Single',
      imageUrl: "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?auto=format&fit=crop&w=800&q=80"
    },
    { 
      id: 'khadija',
      name: "Khadija",
      age: 24,
      location: { lat: 11.590, lng: 43.140 },
      isOnline: true,
      isVerified: true,
      relationshipStatus: 'Single',
      imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"
    },
    { 
      id: 'ibrahim',
      name: "Ibrahim",
      age: 27,
      location: { lat: 11.575, lng: 43.130 },
      isOnline: false,
      isVerified: false,
      relationshipStatus: 'Taken',
      imageUrl: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=800&q=80"
    },
  ], []);

  const handleSwipeAction = useCallback((action: 'like' | 'reject' | 'super') => {
    const currentProfile = MOCK_PROFILES[profileIndex];
    addToHistory(currentProfile, action);
    
    if (action === 'like' || action === 'super') {
      if (Math.random() > 0.6) {
        setMatchedProfile(currentProfile);
        setShowMatch(true);
        return;
      }
    }
    
    setProfileIndex((prev) => (prev + 1) % MOCK_PROFILES.length);
  }, [profileIndex, addToHistory]);

  const handleUndo = useCallback(() => {
    const lastAction = undo();
    if (lastAction) {
      const idx = MOCK_PROFILES.findIndex(p => p.id === lastAction.profile.id);
      if (idx !== -1) {
        setProfileIndex(idx);
        success('Action annulée');
      }
    }
  }, [undo, success]);

  const handleMatchClose = useCallback(() => {
    setShowMatch(false);
    setMatchedProfile(null);
    setProfileIndex((prev) => (prev + 1) % MOCK_PROFILES.length);
  }, []);

  const handleMatchMessage = useCallback(() => {
    setView('chat');
  }, []);

  const renderContent = () => {
    if (showSettings) {
      return <Settings onClose={() => setShowSettings(false)} />;
    }

    switch (view) {
      case 'onboarding':
        return <Onboarding onComplete={() => setView('swipe')} />;
      case 'swipe':
        return (
          <SwipeCard 
            profile={MOCK_PROFILES[profileIndex]}
            nextProfile={MOCK_PROFILES[(profileIndex + 1) % MOCK_PROFILES.length]}
            onAction={handleSwipeAction}
            onUndo={handleUndo}
            canUndo={canUndo}
          />
        );
      case 'nearby':
        return (
          <div className="h-full relative">
            <MapContainer 
              center={mapCenter} 
              places={nearbyPlaces}
              className="h-full w-full"
            />
          </div>
        );
      case 'matches':
        return (
          <PageTransition className="h-full">
            <div className="h-full flex items-center justify-center flex-col gap-6 px-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-action-purple/20 to-action-purple/5 rounded-full flex items-center justify-center">
                  <Sparkles size={40} className="text-action-purple" />
                </div>
                <div className="absolute inset-0 rounded-full border border-action-purple/20 animate-ping" />
                <div className="absolute inset-[-8px] rounded-full border border-action-purple/10 animate-ping" style={{ animationDelay: '150ms' }} />
              </div>
              <div className="text-center">
                <h2 className={`font-bold text-xl mb-2 ${theme.textMain}`}>Vos fans apparaîtront ici</h2>
                <p className={`text-sm max-w-[280px] leading-relaxed ${theme.textSub}`}>
                  Continuez à swiper pour trouver votre match parfait. Chaque like compte! ✨
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Heart size={18} />}
                onClick={() => setView('swipe')}
              >
                Commencer à swiper
              </Button>
            </div>
          </PageTransition>
        );
      case 'profile':
        return <ProfileDetail onOpenSettings={() => setShowSettings(true)} />;
      case 'chat':
        return <ChatInterface />;
      default:
        return <div className="text-white p-10">View not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-black font-sans">
      <div className="flex h-[100dvh]">
        {view !== 'onboarding' && !showSettings && (
          <aside className="hidden lg:flex lg:w-72 xl:w-80 flex-col bg-background border-r border-white/5">
            <DesktopSidebar 
              currentView={view} 
              setView={setView} 
              onOpenSettings={() => setShowSettings(true)}
            />
          </aside>
        )}
        
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-md lg:max-w-2xl xl:max-w-4xl h-[100dvh] relative bg-background shadow-2xl overflow-hidden flex flex-col">
            <div className="flex-1 relative overflow-hidden">
              {renderContent()}
            </div>

            {view !== 'onboarding' && !showSettings && (
              <BottomNav currentView={view} setView={setView} />
            )}

            {showMatch && matchedProfile && (
              <MatchAnimation
                profiles={[USER_PROFILE, matchedProfile]}
                onClose={handleMatchClose}
                onMessage={handleMatchMessage}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
