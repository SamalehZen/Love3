import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, X } from 'lucide-react';
import { Profile } from '../types';

interface MatchAnimationProps {
  profiles: [Profile, Profile];
  onClose: () => void;
  onMessage?: () => void;
}

const CONFETTI_COLORS = ['#FF6B3C', '#32D583', '#7B4CF6', '#FFD700', '#FF3A1F', '#3B82F6'];

export const MatchAnimation: React.FC<MatchAnimationProps> = ({ profiles, onClose, onMessage }) => {
  const [show, setShow] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; color: string; delay: number; size: number }>>([]);

  useEffect(() => {
    setShow(true);
    
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 0.5,
      size: Math.random() * 8 + 4,
    }));
    setConfetti(particles);

    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

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
      className={`fixed inset-0 z-[1000] flex items-center justify-center transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={handleClose} />
      
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 z-50 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
      >
        <X size={20} />
      </button>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((particle) => (
          <div
            key={particle.id}
            className="absolute animate-confetti"
            style={{
              left: `${particle.left}%`,
              top: '-20px',
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              borderRadius: particle.id % 2 === 0 ? '50%' : '2px',
              animationDelay: `${particle.delay}s`,
              animationDuration: `${2 + Math.random()}s`,
            }}
          />
        ))}
      </div>

      <div className={`relative z-10 flex flex-col items-center transition-all duration-500 ${show ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
        <div className="relative flex items-center mb-8">
          <div 
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl -mr-6 z-10 animate-in slide-in-from-left duration-500"
            style={{ animationDelay: '0.1s' }}
          >
            <img 
              src={profiles[0].imageUrl} 
              alt={profiles[0].name}
              className="w-full h-full object-cover" 
            />
          </div>
          
          <div 
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl animate-in slide-in-from-right duration-500"
            style={{ animationDelay: '0.2s' }}
          >
            <img 
              src={profiles[1].imageUrl} 
              alt={profiles[1].name}
              className="w-full h-full object-cover" 
            />
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative animate-heart-pop" style={{ animationDelay: '0.4s' }}>
              <div className="absolute inset-0 bg-action-red rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-action-red rounded-full flex items-center justify-center shadow-lg shadow-action-red/50">
                <Heart size={28} className="text-white fill-current" />
              </div>
            </div>
          </div>
        </div>

        <div 
          className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '0.5s' }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            C'est un Match! 💕
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-8">
            Vous et <span className="text-white font-medium">{profiles[1].name}</span> vous êtes likés mutuellement
          </p>
        </div>

        <div 
          className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '0.7s' }}
        >
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-white/10 border border-white/20 rounded-full text-white font-semibold hover:bg-white/20 transition-colors"
          >
            Continuer à swiper
          </button>
          <button
            onClick={handleMessage}
            className="px-6 py-3 bg-gradient-to-r from-action-purple to-blue-600 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2"
          >
            <MessageCircle size={18} />
            Envoyer un message
          </button>
        </div>
      </div>
    </div>
  );
};
