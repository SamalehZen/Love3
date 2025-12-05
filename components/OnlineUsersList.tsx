import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Users, SlidersHorizontal, UserPlus, MessageCircle, X, Send, RefreshCw } from 'lucide-react';
import type { Profile, MapFilters } from '@types';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import { useRequests } from '@contexts/RequestsContext';
import { useNotification } from '@contexts/NotificationContext';
import { supabase } from '@lib/supabase';
import { Button } from './ui/Button';
import { Skeleton } from './ui/Skeleton';

interface OnlineUsersListProps {
  className?: string;
}

interface QuestionAnswer {
  question: string;
  answer: string;
}

const GETTING_TO_KNOW_QUESTIONS = [
  "Qu'est-ce qui vous passionne le plus dans la vie ?",
  "Comment aimez-vous passer votre temps libre ?",
  "Quel est votre endroit préféré pour un rendez-vous ?",
  "Qu'est-ce qui vous fait rire ?",
  "Quelle est votre vision d'une relation idéale ?",
  "Quel est votre style de communication ?",
  "Qu'est-ce qui est important pour vous dans une relation ?"
];

export const OnlineUsersList: React.FC<OnlineUsersListProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { sendRequest, sentRequests } = useRequests();
  const { success, error } = useNotification();
  const [filters, setFilters] = useState<MapFilters>({ minAge: 21, maxAge: 45, gender: 'tous', onlineOnly: true });
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchProfiles = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .gte('age', filters.minAge)
        .lte('age', filters.maxAge);

      if (filters.onlineOnly) {
        query = query.eq('is_online', true);
      }

      if (filters.gender !== 'tous') {
        query = query.eq('gender', filters.gender);
      }

      const { data, error: fetchError } = await query.order('is_online', { ascending: false }).order('last_seen', { ascending: false }).limit(50);

      if (fetchError) throw fetchError;

      const normalizedProfiles = (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        age: row.age,
        bio: row.bio,
        photo_url: row.photo_url,
        interests: row.interests ?? [],
        gender: row.gender,
        looking_for: row.looking_for,
        location: row.location?.coordinates
          ? { lat: row.location.coordinates[1], lng: row.location.coordinates[0] }
          : null,
        is_online: row.is_online,
        last_seen: row.last_seen,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));

      setProfiles(normalizedProfiles);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      console.error('OnlineUsersList fetchProfiles error:', err);
      error(`Impossible de charger les utilisateurs (${message})`);
    } finally {
      setLoading(false);
    }
  }, [error, filters.gender, filters.maxAge, filters.minAge, filters.onlineOnly, user]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  useEffect(() => {
    if (!profiles.length) return;
    const channel = supabase
      .channel('profiles-online-presence')
      .on('postgres_changes', { schema: 'public', table: 'profiles', event: 'UPDATE' }, (payload) => {
        setProfiles((prev) =>
          prev.map((profile) =>
            profile.id === payload.new.id
              ? {
                  ...profile,
                  is_online: payload.new.is_online,
                  last_seen: payload.new.last_seen,
                }
              : profile
          )
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profiles.length]);

  const handleStartConnection = (profile: Profile) => {
    setSelectedProfile(profile);
    setShowQuestions(true);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');
  };

  const handleNextQuestion = () => {
    if (!currentAnswer.trim()) {
      error('Veuillez répondre à la question');
      return;
    }

    const newAnswers = [
      ...answers,
      { question: GETTING_TO_KNOW_QUESTIONS[currentQuestionIndex], answer: currentAnswer.trim() }
    ];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentQuestionIndex < GETTING_TO_KNOW_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSendInvitation(newAnswers);
    }
  };

  const handleSendInvitation = async (finalAnswers: QuestionAnswer[]) => {
    if (!selectedProfile) return;
    
    await sendRequest(selectedProfile.id, finalAnswers);
    success('Invitation envoyée avec vos réponses');
    
    setShowQuestions(false);
    setSelectedProfile(null);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');
  };

  const handleCloseQuestions = () => {
    setShowQuestions(false);
    setSelectedProfile(null);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');
  };

  const alreadySentRequest = useCallback(
    (profileId: string) => {
      return sentRequests.some(req => req.to_user_id === profileId && req.status === 'pending');
    },
    [sentRequests]
  );

  const getTimeSinceOnline = (lastSeen: string | null | undefined) => {
    if (!lastSeen) return 'Jamais vu';
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  };

  const onlineProfiles = useMemo(() => profiles.filter(p => p.is_online), [profiles]);
  const offlineProfiles = useMemo(() => profiles.filter(p => !p.is_online), [profiles]);

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <div className={`p-4 border-b ${isDarkMode ? 'border-white/5 bg-[#0F0F11]' : 'border-gray-200 bg-white'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-[#32D583]/10' : 'bg-[#32D583]/20'}`}>
              <Users size={24} className="text-[#32D583]" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Personnes connectées
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {onlineProfiles.length} en ligne • {offlineProfiles.length} hors ligne
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchProfiles}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Âge min: {filters.minAge}</label>
                <input
                  type="range"
                  min={18}
                  max={filters.maxAge}
                  value={filters.minAge}
                  onChange={(e) => setFilters((prev) => ({ ...prev, minAge: Number(e.target.value) }))}
                  className="w-full mt-1"
                />
              </div>
              <div>
                <label className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Âge max: {filters.maxAge}</label>
                <input
                  type="range"
                  min={filters.minAge}
                  max={80}
                  value={filters.maxAge}
                  onChange={(e) => setFilters((prev) => ({ ...prev, maxAge: Number(e.target.value) }))}
                  className="w-full mt-1"
                />
              </div>
              <div>
                <label className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Genre</label>
                <select
                  className={`w-full mt-1 rounded-lg px-3 py-2 text-sm ${
                    isDarkMode ? 'bg-white/10 text-white border-white/10' : 'bg-white text-gray-900 border-gray-200'
                  } border`}
                  value={filters.gender}
                  onChange={(e) => setFilters((prev) => ({ ...prev, gender: e.target.value as MapFilters['gender'] }))}
                >
                  <option value="tous">Tous</option>
                  <option value="homme">Hommes</option>
                  <option value="femme">Femmes</option>
                </select>
              </div>
              <div>
                <label className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Statut</label>
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={filters.onlineOnly}
                    onChange={(e) => setFilters((prev) => ({ ...prev, onlineOnly: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>En ligne seulement</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            {onlineProfiles.length > 0 && (
              <div className="mb-6">
                <h2 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  EN LIGNE MAINTENANT
                </h2>
                <div className="space-y-3">
                  {onlineProfiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      isDarkMode={isDarkMode}
                      onConnect={handleStartConnection}
                      alreadySent={alreadySentRequest(profile.id)}
                      getTimeSinceOnline={getTimeSinceOnline}
                    />
                  ))}
                </div>
              </div>
            )}

            {offlineProfiles.length > 0 && (
              <div>
                <h2 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  RÉCEMMENT ACTIFS
                </h2>
                <div className="space-y-3">
                  {offlineProfiles.map((profile) => (
                    <ProfileCard
                      key={profile.id}
                      profile={profile}
                      isDarkMode={isDarkMode}
                      onConnect={handleStartConnection}
                      alreadySent={alreadySentRequest(profile.id)}
                      getTimeSinceOnline={getTimeSinceOnline}
                    />
                  ))}
                </div>
              </div>
            )}

            {profiles.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Users size={48} className={isDarkMode ? 'text-gray-600' : 'text-gray-400'} />
                <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Aucun utilisateur trouvé
                </p>
                <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Essayez de modifier vos filtres
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {showQuestions && selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-3xl p-6 ${isDarkMode ? 'bg-[#1C1C1E]' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Mieux se comprendre
              </h2>
              <button
                onClick={handleCloseQuestions}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                <X size={18} />
              </button>
            </div>

            <div className={`p-4 rounded-2xl mb-6 flex items-center gap-4 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
              <img
                src={selectedProfile.photo_url ?? 'https://placehold.co/200x200?text=Profil'}
                alt={selectedProfile.name}
                className="w-16 h-16 rounded-2xl object-cover"
              />
              <div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedProfile.name}, {selectedProfile.age}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Répondez à quelques questions pour vous présenter
                </p>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-xs mb-2">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Question {currentQuestionIndex + 1} / {GETTING_TO_KNOW_QUESTIONS.length}
                </span>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  {Math.round(((currentQuestionIndex) / GETTING_TO_KNOW_QUESTIONS.length) * 100)}%
                </span>
              </div>
              <div className={`h-1 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'}`}>
                <div
                  className="h-full rounded-full bg-[#32D583] transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex) / GETTING_TO_KNOW_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="mb-6">
              <p className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {GETTING_TO_KNOW_QUESTIONS[currentQuestionIndex]}
              </p>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Votre réponse..."
                rows={4}
                className={`w-full rounded-xl px-4 py-3 text-sm resize-none ${
                  isDarkMode
                    ? 'bg-white/5 text-white placeholder-gray-500 border-white/10'
                    : 'bg-gray-50 text-gray-900 placeholder-gray-400 border-gray-200'
                } border focus:outline-none focus:ring-2 focus:ring-[#32D583]/50`}
                autoFocus
              />
            </div>

            {answers.length > 0 && (
              <div className="mb-4 max-h-32 overflow-y-auto">
                <p className={`text-xs font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  VOS RÉPONSES PRÉCÉDENTES
                </p>
                <div className="space-y-2">
                  {answers.map((qa, idx) => (
                    <div key={idx} className={`p-2 rounded-lg text-xs ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                      <p className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{qa.question}</p>
                      <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{qa.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={handleCloseQuestions} className="flex-1">
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleNextQuestion}
                className="flex-1"
                leftIcon={currentQuestionIndex === GETTING_TO_KNOW_QUESTIONS.length - 1 ? <Send size={16} /> : undefined}
              >
                {currentQuestionIndex === GETTING_TO_KNOW_QUESTIONS.length - 1 ? 'Envoyer invitation' : 'Suivant'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ProfileCardProps {
  profile: Profile;
  isDarkMode: boolean;
  onConnect: (profile: Profile) => void;
  alreadySent: boolean;
  getTimeSinceOnline: (lastSeen: string | null | undefined) => string;
}

const ProfileCard = memo<ProfileCardProps>(({ profile, isDarkMode, onConnect, alreadySent, getTimeSinceOnline }) => {
  return (
    <div
      className={`rounded-2xl p-4 transition-all hover:scale-[1.02] ${
        isDarkMode ? 'bg-[#1C1C1E] border border-white/5' : 'bg-white border border-gray-200'
      } ${profile.is_online ? 'shadow-[0_0_20px_rgba(50,213,131,0.1)]' : ''}`}
    >
      <div className="flex gap-4">
        <div className="relative">
          <img
            src={profile.photo_url ?? 'https://placehold.co/200x200?text=Profil'}
            alt={profile.name}
            className="w-20 h-20 rounded-2xl object-cover"
          />
          {profile.is_online && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#32D583] rounded-full border-2 border-[#1C1C1E]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile.name}, {profile.age}
              </h3>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {profile.is_online ? 'En ligne' : getTimeSinceOnline(profile.last_seen)}
              </p>
            </div>
          </div>

          {profile.bio && (
            <p className={`text-sm mt-2 line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {profile.bio}
            </p>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {profile.interests.slice(0, 3).map((interest, idx) => (
                <span
                  key={idx}
                  className={`text-xs px-2 py-1 rounded-full ${
                    isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {interest}
                </span>
              ))}
              {profile.interests.length > 3 && (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    isDarkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  +{profile.interests.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex gap-2 mt-3">
            {alreadySent ? (
              <button
                disabled
                className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium ${
                  isDarkMode ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-400'
                } cursor-not-allowed`}
              >
                Invitation envoyée
              </button>
            ) : (
              <button
                onClick={() => onConnect(profile)}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-medium bg-[#32D583] text-black hover:bg-[#2bc474] transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus size={16} />
                Se connecter
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ProfileCard.displayName = 'ProfileCard';
