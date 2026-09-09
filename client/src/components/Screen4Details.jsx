import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Loader, ChevronLeft, Sparkles, Shield } from 'lucide-react';
import { registerUser } from '../utils/api';

const Screen4Details = ({ capturedPhoto, selectedFrame, onUserRegistered, registeredId, onNext, onPrev }) => {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(10);
  const [currentId, setCurrentId] = useState(registeredId);

  useEffect(() => {
    const init = async () => {
      if (currentId) return;
      try {
        const res = await registerUser({
          name: 'Anonymous Guest', phone: '0000000000', email: 'anonymous@guest.com',
          frameId: selectedFrame, photo: capturedPhoto,
        });
        if (res?.userId) { setCurrentId(res.userId); onUserRegistered(res.userId); }
      } catch (err) { console.error('Background gen error:', err); }
    };
    init();
  }, [capturedPhoto, selectedFrame, currentId, onUserRegistered]);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => { if (p >= 90) { clearInterval(timer); return 90; } return p + 5; });
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) { setError('Please fill in all fields.'); return; }
    setLoading(true); setError('');
    try {
      const response = await fetch(`http://localhost:5000/api/users/${currentId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to update details');
      onNext();
    } catch (err) { setError(err.message || 'Submission failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 text-slate-800 select-none overflow-hidden">
      <div className="flex flex-col h-full w-full px-6">

        {/* ── Header Nav ── */}
        <div className="flex items-center justify-between w-full pt-8 pb-4 flex-shrink-0">
          <button onClick={onPrev}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:text-purple-600 font-bold rounded-full px-5 py-2.5 text-base shadow-md active:scale-95 transition-all flex-shrink-0">
            <ChevronLeft size={20} strokeWidth={2.5} /> Back
          </button>
          <h2 className="flex-1 text-center text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Sparkles size={18} className="text-white" />
            </div>
            Your Details
          </h2>
          <div className="flex items-center px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-md flex-shrink-0">
            <span className="text-sm font-black uppercase tracking-wide text-white">Step 3 / 5</span>
          </div>
        </div>

        {/* ── Sub-header progress row ── */}
        <div className="flex items-center justify-between w-full mb-1 flex-shrink-0">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Create your AI Experience</span>
          <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600">{progress}% Complete</span>
        </div>
        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden mb-6 flex-shrink-0">
          <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* ── Main content centered ── */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center w-full">
          <div className="w-[90%] max-w-xl flex flex-col">
            
            {/* Hero text */}
            <div className="text-center mb-6">
              <h3 className="text-4xl font-black text-slate-900 mb-2">Almost there ✨</h3>
              <p className="text-base text-slate-500 font-medium leading-relaxed">
                Tell us where we can send your personalized AI photo experience.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl text-center font-semibold mb-4">{error}</div>
            )}

            {/* Full Name */}
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest pl-1">Full Name</label>
              <div className="relative">
                <User size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" name="name" placeholder="John Doe"
                  value={formData.name} onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 shadow-sm transition-all"
                  required />
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest pl-1">Phone Number</label>
              <div className="relative">
                <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="tel" name="phone" placeholder="+91 98765 43210"
                  value={formData.phone} onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 shadow-sm transition-all"
                  required />
              </div>
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-xs font-extrabold text-slate-600 uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative">
                <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" name="email" placeholder="john.doe@email.com"
                  value={formData.email} onChange={handleChange}
                  className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 shadow-sm transition-all"
                  required />
              </div>
            </div>

            {/* AI Experience Preparing card */}
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
                <Loader className="text-white animate-spin" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">AI Experience Preparing</p>
                <p className="text-xs text-purple-600 font-medium">We're preparing your personalized video...</p>
              </div>
              <span className="text-lg font-black text-purple-700">{progress}%</span>
            </div>

            {/* Warning */}
            <div className="flex items-center justify-center gap-2 text-sm text-amber-600 font-semibold mb-4">
              <span>⚡</span>
              <span>Don't worry! We'll notify you when your AI video is ready.</span>
            </div>

            {/* Submit button */}
            <button type="button" onClick={handleSubmit}
              disabled={loading || !formData.name || !formData.phone || !formData.email}
              className="w-full py-5 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#7C3AED] text-white font-extrabold text-lg uppercase tracking-wider shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none mb-3">
              {loading ? 'Creating...' : 'Create My Experience'}
            </button>

            {/* Privacy footer */}
            <p className="text-center text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
              <Shield size={10} className="text-slate-400" />
              Your information is secure and will only be used for your <span className="text-purple-600 font-bold">AI experience</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Screen4Details;
