import { FormEvent, useEffect, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, Heart, Sparkles, Users } from 'lucide-react';
import { useTheme } from '@contexts/ThemeContext';
import { useAuth } from '@contexts/AuthContext';
import { useNotification } from '@contexts/NotificationContext';
import { useGeolocation } from '@hooks/useGeolocation';
import type { Gender, LookingFor } from '@types';
import { Logo } from '@components/Logo';
import { useHaptic } from '@hooks/useHaptic';

interface OnboardingProps {
  onComplete: () => void;
}

type Step = 'welcome' | 'signin' | 'signup' | 'profile' | 'location';

const genders: Gender[] = ['homme', 'femme', 'autre'];
const lookingForOptions: LookingFor[] = ['homme', 'femme', 'tous'];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
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
  const [step, setStep] = useState<Step>('welcome');
  const [showPassword, setShowPassword] = useState(false);
  const [authValues, setAuthValues] = useState({ email: '', password: '' });
  const [signupValues, setSignupValues] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: '' 
  });
  const [profileValues, setProfileValues] = useState({
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

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();
    if (!authValues.email || !authValues.password) {
      error('Email et mot de passe requis');
      return;
    }
    setSubmitting(true);
    try {
      await signInWithEmail(authValues.email, authValues.password);
      success('Connexion réussie');
      if (profile) {
        setStep('location');
      } else {
        setStep('profile');
      }
    } catch (err) {
      error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (event: FormEvent) => {
    event.preventDefault();
    if (!signupValues.firstName || !signupValues.email || !signupValues.password) {
      error('Prénom, email et mot de passe requis');
      return;
    }
    setSubmitting(true);
    try {
      await signUpWithEmail(signupValues.email, signupValues.password);
      setProfileValues(prev => ({
        ...prev,
        name: `${signupValues.firstName} ${signupValues.lastName}`.trim()
      }));
      success('Compte créé');
      setStep('profile');
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
    const fullName = signupValues.firstName 
      ? `${signupValues.firstName} ${signupValues.lastName}`.trim()
      : profileValues.age;
    
    if (!fullName || !profileValues.age) {
      error('Nom et âge requis');
      return;
    }
    setSubmitting(true);
    try {
      await upsertProfile({
        name: fullName,
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

  if (step === 'welcome') {
    return (
      <div className="h-full w-full relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#C17B4A] via-[#8B5A3C] to-[#1a1410]"
          style={{
            backgroundImage: `
              linear-gradient(135deg, rgba(193, 123, 74, 0.8) 0%, rgba(139, 90, 60, 0.9) 50%, rgba(26, 20, 16, 1) 100%),
              repeating-linear-gradient(45deg, transparent, transparent 100px, rgba(0,0,0,0.1) 100px, rgba(0,0,0,0.1) 200px),
              repeating-linear-gradient(-45deg, transparent, transparent 100px, rgba(0,0,0,0.05) 100px, rgba(0,0,0,0.05) 200px)
            `
          }}
        />
        
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#FF6B35]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-[#FFD23F]/15 rounded-full blur-[80px]" />

        <div className="relative h-full flex flex-col items-center justify-between p-8 pt-16 pb-12">
          <Logo variant="icon-white" size="lg" className="text-white drop-shadow-2xl" />

          <div className="text-center space-y-6 px-4">
            <h1 className="text-5xl font-bold text-white leading-tight drop-shadow-lg">
              Overlay
            </h1>
            <p className="text-xl text-white/90 leading-relaxed max-w-sm mx-auto drop-shadow-md">
              Trouvez l'amour et partagez des moments inoubliables
            </p>
            
            <div className="flex items-center justify-center gap-8 pt-4">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-2">
                  <Heart size={28} className="text-white" fill="white" />
                </div>
                <span className="text-xs text-white/80">Connexions</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-2">
                  <Users size={28} className="text-white" />
                </div>
                <span className="text-xs text-white/80">Communauté</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-2">
                  <Sparkles size={28} className="text-white" />
                </div>
                <span className="text-xs text-white/80">Expériences</span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm space-y-4">
            <button
              onClick={() => {
                trigger('soft');
                setStep('signup');
              }}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#FF8C42] via-[#FFD23F] to-[#FFEA85] text-black font-bold text-lg shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Créer un compte
            </button>
            <button
              onClick={() => {
                trigger('soft');
                setStep('signin');
              }}
              className="w-full py-4 rounded-full bg-transparent border-2 border-white/30 text-white font-semibold text-base hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              J'ai déjà un compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'signin') {
    return (
      <div className="h-full w-full bg-gradient-to-b from-[#2d1f1a] via-[#1a1410] to-black px-6 py-12 overflow-auto">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => setStep('welcome')}
            className="text-white/60 text-sm mb-8 hover:text-white transition-colors underline"
          >
            ← Retour
          </button>

          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF8C42]/30 to-[#FFD23F]/30 rounded-3xl blur-2xl" />
              <div className="relative w-32 h-32 bg-gradient-to-br from-[#4a3428] to-[#2d1f1a] rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
                <Logo variant="icon-white" size="lg" className="text-white" />
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white text-center mb-2">
            Se connecter à Overlay
          </h2>
          <p className="text-white/60 text-center mb-8">
            Retrouvez votre compte
          </p>

          <form onSubmit={handleSignIn} className="space-y-5">
            <div>
              <label className="text-white/80 text-sm block mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={authValues.email}
                  onChange={(e) => setAuthValues(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Entrez votre email"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#FF8C42]/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-white/80 text-sm block mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={authValues.password}
                  onChange={(e) => setAuthValues(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Entrez votre mot de passe"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-[#FF8C42]/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button type="button" className="text-white/60 text-sm hover:text-white transition-colors">
                Mot de passe oublié ?
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#FF8C42] via-[#FFD23F] to-[#FFEA85] text-black font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Se connecter'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#1a1410] text-white/40">Ou continuer avec</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3.5 rounded-full bg-black/60 border border-white/10 text-white font-medium flex items-center justify-center gap-3 hover:bg-black/80 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'signup') {
    return (
      <div className="h-full w-full bg-gradient-to-b from-[#2d1f1a] via-[#1a1410] to-black px-6 py-12 overflow-auto">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => setStep('welcome')}
            className="text-white/60 text-sm mb-8 hover:text-white transition-colors underline"
          >
            ← Retour
          </button>

          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF8C42]/30 to-[#FFD23F]/30 rounded-3xl blur-2xl" />
              <div className="relative w-32 h-32 bg-gradient-to-br from-[#4a3428] to-[#2d1f1a] rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl transform rotate-12 hover:rotate-0 transition-transform duration-500">
                <Logo variant="icon-white" size="lg" className="text-white" />
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white text-center mb-2">
            Rejoindre Overlay
          </h2>
          <p className="text-white/60 text-center mb-8">
            Créez votre compte gratuitement
          </p>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/80 text-sm block mb-2">Prénom</label>
                <input
                  value={signupValues.firstName}
                  onChange={(e) => setSignupValues(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Prénom"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#FF8C42]/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-white/80 text-sm block mb-2">Nom</label>
                <input
                  value={signupValues.lastName}
                  onChange={(e) => setSignupValues(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Nom"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#FF8C42]/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-white/80 text-sm block mb-2">Email</label>
              <input
                type="email"
                value={signupValues.email}
                onChange={(e) => setSignupValues(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Entrez votre email"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#FF8C42]/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-white/80 text-sm block mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={signupValues.password}
                  onChange={(e) => setSignupValues(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Créez un mot de passe"
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 pr-12 text-white placeholder-white/30 focus:outline-none focus:border-[#FF8C42]/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#FF8C42] via-[#FFD23F] to-[#FFEA85] text-black font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Continuer'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#1a1410] text-white/40">Ou continuer avec</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-3.5 rounded-full bg-black/60 border border-white/10 text-white font-medium flex items-center justify-center gap-3 hover:bg-black/80 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'profile') {
    return (
      <div className="h-full w-full bg-gradient-to-b from-[#2d1f1a] via-[#1a1410] to-black px-6 py-12 overflow-auto">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-bold text-white mb-2">
            Complétez votre profil
          </h2>
          <p className="text-white/60 mb-8">
            Quelques informations pour personnaliser votre expérience
          </p>

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div>
              <label className="text-white/80 text-sm block mb-2">Âge</label>
              <input
                type="number"
                min={18}
                value={profileValues.age}
                onChange={(e) => setProfileValues(prev => ({ ...prev, age: e.target.value }))}
                placeholder="25"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#FF8C42]/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-white/80 text-sm block mb-2">Photo de profil (URL)</label>
              <input
                value={profileValues.photo_url}
                onChange={(e) => setProfileValues(prev => ({ ...prev, photo_url: e.target.value }))}
                placeholder="https://..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#FF8C42]/50 transition-colors"
              />
            </div>

            <div>
              <label className="text-white/80 text-sm block mb-2">Bio</label>
              <textarea
                value={profileValues.bio}
                onChange={(e) => setProfileValues(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Parlez-nous de vous..."
                rows={3}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#FF8C42]/50 transition-colors resize-none"
              />
            </div>

            <div>
              <label className="text-white/80 text-sm block mb-2">Intérêts (séparés par des virgules)</label>
              <input
                value={profileValues.interests}
                onChange={(e) => setProfileValues(prev => ({ ...prev, interests: e.target.value }))}
                placeholder="Voyages, Musique, Sport"
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[#FF8C42]/50 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/80 text-sm block mb-2">Genre</label>
                <select
                  value={profileValues.gender}
                  onChange={(e) => setProfileValues(prev => ({ ...prev, gender: e.target.value as Gender }))}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-[#FF8C42]/50 transition-colors"
                >
                  {genders.map(g => (
                    <option key={g} value={g} className="bg-black">{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-white/80 text-sm block mb-2">Recherche</label>
                <select
                  value={profileValues.looking_for}
                  onChange={(e) => setProfileValues(prev => ({ ...prev, looking_for: e.target.value as LookingFor }))}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-[#FF8C42]/50 transition-colors"
                >
                  {lookingForOptions.map(l => (
                    <option key={l} value={l} className="bg-black">{l}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#FF8C42] via-[#FFD23F] to-[#FFEA85] text-black font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 mt-6"
            >
              {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Continuer'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'location') {
    return (
      <div className="h-full w-full bg-gradient-to-b from-[#2d1f1a] via-[#1a1410] to-black px-6 py-12 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[#FF8C42]/20 to-[#FFD23F]/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Heart size={48} className="text-[#FF8C42]" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Activez la géolocalisation
          </h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Pour trouver des personnes près de chez vous et découvrir les meilleurs endroits pour vos rendez-vous
          </p>

          <button
            onClick={() => requestPermission().catch(() => null)}
            disabled={permission === 'granted'}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#FF8C42] via-[#FFD23F] to-[#FFEA85] text-black font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {permission === 'granted' ? '✓ Localisation activée' : 'Autoriser la localisation'}
          </button>

          {geoError && (
            <p className="text-red-400 text-sm mt-4">{geoError}</p>
          )}

          <p className="text-white/40 text-xs mt-6">
            Vous pouvez modifier cette autorisation à tout moment dans vos paramètres
          </p>
        </div>
      </div>
    );
  }

  return null;
};
