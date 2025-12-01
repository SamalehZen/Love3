
import React, { useEffect, useRef, useState, memo } from 'react';
import L from 'leaflet';
import { SlidersHorizontal, Menu, Crosshair, MapPin, X, Heart, User, Sparkles } from 'lucide-react';

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
  relationshipStatus?: 'Single' | 'Taken' | 'Complicated' | 'Open';
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
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // 1. Detect System Theme
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            setIsDarkMode(mq.matches);
            const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        }
    }, []);

    // 2. Initialize Map
    useEffect(() => {
      if (!mapRef.current) return;

      if (!mapInstance.current) {
        const map = L.map(mapRef.current, {
          center: [center.lat, center.lng],
          zoom: 14,
          zoomControl: false,
          attributionControl: false,
        });

        mapInstance.current = map;
        map.on('click', () => {
             setSelectedPlaceId(null);
             setIsProfileOpen(false);
        });
      }

      const map = mapInstance.current;
      const darkTiles = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      const lightTiles = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      const url = isDarkMode ? darkTiles : lightTiles;

      if (tileLayerRef.current) {
          tileLayerRef.current.setUrl(url);
      } else {
          tileLayerRef.current = L.tileLayer(url, { attribution: '', maxZoom: 20 }).addTo(map);
      }
    }, [center.lat, center.lng, isDarkMode]);

    // 3. Render Markers
    useEffect(() => {
      if (!mapInstance.current) return;
      const map = mapInstance.current;

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      places.forEach((place, index) => {
        const isSelected = place.id === selectedPlaceId;
        const delay = index * 50; 
        const size = isSelected ? 64 : 44;
        const anchor = size / 2;

        const borderColor = isSelected 
            ? 'border-[#EAB308]' 
            : isDarkMode ? 'border-[#2C2C2E]' : 'border-white';

        const shadow = isSelected
            ? 'shadow-[0_10px_25px_rgba(234,179,8,0.4)]'
            : 'shadow-lg';

        const shimmerOverlay = isSelected 
            ? `<div class="absolute inset-0 z-20 overflow-hidden rounded-full pointer-events-none">
                 <div class="absolute top-0 left-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer-marker"></div>
               </div>`
            : '';

        const html = `
            <div 
                class="relative group cursor-pointer marker-pop-in" 
                style="animation-delay: ${delay}ms"
            >
                ${isSelected ? `<div class="absolute inset-0 rounded-full border border-[#EAB308]/50 animate-ping opacity-75"></div>` : ''}
                
                <div class="relative w-[${size}px] h-[${size}px] rounded-full p-[3px] bg-background transition-all duration-500 ease-out ${isSelected ? 'scale-110' : 'hover:scale-105'}">
                    <div class="w-full h-full rounded-full overflow-hidden border-2 ${borderColor} ${shadow} bg-gray-200 relative">
                        ${shimmerOverlay}
                        ${place.imageUrl 
                            ? `<img src="${place.imageUrl}" class="w-full h-full object-cover relative z-10" />`
                            : `<div class="w-full h-full flex items-center justify-center font-bold text-xs relative z-10">${place.name[0]}</div>`
                        }
                    </div>
                    
                    ${place.isOnline ? `
                    <div class="absolute bottom-0 right-0 w-3.5 h-3.5 bg-background rounded-full flex items-center justify-center z-30">
                        <div class="w-2.5 h-2.5 bg-[#32D583] rounded-full shadow-[0_0_8px_#32D583]"></div>
                    </div>` : ''}
                </div>
            </div>
        `;

        const icon = L.divIcon({
            html,
            className: 'custom-marker-wrapper',
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

    const activePlace = places.find(p => p.id === selectedPlaceId);

    // Helpers for Relationship Labels
    const getStatusLabel = (status?: string) => {
        switch(status) {
            case 'Single': return 'Célibataire';
            case 'Taken': return 'En couple';
            case 'Open': return 'Relation libre';
            case 'Complicated': return 'C\'est compliqué';
            default: return 'Non spécifié';
        }
    };

    const getStatusColor = (status?: string) => {
         switch(status) {
            case 'Single': return 'bg-action-green/20 text-action-green border-action-green/30';
            case 'Taken': return 'bg-action-red/20 text-action-red border-action-red/30';
            case 'Open': return 'bg-action-purple/20 text-action-purple border-action-purple/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    return (
      <div className={`relative w-full h-full overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#121214]' : 'bg-[#F5F5F7]'} ${className}`}>
        
        <style>{`
            @keyframes popIn { 0% { opacity: 0; transform: scale(0.3) translateY(10px); } 60% { transform: scale(1.1); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
            .marker-pop-in { animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; opacity: 0; }
            @keyframes shimmer-move { 0% { transform: translateX(-150%) skewX(-20deg); } 50% { transform: translateX(150%) skewX(-20deg); } 100% { transform: translateX(150%) skewX(-20deg); } }
            .animate-shimmer-marker { animation: shimmer-move 3s infinite ease-in-out; }
        `}</style>

        {/* --- Top Nav --- */}
        <div className="absolute top-0 left-0 w-full z-[400] px-6 pt-6 flex justify-between items-start pointer-events-none">
            <button className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-sm pointer-events-auto transition-colors active:scale-95 ${isDarkMode ? 'bg-[#1C1C1E]/80 border-white/10 text-white' : 'bg-white/80 border-black/5 text-gray-800'} backdrop-blur-xl`}>
                <Menu size={24} />
            </button>
            <div className={`rounded-full p-1 flex items-center border shadow-lg pointer-events-auto backdrop-blur-xl ${isDarkMode ? 'bg-[#1C1C1E]/80 border-white/5' : 'bg-white/80 border-black/5'}`}>
                <button className="px-5 py-2 rounded-full transition-colors">
                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pour vous</span>
                </button>
                <button className={`px-5 py-2 rounded-full shadow-sm transition-transform ${isDarkMode ? 'bg-[#2C2C2E] text-white' : 'bg-white text-black'}`}>
                     <span className="flex items-center gap-2 text-sm font-semibold">
                        <MapPin size={12} className={isDarkMode ? 'text-[#EAB308]' : 'text-black'} fill="currentColor" />
                        À proximité
                     </span>
                </button>
            </div>
            <button className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-sm pointer-events-auto transition-colors active:scale-95 ${isDarkMode ? 'bg-[#1C1C1E]/80 border-white/10 text-white' : 'bg-white/80 border-black/5 text-gray-800'} backdrop-blur-xl`}>
                <SlidersHorizontal size={20} />
            </button>
        </div>

        {/* --- Map --- */}
        <div ref={mapRef} className="absolute inset-0 z-0" />

        {/* --- Floating Info Card (Bottom) --- */}
        {activePlace && !isProfileOpen && (
            <div className="absolute bottom-28 left-6 right-6 z-[400] flex justify-center pointer-events-none">
                <div className={`w-full max-w-sm p-4 rounded-[24px] border shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-6 fade-in duration-500 pointer-events-auto ${isDarkMode ? 'bg-[#1C1C1E]/90 border-white/10 text-white' : 'bg-white/90 border-white/40 text-gray-900'}`}>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full overflow-hidden">
                                <img src={activePlace.imageUrl} className="w-full h-full object-cover" />
                            </div>
                             {activePlace.isOnline && (
                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#32D583] border-[3px] border-white dark:border-[#1C1C1E] rounded-full shadow-lg"></div>
                             )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold">{activePlace.name}, {activePlace.age}</h3>
                                {activePlace.isVerified && <span className="text-blue-500">✓</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(activePlace.relationshipStatus)} font-medium`}>
                                    {getStatusLabel(activePlace.relationshipStatus)}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => setIsProfileOpen(true)}
                                className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/20 transition-colors"
                             >
                                <User size={20} />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-gradient-to-r from-action-purple to-blue-600 flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform active:scale-95">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- Full Screen Luxury Profile Overlay --- */}
        {isProfileOpen && activePlace && (
            <div className="absolute inset-0 z-[500] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className={`w-full h-[85%] rounded-t-[32px] overflow-hidden shadow-2xl relative flex flex-col animate-in slide-in-from-bottom-full duration-500 ease-out
                     ${isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white'}`}>
                    
                    {/* Hero Image Header */}
                    <div className="w-full h-[40%] relative">
                        <img src={activePlace.imageUrl} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1C1C1E]"></div>
                        <button 
                            onClick={() => setIsProfileOpen(false)}
                            className="absolute top-4 right-4 w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content Body */}
                    <div className="flex-1 px-6 -mt-12 relative z-10 overflow-y-auto pb-8 no-scrollbar">
                        <div className="flex justify-between items-end mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                                    {activePlace.name}, {activePlace.age}
                                    {activePlace.isVerified && <span className="text-blue-500 text-xl">✓</span>}
                                </h1>
                                <p className="text-gray-400 text-sm flex items-center gap-1.5 mt-1">
                                    <MapPin size={14} /> 2 km de vous
                                </p>
                            </div>
                             <div className={`px-3 py-1.5 rounded-full border ${getStatusColor(activePlace.relationshipStatus)} flex items-center gap-1.5`}>
                                <Heart size={14} className="fill-current" />
                                <span className="text-xs font-bold uppercase tracking-wide">{getStatusLabel(activePlace.relationshipStatus)}</span>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex gap-4 mb-6">
                            <div className="flex-1 bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-center">
                                <span className="text-white font-bold text-lg">85%</span>
                                <span className="text-gray-500 text-[10px] uppercase">Match</span>
                            </div>
                            <div className="flex-1 bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-center">
                                <span className="text-white font-bold text-lg">1.2k</span>
                                <span className="text-gray-500 text-[10px] uppercase">Fans</span>
                            </div>
                            <div className="flex-1 bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-center">
                                <span className="text-white font-bold text-lg">Active</span>
                                <span className="text-gray-500 text-[10px] uppercase">Status</span>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="mb-6">
                            <h3 className="text-gray-300 font-semibold mb-2">À propos</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                Passionnée par les voyages, la photo et les bons cafés. Je cherche quelqu'un avec qui partager des moments simples et authentiques. ✨
                            </p>
                        </div>

                        {/* Interests */}
                        <div className="mb-8">
                            <h3 className="text-gray-300 font-semibold mb-3">Intérêts</h3>
                            <div className="flex flex-wrap gap-2">
                                {['Voyage', 'Photo', 'Café', 'Nature', 'Musique'].map((tag, i) => (
                                    <span key={i} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                         {/* Action Buttons Large */}
                        <div className="flex gap-4">
                            <button className="flex-1 h-12 rounded-full border border-white/10 flex items-center justify-center gap-2 text-white font-semibold hover:bg-white/5 transition-colors">
                                <X size={20} className="text-red-500" />
                                Passer
                            </button>
                            <button className="flex-1 h-12 rounded-full bg-action-purple flex items-center justify-center gap-2 text-white font-semibold hover:bg-purple-600 transition-colors shadow-lg shadow-purple-900/50">
                                <Heart size={20} className="fill-current" />
                                Liker
                            </button>
                        </div>
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
