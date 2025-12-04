import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, SlidersHorizontal, UserPlus, AlertTriangle } from 'lucide-react';
import type { Coordinates, MapFilters, Profile } from '@types';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import { useRequests } from '@contexts/RequestsContext';
import { useNotification } from '@contexts/NotificationContext';
import { supabase } from '@lib/supabase';
import { mapConfig } from '@constants/theme';
import { Button } from './ui/Button';
import { Skeleton } from './ui/Skeleton';

interface NearbyMapProps {
  location: Coordinates | null;
}

interface NearbyProfile extends Profile {
  distance?: number;
}

const normalizeProfile = (row: any): NearbyProfile => ({
  id: row.id,
  name: row.name,
  age: row.age,
  bio: row.bio,
  photo_url: row.photo_url,
  interests: row.interests ?? [],
  gender: row.gender,
  looking_for: row.looking_for,
  location: row.location?.coordinates
    ? { lat: row.location.coordinates[1], lng: row.location.coordinates[0] }
    : null,
  is_online: row.is_online,
  last_seen: row.last_seen,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const LeafletMap = memo(
  ({ center, profiles, selectedId, onSelect }: { center: Coordinates; profiles: NearbyProfile[]; selectedId: string | null; onSelect: (id: string) => void }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<L.Map | null>(null);
    const layerRef = useRef<L.TileLayer | null>(null);
    const markersRef = useRef<Record<string, L.Marker>>({});
    const { isDarkMode } = useTheme();

    useEffect(() => {
      if (!mapRef.current) return;
      if (!instanceRef.current) {
        instanceRef.current = L.map(mapRef.current, {
          center: [center.lat, center.lng],
          zoom: mapConfig.defaultZoom,
          zoomControl: false,
        });
      }
      const tileUrl = isDarkMode ? mapConfig.tiles.dark : mapConfig.tiles.light;
      if (!layerRef.current) {
        layerRef.current = L.tileLayer(tileUrl, { attribution: '' }).addTo(instanceRef.current);
      } else {
        layerRef.current.setUrl(tileUrl);
      }
    }, [center.lat, center.lng, isDarkMode]);

    useEffect(() => {
      const map = instanceRef.current;
      if (!map) return;
      map.setView([center.lat, center.lng], mapConfig.defaultZoom);
    }, [center.lat, center.lng]);

    useEffect(() => {
      const map = instanceRef.current;
      if (!map) return;
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};

      profiles.forEach((profile, index) => {
        if (!profile.location) return;
        const isSelected = selectedId === profile.id;
        const size = isSelected ? 76 : 56;
        const anchor = size / 2;
        const html = `
          <div class="relative">
            <div class="w-${size} h-${size} rounded-full overflow-hidden border-4 ${
              profile.is_online ? 'border-[#32D583]' : 'border-white/20'
            } shadow-xl">
              <img src="${profile.photo_url ?? 'https://placehold.co/200x200?text=Profil'}" class="w-full h-full object-cover" />
            </div>
            ${profile.is_online ? '<div class="absolute -bottom-1 -right-1 w-4 h-4 bg-[#32D583] rounded-full border-2 border-black"></div>' : ''}
          </div>`;
        const icon = L.divIcon({ html, iconSize: [size, size], iconAnchor: [anchor, anchor] });
        const marker = L.marker([profile.location.lat, profile.location.lng], { icon }).addTo(map);
        marker.on('click', () => onSelect(profile.id));
        markersRef.current[profile.id] = marker;
      });
    }, [profiles, selectedId, onSelect]);

    return <div ref={mapRef} className="absolute inset-0" />;
  }
);

LeafletMap.displayName = 'LeafletMap';

export const NearbyMap: React.FC<NearbyMapProps> = ({ location }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { sendRequest } = useRequests();
  const { success, error } = useNotification();
  const [filters, setFilters] = useState<MapFilters>({ minAge: 21, maxAge: 45, gender: 'tous', onlineOnly: false });
  const [profiles, setProfiles] = useState<NearbyProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const fetchProfiles = useCallback(async () => {
    if (!user || !location) return;
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .filter('location', 'st_dwithin', `SRID=4326;POINT(${location.lng} ${location.lat}),50000`)
        .gte('age', filters.minAge)
        .lte('age', filters.maxAge);
      if (filters.gender !== 'tous') {
        query = query.eq('gender', filters.gender);
      }
      if (filters.onlineOnly) {
        query = query.eq('is_online', true);
      }
      const { data, error: fetchError } = await query;
      if (fetchError) {
        const payload = fetchError.details || fetchError.hint || fetchError.message;
        throw new Error(payload || fetchError.message);
      }
      setLastError(null);
      const normalized = (data ?? []).map(normalizeProfile).filter((profile) => profile.location);
      setProfiles(normalized);
      if (normalized.length) {
        setSelectedId(normalized[0].id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      const stack = err instanceof Error && err.stack ? err.stack : String(err);
      console.error('NearbyMap fetchProfiles error:', stack);
      setLastError(message);
      error(`Impossible de charger les couples à proximité (${message})`);
    } finally {
      setLoading(false);
    }
  }, [error, filters.gender, filters.maxAge, filters.minAge, filters.onlineOnly, location, user]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    if (!profiles.length) return;
    const channel = supabase
      .channel('profiles-presence')
      .on('postgres_changes', { schema: 'public', table: 'profiles', event: 'UPDATE' }, (payload) => {
        setProfiles((prev) =>
          prev.map((profile) =>
            profile.id === payload.new.id
              ? {
                  ...profile,
                  is_online: payload.new.is_online,
                  last_seen: payload.new.last_seen,
                  location: payload.new.location?.coordinates
                    ? {
                        lat: payload.new.location.coordinates[1],
                        lng: payload.new.location.coordinates[0],
                      }
                    : profile.location,
                }
              : profile
          )
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profiles.length]);

  const selectedProfile = profiles.find((profile) => profile.id === selectedId) ?? null;

  const handleSendRequest = async () => {
    if (!selectedProfile) return;
    await sendRequest(selectedProfile.id);
    success('Demande envoyée');
  };

  if (!location) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-8">
        <MapPin size={32} />
        <p className="mt-4">Activez la géolocalisation pour voir les couples proches.</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <LeafletMap center={location} profiles={profiles} selectedId={selectedId} onSelect={setSelectedId} />

      <div className="absolute top-4 left-4 right-4 flex gap-3">
        <div className="flex-1 rounded-2xl bg-black/50 backdrop-blur border border-white/10 p-4 text-white">
          <p className="text-xs text-gray-400">Filtrer</p>
          <div className="flex flex-wrap gap-3 mt-3">
            <div className="flex flex-col text-xs text-gray-300">
              <span>Âge min</span>
              <input
                type="range"
                min={18}
                max={filters.maxAge}
                value={filters.minAge}
                onChange={(e) => setFilters((prev) => ({ ...prev, minAge: Number(e.target.value) }))}
              />
              <span>{filters.minAge} ans</span>
            </div>
            <div className="flex flex-col text-xs text-gray-300">
              <span>Âge max</span>
              <input
                type="range"
                min={filters.minAge}
                max={80}
                value={filters.maxAge}
                onChange={(e) => setFilters((prev) => ({ ...prev, maxAge: Number(e.target.value) }))}
              />
              <span>{filters.maxAge} ans</span>
            </div>
            <select
              className="bg-white/10 rounded-full px-3 py-1 text-xs"
              value={filters.gender}
              onChange={(e) => setFilters((prev) => ({ ...prev, gender: e.target.value as MapFilters['gender'] }))}
            >
              <option value="tous">Tous</option>
              <option value="homme">Hommes</option>
              <option value="femme">Femmes</option>
            </select>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={filters.onlineOnly}
                onChange={(e) => setFilters((prev) => ({ ...prev, onlineOnly: e.target.checked }))}
              />
              En ligne
            </label>
          </div>
        </div>
        <button
          onClick={fetchProfiles}
          className="w-12 h-12 rounded-2xl bg-black/50 border border-white/10 text-white flex items-center justify-center"
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="w-32 h-32 rounded-full" />
        </div>
      )}

      {lastError && !loading && (
        <div className="absolute top-[120px] left-4 right-4 z-[450]">
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-[#1c0f10]/80 p-4 text-sm text-red-200 backdrop-blur">
            <AlertTriangle className="text-red-400 flex-shrink-0" size={18} />
            <div className="flex-1">
              <p className="font-semibold text-red-100">Erreur Supabase</p>
              <p className="mt-1 text-red-200/80 text-xs break-words whitespace-pre-wrap">{lastError}</p>
            </div>
            <button
              onClick={fetchProfiles}
              className="text-xs font-semibold text-white/90 px-3 py-1 rounded-full bg-red-500/30 border border-red-500/40 hover:bg-red-500/40"
            >
              Réessayer
            </button>
          </div>
        </div>
      )}

      {selectedProfile && (
        <div className="absolute bottom-6 left-4 right-4">
          <div className="rounded-[32px] bg-black/70 backdrop-blur border border-white/10 p-4 flex gap-4">
            <img
              src={selectedProfile.photo_url ?? 'https://placehold.co/200x200?text=Profil'}
              alt={selectedProfile.name}
              className="w-24 h-24 rounded-3xl object-cover"
            />
            <div className="flex-1 text-white">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">
                  {selectedProfile.name}, {selectedProfile.age}
                </h3>
                {selectedProfile.is_online && <span className="w-2 h-2 rounded-full bg-action-green" />}
              </div>
              <p className="text-sm text-gray-300 line-clamp-2">{selectedProfile.bio}</p>
              <div className="flex gap-3 mt-3">
                <Button variant="secondary" onClick={handleSendRequest} leftIcon={<UserPlus size={16} />}>
                  Envoyer demande
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
