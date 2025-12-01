import React, { useEffect, useRef, useState, memo } from 'react';
import L from 'leaflet';
import { SlidersHorizontal, Menu, Crosshair, MessageCircle, User } from 'lucide-react';

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
  height?: string;
}

const MapComponent = memo(
  ({ center, places = [], className = '' }: MapContainerProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    
    // State to track which user is currently "active"
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | number | null>(places[0]?.id || null);

    useEffect(() => {
      if (!mapRef.current || mapInstance.current) return;

      try {
        // Initialize Leaflet map
        const map = L.map(mapRef.current, {
          center: [center.lat, center.lng],
          zoom: 14,
          zoomControl: false,
          attributionControl: false,
        });

        mapInstance.current = map;

        // Dark theme tiles with inverted filter for "Deep Charcoal" luxury look
        const tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '',
          maxZoom: 20,
        });

        tiles.addTo(map);
        
        // CSS hack to invert tiles for deep dark mode matching #121214
        tiles.getContainer()!.style.filter = 'invert(100%) hue-rotate(180deg) brightness(0.8) contrast(1.2) grayscale(0.8)';
        
        // Add a subtle "Radar" circle overlay at center
        L.circle([center.lat, center.lng], {
            color: '#32D583',
            fillColor: '#32D583',
            fillOpacity: 0.05,
            radius: 800,
            weight: 1,
            dashArray: '10, 20'
        }).addTo(map);

        // --- NEW: Handle map background click to deselect ---
        map.on('click', () => {
            setSelectedPlaceId(null);
        });

        return () => {
          if (mapInstance.current) {
            map.remove();
            mapInstance.current = null;
          }
        };
      } catch (error) {
        console.error('Map init error:', error);
      }
    }, [center.lat, center.lng]);

    // Handle Markers rendering based on selection
    useEffect(() => {
      if (!mapInstance.current) return;
      const map = mapInstance.current;

      // Clear old markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      places.forEach((place) => {
        const isSelected = place.id === selectedPlaceId;

        // --- 1. HERO MARKER (Selected) ---
        if (isSelected) {
            const html = `
            <div class="relative flex flex-col items-center justify-center w-[300px] h-[300px] pointer-events-none select-none">
                
                <!-- Radar Pulse Animation -->
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-[#EAB308]/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#EAB308]/5 rounded-full blur-2xl"></div>

                <!-- Main Avatar Container -->
                <div class="relative z-20 pointer-events-auto cursor-pointer group transition-transform duration-500 hover:scale-105">
                     <!-- Golden Gradient Border & Glow -->
                     <div class="absolute -inset-1.5 bg-gradient-to-br from-[#EAB308] via-[#CA8A04] to-[#EAB308] rounded-full blur-md opacity-60 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
                     
                     <!-- Image -->
                     <div class="relative w-32 h-32 rounded-full border-[3px] border-[#1C1C1E] overflow-hidden bg-[#1C1C1E] shadow-2xl z-10">
                        <img src="${place.imageUrl}" class="w-full h-full object-cover" />
                     </div>
                     
                     <!-- Teardrop Point (Visual) -->
                     <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#CA8A04] rotate-45 transform origin-center -z-0 shadow-[0_0_15px_rgba(234,179,8,0.8)]"></div>
                     
                     <!-- Online Badge -->
                     ${place.isOnline ? `
                     <div class="absolute bottom-1 right-2 w-7 h-7 bg-[#1C1C1E] rounded-full flex items-center justify-center z-30">
                        <div class="w-4 h-4 bg-[#32D583] rounded-full shadow-[0_0_8px_#32D583] animate-pulse"></div>
                     </div>` : ''}
                </div>

                <!-- Floating Info Card -->
                <div class="mt-6 bg-[#121214]/80 backdrop-blur-xl border border-white/10 rounded-[20px] p-4 shadow-2xl flex flex-col items-center min-w-[180px] animate-in slide-in-from-bottom-4 fade-in duration-500 pointer-events-auto">
                    
                    <!-- Name & Age -->
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-white font-bold text-xl tracking-tight">${place.name}, ${place.age}</span>
                        ${place.isVerified ? '<div class="bg-blue-500/20 p-1 rounded-full"><svg class="w-3 h-3 text-blue-400 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg></div>' : ''}
                    </div>
                    
                    <!-- Status Pill -->
                    <div class="flex items-center gap-1.5 mb-3 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        <span class="w-1.5 h-1.5 bg-[#EAB308] rounded-full shadow-[0_0_6px_#EAB308]"></span>
                        <span class="text-[11px] text-gray-300 font-medium tracking-wide">${place.isOnline ? 'En temps réel' : 'Récemment actif'}</span>
                    </div>

                    <!-- Quick Actions -->
                    <div class="flex items-center gap-4 w-full justify-center border-t border-white/10 pt-3">
                         <button class="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all active:scale-95 group/btn">
                            <svg class="w-5 h-5 text-white group-hover/btn:text-[#EAB308] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                         </button>
                         <button class="w-10 h-10 rounded-full bg-[#7B4CF6] hover:bg-[#6D42DB] flex items-center justify-center transition-all shadow-[0_0_15px_rgba(123,76,246,0.3)] hover:shadow-[0_0_20px_rgba(123,76,246,0.5)] active:scale-95 group/btn">
                            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                         </button>
                    </div>
                </div>
            </div>
            `;

            const icon = L.divIcon({
                html,
                className: 'custom-hero-marker',
                iconSize: [300, 300],
                iconAnchor: [150, 115], // Carefully tuned to center over location
            });

            const marker = L.marker([place.location.lat, place.location.lng], { icon, zIndexOffset: 1000 }).addTo(map);
            
            // Fly to selection
            map.flyTo([place.location.lat, place.location.lng], 15, { animate: true, duration: 0.8 });
            
            markersRef.current.push(marker);
        } 
        
        // --- 2. PASSIVE MARKER (Others) ---
        else {
            const html = `
            <div class="relative group cursor-pointer transition-transform duration-300 hover:scale-110">
                <div class="w-[52px] h-[52px] rounded-full p-[2px] bg-gradient-to-tr from-white/20 to-transparent shadow-lg backdrop-blur-sm border border-white/5">
                    <div class="w-full h-full rounded-full overflow-hidden bg-[#1C1C1E]">
                        ${place.imageUrl 
                            ? `<img src="${place.imageUrl}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />`
                            : `<div class="w-full h-full bg-gray-800 flex items-center justify-center text-white font-bold">${place.name[0]}</div>`
                        }
                    </div>
                </div>
                <!-- Mini Online Dot -->
                ${place.isOnline ? `<div class="absolute bottom-0 right-0 w-3 h-3 bg-[#32D583] border-2 border-[#121214] rounded-full"></div>` : ''}
            </div>
            `;

            const icon = L.divIcon({
                html,
                className: 'custom-passive-marker',
                iconSize: [52, 52],
                iconAnchor: [26, 26],
            });

            const marker = L.marker([place.location.lat, place.location.lng], { icon }).addTo(map);
            
            // On Click -> Become Selected
            marker.on('click', (e) => {
                L.DomEvent.stopPropagation(e); // Prevent map click logic
                setSelectedPlaceId(place.id);
            });
            
            markersRef.current.push(marker);
        }

      });

    }, [places, selectedPlaceId]);

    return (
      <div className={`relative w-full h-full bg-[#121214] overflow-hidden ${className}`}>
        
        {/* --- Floating Top Navigation --- */}
        <div className="absolute top-0 left-0 w-full z-[400] px-6 pt-6 flex justify-between items-start pointer-events-none">
            
            {/* Menu Button */}
            <button className="w-12 h-12 bg-[#1C1C1E]/60 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/5 shadow-lg pointer-events-auto active:scale-95 transition-transform">
                <Menu size={24} />
            </button>

            {/* Toggle Switch (For you / Nearby) */}
            <div className="bg-[#1C1C1E]/80 backdrop-blur-xl rounded-full p-1.5 flex items-center border border-white/5 shadow-2xl pointer-events-auto">
                <button 
                    className="px-6 py-2.5 rounded-full text-gray-400 text-sm font-medium hover:text-white transition-colors"
                >
                    <span className="flex items-center gap-2">🔥 Pour vous</span>
                </button>
                <button 
                    className="px-6 py-2.5 rounded-full bg-[#2C2C2E] text-white text-sm font-medium shadow-md transition-transform"
                >
                     <span className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        À proximité
                     </span>
                </button>
            </div>

            {/* Filters Button */}
            <button className="w-12 h-12 bg-[#1C1C1E]/60 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/5 shadow-lg pointer-events-auto active:scale-95 transition-transform">
                <SlidersHorizontal size={20} />
            </button>
        </div>

        {/* --- Map Container --- */}
        <div ref={mapRef} className="absolute inset-0 z-0 bg-[#121214]" />
        
        {/* --- Bottom Right Controls --- */}
        <div className="absolute bottom-24 right-6 z-[400] flex flex-col gap-4">
             <button 
                className="w-12 h-12 bg-[#1C1C1E]/80 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 shadow-xl hover:bg-[#2C2C2E] transition active:scale-95"
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