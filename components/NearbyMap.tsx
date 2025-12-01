import React, { useEffect, useRef, useState, memo } from 'react';
import L from 'leaflet';
import { SlidersHorizontal, Menu, Crosshair, MapPin } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
}

export interface Place {
  id: string | number;
  name: string;
  age: number;
  location: Location;
  isOnline: boolean;
  imageUrl?: string;
  isVerified?: boolean;
}

interface MapContainerProps {
  center: Location;
  places?: Place[];
  className?: string;
}

const MapComponent = memo(
  ({ center, places = [], className = '' }: MapContainerProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const tileLayerRef = useRef<L.TileLayer | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    
    // State
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | number | null>(places[0]?.id || null);
    const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark, update on mount

    // 1. Detect System Theme
    useEffect(() => {
        // Check initial
        if (typeof window !== 'undefined') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            setIsDarkMode(mq.matches);

            // Listen for changes
            const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        }
    }, []);

    // 2. Initialize Map & Handle Theme Changes
    useEffect(() => {
      if (!mapRef.current) return;

      if (!mapInstance.current) {
        // Init Map
        const map = L.map(mapRef.current, {
          center: [center.lat, center.lng],
          zoom: 14,
          zoomControl: false,
          attributionControl: false,
        });

        mapInstance.current = map;

        // Add Click to Deselect
        map.on('click', () => setSelectedPlaceId(null));
      }

      const map = mapInstance.current;

      // Select Tile Layer based on Theme
      // Dark: CartoDB Dark Matter (No labels for cleaner look, or with labels)
      // Light: CartoDB Voyager (Premium, pastel look)
      const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      const lightTiles = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      const url = isDarkMode ? darkTiles : lightTiles;

      if (tileLayerRef.current) {
          tileLayerRef.current.setUrl(url);
      } else {
          tileLayerRef.current = L.tileLayer(url, {
              attribution: '',
              maxZoom: 20,
          }).addTo(map);
      }

    }, [center.lat, center.lng, isDarkMode]);

    // 3. Render Markers
    useEffect(() => {
      if (!mapInstance.current) return;
      const map = mapInstance.current;

      // Clear old markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      places.forEach((place, index) => {
        const isSelected = place.id === selectedPlaceId;

        // Staggered Animation Delay based on index
        const delay = index * 50; 

        // --- Marker HTML ---
        // We use a cleaner, more discrete design.
        // Active: 64px, Gold Border, Subtle Pulse.
        // Passive: 44px, Theme Border, No Pulse.
        
        const size = isSelected ? 64 : 44;
        const anchor = size / 2;

        const borderColor = isSelected 
            ? 'border-[#EAB308]' // Gold
            : isDarkMode ? 'border-[#2C2C2E]' : 'border-white'; // Theme compliant

        const shadow = isSelected
            ? 'shadow-[0_10px_25px_rgba(234,179,8,0.4)]'
            : 'shadow-lg';

        const html = `
            <div 
                class="relative group cursor-pointer marker-pop-in" 
                style="animation-delay: ${delay}ms"
            >
                <!-- Pulse Ring (Active Only) -->
                ${isSelected ? `<div class="absolute inset-0 rounded-full border border-[#EAB308]/50 animate-ping opacity-75"></div>` : ''}
                
                <!-- Avatar Container -->
                <div class="relative w-[${size}px] h-[${size}px] rounded-full p-[3px] bg-background transition-all duration-500 ease-out ${isSelected ? 'scale-110' : 'hover:scale-105'}">
                    <div class="w-full h-full rounded-full overflow-hidden border-2 ${borderColor} ${shadow} bg-gray-200">
                        ${place.imageUrl 
                            ? `<img src="${place.imageUrl}" class="w-full h-full object-cover" />`
                            : `<div class="w-full h-full flex items-center justify-center font-bold text-xs">${place.name[0]}</div>`
                        }
                    </div>
                    
                    <!-- Online Dot -->
                    ${place.isOnline ? `
                    <div class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-background rounded-full flex items-center justify-center">
                        <div class="w-2.5 h-2.5 bg-[#32D583] rounded-full"></div>
                    </div>` : ''}
                </div>
            </div>
        `;

        const icon = L.divIcon({
            html,
            className: 'custom-marker-wrapper', // Clean wrapper
            iconSize: [size, size],
            iconAnchor: [anchor, anchor],
        });

        const marker = L.marker([place.location.lat, place.location.lng], { icon, zIndexOffset: isSelected ? 1000 : 100 }).addTo(map);

        marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            setSelectedPlaceId(place.id);
            map.flyTo([place.location.lat, place.location.lng], 15, { animate: true, duration: 0.8 });
        });

        markersRef.current.push(marker);
      });

    }, [places, selectedPlaceId, isDarkMode]);

    // Find active place data for the floating card
    const activePlace = places.find(p => p.id === selectedPlaceId);

    return (
      <div className={`relative w-full h-full overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#121214]' : 'bg-[#F5F5F7]'} ${className}`}>
        
        {/* CSS for Marker Animation */}
        <style>{`
            @keyframes popIn {
                0% { opacity: 0; transform: scale(0.3) translateY(10px); }
                60% { transform: scale(1.1); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
            }
            .marker-pop-in {
                animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                opacity: 0; /* Start hidden */
            }
        `}</style>

        {/* --- Top Floating Nav (Glassmorphism) --- */}
        <div className="absolute top-0 left-0 w-full z-[400] px-6 pt-6 flex justify-between items-start pointer-events-none">
            
            <button className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-sm pointer-events-auto transition-colors active:scale-95
                ${isDarkMode ? 'bg-[#1C1C1E]/80 border-white/10 text-white' : 'bg-white/80 border-black/5 text-gray-800'} backdrop-blur-xl`}>
                <Menu size={24} />
            </button>

            {/* Switcher */}
            <div className={`rounded-full p-1 flex items-center border shadow-lg pointer-events-auto backdrop-blur-xl
                ${isDarkMode ? 'bg-[#1C1C1E]/80 border-white/5' : 'bg-white/80 border-black/5'}`}>
                <button className="px-5 py-2 rounded-full transition-colors">
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pour vous</span>
                </button>
                <button className={`px-5 py-2 rounded-full shadow-sm transition-transform
                    ${isDarkMode ? 'bg-[#2C2C2E] text-white' : 'bg-white text-black'}`}>
                     <span className="flex items-center gap-2 text-sm font-semibold">
                        <MapPin size={12} className={isDarkMode ? 'text-[#EAB308]' : 'text-black'} fill="currentColor" />
                        À proximité
                     </span>
                </button>
            </div>

            <button className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-sm pointer-events-auto transition-colors active:scale-95
                ${isDarkMode ? 'bg-[#1C1C1E]/80 border-white/10 text-white' : 'bg-white/80 border-black/5 text-gray-800'} backdrop-blur-xl`}>
                <SlidersHorizontal size={20} />
            </button>
        </div>

        {/* --- Map Container --- */}
        <div ref={mapRef} className="absolute inset-0 z-0" />

        {/* --- Floating Profile Card (Bottom Center) --- */}
        {activePlace && (
            <div className="absolute bottom-28 left-6 right-6 z-[400] flex justify-center pointer-events-none">
                <div className={`w-full max-w-sm p-4 rounded-[24px] border shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-6 fade-in duration-500 pointer-events-auto
                    ${isDarkMode 
                        ? 'bg-[#1C1C1E]/90 border-white/10 text-white' 
                        : 'bg-white/90 border-white/40 text-gray-900'
                    }`}>
                    
                    <div className="flex items-center gap-4">
                        {/* Avatar (Card) */}
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full overflow-hidden">
                                <img src={activePlace.imageUrl} className="w-full h-full object-cover" />
                            </div>
                             {activePlace.isOnline && (
                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#32D583] border-[3px] border-white dark:border-[#1C1C1E] rounded-full"></div>
                             )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold">{activePlace.name}, {activePlace.age}</h3>
                                {activePlace.isVerified && <span className="text-blue-500">✓</span>}
                            </div>
                            <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {activePlace.isOnline ? 'En ligne maintenant' : 'Vu récemment'}
                            </p>
                        </div>

                        {/* Action */}
                        <button className="w-12 h-12 rounded-full bg-gradient-to-r from-action-purple to-blue-600 flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform active:scale-95">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- Recenter Button --- */}
        <div className="absolute bottom-28 right-6 z-[300]">
             <button 
                className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-xl transition active:scale-95 backdrop-blur-md
                ${isDarkMode ? 'bg-[#1C1C1E]/80 border-white/10 text-white hover:bg-[#2C2C2E]' : 'bg-white/80 border-black/5 text-gray-800 hover:bg-gray-50'}`}
                onClick={() => {
                   if(mapInstance.current) mapInstance.current.flyTo([center.lat, center.lng], 14);
                }}
             >
                <Crosshair size={24} />
             </button>
        </div>

      </div>
    );
  }
);

MapComponent.displayName = 'MapComponent';

export const MapContainer: React.FC<MapContainerProps> = (props) => {
  return <MapComponent {...props} />;
};
