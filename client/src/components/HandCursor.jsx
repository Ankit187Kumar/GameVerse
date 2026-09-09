import React, { useEffect, useRef } from 'react';
import { Hand, ThumbsDown } from 'lucide-react';
import { useHandTrackerState, getPreviewCanvas } from '../hooks/useHandTracker';

// Small live camera + hand-skeleton preview, pinned to the bottom-right
// corner so the player can see themselves and their tracked hand while
// playing. Mounts the tracker's singleton <canvas> (already being drawn
// into on every MediaPipe frame) rather than owning its own camera feed.
const HandPreview = ({ status }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = getPreviewCanvas();
    const container = containerRef.current;
    if (container && canvas) container.appendChild(canvas);
    return () => {
      if (container && canvas && canvas.parentNode === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div
      className="fixed bottom-6 right-6 z-[999] w-40 aspect-[4/3] rounded-2xl overflow-hidden border-4 border-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] bg-slate-900 pointer-events-none"
      ref={containerRef}
    >
      {status !== 'ready' && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-white/70">
          {status === 'unavailable' ? 'No Camera' : 'Loading...'}
        </div>
      )}
    </div>
  );
};

// Visual overlay for hand-gesture play: a floating cursor that follows the
// player's tracked hand, glowing green on a pinch ("tap"), plus a
// bottom-right camera preview and a "thumbs down = back" gesture. Mount
// this only while a screen should be playable by hand (Countdown +
// GamePlay) — it owns the camera/tracker lifecycle via useHandTrackerState.
const HandCursor = ({ active }) => {
  const { xPct, yPct, pinching, thumbsDown, handVisible, status } = useHandTrackerState(active);

  if (!active) return null;

  return (
    <>
      <HandPreview status={status} />

      {status === 'ready' && handVisible && (
        <div
          className="fixed z-[999] pointer-events-none"
          style={{ left: `${xPct}%`, top: `${yPct}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div
            className={`rounded-full flex items-center justify-center transition-all duration-100 ${
              pinching
                ? 'w-10 h-10 bg-green-400/90 border-4 border-white shadow-[0_0_25px_rgba(74,222,128,0.9)] scale-90'
                : 'w-14 h-14 bg-blue-400/40 border-4 border-white shadow-[0_0_20px_rgba(96,165,250,0.7)]'
            }`}
          >
            <Hand className="w-5 h-5 text-white drop-shadow" />
          </div>
        </div>
      )}
      {status === 'ready' && thumbsDown && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[999] bg-red-600/90 text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full pointer-events-none flex items-center gap-2 shadow-lg">
          <ThumbsDown className="w-4 h-4" /> Going Back...
        </div>
      )}
      {status === 'ready' && !handVisible && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] bg-slate-900/85 text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full pointer-events-none flex items-center gap-2 shadow-lg">
          <Hand className="w-4 h-4" /> Show your hand to the camera
        </div>
      )}
      {status === 'loading' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] bg-slate-900/85 text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full pointer-events-none">
          Starting hand tracking...
        </div>
      )}
      {status === 'unavailable' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] bg-red-900/90 text-white text-xs font-bold uppercase tracking-widest px-5 py-2.5 rounded-full pointer-events-none">
          Camera unavailable — tap to play instead
        </div>
      )}
    </>
  );
};

export default HandCursor;
