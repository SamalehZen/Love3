import React, { useState } from 'react';
import { 
  ChevronLeft, Sun, Moon, Bell, BellOff, MapPin, Users, 
  Shield, CreditCard, LogOut, ChevronRight, Crown, Heart,
  Eye, Lock, HelpCircle, Info
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [showDistance, setShowDistance] = useState(true);
  const [distanceRange, setDistanceRange] = useState(50);
  const [ageRange, setAgeRange] = useState({ min: 18, max: 35 });

  const SettingSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
      <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-1 ${theme.textSub}`}>
        {title}
      </h3>
      <div className={`rounded-2xl overflow-hidden border ${isDarkMode ? 'bg-surface border-white/5' : 'bg-white border-gray-200 shadow-sm'}`}>
        {children}
      </div>
    </div>
  );

  const SettingRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    value?: string;
    onClick?: () => void;
    toggle?: boolean;
    toggleValue?: boolean;
    onToggle?: () => void;
    danger?: boolean;
  }> = ({ icon, label, value, onClick, toggle, toggleValue, onToggle, danger }) => (
    <button
      onClick={onClick || onToggle}
      className={`w-full flex items-center gap-4 px-4 py-3.5 transition-colors ${
        isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
      } ${isDarkMode ? 'border-b border-white/5 last:border-0' : 'border-b border-gray-100 last:border-0'}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        danger 
          ? 'bg-action-red/20 text-action-red' 
          : isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'
      }`}>
        {icon}
      </div>
      <span className={`flex-1 text-left text-sm font-medium ${danger ? 'text-action-red' : theme.textMain}`}>
        {label}
      </span>
      {toggle ? (
        <div 
          className={`w-12 h-7 rounded-full p-1 transition-colors ${
            toggleValue ? 'bg-action-green' : isDarkMode ? 'bg-white/10' : 'bg-gray-200'
          }`}
        >
          <div 
            className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
              toggleValue ? 'translate-x-5' : 'translate-x-0'
            }`} 
          />
        </div>
      ) : value ? (
        <span className={`text-sm ${theme.textSub}`}>{value}</span>
      ) : (
        <ChevronRight size={18} className={theme.textSub} />
      )}
    </button>
  );

  return (
    <div className={`h-full overflow-y-auto no-scrollbar pb-24 transition-colors duration-500 ${theme.bg}`}>
      <div className={`sticky top-0 z-30 backdrop-blur-lg px-4 py-4 flex items-center gap-4 border-b transition-colors duration-500 ${theme.headerBg} ${theme.headerBorder}`}>
        <button 
          onClick={onBack}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${theme.iconBtn} border ${theme.iconBtnBorder}`}
        >
          <ChevronLeft size={20} className={theme.textMain} />
        </button>
        <h1 className={`text-lg font-bold ${theme.textMain}`}>Paramètres</h1>
      </div>

      <div className="px-4 pt-6">
        <div className="relative w-full rounded-2xl p-5 mb-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/10 via-[#FFA500]/10 to-[#FFD700]/5 border border-[#FFD700]/20 rounded-2xl bg-[#121214]" />
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#FFD700]/20 blur-3xl rounded-full" />
          
          <div className="relative z-10 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown size={20} className="text-[#FFD700] fill-current" />
                <h3 className="text-[#FFD700] font-bold text-lg">Passer à Gold</h3>
              </div>
              <p className="text-gray-300 text-xs max-w-[200px] leading-relaxed">
                Likes illimités, voir qui vous a liké, et plus encore.
              </p>
            </div>
            <button className="px-4 py-2 bg-[#FFD700] rounded-full text-black font-semibold text-sm shadow-lg shadow-[#FFD700]/30 hover:scale-105 transition-transform">
              Upgrade
            </button>
          </div>
        </div>

        <SettingSection title="Apparence">
          <SettingRow
            icon={isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
            label="Mode sombre"
            toggle
            toggleValue={isDarkMode}
            onToggle={toggleTheme}
          />
        </SettingSection>

        <SettingSection title="Découverte">
          <SettingRow
            icon={<MapPin size={18} />}
            label="Distance maximale"
            value={`${distanceRange} km`}
          />
          <SettingRow
            icon={<Users size={18} />}
            label="Tranche d'âge"
            value={`${ageRange.min} - ${ageRange.max} ans`}
          />
          <SettingRow
            icon={<Eye size={18} />}
            label="Afficher ma distance"
            toggle
            toggleValue={showDistance}
            onToggle={() => setShowDistance(!showDistance)}
          />
        </SettingSection>

        <SettingSection title="Notifications">
          <SettingRow
            icon={notifications ? <Bell size={18} /> : <BellOff size={18} />}
            label="Notifications push"
            toggle
            toggleValue={notifications}
            onToggle={() => setNotifications(!notifications)}
          />
          <SettingRow
            icon={<Heart size={18} />}
            label="Nouveaux matchs"
            value="Activé"
          />
        </SettingSection>

        <SettingSection title="Confidentialité">
          <SettingRow
            icon={<Shield size={18} />}
            label="Confidentialité du profil"
          />
          <SettingRow
            icon={<Lock size={18} />}
            label="Données et sécurité"
          />
        </SettingSection>

        <SettingSection title="Abonnement">
          <SettingRow
            icon={<CreditCard size={18} />}
            label="Gérer l'abonnement"
          />
        </SettingSection>

        <SettingSection title="Support">
          <SettingRow
            icon={<HelpCircle size={18} />}
            label="Centre d'aide"
          />
          <SettingRow
            icon={<Info size={18} />}
            label="À propos"
            value="v1.0.0"
          />
        </SettingSection>

        <SettingSection title="Compte">
          <SettingRow
            icon={<LogOut size={18} />}
            label="Se déconnecter"
            danger
          />
        </SettingSection>

        <p className={`text-center text-xs mt-6 mb-4 ${theme.textSub}`}>
          Connexa © 2024 - Tous droits réservés
        </p>
      </div>
    </div>
  );
};
