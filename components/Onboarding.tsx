import { FormEvent, useEffect, useState } from 'react';
import { Eye, EyeOff, Loader2, ChevronRight, Heart } from 'lucide-react';
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
  const [rememberMe, setRememberMe] = useState(false);

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
      success('Welcome back');
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
      error('All fields are required');
      return;
    }
    setSubmitting(true);
    try {
      await signUpWithEmail(signupValues.email, signupValues.password);
      setProfileValues(prev => ({
        ...prev,
        name: `${signupValues.firstName} ${signupValues.lastName}`.trim()
      }));
      success('Account created');
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
      error('Name and age required');
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
      success('Profile saved');
      setStep('location');
    } catch (err) {
      error((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  // Custom UI Components to match the design
  const YellowButton = ({ children, onClick, disabled, className = '', type = 'button' }: any) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 rounded-full bg-[#FDC500] text-black font-bold text-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all ${className} disabled:opacity-50 shadow-lg`}
    >
      {children}
    </button>
  );

  const DarkInput = ({ label, ...props }: any) => (
    <div className="space-y-2">
      {label && <label className="text-white/70 text-sm font-medium ml-1">{label}</label>}
      <input
        {...props}
        className={`w-full bg-[#1C1C1E] border-none rounded-xl px-4 py-4 text-white placeholder-white/30 focus:ring-2 focus:ring-[#FDC500] outline-none transition-all ${props.className || ''}`}
      />
    </div>
  );

  if (step === 'welcome') {
    return (
      <div className="h-full w-full relative bg-black overflow-hidden flex flex-col">
        {/* Background Image Section */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black z-10" />
            <img 
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1000" 
              alt="Luxury Car Background" 
              className="w-full h-full object-cover opacity-60"
            />
        </div>

        {/* Content */}
        <div className="relative z-20 flex-1 flex flex-col justify-end p-6 pb-12 bg-gradient-to-t from-black via-black/80 to-transparent">
          <div className="space-y-4 mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Get started with Love3
            </h1>
            <p className="text-gray-300 text-lg max-w-xs font-medium">
              Experience Seamless Connections With Love3 – Your Ultimate Match Companion.
            </p>
          </div>

          <YellowButton onClick={() => setStep('signin')}>
            <span>Continue</span>
            <div className="flex -space-x-1">
               <ChevronRight size={20} />
               <ChevronRight size={20} className="text-black/50" />
               <ChevronRight size={20} className="text-black/20" />
            </div>
          </YellowButton>
        </div>
      </div>
    );
  }

  if (step === 'signin') {
    return (
      <div className="h-full w-full bg-black text-white flex flex-col overflow-auto">
        {/* Header */}
        <div className="pt-12 pb-6 px-6">
            <div className="flex justify-between items-center mb-8">
                 <button onClick={() => setStep('welcome')} className="p-2 -ml-2 text-white/60 hover:text-white flex items-center gap-2 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                    <span className="text-sm font-medium">Back</span>
                 </button>
            </div>
            <h2 className="text-3xl font-bold mb-3">Hop In - Log In to Your Love3 Account</h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                Access your matches, chat history, manage profile, and connect anywhere with ease.
            </p>
        </div>

        {/* Form */}
        <div className="flex-1 px-6 pb-8 space-y-6">
            <form onSubmit={handleSignIn} className="space-y-5">
                <DarkInput 
                    label="Email"
                    type="email"
                    placeholder="name@example.com"
                    value={authValues.email}
                    onChange={(e: any) => setAuthValues(prev => ({ ...prev, email: e.target.value }))}
                />

                <div className="space-y-2">
                    <label className="text-white/70 text-sm font-medium ml-1">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••"
                            value={authValues.password}
                            onChange={(e) => setAuthValues(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full bg-[#1C1C1E] border-none rounded-xl px-4 py-4 pr-12 text-white placeholder-white/30 focus:ring-2 focus:ring-[#FDC500] outline-none transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${rememberMe ? 'bg-[#FDC500] border-[#FDC500]' : 'border-white/30 bg-transparent'}`}>
                             {rememberMe && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </div>
                        <input type="checkbox" className="hidden" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                        <span className="text-white/60 text-sm group-hover:text-white transition-colors">Remember Me</span>
                    </label>
                    <button type="button" className="text-[#FDC500] text-sm font-medium hover:underline hover:text-[#eeb800] transition-colors">
                        Forgot Password?
                    </button>
                </div>
                
                {/* Spacer for 'Or' divider */}
                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-4 bg-black text-white/40 text-xs uppercase tracking-wider font-medium">Or</span>
                    </div>
                </div>
                
                <YellowButton onClick={handleGoogleLogin} className="!bg-[#FDC500] !text-black">
                   <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#000000" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#000000" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#000000" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#000000" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
                   Continue With Google
                </YellowButton>

                <YellowButton onClick={() => error("Apple login not configured")} className="!bg-[#FDC500] !text-black">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2 w-5 h-5">
                    <path d="M17.05 20.28c-.98.95-2.05.87-3.08.47-1.05-.4-2.03-.4-3.05 0-1.03.4-2.1.48-3.08-.47-2.2-2.14-3.67-7.5 1.48-9.58 1.3-.52 2.54.03 3.35.49.81.46 2.03.46 2.84 0 .81-.46 2.05-1.01 3.35-.49.66.27 1.66.97 2.21 1.78-.17.1-.98.62-.98 2.15 0 1.8 1.43 2.42 1.68 2.53-.17.52-.41 1.16-.72 1.62-.66.96-1.36 1.91-2.33 2.06-.97.15-1.67-.56-1.67-.56s-.7.71-1.67.56c-.4-.06-.82-.28-1.25-.62zM12.03 7.25c-.15-1.54 1.08-3.03 2.48-3.25.24 1.68-1.34 3.2-2.48 3.25z" fill="#000000"/>
                  </svg>
                  Continue With Apple
                </YellowButton>
            
            </form>

            <div className="text-center mt-6">
              <p className="text-white/60 text-sm">
                Don't Have An Account!{' '}
                <button 
                  onClick={() => setStep('signup')} 
                  className="text-[#FDC500] font-bold hover:underline ml-1"
                >
                  Register
                </button>
              </p>
            </div>
        </div>
      </div>
    );
  }
  
  if (step === 'signup') {
    return (
      <div className="h-full w-full bg-black text-white flex flex-col overflow-auto px-6 py-12">
        <div className="max-w-md mx-auto w-full">
            <div className="flex justify-between items-center mb-8">
                 <button onClick={() => setStep('signin')} className="p-2 -ml-2 text-white/60 hover:text-white flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                    Back to Login
                 </button>
            </div>

            <h2 className="text-3xl font-bold mb-2">Create Account</h2>
             <p className="text-gray-400 text-sm mb-8">
                Join Love3 and start your journey.
            </p>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
               <DarkInput 
                  label="First Name"
                  value={signupValues.firstName}
                  onChange={(e: any) => setSignupValues(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="First"
                />
                <DarkInput 
                  label="Last Name"
                  value={signupValues.lastName}
                  onChange={(e: any) => setSignupValues(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Last"
                />
            </div>

            <DarkInput 
                label="Email"
                type="email"
                value={signupValues.email}
                onChange={(e: any) => setSignupValues(prev => ({ ...prev, email: e.target.value }))}
                placeholder="name@example.com"
            />

            <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium ml-1">Password</label>
                <div className="relative">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={signupValues.password}
                        onChange={(e) => setSignupValues(prev => ({ ...prev, password: e.target.value }))}
                         placeholder="Create a password"
                        className="w-full bg-[#1C1C1E] border-none rounded-xl px-4 py-4 pr-12 text-white placeholder-white/30 focus:ring-2 focus:ring-[#FDC500] outline-none transition-all"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>

            <YellowButton type="submit" disabled={submitting} className="mt-8">
              {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Create Account'}
            </YellowButton>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'profile') {
    return (
      <div className="h-full w-full bg-black px-6 py-12 overflow-auto">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-bold text-white mb-2">
            Complétez votre profil
          </h2>
          <p className="text-gray-400 mb-8">
            Quelques informations pour personnaliser votre expérience
          </p>

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <DarkInput
              label="Âge"
              type="number"
              min={18}
              value={profileValues.age}
              onChange={(e: any) => setProfileValues(prev => ({ ...prev, age: e.target.value }))}
              placeholder="25"
            />

            <DarkInput
              label="Photo de profil (URL)"
              value={profileValues.photo_url}
              onChange={(e: any) => setProfileValues(prev => ({ ...prev, photo_url: e.target.value }))}
              placeholder="https://..."
            />

            <div className="space-y-2">
              <label className="text-white/70 text-sm font-medium ml-1">Bio</label>
              <textarea
                value={profileValues.bio}
                onChange={(e) => setProfileValues(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Parlez-nous de vous..."
                rows={3}
                className="w-full bg-[#1C1C1E] border-none rounded-xl px-5 py-4 text-white placeholder-white/30 focus:ring-2 focus:ring-[#FDC500] outline-none transition-all resize-none"
              />
            </div>

            <DarkInput
              label="Intérêts (séparés par des virgules)"
              value={profileValues.interests}
              onChange={(e: any) => setProfileValues(prev => ({ ...prev, interests: e.target.value }))}
              placeholder="Voyages, Musique, Sport"
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium ml-1">Genre</label>
                <div className="relative">
                    <select
                    value={profileValues.gender}
                    onChange={(e) => setProfileValues(prev => ({ ...prev, gender: e.target.value as Gender }))}
                    className="w-full bg-[#1C1C1E] border-none rounded-xl px-4 py-4 text-white focus:ring-2 focus:ring-[#FDC500] outline-none appearance-none"
                    >
                    {genders.map(g => (
                        <option key={g} value={g} className="bg-[#1C1C1E]">{g}</option>
                    ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-white/70 text-sm font-medium ml-1">Recherche</label>
                 <div className="relative">
                    <select
                    value={profileValues.looking_for}
                    onChange={(e) => setProfileValues(prev => ({ ...prev, looking_for: e.target.value as LookingFor }))}
                    className="w-full bg-[#1C1C1E] border-none rounded-xl px-4 py-4 text-white focus:ring-2 focus:ring-[#FDC500] outline-none appearance-none"
                    >
                    {lookingForOptions.map(l => (
                        <option key={l} value={l} className="bg-[#1C1C1E]">{l}</option>
                    ))}
                    </select>
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </div>
                </div>
              </div>
            </div>

            <YellowButton type="submit" disabled={submitting} className="mt-6">
              {submitting ? <Loader2 className="animate-spin mx-auto" /> : 'Continuer'}
            </YellowButton>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'location') {
    return (
      <div className="h-full w-full bg-black px-6 py-12 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-[#FDC500]/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Heart size={48} className="text-[#FDC500]" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-4">
            Activez la géolocalisation
          </h2>
          <p className="text-white/60 mb-8 leading-relaxed">
            Pour trouver des personnes près de chez vous et découvrir les meilleurs endroits pour vos rendez-vous
          </p>

          <YellowButton
            onClick={() => requestPermission().catch(() => null)}
            disabled={permission === 'granted'}
          >
            {permission === 'granted' ? '✓ Localisation activée' : 'Autoriser la localisation'}
          </YellowButton>

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