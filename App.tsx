import React, { useState } from 'react';
import { Onboarding } from './components/Onboarding';
import { SwipeCard } from './components/SwipeCard';
import { ProfileDetail } from './components/ProfileDetail';
import { BottomNav } from './components/BottomNav';
import { ChatInterface } from './components/ChatInterface';
import { ViewState, Profile } from './types';
import { MapPin, Sparkles } from 'lucide-react';

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

function App() {
  const [view, setView] = useState<ViewState>('onboarding');
  const [profileIndex, setProfileIndex] = useState(0);

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
          <div className="flex flex-col items-center justify-center h-full bg-background text-gray-400 p-8 text-center">
            <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mb-4 animate-pulse">
                <MapPin size={40} className="text-primary-orange" />
            </div>
            <h2 className="text-white text-2xl font-bold mb-2">Nearby People</h2>
            <p className="text-sm">Finding people in your area...</p>
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

export default App;