import React from 'react';
import { Settings, Edit2, Pizza, Book, Plane, Palette, Sun, CheckCircle } from 'lucide-react';

export const ProfileDetail: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-background pb-24">
      {/* Header Image */}
      <div className="relative w-full h-96">
        <img 
          src="https://picsum.photos/600/800?random=20" 
          alt="Profile" 
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-background" />
        
        {/* Top Nav */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center pt-8">
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition">
                <Settings className="text-white" size={20} />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition">
                <Edit2 className="text-white" size={18} />
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="-mt-20 relative px-6 z-10">
         <div className="flex items-center gap-2 mb-1">
             <h1 className="text-3xl font-bold text-white">Lay M, 25</h1>
             <CheckCircle className="text-blue-500 fill-current" size={24} />
         </div>
         <p className="text-gray-400 text-sm mb-6">Washington, USA</p>

         <div className="mb-8">
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">About</h3>
            <p className="text-gray-200 text-base leading-relaxed">
                Hi there! 👋 I'm 25, into coffee ☕, travel ✈️, and late-night talks ✨. Always open to new people and good vibes 🌎.
            </p>
         </div>

         <div className="mb-8">
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">Interests</h3>
            <div className="flex flex-wrap gap-3">
                {[
                    { icon: Pizza, label: 'Street Food', color: 'text-orange-500' },
                    { icon: Book, label: 'Books', color: 'text-blue-400' },
                    { icon: Plane, label: 'Travel', color: 'text-blue-300' },
                    { icon: Palette, label: 'Digital Art', color: 'text-purple-400' },
                    { icon: Sun, label: 'Beach Time', color: 'text-yellow-400' }
                ].map((interest, idx) => {
                    const Icon = interest.icon;
                    return (
                        <div key={idx} className="flex items-center gap-2 bg-chip px-4 py-2.5 rounded-full border border-white/5">
                            <Icon size={16} className={interest.color} />
                            <span className="text-gray-200 text-sm">{interest.label}</span>
                        </div>
                    );
                })}
            </div>
         </div>
         
         {/* Gallery Grid */}
         <div className="grid grid-cols-2 gap-3 mb-8">
             <div className="h-48 rounded-2xl bg-surface overflow-hidden">
                <img src="https://picsum.photos/300/400?random=21" className="w-full h-full object-cover" />
             </div>
             <div className="h-48 rounded-2xl bg-surface overflow-hidden">
                <img src="https://picsum.photos/300/400?random=22" className="w-full h-full object-cover" />
             </div>
             <div className="col-span-2 h-48 rounded-2xl bg-surface overflow-hidden">
                <img src="https://picsum.photos/600/400?random=23" className="w-full h-full object-cover" />
             </div>
         </div>
      </div>
    </div>
  );
};