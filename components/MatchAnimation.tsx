import React, { useEffect, useState, useMemo } from 'react';
import { Heart, MessageCircle, X } from 'lucide-react';
import { Profile } from '../types';
import { Button } from './ui/Button';

interface MatchAnimationProps {
  profiles: [Profile, Profile];
  onClose: () => void;
  onMessage?: () => void;
}

const CONFETTI_COLORS = ['#FF6B3C', '#32D583', '#7B4CF6', '#FFD700', '#EF4444', '#3B82F6'];

export const MatchAnimation: React.FC<MatchAnimationProps> = ({ 
  profiles, 
  onClose,
  onMessage 
}) => {
  const [show, setShow] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setShow(true));
    const contentTimer = setTimeout(() => setShowContent(true), 400);
    return () => clearTimeout(contentTimer);
  }, []);

  const confettiParticles = useMemo(() => 
    Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: `${Math.random() * 0.8}s`,
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
    })),
  []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  const handleMessage = () => {
    setShow(false);
    setTimeout(() => {
      onMessage?.();
      onClose();
    }, 300);
  };

  return (
    <div 
      className={`fixed inset-0 z-[1000] flex items-center justify-center transition-all duration-300 ${
        show ? 'bg-black/90 backdrop-blur-xl' : 'bg-black/0 backdrop-blur-none'
      }`}
      onClick={handleClose}
    >
      <button 
        onClick={handleClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50"
      >
        <X size={20} />
      </button>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {show && confettiParticles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-sm animate-confetti"
            style={{
              left: particle.left,
              top: '-20px',
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              animationDelay: particle.delay,
              transform: `rotate(${particle.rotation}deg)`,
            }}
          />
        ))}
      </div>

      <div 
        className="flex flex-col items-center"
        onClick={e => e.stopPropagation()}
      >
        <div className={`relative flex items-center mb-8 transition-all duration-500 ${
          showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}>
          <div className="relative z-10 -mr-6 animate-slide-in-left">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white shadow-2xl">
              <img 
                src={profiles[0].imageUrl} 
                alt={profiles[0].name}
                className="w-full h-full object-cover" 
              />
            </div>
          </div>

          <div className="relative z-20 animate-slide-in-right">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-white shadow-2xl">
              <img 
                src={profiles[1].imageUrl} 
                alt={profiles[1].name}
                className="w-full h-full object-cover" 
              />
            </div>
          </div>

          <div className="absolute left-1/2 top-1/2 z-30 animate-heart-pop">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-action-red to-pink-600 flex items-center justify-center shadow-lg shadow-action-red/50">
              <Heart size={28} className="text-white fill-current" />
            </div>
          </div>
        </div>

        <div className={`text-center transition-all duration-500 delay-200 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            C'est un Match! 💕
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-8">
            Vous et <span className="text-white font-semibold">{profiles[1].name}</span> vous êtes likés mutuellement
          </p>

          <div className="flex flex-col sm:flex-row gap-3 px-6">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<MessageCircle size={20} />}
              onClick={handleMessage}
              className="min-w-[200px]"
            >
              Envoyer un message
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleClose}
              className="min-w-[200px]"
            >
              Continuer à swiper
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
