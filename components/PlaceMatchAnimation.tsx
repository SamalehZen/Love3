import { useEffect, useState } from 'react';
import { MapPin, ExternalLink, MessageCircle } from 'lucide-react';
import { Button } from '@components/ui/Button';

interface PlaceMatchAnimationProps {
  placeName: string;
  placePhoto?: string | null;
  placeAddress?: string | null;
  onOpenMaps: () => void;
  onContinue: () => void;
}

export const PlaceMatchAnimation: React.FC<PlaceMatchAnimationProps> = ({
  placeName,
  placePhoto,
  placeAddress,
  onOpenMaps,
  onContinue,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[1200] flex items-center justify-center transition duration-500 ${
        visible ? 'bg-black/80 backdrop-blur-lg' : 'bg-transparent'
      }`}
    >
      <div className={`w-full max-w-md mx-6 rounded-[32px] border border-white/10 bg-[#0B0F1A] p-8 text-center transform transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}>
        <div className="relative mb-6">
          <div className="absolute inset-0 blur-3xl bg-action-purple/30" />
          <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-4 border-white/10 mx-auto shadow-2xl">
            {placePhoto ? (
              <img src={placePhoto} alt={placeName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-action-purple to-blue-500 flex items-center justify-center">
                <MapPin size={36} className="text-white" />
              </div>
            )}
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Vous vous retrouvez à</h2>
        <p className="text-action-green text-xl font-semibold mb-2">{placeName}</p>
        {placeAddress && <p className="text-sm text-gray-400 mb-6">{placeAddress}</p>}
        <div className="flex flex-col gap-3">
          <Button variant="primary" size="lg" onClick={onOpenMaps} leftIcon={<ExternalLink size={18} />}>
            Voir sur Google Maps
          </Button>
          <Button variant="secondary" size="lg" onClick={onContinue} leftIcon={<MessageCircle size={18} />}>
            Continuer la conversation
          </Button>
        </div>
      </div>
    </div>
  );
};
