import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { 
  Settings, Edit2, Pizza, Book, Plane, Palette, Sun, CheckCircle, 
  X, ChevronLeft, ChevronRight, ZoomIn, Heart, Users, Eye, 
  Crown, Briefcase, GraduationCap, Ruler, Wine, Plus, Camera, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const GALLERY_IMAGES = [
  "https://picsum.photos/300/400?random=21",
  "https://picsum.photos/300/400?random=22",
  "https://picsum.photos/600/400?random=23",
  "https://picsum.photos/300/400?random=24",
  "https://picsum.photos/300/400?random=25"
];

interface ProfileDetailProps {
  onOpenSettings?: () => void;
}

export const ProfileDetail: React.FC<ProfileDetailProps> = ({ onOpenSettings }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const { isDarkMode, theme } = useTheme();
  
  const touchStartX = useRef(0);
  const lastTap = useRef(0);

  const themeStyles = useMemo(() => ({
    bg: isDarkMode ? 'bg-background' : 'bg-[#F2F2F7]',
    textMain: isDarkMode ? 'text-white' : 'text-gray-900',
    textSub: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    surface: isDarkMode ? 'bg-surface border-white/5' : 'bg-white border-gray-200 shadow-sm',
    header: isDarkMode ? 'bg-[#121214]/90 border-white/5' : 'bg-white/90 border-gray-200',
    iconBtn: isDarkMode ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
    chip: isDarkMode ? 'bg-chip border-white/5' : 'bg-white border-gray-200 shadow-sm',
    border: isDarkMode ? 'border-white/10' : 'border-black/5'
  }), [isDarkMode]);

  useEffect(() => {
    setIsZoomed(false);
  }, [selectedIndex]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! + 1) % GALLERY_IMAGES.length);
  }, [selectedIndex]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => (prev! - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
  }, [selectedIndex]);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
    setIsZoomed(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isZoomed) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
  }, [isZoomed, handleNext, handlePrev]);

  const handleImageClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      setIsZoomed(!isZoomed);
    }
    lastTap.current = now;
  }, [isZoomed]);

  const interests = useMemo(() => [
    { icon: Pizza, label: 'Street Food', color: 'text-orange-500' },
    { icon: Book, label: 'Livres', color: 'text-blue-400' },
    { icon: Plane, label: 'Voyage', color: 'text-blue-300' },
    { icon: Palette, label: 'Art', color: 'text-purple-400' },
    { icon: Sun, label: 'Plage', color: 'text-yellow-400' }
  ], []);

  return (
    <div className={`h-full overflow-y-auto no-scrollbar pb-24 transition-colors duration-500 ${themeStyles.bg}`}>
      <div className={`sticky top-0 z-30 backdrop-blur-lg px-6 md:px-8 lg:px-12 py-4 flex justify-between items-center border-b transition-colors duration-500 ${themeStyles.header}`}>
        <h1 className={`text-lg font-bold tracking-wide ${themeStyles.textMain}`}>Mon Profil</h1>
        <div className="flex items-center gap-3">
          <button className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition ${isDarkMode ? 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10' : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'}`}>
            Aperçu
          </button>
          <button 
            onClick={onOpenSettings}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition ${isDarkMode ? 'bg-surface text-gray-400 hover:text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <div className="px-6 pt-6">
        <div className="flex items-center gap-5 mb-8">
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-action-purple via-blue-500 to-action-green">
              <img 
                src="https://picsum.photos/600/800?random=20" 
                className={`w-full h-full rounded-full object-cover border-4 ${isDarkMode ? 'border-background' : 'border-[#F2F2F7]'}`} 
                alt="Profile Avatar"
                loading="lazy"
              />
            </div>
            <div className={`absolute bottom-0 right-0 p-1.5 rounded-full border shadow-lg ${themeStyles.surface}`}>
              <Edit2 size={14} className={themeStyles.textSub} />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className={`text-2xl font-bold ${themeStyles.textMain}`}>Lay M, 25</h2>
              <CheckCircle className="text-blue-500 fill-current" size={20} />
            </div>
            <p className={`${themeStyles.textSub} text-sm mb-3`}>Washington, USA</p>
            
            <div className={`w-full h-1.5 rounded-full overflow-hidden flex ${isDarkMode ? 'bg-surface' : 'bg-gray-200'}`}>
              <div className="w-[85%] bg-action-purple h-full rounded-full"></div>
            </div>
            <p className={`text-[10px] mt-1.5 font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Profil complété à 85%</p>
          </div>
        </div>

        <div className="grid grid-cols-3 lg:flex lg:gap-6 gap-3 mb-8">
          <div className={`rounded-2xl p-3 lg:flex-1 flex flex-col items-center justify-center gap-1 border transition-colors duration-500 card-premium ${themeStyles.surface}`}>
            <div className="w-8 h-8 rounded-full bg-action-red/20 flex items-center justify-center mb-1">
              <Heart size={16} className="text-action-red fill-current" />
            </div>
            <span className={`text-xl font-bold ${themeStyles.textMain}`}>128</span>
            <span className={`text-[10px] uppercase tracking-wider font-semibold ${themeStyles.textSub}`}>Likes</span>
          </div>
          <div className={`rounded-2xl p-3 lg:flex-1 flex flex-col items-center justify-center gap-1 border transition-colors duration-500 card-premium ${themeStyles.surface}`}>
            <div className="w-8 h-8 rounded-full bg-action-purple/20 flex items-center justify-center mb-1">
              <Users size={16} className="text-action-purple fill-current" />
            </div>
            <span className={`text-xl font-bold ${themeStyles.textMain}`}>43</span>
            <span className={`text-[10px] uppercase tracking-wider font-semibold ${themeStyles.textSub}`}>Matchs</span>
          </div>
          <div className={`rounded-2xl p-3 lg:flex-1 flex flex-col items-center justify-center gap-1 border transition-colors duration-500 card-premium ${themeStyles.surface}`}>
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mb-1">
              <Eye size={16} className="text-blue-400 fill-current" />
            </div>
            <span className={`text-xl font-bold ${themeStyles.textMain}`}>1.2k</span>
            <span className={`text-[10px] uppercase tracking-wider font-semibold ${themeStyles.textSub}`}>Vues</span>
          </div>
        </div>

        <div className="relative w-full rounded-2xl p-5 mb-8 overflow-hidden group cursor-pointer shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/10 via-[#FFA500]/10 to-[#FFD700]/5 border border-[#FFD700]/20 rounded-2xl bg-[#121214]"></div>
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#FFD700]/20 blur-3xl rounded-full"></div>
          
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown size={20} className="text-[#FFD700] fill-current" />
                <h3 className="text-[#FFD700] font-bold text-lg">Connexa Gold</h3>
              </div>
              <p className="text-gray-300 text-xs max-w-[200px] leading-relaxed">
                Boostez votre visibilité x10 et voyez qui vous a liké.
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#FFD700] flex items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.4)] group-hover:scale-110 transition-transform">
              <ChevronRightIcon size={18} className="text-black" />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-end mb-3">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${themeStyles.textSub}`}>À propos de moi</h3>
            <button className="text-action-purple text-xs font-medium hover:underline">Modifier</button>
          </div>
          <div className={`rounded-2xl p-4 border transition-colors duration-500 ${themeStyles.surface}`}>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Salut ! 👋 J'ai 25 ans, fan de café ☕, de voyages ✈️, et de discussions nocturnes ✨. Toujours ouverte aux nouvelles rencontres et aux bonnes ondes 🌎.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-end mb-3">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${themeStyles.textSub}`}>L'essentiel</h3>
            <button className="text-action-purple text-xs font-medium hover:underline">Modifier</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`rounded-xl p-3 flex items-center gap-3 border transition-colors duration-500 ${themeStyles.surface}`}>
              <Briefcase size={18} className={themeStyles.textSub} />
              <div>
                <p className={`text-[10px] ${themeStyles.textSub}`}>Travail</p>
                <p className={`text-xs font-medium ${themeStyles.textMain}`}>Designer</p>
              </div>
            </div>
            <div className={`rounded-xl p-3 flex items-center gap-3 border transition-colors duration-500 ${themeStyles.surface}`}>
              <GraduationCap size={18} className={themeStyles.textSub} />
              <div>
                <p className={`text-[10px] ${themeStyles.textSub}`}>Études</p>
                <p className={`text-xs font-medium ${themeStyles.textMain}`}>Arts Univ.</p>
              </div>
            </div>
            <div className={`rounded-xl p-3 flex items-center gap-3 border transition-colors duration-500 ${themeStyles.surface}`}>
              <Ruler size={18} className={themeStyles.textSub} />
              <div>
                <p className={`text-[10px] ${themeStyles.textSub}`}>Taille</p>
                <p className={`text-xs font-medium ${themeStyles.textMain}`}>175 cm</p>
              </div>
            </div>
            <div className={`rounded-xl p-3 flex items-center gap-3 border transition-colors duration-500 ${themeStyles.surface}`}>
              <Wine size={18} className={themeStyles.textSub} />
              <div>
                <p className={`text-[10px] ${themeStyles.textSub}`}>Boisson</p>
                <p className={`text-xs font-medium ${themeStyles.textMain}`}>Parfois</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-end mb-3">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${themeStyles.textSub}`}>Intérêts</h3>
            <button className="text-action-purple text-xs font-medium hover:underline">Modifier</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, idx) => {
              const Icon = interest.icon;
              return (
                <div key={idx} className={`flex items-center gap-1.5 px-3 py-2 rounded-full border transition-colors duration-500 ${themeStyles.chip}`}>
                  <Icon size={14} className={interest.color} />
                  <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{interest.label}</span>
                </div>
              );
            })}
            <button className={`flex items-center gap-1.5 px-3 py-2 rounded-full border border-dashed transition ${isDarkMode ? 'border-white/20 text-gray-400 hover:text-white hover:border-white/40' : 'border-gray-300 text-gray-500 hover:text-gray-800 hover:border-gray-400'}`}>
              <Plus size={14} />
            </button>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex justify-between items-end mb-3">
            <h3 className={`text-xs font-semibold uppercase tracking-wider ${themeStyles.textSub}`}>Ma Galerie</h3>
            <span className={`text-[10px] ${themeStyles.textSub}`}>Maintenez pour réorganiser</span>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {GALLERY_IMAGES.map((src, index) => (
              <div 
                key={index} 
                className={`relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-transform group ${isDarkMode ? 'bg-surface' : 'bg-gray-100'}`}
                onClick={() => setSelectedIndex(index)}
              >
                <img src={src} className="w-full h-full object-cover" alt={`Gallery ${index}`} loading="lazy" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-action-purple px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wide">
                    Principal
                  </div>
                )}
              </div>
            ))}
            <div className={`aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors group ${isDarkMode ? 'bg-surface border-white/10 hover:bg-white/5' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${isDarkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
                <Camera size={20} className={`${themeStyles.textSub} group-hover:text-action-purple`} />
              </div>
              <span className={`text-[10px] font-medium ${themeStyles.textSub}`}>Ajouter</span>
            </div>
          </div>
        </div>
      </div>

      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center touch-none animate-in fade-in duration-300"
          onClick={handleClose}
        >
          <button 
            onClick={handleClose}
            className="absolute top-6 right-6 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 z-50"
          >
            <X size={24} />
          </button>

          <button 
            onClick={handlePrev}
            className="absolute left-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 z-50 hidden sm:block"
          >
            <ChevronLeft size={32} />
          </button>

          <button 
            onClick={handleNext}
            className="absolute right-4 p-3 bg-white/10 rounded-full text-white hover:bg-white/20 z-50 hidden sm:block"
          >
            <ChevronRight size={32} />
          </button>
          
          <div 
            className="w-full h-full flex items-center justify-center overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img 
              src={GALLERY_IMAGES[selectedIndex]} 
              alt="Full screen view" 
              className={`max-w-full max-h-full object-contain transition-transform duration-300 ease-out ${isZoomed ? 'scale-[2.5] cursor-move' : 'scale-100 cursor-zoom-in'}`}
              onClick={handleImageClick}
            />
          </div>

          <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 z-50">
            {GALLERY_IMAGES.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === selectedIndex ? 'bg-white w-6' : 'bg-white/30'}`} 
              />
            ))}
          </div>

          {!isZoomed && (
            <div className="absolute bottom-24 bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10 flex items-center gap-2 animate-pulse">
              <ZoomIn size={14} className="text-gray-300" />
              <span className="text-xs text-gray-300">Double tap pour zoomer</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
