import React, { useState, useEffect } from 'react';
import { Film, Sparkles } from 'lucide-react';
import { pollStatus } from '../utils/api';

const Screen5Quiz = ({ registeredId, onVideoComplete, onNext }) => {
  const [secondsLeft, setSecondsLeft] = useState(165);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizIndex, setQuizIndex] = useState(0);

  const quizzes = [
    { question: 'Which travel experience excites you the most?',
      options: [{ key: 'A', text: 'Adventure in Mountains' }, { key: 'B', text: 'Relaxing at the Beach' }, { key: 'C', text: 'Exploring Forests' }, { key: 'D', text: 'City Sightseeing' }] },
    { question: 'What is your favorite type of photography?',
      options: [{ key: 'A', text: 'Stunning Landscapes' }, { key: 'B', text: 'Candid Portraits' }, { key: 'C', text: 'Macro / Close-ups' }, { key: 'D', text: 'Vintage / B&W' }] },
    { question: 'Which visual effect is the most impressive?',
      options: [{ key: 'A', text: 'Smooth Slow Motion' }, { key: 'B', text: 'Fast-paced Time-lapse' }, { key: 'C', text: '3D Parallex Zoom' }, { key: 'D', text: 'Cinematic Color Grading' }] },
  ];

  const currentQuiz = quizzes[quizIndex];

  useEffect(() => {
    if (!registeredId) return;
    const interval = setInterval(async () => {
      try {
        const data = await pollStatus(registeredId);
        if (data.status === 'completed') { clearInterval(interval); onVideoComplete(data.videoUrl); onNext(); }
        else if (data.status === 'failed') { clearInterval(interval); onVideoComplete(''); onNext(); }
      } catch (err) { console.error('Polling error:', err); }
    }, 2000);
    return () => clearInterval(interval);
  }, [registeredId, onVideoComplete, onNext]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(p => { if (p <= 1) { clearInterval(timer); return 0; } return p - 1; });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (t) => `${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toString().padStart(2,'0')}`;

  const handleOptionClick = (key) => {
    setSelectedOption(key);
    if (registeredId) {
      fetch(`http://localhost:5000/api/users/${registeredId}/quiz`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: key }),
      }).catch(e => console.error(e));
    }
    setTimeout(() => { setSelectedOption(null); setQuizIndex(p => (p + 1) % quizzes.length); }, 1000);
  };

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (secondsLeft / 165) * circumference;

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 text-slate-800 select-none overflow-hidden">
      <div className="flex flex-col h-full w-full px-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between w-full pt-8 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-xl font-black text-slate-900">AI Holobooth</span>
          </div>
          <div className="flex items-center px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-md">
            <span className="text-sm font-black uppercase tracking-wide text-white">Step 4 / 5</span>
          </div>
        </div>

        {/* ── Content flows naturally ── */}
        <div className="flex-1 min-h-0 flex flex-col items-center overflow-y-auto">

          {/* Timer */}
          <div className="relative w-36 h-36 flex items-center justify-center mt-4 mb-6 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={radius} className="stroke-slate-200" strokeWidth="6" fill="transparent" />
              <circle cx="60" cy="60" r={radius} className="stroke-purple-500 transition-all duration-1000 ease-linear"
                strokeWidth="6" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-slate-800">{formatTime(secondsLeft)}</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Remaining</span>
            </div>
          </div>

          {/* Section label */}
          <div className="flex items-center gap-2 mb-4 flex-shrink-0">
            <Film size={18} className="text-purple-600" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">While you wait...</span>
          </div>

          {/* Quiz Card */}
          <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-lg mb-4 flex-shrink-0">
            <span className="text-[10px] uppercase font-bold tracking-widest text-purple-600 mb-2 block">Fun Quiz</span>
            <h3 className="text-xl font-black text-slate-800 mb-5 leading-tight">{currentQuiz.question}</h3>
            <div className="flex flex-col gap-3">
              {currentQuiz.options.map((option) => {
                const isChosen = selectedOption === option.key;
                return (
                  <button key={option.key} onClick={() => handleOptionClick(option.key)}
                    className={`w-full py-4 px-5 rounded-xl text-left text-base font-bold border transition-all duration-300 flex items-center justify-between active:scale-[0.98] ${
                      isChosen ? 'bg-gradient-to-r from-[#9333EA] to-[#7C3AED] border-transparent text-white shadow-lg'
                        : 'bg-slate-50 border-slate-200 hover:border-purple-300 text-slate-700'
                    }`}>
                    <span>{option.text}</span>
                    <span className={`text-sm font-extrabold px-3 py-1 rounded-full ${isChosen ? 'bg-white/20 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>{option.key}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-sm text-amber-600 font-semibold animate-pulse text-center mb-6">
            💡 Answer more questions while we prepare your amazing video!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Screen5Quiz;
