export interface Profile {
  id: number;
  name: string;
  age: number;
  location: string;
  bio: string;
  imageUrl: string;
  interests: string[];
  matchPercentage: number;
  isOnline: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export type ViewState = 'onboarding' | 'swipe' | 'nearby' | 'matches' | 'profile' | 'chat';

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
}