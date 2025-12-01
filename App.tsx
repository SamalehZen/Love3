import React, { useState, useCallback } from 'react';
import { Onboarding } from './components/Onboarding';
import { SwipeCard } from './components/SwipeCard';
import { ProfileDetail } from './components/ProfileDetail';
import { BottomNav } from './components/BottomNav';
import { ChatInterface } from './components/ChatInterface';
import { MapContainer, Place } from './components/NearbyMap';
import { MatchAnimation } from './components/MatchAnimation';
import { Settings } from './components/Settings';
import { PageTransition } from './components/ui/PageTransition';
import { ViewState, Profile } from './types';
import { useSwipeHistory } from './hooks/useSwipeHistory';
import { useTheme } from './contexts/ThemeContext';
import { Sparkles, Heart } from 'lucide-react';

const MOCK_PROFILES: Profile[] = [
  {
    id: 1,
    name: "Irene Fox",
    age: 27,
    location: "Washington, D.C.",
    bio: "Art lover and coffee addict.",
    imageUrl: "https://picsum.photos/600/800?random=100",
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
    imageUrl: "https://picsum.photos/600/800?random=101",
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
    imageUrl: "https://picsum.photos/600/800?random=102",
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
    imageUrl: "https://picsum.photos/600/800?random=103",
    interests: ["Food", "Cinema"],
    matchPercentage: 88,
    isOnline: true,
    relationshipStatus: 'Single'
  }
];

const USER_PROFILE: Profile = {
  id: 0,
  name: "Lay M",
  age: 25,
  location: "Washington, USA",
  bio: "Looking for connection",
  imageUrl: "https://picsum.photos/600/800?random=20",
  interests: ["Travel", "Coffee"],
  matchPercentage: 100,
  isOnline: true,
  relationshipStatus: 'Single'
};

export function App() {
  const { isDarkMode } = useTheme();
  const [view, setView] = useState<ViewState>('onboarding');
  const [profileIndex, setProfileIndex] = useState(0);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const { addToHistory, undo, canUndo } = useSwipeHistory({ maxHistory: 10 });

  const mapCenter = { lat: 11.585, lng: 43.148 };
  
  const nearbyPlaces: Place[] = [
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
  ];

  const handleSwipeAction = useCallback((action: 'like' | 'reject' | 'super') => {
    const currentProfile = MOCK_PROFILES[profileIndex];
    addToHistory(currentProfile, action);
    
    if (action === 'like' && Math.random() > 0.5) {
      setMatchedProfile(currentProfile);
      setShowMatch(true);
    }
    
    setProfileIndex((prev) => (prev + 1) % MOCK_PROFILES.length);
  }, [profileIndex, addToHistory]);

  const handleUndo = useCallback(() => {
    const lastSwipe = undo();
    if (lastSwipe) {
      const idx = MOCK_PROFILES.findIndex(p => p.id === lastSwipe.profile.id);
      if (idx !== -1) {
        setProfileIndex(idx);
      }
    }
  }, [undo]);

  const handleMatchClose = useCallback(() => {
    setShowMatch(false);
    setMatchedProfile(null);
  }, []);

  const handleMatchMessage = useCallback(() => {
    setShowMatch(false);
    setMatchedProfile(null);
    setView('chat');
  }, []);

  const renderContent = () => {
    if (showSettings) {
      return <Settings onBack={() => setShowSettings(false)} />;
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
          <PageTransition>
            <div className={`h-full flex items-center justify-center flex-col gap-6 px-8 ${isDarkMode ? 'bg-background' : 'bg-[#F2F2F7]'}`}>
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-action-purple/20 to-action-purple/5 rounded-full flex items-center justify-center">
                  <Sparkles size={40} className="text-action-purple" />
                </div>
                <div className="absolute inset-0 rounded-full border border-action-purple/20 animate-ping" />
                <div className="absolute inset-[-8px] rounded-full border border-action-purple/10 animate-ping" style={{ animationDelay: '0.15s' }} />
              </div>
              <div className="text-center">
                <h2 className={`font-bold text-xl mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Vos fans apparaîtront ici
                </h2>
                <p className={`text-sm max-w-[280px] leading-relaxed ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Continuez à swiper pour trouver votre match parfait. Chaque like compte! ✨
                </p>
              </div>
              <button
                onClick={() => setView('swipe')}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-action-purple to-blue-600 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
              >
                <Heart size={18} />
                Commencer à swiper
              </button>
            </div>
          </PageTransition>
        );
      case 'profile':
        return (
          <ProfileDetail onSettingsClick={() => setShowSettings(true)} />
        );
      case 'chat':
        return <ChatInterface />;
      default:
        return (
          <div className={`p-10 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            View not found
          </div>
        );
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-black font-sans">
      <div className="w-full max-w-md h-[100dvh] relative bg-background shadow-2xl overflow-hidden flex flex-col">
        <div className="flex-1 relative overflow-hidden">
          {renderContent()}
        </div>

        {view !== 'onboarding' && !showSettings && (
          <BottomNav currentView={view} setView={setView} />
        )}
      </div>

      {showMatch && matchedProfile && (
        <MatchAnimation
          profiles={[USER_PROFILE, matchedProfile]}
          onClose={handleMatchClose}
          onMessage={handleMatchMessage}
        />
      )}
    </div>
  );
}
