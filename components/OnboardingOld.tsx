import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Mail, Lock, Shield, MapPin, Loader2, LogIn, UserPlus, Compass } from 'lucide-react';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import { useNotification } from '@contexts/NotificationContext';
import { useGeolocation } from '@hooks/useGeolocation';
import type { Gender, LookingFor } from '@types';
import { Button } from '@components/ui/Button';
import { useHaptic } from '@hooks/useHaptic';

interface OnboardingProps {
  onComplete: () => void;
}

type Step = 'choice' | 'auth' | 'profile' | 'location';
type Mode = 'login' | 'signup';

const genders: Gender[] = ['homme', 'femme', 'autre'];
const lookingForOptions: LookingFor[] = ['homme', 'femme', 'tous'];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { theme } = useTheme();
  const { trigger } = useHaptic();
  const {
    user,
    profile,
    loading: authLoading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    upsertProfile,
  } = useAuth();
  const { success, error } = useNotification();
  const [step, setStep] = useState<Step>('choice');
  const [mode, setMode] = useState<Mode>('login');
  const [authValues, setAuthValues] = useState({ email: '', password: '' });
  const [profileValues, setProfileValues] = useState({
    name: '',
    age: '',
    photo_url: '',
    bio: '',
    interests: '',
    gender: 'autre' as Gender,
    looking_for: 'tous' as LookingFor,
  });
  const [submitting, setSubmitting] = useState(false);

  const geolocationEnabled = step === 'location' && Boolean(user);
  const { permission, requestPermission, error: geoError } = useGeolocation(geolocationEnabled);

  useEffect(() => {
    if (authLoading) return;
    if (user && profile) {
      setStep('location');
    } else if (user && !profile) {
      setStep('profile');
    }
  }, [authLoading, profile, user]);

  useEffect(() => {
    if (permission === 'granted' && step === 'location') {
      success('Localisation activée');
      onComplete();
    }
  }, [permission, step, success, onComplete]);

  const handleModeSelect = (nextMode: Mode) => {
    setMode(nextMode);
    setStep('auth');
    trigger('soft');
  };

  const handleAuthSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!authValues.email || !authValues.password) {
      error('Email et mot de passe requis');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(authValues.email, authValues.password);
        success('Connexion réussie');
        if (profile) {
          setStep('location');
        } else {
          setStep('profile');
        }
      } else {
        await signUpWithEmail(authValues.email, authValues.password);
        success('Compte créé');
        setStep('profile');
      }
    } catch (err) {
      error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    trigger('medium');
    try {
      await signInWithGoogle();
    } catch (err) {
      error((err as Error).message);
    }
  };

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!profileValues.name || !profileValues.age) {
      error('Nom et âge requis');
      return;
    }
    setSubmitting(true);
    try {
      await upsertProfile({
        name: profileValues.name,
        age: Number(profileValues.age),
        bio: profileValues.bio,
        photo_url: profileValues.photo_url,
        interests: profileValues.interests
          .split(',')
          .map((interest) => interest.trim())
          .filter(Boolean),
        gender: profileValues.gender,
        looking_for: profileValues.looking_for,
      });
      success('Profil enregistré');
      setStep('location');
    } catch (err) {
      error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderChoice = () => (
    <div className="flex flex-col gap-6">
      <h1 className={`text-3xl font-semibold ${theme.textMain}`}>Bienvenue</h1>
      <p className={`text-sm ${theme.textSub}`}>Connectez-vous pour retrouver votre duo et organiser vos rendez-vous.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => handleModeSelect('login')}
          className="p-6 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex flex-col gap-3"
        >
          <LogIn />
          <div>
            <h3 className="text-lg font-semibold text-white">Déjà un compte</h3>
            <p className="text-sm text-gray-400">Connectez-vous pour continuer.</p>
          </div>
        </button>
        <button
          onClick={() => handleModeSelect('signup')}
          className="p-6 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex flex-col gap-3"
        >
          <UserPlus />
          <div>
            <h3 className="text-lg font-semibold text-white">Créer un compte</h3>
            <p className="text-sm text-gray-400">Commencez votre aventure à deux.</p>
          </div>
        </button>
      </div>
    </div>
  );

  const renderAuthForm = () => (
    <form onSubmit={handleAuthSubmit} className="space-y-6">
      <div>
        <label className="text-xs text-gray-400">Email</label>
        <div className="mt-2 flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 border border-white/10">
          <Mail size={16} className="text-gray-400" />
          <input
            type="email"
            value={authValues.email}
            onChange={(e) => setAuthValues((prev) => ({ ...prev, email: e.target.value }))}
            className="flex-1 bg-transparent outline-none text-white"
            placeholder="vous@email.com"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-400">Mot de passe</label>
        <div className="mt-2 flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 border border-white/10">
          <Lock size={16} className="text-gray-400" />
          <input
            type="password"
            value={authValues.password}
            onChange={(e) => setAuthValues((prev) => ({ ...prev, password: e.target.value }))}
            className="flex-1 bg-transparent outline-none text-white"
            placeholder="••••••••"
          />
        </div>
      </div>
      <Button type="submit" disabled={submitting} className="w-full justify-center">
        {submitting ? <Loader2 className="animate-spin" /> : mode === 'login' ? 'Se connecter' : 'Créer le compte'}
      </Button>
      <Button type="button" variant="ghost" onClick={handleGoogleLogin} className="w-full justify-center border border-white/10">
        Continuer avec Google
      </Button>
    </form>
  );

  const renderProfileForm = () => (
    <form onSubmit={handleProfileSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400">Prénom</label>
          <input
            value={profileValues.name}
            onChange={(e) => setProfileValues((prev) => ({ ...prev, name: e.target.value }))}
            className="mt-1 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white"
            placeholder="Alex"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400">Âge</label>
          <input
            type="number"
            min={18}
            value={profileValues.age}
            onChange={(e) => setProfileValues((prev) => ({ ...prev, age: e.target.value }))}
            className="mt-1 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white"
            placeholder="28"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-gray-400">Photo (URL)</label>
        <input
          value={profileValues.photo_url}
          onChange={(e) => setProfileValues((prev) => ({ ...prev, photo_url: e.target.value }))}
          className="mt-1 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="text-xs text-gray-400">Bio</label>
        <textarea
          value={profileValues.bio}
          onChange={(e) => setProfileValues((prev) => ({ ...prev, bio: e.target.value }))}
          className="mt-1 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white"
          rows={3}
          placeholder="Nous cherchons des lieux cosy pour nos rendez-vous..."
        />
      </div>
      <div>
        <label className="text-xs text-gray-400">Intérêts (séparés par des virgules)</label>
        <input
          value={profileValues.interests}
          onChange={(e) => setProfileValues((prev) => ({ ...prev, interests: e.target.value }))}
          className="mt-1 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white"
          placeholder="Gastronomie, Concerts, Cinéma"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400">Genre</label>
          <select
            value={profileValues.gender}
            onChange={(e) => setProfileValues((prev) => ({ ...prev, gender: e.target.value as Gender }))}
            className="mt-1 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white"
          >
            {genders.map((option) => (
              <option key={option} value={option} className="bg-black">
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400">Recherche</label>
          <select
            value={profileValues.looking_for}
            onChange={(e) =>
              setProfileValues((prev) => ({ ...prev, looking_for: e.target.value as LookingFor }))
            }
            className="mt-1 w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white"
          >
            {lookingForOptions.map((option) => (
              <option key={option} value={option} className="bg-black">
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Button type="submit" disabled={submitting} className="w-full justify-center">
        {submitting ? <Loader2 className="animate-spin" /> : 'Enregistrer mon profil'}
      </Button>
    </form>
  );

  const renderLocationStep = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-action-green/10 flex items-center justify-center text-action-green">
          <Compass />
        </div>
        <div>
          <h2 className={`text-2xl font-semibold ${theme.textMain}`}>Activez la géolocalisation</h2>
          <p className={`text-sm ${theme.textSub}`}>
            Nous utilisons votre position pour afficher les couples proches et les lieux adaptés.
          </p>
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 p-4 bg-white/5 flex items-center gap-3">
        <MapPin className="text-action-green" />
        <div>
          <p className="text-white text-sm">Précision 50 km</p>
          <p className="text-xs text-gray-400">Modifiable à tout moment dans les paramètres.</p>
        </div>
      </div>
      <Button
        onClick={() => requestPermission().catch(() => null)}
        className="w-full justify-center"
        disabled={permission === 'granted'}
      >
        {permission === 'granted' ? 'Autorisation accordée' : 'Autoriser la localisation'}
      </Button>
      {geoError && <p className="text-sm text-red-400">{geoError}</p>}
    </div>
  );

  const content = useMemo(() => {
    switch (step) {
      case 'choice':
        return renderChoice();
      case 'auth':
        return renderAuthForm();
      case 'profile':
        return renderProfileForm();
      case 'location':
        return renderLocationStep();
      default:
        return null;
    }
  }, [step, mode, authValues, profileValues, geoError, permission]);

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-b from-black via-black to-[#02050b] px-6">
      <div className="w-full max-w-2xl rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6 text-xs text-gray-400">
          <span>
            {step === 'choice'
              ? 'Étape 1/4'
              : step === 'auth'
              ? 'Étape 2/4'
              : step === 'profile'
              ? 'Étape 3/4'
              : 'Étape 4/4'}
          </span>
          <Shield size={16} />
        </div>
        {content}
      </div>
    </div>
  );
};
