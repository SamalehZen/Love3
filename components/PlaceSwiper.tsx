import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, X, MapPin, ThumbsDown, ThumbsUp, Loader2, Sparkles } from 'lucide-react';
import type { Conversation, Coordinates, PlaceSuggestion } from '@types';
import { useAuth } from '@contexts/AuthContext';
import { useNotification } from '@contexts/NotificationContext';
import { useConversations } from '@contexts/ConversationsContext';
import { searchNearbyPlaces } from '@services/placesService';
import { supabase } from '@lib/supabase';
import { useHaptic } from '@hooks/useHaptic';
import { PlaceMatchAnimation } from './PlaceMatchAnimation';
import { Button } from './ui/Button';


interface PlaceSwiperProps {
  conversation: Conversation;
  coordinates: Coordinates | null;
  onClose: () => void;
}

export const PlaceSwiper: React.FC<PlaceSwiperProps> = ({ conversation, coordinates, onClose }) => {
  const { user } = useAuth();
  const { success, error } = useNotification();
  const { refreshConversations } = useConversations();
  const { trigger } = useHaptic();

  const [places, setPlaces] = useState<PlaceSuggestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchedPlace, setMatchedPlace] = useState<PlaceSuggestion | null>(null);
  const [saving, setSaving] = useState(false);

  const partner = useMemo(
    () => conversation.participants?.find((participant) => participant.id !== user?.id) ?? null,
    [conversation.participants, user?.id]
  );

  useEffect(() => {
    const loadPlaces = async () => {
      if (!user) return;
      setLoading(true);
      try {
        if (conversation.places_list && conversation.places_list.length > 0) {
          setPlaces(conversation.places_list);
          return;
        }
        if (!coordinates) {
          return;
        }
        const fetched = await searchNearbyPlaces(coordinates.lat, coordinates.lng);
        setPlaces(fetched);
        await supabase
          .from('conversations')
          .update({ places_list: fetched })
          .eq('id', conversation.id);
        refreshConversations();
      } catch (err) {
        error('Impossible de charger les lieux.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPlaces();
  }, [conversation.id, conversation.places_list, coordinates, error, refreshConversations, user]);

  const currentPlace = places[currentIndex];

  const handleSwipe = async (liked: boolean) => {
    if (!user || !currentPlace) return;
    trigger(liked ? 'success' : 'light');
    setSaving(true);
    try {
      const swipePayload = {
        conversation_id: conversation.id,
        user_id: user.id,
        place_id: currentPlace.id,
        place_name: currentPlace.name,
        place_type: currentPlace.type,
        place_address: currentPlace.address,
        place_photo_url: currentPlace.photoUrl,
        place_lat: currentPlace.lat,
        place_lng: currentPlace.lng,
        liked,
        swipe_order: currentIndex + 1,
      };

      await supabase.from('place_swipes').upsert(swipePayload, {
        onConflict: 'conversation_id,user_id,place_id',
      });

      if (liked) {
        const { data: counterpart } = await supabase
          .from('place_swipes')
          .select('*')
          .eq('conversation_id', conversation.id)
          .eq('place_id', currentPlace.id)
          .eq('liked', true)
          .neq('user_id', user.id)
          .maybeSingle();

        if (counterpart) {
          await supabase
            .from('conversations')
            .update({
              place_match_id: currentPlace.id,
              place_match_name: currentPlace.name,
              place_match_at: new Date().toISOString(),
            })
            .eq('id', conversation.id);

          await supabase.from('messages').insert({
            conversation_id: conversation.id,
            sender_id: user.id,
            content: JSON.stringify({
              type: 'system',
              subtype: 'place_match',
              place: currentPlace,
            }),
            is_read: false,
          });

          setMatchedPlace(currentPlace);
          success('Nouveau lieu validé !');
          refreshConversations();
        }
      }

      setCurrentIndex((prev) => prev + 1);
    } catch (err) {
      error('Action impossible pour le moment.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!coordinates) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
        <MapPin size={36} className="mb-4" />
        <p>Activez la géolocalisation pour proposer des lieux.</p>
        <Button onClick={onClose} className="mt-4">
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-white/5">
        <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center">
          <ArrowLeft />
        </button>
        <div className="flex-1">
          <p className="text-xs text-gray-400">Match lieux</p>
          <h2 className="text-xl text-white font-semibold">
            {partner ? `Avec ${partner.name}` : 'Choisissez un lieu'}
          </h2>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X />
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-6">
        {loading ? (
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <Loader2 className="animate-spin" />
            <p>Recherche de lieux romantiques...</p>
          </div>
        ) : currentPlace ? (
          <div className="w-full max-w-md">
            <div className="rounded-[32px] overflow-hidden border border-white/10 bg-white/5 shadow-2xl relative">
              <img
                src={currentPlace.photoUrl ?? 'https://placehold.co/600x800?text=Lieu'}
                alt={currentPlace.name}
                className="w-full h-80 object-cover"
              />
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-action-green/10 text-action-green flex items-center justify-center">
                    <MapPin />
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-semibold">{currentPlace.name}</h3>
                    <p className="text-gray-400 text-sm">{currentPlace.type}</p>
                  </div>
                </div>
                {currentPlace.address && <p className="text-sm text-gray-400">{currentPlace.address}</p>}
                {currentPlace.rating && (
                  <p className="text-sm text-yellow-400 flex items-center gap-2">
                    <Sparkles size={16} /> {currentPlace.rating.toFixed(1)} / 5
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button
                variant="ghost"
                onClick={() => handleSwipe(false)}
                disabled={saving}
                className="flex-1 border border-white/10 text-gray-300"
              >
                <ThumbsDown /> Pas fan
              </Button>
              <Button variant="primary" onClick={() => handleSwipe(true)} disabled={saving} className="flex-1">
                <ThumbsUp /> On y va
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <p>Plus de lieux pour le moment.</p>
            <Button onClick={onClose} className="mt-4">
              Retour au chat
            </Button>
          </div>
        )}
      </div>

      {matchedPlace && (
        <PlaceMatchAnimation
          placeName={matchedPlace.name}
          placePhoto={matchedPlace.photoUrl}
          placeAddress={matchedPlace.address}
          onOpenMaps={() => {
            const query = encodeURIComponent(matchedPlace.name + ' ' + (matchedPlace.address ?? ''));
            const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
            window.open(url, '_blank');
          }}
          onContinue={() => {
            setMatchedPlace(null);
            onClose();
          }}
        />
      )}
    </div>
  );
};
