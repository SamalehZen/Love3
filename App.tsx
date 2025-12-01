
import React, { useState } from 'react';
import { Onboarding } from './components/Onboarding';
import { SwipeCard } from './components/SwipeCard';
import { ProfileDetail } from './components/ProfileDetail';
import { BottomNav } from './components/BottomNav';
import { ChatInterface } from './components/ChatInterface';
import { MapContainer, Place } from './components/NearbyMap';
import { ViewState, Profile } from './types';
import { Sparkles } from 'lucide-react';

// Mock Data
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

export function App() {
  const [view, setView] = useState<ViewState>('onboarding');
  const [profileIndex, setProfileIndex] = useState(0);

  // Default Center: Djibouti City
  const mapCenter = { lat: 11.585, lng: 43.148 };
  
  // 10 Profiles distributed across Djibouti (Balbala, Heron, Centre Ville, etc.)
  const nearbyPlaces: Place[] = [
    { 
        id: 'amina',
        name: "Amina",
        age: 23,
        location: { lat: 11.594, lng: 43.149 }, // Centre Ville (Près de la Place Menelik)
        isOnline: true,
        isVerified: true,
        relationshipStatus: 'Single',
        imageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80"
    },
    { 
        id: 'hassan',
        name: "Hassan",
        age: 26,
        location: { lat: 11.564, lng: 43.125 }, // Balbala
        isOnline: false,
        isVerified: true,
        relationshipStatus: 'Taken',
        imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80"
    },
    { 
        id: 'fatouma',
        name: "Fatouma",
        age: 24,
        location: { lat: 11.605, lng: 43.160 }, // Héron
        isOnline: true,
        isVerified: false,
        relationshipStatus: 'Single',
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
    },
    { 
        id: 'moussa',
        name: "Moussa",
        age: 28,
        location: { lat: 11.580, lng: 43.138 }, // Quartier 7
        isOnline: true,
        isVerified: true,
        relationshipStatus: 'Complicated',
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80"
    },
    { 
        id: 'safia',
        name: "Safia",
        age: 22,
        location: { lat: 11.570, lng: 43.155 }, // Marabout
        isOnline: false,
        isVerified: true,
        relationshipStatus: 'Single',
        imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80"
    },
    { 
        id: 'ali',
        name: "Ali",
        age: 25,
        location: { lat: 11.550, lng: 43.110 }, // Hodan (Balbala Sud)
        isOnline: true,
        isVerified: false,
        relationshipStatus: 'Open',
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
    },
    { 
        id: 'yasmin',
        name: "Yasmin",
        age: 21,
        location: { lat: 11.558, lng: 43.165 }, // Gabode
        isOnline: true,
        isVerified: true,
        relationshipStatus: 'Single',
        imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
    },
    { 
        id: 'omar',
        name: "Omar",
        age: 29,
        location: { lat: 11.530, lng: 43.150 }, // Ambouli
        isOnline: false,
        isVerified: true,
        relationshipStatus: 'Single',
        imageUrl: "https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?auto=format&fit=crop&w=800&q=80"
    },
    { 
        id: 'khadija',
        name: "Khadija",
        age: 24,
        location: { lat: 11.590, lng: 43.140 }, // Quartier 1
        isOnline: true,
        isVerified: true,
        relationshipStatus: 'Single',
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"
    },
    { 
        id: 'ibrahim',
        name: "Ibrahim",
        age: 27,
        location: { lat: 11.575, lng: 43.130 }, // Quartier 5
        isOnline: false,
        isVerified: false,
        relationshipStatus: 'Taken',
        imageUrl: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=800&q=80"
    },
  ];

  const handleSwipeAction = (action: 'like' | 'reject' | 'super') => {
    // Advance profile
    setProfileIndex((prev) => (prev + 1) % MOCK_PROFILES.length);
  };

  const renderContent = () => {
    switch (view) {
      case 'onboarding':
        return <Onboarding onComplete={() => setView('swipe')} />;
      case 'swipe':
        return (
          <SwipeCard 
            profile={MOCK_PROFILES[profileIndex]}
            nextProfile={MOCK_PROFILES[(profileIndex + 1) % MOCK_PROFILES.length]}
            onAction={handleSwipeAction}
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
          <div className="h-full flex items-center justify-center text-white flex-col gap-4">
             <div className="w-20 h-20 bg-action-purple/20 rounded-full flex items-center justify-center animate-pulse">
                <Sparkles size={40} className="text-action-purple" />
             </div>
             <p className="font-semibold text-lg">Vos fans apparaîtront ici</p>
             <p className="text-sm text-gray-500 max-w-xs text-center">Continuez à swiper pour trouver votre match parfait.</p>
          </div>
        );
      case 'profile':
        return <ProfileDetail />;
      case 'chat':
        return <ChatInterface />;
      default:
        return <div className="text-white p-10">View not found</div>;
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-black font-sans">
      <div className="w-full max-w-md h-[100dvh] relative bg-background shadow-2xl overflow-hidden flex flex-col">
        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden">
          {renderContent()}
        </div>

        {/* Navigation - Only show if not onboarding/chat */}
        {view !== 'onboarding' && view !== 'chat' && (
          <BottomNav currentView={view} setView={setView} />
        )}
      </div>
    </div>
  );
}
