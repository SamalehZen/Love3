import React, { useState } from 'react';
import { 
  ChevronLeft, Moon, Sun, Bell, MapPin, Users, Shield, 
  HelpCircle, LogOut, ChevronRight, Crown, Heart, Eye
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from './ui/Button';

interface SettingsProps {
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [showOnMap, setShowOnMap] = useState(true);
  const [ageRange, setAgeRange] = useState([18, 35]);
  const [maxDistance, setMaxDistance] = useState(50);

  const SettingRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    value?: React.ReactNode;
    onClick?: () => void;
    danger?: boolean;
  }> = ({ icon, label, value, onClick, danger }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-colors ${
        isDarkMode 
          ? 'hover:bg-white/5' 
          : 'hover:bg-gray-50'
      } ${danger ? 'text-action-red' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isDarkMode ? 'bg-white/5' : 'bg-gray-100'
        }`}>
          {icon}
        </div>
        <span className={`font-medium ${danger ? 'text-action-red' : theme.textMain}`}>{label}</span>
      </div>
      {value || <ChevronRight size={20} className={theme.textSub} />}
    </button>
  );

  const Toggle: React.FC<{ enabled: boolean; onToggle: () => void }> = ({ enabled, onToggle }) => (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={`w-12 h-7 rounded-full transition-colors relative ${
        enabled ? 'bg-action-green' : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
      }`}
    >
      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );

  return (
    <div className={`h-full flex flex-col transition-colors duration-500 ${theme.bg}`}>
      <div className={`sticky top-0 z-30 backdrop-blur-lg px-4 py-4 flex items-center gap-4 border-b transition-colors duration-500 ${theme.headerBg}`}>
        <button 
          onClick={onClose}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
          }`}
        >
          <ChevronLeft size={24} className={theme.textMain} />
        </button>
        <h1 className={`text-lg font-bold ${theme.textMain}`}>Paramètres</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        <div className="relative w-full rounded-2xl p-5 m-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/10 via-[#FFA500]/10 to-[#FFD700]/5 border border-[#FFD700]/20 rounded-2xl bg-[#121214]"></div>
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#FFD700]/20 blur-3xl rounded-full"></div>
          
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown size={20} className="text-[#FFD700] fill-current" />
                <h3 className="text-[#FFD700] font-bold text-lg">Passer à Gold</h3>
              </div>
              <p className="text-gray-300 text-xs max-w-[200px] leading-relaxed">
                Likes illimités, voir qui vous aime, et plus encore.
              </p>
            </div>
            <Button variant="gold" size="sm">
              Essayer
            </Button>
          </div>
        </div>

        <div className="px-4 space-y-2">
          <h3 className={`text-xs font-semibold uppercase tracking-wider px-4 mb-2 ${theme.textSub}`}>
            Compte
          </h3>
          <div className={`rounded-2xl border overflow-hidden ${theme.surface}`}>
            <SettingRow
              icon={isDarkMode ? <Moon size={20} className="text-action-purple" /> : <Sun size={20} className="text-yellow-500" />}
              label="Mode sombre"
              value={<Toggle enabled={isDarkMode} onToggle={toggleTheme} />}
            />
            <SettingRow
              icon={<Bell size={20} className="text-action-green" />}
              label="Notifications"
              value={<Toggle enabled={notifications} onToggle={() => setNotifications(!notifications)} />}
            />
            <SettingRow
              icon={<Eye size={20} className="text-blue-500" />}
              label="Visible sur la carte"
              value={<Toggle enabled={showOnMap} onToggle={() => setShowOnMap(!showOnMap)} />}
            />
          </div>
        </div>

        <div className="px-4 space-y-2 mt-6">
          <h3 className={`text-xs font-semibold uppercase tracking-wider px-4 mb-2 ${theme.textSub}`}>
            Préférences de recherche
          </h3>
          <div className={`rounded-2xl border overflow-hidden ${theme.surface}`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-white/5' : 'bg-gray-100'
                  }`}>
                    <Users size={20} className="text-action-purple" />
                  </div>
                  <span className={`font-medium ${theme.textMain}`}>Tranche d'âge</span>
                </div>
                <span className={`text-sm font-semibold ${theme.textMain}`}>
                  {ageRange[0]} - {ageRange[1]} ans
                </span>
              </div>
              <input
                type="range"
                min="18"
                max="60"
                value={ageRange[1]}
                onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])}
                className="w-full h-1.5 bg-gray-600 rounded-full appearance-none cursor-pointer accent-action-green"
              />
            </div>
            
            <div className="p-4 border-t border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-white/5' : 'bg-gray-100'
                  }`}>
                    <MapPin size={20} className="text-action-green" />
                  </div>
                  <span className={`font-medium ${theme.textMain}`}>Distance max</span>
                </div>
                <span className={`text-sm font-semibold ${theme.textMain}`}>
                  {maxDistance} km
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-600 rounded-full appearance-none cursor-pointer accent-action-green"
              />
            </div>
          </div>
        </div>

        <div className="px-4 space-y-2 mt-6">
          <h3 className={`text-xs font-semibold uppercase tracking-wider px-4 mb-2 ${theme.textSub}`}>
            Support
          </h3>
          <div className={`rounded-2xl border overflow-hidden ${theme.surface}`}>
            <SettingRow
              icon={<Shield size={20} className="text-blue-500" />}
              label="Confidentialité"
            />
            <SettingRow
              icon={<HelpCircle size={20} className={theme.textSub} />}
              label="Centre d'aide"
            />
          </div>
        </div>

        <div className="px-4 mt-6">
          <div className={`rounded-2xl border overflow-hidden ${theme.surface}`}>
            <SettingRow
              icon={<LogOut size={20} className="text-action-red" />}
              label="Se déconnecter"
              danger
            />
          </div>
        </div>

        <p className={`text-center text-xs mt-8 pb-4 ${theme.textSub}`}>
          Connexa v1.0.0
        </p>
      </div>
    </div>
  );
};
