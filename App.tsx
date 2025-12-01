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

  // Mock Map Data centered on Washington DC
  // Updated to match the screenshot "Helen" example + surrounding users
  const dcCenter = { lat: 38.9072, lng: -77.0369 };
  const nearbyPlaces: Place[] = [
    { 
        id: 'helen',
        name: "Helen",
        age: 23,
        location: { lat: 38.9072, lng: -77.0369 }, // Center
        isOnline: true,
        isVerified: true,
        imageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=400&q=80" // High quality portrait
    },
    { 
        id: 2,
        name: "Irene", 
        age: 25,
        location: { lat: 38.912, lng: -77.042 }, 
        isOnline: false,
        imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80"
    },
    { 
        id: 3,
        name: "Sarah", 
        age: 29,
        location: { lat: 38.898, lng: -77.025 }, 
        isOnline: true,
        imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"
    },
    { 
        id: 4,
        name: "Emily", 
        age: 22,
        location: { lat: 38.918, lng: -77.05 }, 
        isOnline: true,
        imageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80"
    },
     { 
        id: 5,
        name: "Jessica", 
        age: 24,
        location: { lat: 38.902, lng: -77.03 }, 
        isOnline: false,
        imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80"
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
                center={dcCenter} 
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
             <h2 className="text-white text-2xl font-bold mb-2">My Fans</h2>
            <p>See who likes you back!</p>
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
