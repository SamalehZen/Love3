import type { PlaceSuggestion } from '@types';

const SERPAPI_KEY = import.meta.env.VITE_SERPAPI_KEY;
const SERPAPI_ENDPOINT = 'https://serpapi.com/search';

interface SerpApiLocalResult {
  title?: string;
  address?: string;
  type?: string | string[];
  rating?: number;
  thumbnail?: string;
  images?: { image?: string; thumbnail?: string }[];
  gps_coordinates?: {
    latitude?: number;
    longitude?: number;
  };
  data_id?: string;
}

interface SerpApiPhotoResult {
  photos?: Array<{
    image?: string;
    image_url?: string;
    thumbnail?: string;
  }>;
  categories?: Array<{ id: string; name: string }>;
  next_page_token?: string;
}

const buildSerpApiUrl = (params: Record<string, string | number | boolean | undefined>) => {
  if (!SERPAPI_KEY) {
    throw new Error('VITE_SERPAPI_KEY is not configured');
  }
  const url = new URL(SERPAPI_ENDPOINT);
  Object.entries({ ...params, api_key: SERPAPI_KEY }).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });
  return url.toString();
};

const requestSerpApi = async <T>(params: Record<string, string | number | boolean | undefined>) => {
  const response = await fetch(buildSerpApiUrl(params));
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'SerpApi request failed');
  }
  return (await response.json()) as T;
};

const mapLocalResult = (result: SerpApiLocalResult, index: number): PlaceSuggestion => {
  const typeLabel = Array.isArray(result.type) ? result.type.join(', ') : result.type;
  return {
    id: result.data_id ?? `${result.title ?? 'place'}-${index}`,
    dataId: result.data_id,
    name: result.title ?? 'Lieu mystère',
    address: result.address,
    type: typeLabel,
    rating: result.rating,
    photoUrl: result.thumbnail ?? result.images?.[0]?.image ?? result.images?.[0]?.thumbnail,
    lat: result.gps_coordinates?.latitude,
    lng: result.gps_coordinates?.longitude,
  };
};

const fetchPrimaryPhoto = async (dataId?: string) => {
  if (!dataId) return undefined;
  try {
    const data = await requestSerpApi<SerpApiPhotoResult>({
      engine: 'google_maps_photos',
      data_id: dataId,
      hl: 'fr',
      no_cache: true,
    });
    return data.photos?.[0]?.image ?? data.photos?.[0]?.image_url ?? data.photos?.[0]?.thumbnail;
  } catch (err) {
    console.warn('SerpApi photos error', err);
    return undefined;
  }
};

export async function searchNearbyPlaces(
  lat: number,
  lng: number,
  type?: string
): Promise<PlaceSuggestion[]> {
  const query = type && type.trim().length > 0 ? type : 'cafés romantiques bars cosy parcs';

  const data = await requestSerpApi<{ local_results?: SerpApiLocalResult[] } | { place_results?: SerpApiLocalResult }>(
    {
      engine: 'google_maps',
      type: 'search',
      hl: 'fr',
      q: query,
      ll: `@${lat},${lng},14z`,
    }
  );

  const results = (data as any).local_results ??
    ((data as any).place_results ? [(data as any).place_results] : []);

  const mapped = results.map(mapLocalResult);

  // Enrichir les 6 premiers lieux sans photo via l'API Photos pour de meilleures images
  const enrichCount = 6;
  for (let i = 0; i < mapped.length && i < enrichCount; i += 1) {
    if (!mapped[i].photoUrl) {
      const photo = await fetchPrimaryPhoto(mapped[i].dataId);
      if (photo) {
        mapped[i].photoUrl = photo;
      }
    }
  }

  return mapped.filter((place) => Boolean(place.name));
}

export async function fetchPlacePhotos(
  dataId: string,
  options?: { hl?: string; categoryId?: string; nextPageToken?: string }
): Promise<SerpApiPhotoResult> {
  return requestSerpApi<SerpApiPhotoResult>({
    engine: 'google_maps_photos',
    data_id: dataId,
    hl: options?.hl ?? 'fr',
    category_id: options?.categoryId,
    next_page_token: options?.nextPageToken,
  });
}

export async function fetchPlaceDetails(params: {
  dataId?: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  hl?: string;
}) {
  if (!params.dataId && !params.placeId) {
    throw new Error('fetchPlaceDetails requires a dataId or placeId');
  }

  let dataParam: string | undefined;
  if (params.dataId && params.latitude !== undefined && params.longitude !== undefined) {
    dataParam = `!4m5!3m4!1s${params.dataId}!8m2!3d${params.latitude}!4d${params.longitude}`;
  }

  return requestSerpApi<any>({
    engine: 'google_maps',
    type: 'place',
    hl: params.hl ?? 'fr',
    data: dataParam,
    place_id: params.placeId,
  });
}
