import React from 'react';
import { Check, Lock, ArrowRight, Sparkles } from 'lucide-react';

const Screen2Frame = ({ selectedFrame, onSelectFrame, onNext }) => {
  const frames = [
    {
      id: 'frame_1',
      name: 'Spider-Verse',
      desc: 'Enter a world of heroes & action',
      bgImage: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'frame_2',
      name: 'Space Odyssey',
      desc: 'Take your photo beyond the stars',
      bgImage: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'frame_3',
      name: 'Retro Future',
      desc: 'A nostalgic trip into tomorrow',
      bgImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'frame_4',
      name: 'Sunset Escape',
      desc: 'Step into a cinematic sunset',
      bgImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    },
  ];

  const selectedFrameData = frames.find(f => f.id === selectedFrame);

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 text-slate-800 select-none overflow-hidden">
      <div className="flex flex-col h-full w-full px-6">

        {/* ── Top Nav Bar ── */}
        <div className="flex items-center justify-between w-full pt-8 pb-4 flex-shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">AI Holobooth</span>
          </div>
          {/* Step indicator with dots */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Step 1 of 5</span>
            <div className="flex items-center gap-1">
              <div className="w-5 h-1.5 rounded-full bg-purple-600" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            </div>
          </div>
        </div>

        {/* ── Hero Section ── */}
        <div className="flex flex-col items-center text-center mt-6 mb-4 flex-shrink-0">
          <span className="text-xs uppercase tracking-[0.3em] font-black text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full border border-purple-100 mb-4">
            ✦ AI Experience ✦
          </span>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
            Choose your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-violet-600">world.</span>
          </h1>
          <p className="text-base text-slate-500 mt-3 font-medium max-w-md leading-relaxed">
            Pick a style and we'll transform your photo into an unforgettable AI experience.
          </p>
        </div>

        {/* ── Section header ── */}
        <div className="flex items-center justify-between w-full mt-2 mb-3 flex-shrink-0">
          <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-500">Explore Experiences</span>
          <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
            {selectedFrame ? '1 of 4 Selected' : '0 of 4 Selected'}
          </span>
        </div>

        {/* ── Frame Cards 2x2 Grid ── */}
        <div className="grid grid-cols-2 gap-4 w-full flex-shrink-0">
          {frames.map((frame, index) => {
            const isSelected = selectedFrame === frame.id;
            return (
              <div
                key={frame.id}
                onClick={() => onSelectFrame(frame.id)}
                className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 aspect-square ${
                  isSelected
                    ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-50 scale-[1.02] shadow-xl shadow-purple-500/20'
                    : 'hover:scale-[1.01] shadow-lg'
                }`}
              >
                {/* Background image */}
                <img src={frame.bgImage} alt={frame.name} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                {/* Selected badge */}
                {isSelected && (
                  <div className="absolute top-3 left-3 z-20">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-purple-600 text-white px-3 py-1 rounded-md shadow-md">
                      Selected
                    </span>
                  </div>
                )}

                {/* Check circle */}
                <div className="absolute top-3 right-3 z-20">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                      : 'bg-slate-800/60 border border-white/20 backdrop-blur-sm'
                  }`}>
                    {isSelected && <Check size={16} strokeWidth={3} />}
                  </div>
                </div>

                {/* Bottom text overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                    Experience {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5 leading-tight">{frame.name}</h3>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">{frame.desc}</p>
                </div>

                {/* Subtle top-left frame image icon */}
                {!isSelected && (
                  <div className="absolute top-3 left-3 z-20 w-7 h-7 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                    <img src={frame.bgImage} alt="" className="w-4 h-4 rounded object-cover" draggable={false} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Bottom Section ── */}
        <div className="flex flex-col items-center pt-4 pb-6 flex-shrink-0">
          {/* Selected experience label */}
          {selectedFrameData && (
            <p className="text-sm text-slate-600 font-semibold mb-3 flex items-center gap-2">
              <Sparkles size={14} className="text-purple-600" />
              Your experience: <span className="font-black text-slate-900">{selectedFrameData.name}</span>
            </p>
          )}

          {/* Continue button */}
          <button
            onClick={onNext}
            disabled={!selectedFrame}
            className={`w-full py-5 rounded-xl font-extrabold text-lg uppercase tracking-wider transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 ${
              selectedFrame
                ? 'bg-gradient-to-r from-[#9333EA] to-[#7C3AED] text-white shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            Continue
            {selectedFrame && <ArrowRight size={18} strokeWidth={3} />}
          </button>

          {/* Privacy note */}
          <p className="text-center text-[11px] text-slate-400 mt-3 flex items-center justify-center gap-1 font-medium">
            <Lock size={10} className="text-slate-400" />
            Your selected experience will be applied to your AI photo.
          </p>
        </div>

      </div>
    </div>
  );
};

export default Screen2Frame;
