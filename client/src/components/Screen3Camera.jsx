import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, RotateCcw, AlertTriangle, ChevronLeft, Upload, Sparkles } from 'lucide-react';

const Screen3Camera = ({ selectedFrame, onCapturePhoto, onNext, onPrev }) => {
  const webcamRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [countdown, setCountdown] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [hasCameraError, setHasCameraError] = useState(false);

  const frameStyles = {
    frame_1: { border: 'border-red-500', name: 'Spider-Verse' },
    frame_2: { border: 'border-indigo-500', name: 'Space Odyssey' },
    frame_3: { border: 'border-cyan-500', name: 'Retro Future' },
    frame_4: { border: 'border-amber-500', name: 'Sunset Escape' },
  };

  const activeStyle = frameStyles[selectedFrame] || frameStyles['frame_2'];
  const videoConstraints = { width: 1080, height: 1920, facingMode: 'user' };

  const startCountdown = () => setCountdown(3);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { capture(); setCountdown(null); return; }
    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) setCapturedImage(imageSrc);
    }
  };

  const handleGalleryUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setCapturedImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRetake = () => setCapturedImage(null);
  const handleConfirm = () => { if (capturedImage) { onCapturePhoto(capturedImage); onNext(); } };

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 text-slate-800 select-none overflow-hidden">
      <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleGalleryUpload} />

      <div className="flex flex-col h-full w-full px-6">

        {/* ── Header Nav ── */}
        <div className="flex items-center justify-between w-full pt-8 pb-4 flex-shrink-0">
          <button onClick={onPrev}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:text-purple-600 font-bold rounded-full px-5 py-2.5 text-base shadow-md active:scale-95 transition-all flex-shrink-0">
            <ChevronLeft size={20} strokeWidth={2.5} /> Back
          </button>
          <h2 className="flex-1 text-center text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Camera size={18} className="text-white" />
            </div>
            Camera
          </h2>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 shadow-md flex-shrink-0">
            <span className="text-sm font-black uppercase tracking-wide text-white">Step 2 / 5</span>
          </div>
        </div>

        {/* ── Step dots ── */}
        <div className="flex items-center justify-between w-full mb-4 flex-shrink-0">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Capture your photo</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          </div>
        </div>

        {/* ── Camera Preview + Buttons Group ── */}
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center w-full">
          <div className="flex flex-col gap-6 w-[85%] max-w-xl">
            {/* Camera viewport — 9:16 ratio, max height constraint */}
            <div
              className="relative overflow-hidden rounded-2xl bg-slate-900 border-2 border-slate-200 shadow-xl w-full"
              style={{ aspectRatio: '9/16', maxHeight: '55vh' }}
            >
              {/* Colored frame border */}
              <div className={`absolute inset-2 border-4 ${activeStyle.border} rounded-xl z-20 pointer-events-none`}>
                <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[9px] uppercase font-black text-white">
                  {activeStyle.name}
                </div>
              </div>

              {!capturedImage ? (
                <>
                  {!hasCameraError ? (
                    <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg"
                      videoConstraints={videoConstraints}
                      onUserMediaError={() => setHasCameraError(true)}
                      className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6">
                      <AlertTriangle size={48} className="text-amber-500 mb-3" />
                      <p className="font-bold text-white text-lg mb-1">Camera Access Failed</p>
                      <p className="text-sm text-slate-300">Upload a photo from gallery below.</p>
                    </div>
                  )}
                  {countdown !== null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                      <span className="text-[140px] font-black text-purple-400 drop-shadow-2xl leading-none">{countdown}</span>
                    </div>
                  )}
                </>
              ) : (
                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
              )}
            </div>

            {/* ── Buttons ── */}
            <div className="flex flex-col gap-3 w-full">
              {!capturedImage ? (
                <>
                  <button onClick={startCountdown} disabled={countdown !== null}
                    className="w-full py-5 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#7C3AED] text-white font-extrabold text-lg uppercase tracking-wider shadow-xl shadow-purple-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-60">
                    <Camera size={22} /> Take Photo
                  </button>
                  <button onClick={() => galleryInputRef.current?.click()}
                    className="w-full py-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-base hover:border-purple-400 hover:text-purple-600 flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-sm">
                    <Upload size={20} /> Upload from Gallery
                  </button>
                  <p className="text-center text-xs text-slate-400 font-medium">
                    Align yourself in the frame and tap TAKE PHOTO
                  </p>
                </>
              ) : (
                <div className="flex gap-4 w-full">
                  <button onClick={handleRetake}
                    className="flex-1 py-5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm transition-all">
                    <RotateCcw size={20} /> Retake
                  </button>
                  <button onClick={handleConfirm}
                    className="flex-1 py-5 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#7C3AED] text-white font-bold text-base shadow-xl active:scale-[0.98] transition-all">
                    Use Photo ✓
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Screen3Camera;
