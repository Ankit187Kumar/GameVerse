import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Share2, Play, Download, Home, Film, Sparkles } from 'lucide-react';

const Screen6Ready = ({ registeredId, videoUrl, onReset }) => {
  const videoRef = useRef(null);
  const serverHost = window.location.hostname;
  const downloadUrl = `http://${serverHost}:5000/download.html?id=${registeredId}`;
  const absoluteVideoUrl = videoUrl ? `http://${serverHost}:5000${videoUrl}` : '';

  const handleWatchAgain = () => { if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play(); } };
  const handleDownload = () => {
    if (absoluteVideoUrl) { const a = document.createElement('a'); a.href = absoluteVideoUrl; a.download = `ai_video_${registeredId}.mp4`; document.body.appendChild(a); a.click(); document.body.removeChild(a); }
  };
  const handleShare = () => {
    if (navigator.share && absoluteVideoUrl) {
      navigator.share({ title: 'My AI HoloBooth Video', text: 'Check out my AI video!', url: absoluteVideoUrl }).catch(() => {});
    } else { navigator.clipboard.writeText(absoluteVideoUrl); alert('Link copied!'); }
  };

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
            <span className="text-sm font-black uppercase tracking-wide text-white">Step 5 / 5</span>
          </div>
        </div>

        {/* ── Hero ── */}
        <div className="text-center mb-4 flex-shrink-0">
          <h2 className="text-4xl font-black text-slate-900">Your video is ready! 🎬</h2>
          <p className="text-base text-slate-500 font-medium mt-1">Watch, download, or share your AI experience.</p>
        </div>

        {/* ── Video + actions flow naturally ── */}
        <div className="flex-1 min-h-0 flex flex-col items-center overflow-y-auto">

          {/* Video */}
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 border-2 border-slate-200 shadow-xl w-[75%] mb-4 flex-shrink-0"
            style={{ aspectRatio: '9/16', maxHeight: '45vh' }}>
            {absoluteVideoUrl ? (
              <video ref={videoRef} src={absoluteVideoUrl} className="w-full h-full object-cover" controls autoPlay loop playsInline />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Film size={56} className="text-purple-500 animate-pulse mb-3" />
                <p className="font-bold text-white text-lg">Video Preparing</p>
                <p className="text-sm text-slate-300 mt-1">Processing your video...</p>
              </div>
            )}
          </div>

          {/* QR Code row */}
          <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-md mb-4 flex-shrink-0">
            <QRCodeSVG value={downloadUrl} size={56} level="M" includeMargin={false} />
            <div>
              <span className="text-sm font-black text-slate-800 block">Scan to Download</span>
              <span className="text-xs text-slate-500 font-medium">Use your phone camera</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-3 w-full mb-4 flex-shrink-0">
            <button onClick={handleShare}
              className="py-4 bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-xl flex flex-col items-center justify-center gap-1.5 active:scale-[0.97] hover:scale-[1.02] shadow-sm transition">
              <Share2 size={20} className="text-purple-600" /> Share
            </button>
            <button onClick={handleWatchAgain}
              className="py-4 bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-xl flex flex-col items-center justify-center gap-1.5 active:scale-[0.97] hover:scale-[1.02] shadow-sm transition">
              <Play size={20} className="text-purple-600" /> Watch Again
            </button>
            <button onClick={handleDownload}
              className="py-4 bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-xl flex flex-col items-center justify-center gap-1.5 active:scale-[0.97] hover:scale-[1.02] shadow-sm transition">
              <Download size={20} className="text-purple-600" /> Download
            </button>
          </div>

          {/* Home button */}
          <button onClick={onReset}
            className="w-full py-5 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#7C3AED] text-white font-extrabold text-lg uppercase tracking-wider shadow-xl shadow-purple-500/25 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mb-6 flex-shrink-0">
            <Home size={20} /> Start Over
          </button>
        </div>
      </div>
    </div>
  );
};

export default Screen6Ready;
