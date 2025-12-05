export type Gender = 'homme' | 'femme' | 'autre';
export type LookingFor = 'homme' | 'femme' | 'tous';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  bio?: string | null;
  photo_url?: string | null;
  interests: string[];
  gender?: Gender | null;
  looking_for?: LookingFor | null;
  location?: Coordinates | null;
  is_online: boolean;
  last_seen?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ConnectionRequest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  from_user?: Profile;
  to_user?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface PlaceSuggestion {
  id: string;
  name: string;
  type?: string;
  address?: string;
  photoUrl?: string;
  rating?: number;
  lat?: number;
  lng?: number;
  dataId?: string;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  user1_matched: boolean;
  user2_matched: boolean;
  place_match_id?: string | null;
  place_match_name?: string | null;
  place_match_at?: string | null;
  places_list?: PlaceSuggestion[] | null;
  created_at?: string;
  updated_at?: string;
  participants?: Profile[];
  last_message?: Message | null;
  unread_count?: number;
}

export interface PlaceSwipe {
  id: string;
  conversation_id: string;
  user_id: string;
  place_id: string;
  place_name: string;
  place_type?: string;
  place_address?: string;
  place_photo_url?: string;
  place_lat?: number;
  place_lng?: number;
  liked: boolean;
  swipe_order: number;
  created_at: string;
}

export interface MapFilters {
  minAge: number;
  maxAge: number;
  gender: LookingFor;
  onlineOnly: boolean;
}

export interface AuthProfileInput {
  name: string;
  age: number;
  bio?: string;
  photo_url?: string;
  interests: string[];
  gender?: Gender;
  looking_for?: LookingFor;
}

export type ViewState =
  | 'onboarding'
  | 'nearby'
  | 'requests'
  | 'conversations'
  | 'chat'
  | 'places'
  | 'profile';
