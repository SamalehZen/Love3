import { useAuth } from '@contexts/AuthContext';
import { supabase } from '@lib/supabase';
import type { Coordinates } from '@types';
import { useCallback, useEffect, useRef, useState } from 'react';

type PermissionState = 'prompt' | 'granted' | 'denied';

const buildPoint = (coords: Coordinates) => `POINT(${coords.lng} ${coords.lat})`;

export const useGeolocation = (enabled: boolean) => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<PermissionState>('prompt');
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const keepAliveRef = useRef<number | null>(null);
  const latestCoordsRef = useRef<Coordinates | null>(null);

  const updatePresence = useCallback(
    async (isOnline: boolean, coords?: Coordinates | null) => {
      if (!user) return;
      const payload: Record<string, unknown> = {
        is_online: isOnline,
        last_seen: new Date().toISOString(),
      };
      if (coords) {
        payload.location = buildPoint(coords);
      }
      try {
        await supabase.from('profiles').update(payload).eq('id', user.id);
      } catch (err) {
        console.error('Failed to update presence', err);
      }
    },
    [user]
  );

  const clearWatchers = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (keepAliveRef.current) {
      window.clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('La géolocalisation n’est pas supportée.');
      throw new Error('Geolocation unsupported');
    }

    return new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: Coordinates = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          latestCoordsRef.current = coords;
          setLocation(coords);
          setPermission('granted');
          updatePresence(true, coords).finally(resolve);
        },
        (err) => {
          setError(err.message);
          setPermission('denied');
          reject(err);
        },
        { enableHighAccuracy: true }
      );
    });
  }, [updatePresence]);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return;
    }
    if (!enabled || !user) {
      clearWatchers();
      return;
    }

    let canceled = false;

    const track = async () => {
      try {
        if ('permissions' in navigator && (navigator.permissions as any)?.query) {
          const status = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          if (!canceled) {
            setPermission(status.state as PermissionState);
            status.onchange = () => setPermission(status.state as PermissionState);
          }
        }
      } catch (err) {
        console.warn('Permission query failed', err);
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const coords: Coordinates = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          latestCoordsRef.current = coords;
          setLocation(coords);
          setPermission('granted');
          updatePresence(true, coords);
        },
        (err) => {
          setError(err.message);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 }
      );

      keepAliveRef.current = window.setInterval(() => {
        if (latestCoordsRef.current) {
          updatePresence(true, latestCoordsRef.current);
        }
      }, 30000);

      const handleVisibility = () => {
        if (document.visibilityState === 'hidden') {
          updatePresence(false, latestCoordsRef.current);
        } else if (latestCoordsRef.current) {
          updatePresence(true, latestCoordsRef.current);
        }
      };

      document.addEventListener('visibilitychange', handleVisibility);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibility);
      };
    };

    const cleanupVisibility = track();

    return () => {
      canceled = true;
      cleanupVisibility?.();
      clearWatchers();
      updatePresence(false, latestCoordsRef.current);
    };
  }, [clearWatchers, enabled, updatePresence, user]);

  return {
    location,
    permission,
    error,
    requestPermission,
    isTracking: Boolean(enabled && user),
  };
};
