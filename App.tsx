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
    isOnline: true
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
    isOnline: false
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
    isOnline: true
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
    isOnline: true
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
        imageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80" 
    },
    { 
        id: 'moussa',
        name: "Moussa", 
        age: 25,
        location: { lat: 11.555, lng: 43.125 }, // Balbala (Cheikh Moussa)
        isOnline: false,
        imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80"
    },
    { 
        id: 'fatouma',
        name: "Fatouma", 
        age: 22,
        location: { lat: 11.608, lng: 43.154 }, // Héron (Près de la plage)
        isOnline: true,
        imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80"
    },
    { 
        id: 'hassan',
        name: "Hassan", 
        age: 28,
        location: { lat: 11.575, lng: 43.155 }, // Gabode
        isOnline: true,
        isVerified: true,
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
    },
    { 
        id: 'kadra',
        name: "Kadra", 
        age: 24,
        location: { lat: 11.558, lng: 43.150 }, // Ambouli (Route de l'aéroport)
        isOnline: false,
        imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80"
    },
    { 
        id: 'ahmed',
        name: "Ahmed", 
        age: 26,
        location: { lat: 11.578, lng: 43.138 }, // Quartier 7
        isOnline: true,
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80"
    },
    { 
        id: 'samia',
        name: "Samia", 
        age: 21,
        location: { lat: 11.588, lng: 43.144 }, // Marabout
        isOnline: true,
        imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80"
    },
    { 
        id: 'youssouf',
        name: "Youssouf", 
        age: 29,
        location: { lat: 11.535, lng: 43.110 }, // PK12
        isOnline: false,
        imageUrl: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&q=80"
    },
    { 
        id: 'noura',
        name: "Noura", 
        age: 25,
        location: { lat: 11.590, lng: 43.170 }, // Haramous
        isOnline: true,
        isVerified: true,
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
    },
    { 
        id: 'ibrahim',
        name: "Ibrahim", 
        age: 27,
        location: { lat: 11.596, lng: 43.142 }, // Quartier Commercial
        isOnline: true,
        imageUrl: "https://images.unsplash.com/photo-1522075469751-3a3694fb60ed?auto=format&fit=crop&w=400&q=80"
    }
  ];

  const handleSwipeAction = (action: 'like' | 'reject' | 'super') => {
    // Logic to handle swipe
    console.log(`User ${action}ed profile ${MOCK_PROFILES[profileIndex].name}`);
    
    // Move to next profile, loop back for demo purposes
    // We delay slightly to allow the "exit" animation in SwipeCard to finish visually before we swap data
    setTimeout(() => {
        setProfileIndex((prev) => (prev + 1) % MOCK_PROFILES.length);
    }, 50); 
  };

  const renderView = () => {
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
      case 'profile':
        return <ProfileDetail />;
      case 'chat':
        return <ChatInterface />;
      case 'nearby':
        return (
           <div className="w-full h-full bg-background relative">
             <MapContainer 
                center={mapCenter} 
                places={nearbyPlaces}
                className="h-full w-full"
             />
           </div>
        );
      case 'matches':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-background text-gray-400 p-8 text-center">
             <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-4">
                <Sparkles size={40} className="text-action-purple" />
            </div>
             <h2 className="text-white text-2xl font-bold mb-2">Mes Fans</h2>
            <p>Voyez qui vous aime en retour !</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#000] flex justify-center items-center font-sans">
      <div className="w-full max-w-md h-screen bg-background relative shadow-2xl overflow-hidden sm:rounded-[40px] sm:h-[90vh] sm:border-8 sm:border-[#1C1C1E]">
        
        {/* Main Content Area */}
        <main className="h-full w-full">
          {renderView()}
        </main>

        {/* Bottom Navigation - Only show if not on onboarding */}
        {view !== 'onboarding' && (
          <BottomNav currentView={view} setView={setView} />
        )}
        
      </div>
    </div>
  );
}