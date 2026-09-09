import React from 'react';
import { Sparkles, Camera, User, HelpCircle, Play, ArrowRight } from 'lucide-react';

const Screen1Welcome = ({ onNext }) => {
  const steps = [
    { num: 1, label: 'Select Frame', icon: <Sparkles size={22} /> },
    { num: 2, label: 'Take Photo', icon: <Camera size={22} /> },
    { num: 3, label: 'Enter Details', icon: <User size={22} /> },
    { num: 4, label: 'Quiz + Timer', icon: <HelpCircle size={22} /> },
    { num: 5, label: 'Video Ready', icon: <Play size={22} /> },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#13072E] text-white select-none relative overflow-hidden">

      {/* Top gradient bar */}
      <div className="w-full h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 flex-shrink-0" />

      {/* Title — right at the very top, tight padding */}
      <div className="w-full flex flex-col items-center text-center px-8 pt-8 pb-2 flex-shrink-0">
        <span className="text-sm uppercase tracking-[0.3em] font-black text-purple-400 mb-1">
          ✨ AI HoloBooth ✨
        </span>
        <h1 className="text-5xl font-black tracking-tight leading-none">
          AI{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            HoloBooth
          </span>
        </h1>
        <p className="text-base font-semibold tracking-widest text-purple-300 mt-2 uppercase">
          Photo · AI · Video Experience
        </p>
        <span className="text-xs text-slate-400 bg-slate-800/80 px-4 py-1.5 rounded-full mt-3 border border-slate-700 font-medium">
          📐 1080 × 1920 · 9:16 Portrait
        </span>
      </div>

      {/* Decorative glowing orb */}
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-purple-700/15 blur-3xl pointer-events-none" />

      {/* Steps List — fills the middle */}
      <div className="flex-1 flex flex-col justify-center px-8 gap-5 z-10">
        {steps.map((step, i) => (
          <div
            key={step.num}
            className="flex items-center gap-5 bg-white/5 backdrop-blur-md rounded-2xl px-6 py-5 border border-white/10 hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white text-xl font-black shadow-lg shadow-purple-500/20 flex-shrink-0">
              {step.num}
            </div>
            <span className="text-xl font-bold text-white">{step.label}</span>
            <div className="ml-auto text-purple-400 opacity-60">
              {step.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Start Button at bottom */}
      <div className="px-8 pb-10 pt-4 flex-shrink-0 z-10">
        <button
          onClick={onNext}
          className="w-full py-6 rounded-full bg-gradient-to-r from-[#9333EA] to-[#6366F1] text-white font-extrabold text-2xl tracking-wider uppercase transition-all duration-300 shadow-xl shadow-purple-900/50 hover:shadow-purple-600/40 hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-3"
        >
          Start Experience
          <ArrowRight size={24} strokeWidth={3} />
        </button>
        <p className="text-center text-sm text-slate-500 mt-4 font-semibold uppercase tracking-widest">
          AI-Powered · Portrait Mode
        </p>
      </div>
    </div>
  );
};

export default Screen1Welcome;
