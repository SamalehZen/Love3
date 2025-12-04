import type { PlaceSuggestion } from '@types';

const SERPER_API_KEY = import.meta.env.VITE_SERPER_API_KEY;

interface SerperPlace {
  title: string;
  address?: string;
  type?: string;
  rating?: number;
  thumbnailUrl?: string;
  images?: { url: string }[];
  gpsCoordinates?: {
    latitude?: number;
    longitude?: number;
  };
  placeId?: string;
}

const transformToPlace = (place: SerperPlace, index: number): PlaceSuggestion => ({
  id: place.placeId ?? `${place.title}-${index}`,
  name: place.title,
  address: place.address,
  type: place.type,
  rating: place.rating,
  photoUrl: place.thumbnailUrl ?? place.images?.[0]?.url,
  lat: place.gpsCoordinates?.latitude,
  lng: place.gpsCoordinates?.longitude,
});

export async function searchNearbyPlaces(
  lat: number,
  lng: number,
  type?: string
): Promise<PlaceSuggestion[]> {
  if (!SERPER_API_KEY) {
    throw new Error('VITE_SERPER_API_KEY is not configured');
  }

  const query = type && type.trim().length > 0 ? type : 'cafés restaurants bars parcs';

  const response = await fetch('https://google.serper.dev/places', {
    method: 'POST',
    headers: {
      'X-API-KEY': SERPER_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: query,
      location: `${lat},${lng}`,
      gl: 'fr',
      hl: 'fr',
    }),
  });

  if (!response.ok) {
    throw new Error('Échec de la récupération des lieux');
  }

  const data = await response.json();
  if (!Array.isArray(data.places)) {
    return [];
  }

  return data.places.map(transformToPlace).filter((place: PlaceSuggestion) => Boolean(place.name));
}
